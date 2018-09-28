import PropTypes from 'prop-types';
import React from 'react';
import iMatrixPropTypes from 'utils/iMatrixPropTypes';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';

class Gmap extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      zoom: 17,
      // *Data are required to be able to compare incoming new data
      markersData: Immutable.Map(),
      shapesData:  Immutable.Map(),
      //The following are gmaps appliable objects generated from *Data arrays
      markers:     {},
      shapes:      {},
      infoWindows: {}
    };
  }

  render() {
    return <div className="gmap-container">
      <div className="gmap-canvas" ref="mapCanvas">
      </div>
    </div>
  }

  /**
   *
   * @param props
   */
  updateMarkers(props){

    let newState = this.state;

    //Cleanup the missing ones
    this.state.markersData.map((markerData, key) => {
      let doDelete = !props.markersData.has(key);
      if(true === doDelete){
        if(newState.markers[key]){
          newState.markers[key].setMap(null);
        }
      }
    });

    //Add/update the rest
    props.markersData.map((markerData, key) => {

      const previousMarkerData = this.state.markersData.get(key);

      let isNew      = !Boolean(previousMarkerData);
      let hasChanged = !(true === Immutable.is(previousMarkerData, markerData));

      let latLng = new window.google.maps.LatLng(
        markerData.get('position').lat,
        markerData.get('position').lng
      );

      //Is this marker already on the map?
      if(isNew){

        let marker = new window.google.maps.Marker({
          position: latLng,
          map:      this.map
        });

        marker.addListener('click', function(){
          if(this.props.onMarkerClick) this.props.onMarkerClick(key);
        }.bind(this))

        let infoWindow = new window.google.maps.InfoWindow({
          content: '<div><b>'+markerData.get('title')+'</b><br/>'+markerData.get('description')+'</div>'
        });

        newState.infoWindows[key] = infoWindow;
        newState.markers[key]     = marker;

        //Is the marker data stale?
      } else if(hasChanged){
        newState.markers[key].setPosition(latLng);
      }

    });

    //Don't forget to save this to state so we can compare later!
    newState.markersData = props.markersData;
    //@TODO Add routine to cleanup removed markers
    //To do that - iterate over existing markers list and check if they still exist in the new list
    //If not - good to remove

    this.setState(newState);
  }

  /**
   * @TODO Implement
   * @param porops
   * @private
   */
  updateShapes(props){}

  /**
   * @param props
   * @private
   */
  updateGeoJson(props){
    this.map.data.forEach(function (f) {
      this.map.data.remove(f);
    }.bind(this));
    if(props.geoJson){
      try{
        let geoJson = JSON.parse(props.geoJson);
        this.map.data.addGeoJson(geoJson);
      } catch (e){
        //@TODO Add something better to handle exceptions
        console.error(e);
      }
    }
  }

  /**
   *
   * @param id
   * @param doOpenInfoWindow
   */
  selectMarker(id, doOpenInfoWindow = false){
    if(this.state.markers[id]){
      let marker = this.state.markers[id];
      this.map.panTo(marker.getPosition());
      if(doOpenInfoWindow && this.state.infoWindows[id]){
        this.closeAllInfoWindows();
        this.state.infoWindows[id].open(this.map, marker);
      }
    }
  }

  closeAllInfoWindows(){
    Object.keys(this.state.infoWindows).map((key)=>{this.state.infoWindows[key].close()});
  }

  getObjectsBounds(){

    let objectsBounds = new window.google.maps.LatLngBounds();

    Object.values(this.state.shapes).map((shape => {
      let shapeBounds = shape.getBounds();
      objectsBounds.extend(shapeBounds.getNorthEast());
      objectsBounds.extend(shapeBounds.getSouthWest());
    }));

    Object.values(this.state.markers).map((marker) => {
      let lat   = parseFloat(marker.getPosition().lat());
      let lng   = parseFloat(marker.getPosition().lng());
      let point = new window.google.maps.LatLng(lat, lng);
      objectsBounds.extend(point);
    });

    this.map.data.forEach(function(feature){
      feature.getGeometry().forEachLatLng(function(latlng){
        objectsBounds.extend(latlng);
      });
    });

    return objectsBounds;
  }

  fitBounds(){
    let bounds = this.getObjectsBounds();
    this.map.fitBounds(bounds);
  }

  panToBounds(){
    let bounds = this.getObjectsBounds();
    this.map.panToBounds(bounds);
  }

  panToMarker(id){
    let marker = this.state.markers[id];
    if(marker){
      this.map.panTo(marker.getPosition());
    }
  }

  /**
   *
   */
  componentDidMount() {

    // create the map, marker and infoWindow after the component has
    // been rendered because we need to manipulate the DOM for Google =(
    this.map = this.createMap();

    this.updateMarkers(this.props);
    this.updateShapes(this.props);
    this.updateGeoJson(this.props);

    //Explicit center passed down as a prop has a priority
    //If it's not there - we'll try to fit bounds based on all the shapes, markers and data layer objects
    if(this.props.center){
      if(this.props.center.lat && this.props.center.lng){
        this.map.setCenter({lat: this.props.center.lat, lng: this.props.center.lng});
      }
    } else {
      this.fitBounds();
    }

    // have to define window.google maps event listeners here too
    // because we can't add listeners on the map until its created
    window.google.maps.event.addListener(this.map, 'zoom_changed', ()=> this.handleZoomChange());
  }

  // clean up event listeners when component unmounts
  componentWillUnmount() {
    window.google.maps.event.clearListeners(this.map, 'zoom_changed')
  }

  componentWillReceiveProps(newProps){

    this.updateMarkers(newProps);
    this.updateShapes(newProps);
    this.updateGeoJson(newProps);

    //Explicit center passed down as a prop has a priority
    //If it's not there - we'll try to fit bounds based on all the shapes, markers and data layer objects
    if(newProps.center){
      if(newProps.center.lat && newProps.center.lng){
        this.map.setCenter({lat: newProps.center.lat, lng: newProps.center.lng});
      }
    } else {
     this.fitBounds();
    }

    //Once new props arrive - check if we should select any markers
    //Selecting a marker means bringing up an info window with the same id and panning to the marker itself
    //@TODO Review these rules!!!! Probably need to ignore when there's just one marker
    if(newProps.selectedMarkerId){
      this.selectMarker(newProps.selectedMarkerId, true);
    }
  }

  createMap() {
    let mapOptions = {
      mapTypeId: 'satellite',
      zoom:   this.state.zoom,
      center: this.props.center
    }
    return new window.google.maps.Map(this.refs.mapCanvas, mapOptions)
  }

  createInfoWindow() {
    let contentString = '<div class="InfoWindow">I\'m a Window that contains Info Yay</div>';
    return new window.google.maps.InfoWindow({
      map: this.map,
      anchor: this.marker,
      content: contentString
    })
  }

  handleZoomChange() {
    this.setState({
      zoom: this.map.getZoom()
    })
  }
}

Gmap.defaultProps = {
  markersData: new Immutable.Map(),
  shapesData:  new Immutable.Map(),
  selectedMarkerId: null
}

Gmap.propTypes = {
  center:    PropTypes.object, //{lat: 0, lng: 0}
  markersData:      ImmutablePropTypes.map,
  shapesData:       ImmutablePropTypes.map,
  geoJson:          PropTypes.string,
  selectedMarkerId: PropTypes.oneOfType([iMatrixPropTypes.null, PropTypes.number]),
  onMarkerClick:    PropTypes.func
}

export default Gmap;
