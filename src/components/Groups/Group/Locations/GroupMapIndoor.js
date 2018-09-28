import _         from 'lodash';
import React     from 'react';
import config    from 'config';
import L         from 'leaflet';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Map, GeoJSON, FeatureGroup, Marker, Popup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

class GroupMapIndoor extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      lat: 0,
      lng: 0,
      zoom: 0,
      isMapControllerLoaded: false,
      isThingsLoaded: false,
      isLayersLoaded: false,
      selectedFeature: new L.FeatureGroup(),
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('nextProps', nextProps.things)
  }

  thingsMarkers() {
    if (this.props.things.length != 0 && this.props.products.size != 0) {
      if (!this.state.isThingsLoaded) {
        this.state.isThingsLoaded = true
        this.props.things.map(function(thing, key){
          let iconUrl = this.props.products.getIn([thing.get('product'), 'iconFileUri']) || config.defaultProductIconUri;
          if (this.map) {

            let markerEditeble = L.marker([thing.get('locY'), thing.get('locX')], {
              icon:
                L.icon({
                  iconUrl: iconUrl,
                  // shadowUrl: 'leaf-shadow.png',
                  iconSize:     [20, 20], // size of the icon
                  // shadowSize:   [50, 64], // size of the shadow
                  iconAnchor:   [10, 10], //isThingsLoaded point of the icon which will correspond to marker's location
                  // shadowAnchor: [4, 62],  // the same for the shadow
                  popupAnchor:  [0, -10], // point from which the popup should open relative to the iconAnchor
                  className: 'thing-marker-icon'
                }),
              key:key,
              id:thing.get('id'),
              group:thing.get('group'),
              name:thing.get('name'),
              owner:thing.get('owner'),
              product:thing.get('product'),
              sn:thing.get('sn'),
            })
            .bindPopup(thing.get('sn'))
            .addTo(this.map)

            if (this.props.edit) {
              this.setState({selectedFeature: this.state.selectedFeature.addLayer(markerEditeble)})
            }

          }
        }.bind(this))
      }
    }
  }

  handeMapRef(mapComponent) {
    if(mapComponent && !this.state.isMapControllerLoaded){
      this.state.isMapControllerLoaded = true
      this.map = mapComponent.leafletElement
      if(this.props.edit) {
        const drawControl = new L.Control.Draw({
          position: 'topright',
          draw: {
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
            polygon: {
              shapeOptions: {
                color: '#ff7800',
                weight: 5,
                opacity: 0.65
              }
            }
          },
          edit: {
            featureGroup: this.state.selectedFeature,
            remove: false,
          }
        });
        this.map.addControl(drawControl);
      }
    }
  }

  handleClick(e){
    if(config.isDev()) console.info('X: ' + e.latlng.lng + ', Y:' + e.latlng.lat);
  }

  buildMapBounds(map, dimX, dimY){
    return new L.LatLngBounds([0, dimX], [dimY, 0]);
  }

  buildCRS(dimX, dimY){
    //256 is the tile size
    //By default, tiled map coordinates are in tile dim range e.g. 256 X, 256 Y
    //We need them to be in floor dim range
    //We'll use the value below and transofrm function to achieve required behaviour
    this.CRSfactor = 256 / Math.max(dimX, dimY);
    return L.extend({}, L.CRS.Simple, {
      transformation: new L.Transformation(this.CRSfactor, 0, -this.CRSfactor, 0)
    });
  }

  handleCreateLayer(e) {
    let layer = e.layer;
    let json = layer.toGeoJSON()

    for (let key in this.state.selectedFeature._layers) {
      if(typeof this.state.selectedFeature._layers[key].feature == 'object' && this.state.selectedFeature._layers[key].feature.geometry.type === 'Polygon') {
        this.state.selectedFeature._layers[key].remove()
        this.state.selectedFeature.removeLayer(this.state.selectedFeature._layers[key])
        let nawLayer = L.geoJSON(json, {
          style: {
            'color': '#ff7800',
            'weight': 5,
            'opacity': 0.65
          },
          onEachFeature: function (feature, layer) {
              this.setState({selectedFeature: this.state.selectedFeature.addLayer(layer)})
            }.bind(this)
        }).addTo(this.map)
      }
    }

    if (json)
      this.props.mapOnChange('create', json)
    return json
  }

  handleEditLayer(e) {
    let layers = e.layers._layers
    let feature = this.state.selectedFeature._layers
    if (layers && feature)
      this.props.mapOnChange('edit', layers, feature)
    return layers
  }

  componentDidMount(){
    if(this.map){
      let mapBounds = this.buildMapBounds(
        this.map,
        this.props.dimX,
        this.props.dimY,
        this.props.maxZoom
      );
      this.map.fitBounds(mapBounds);
      let tiles = L.tileLayer(this.props.tileUrl, {
        tileSize: 256,
        minZoom: this.props.minZoom,
        maxZoom: this.props.maxZoom,
        bounds:  mapBounds,
        noWrap:  true,
        tms:     true
      });
      if (this.props.edit) {
        this.map.addLayer(this.state.selectedFeature)
        this.map.on('draw:created', function (e) {
          this.handleCreateLayer(e)
        }.bind(this));
        this.map.on('draw:edited', function (e) {
          this.handleEditLayer(e)
        }.bind(this));
      }
      //https://github.com/Leaflet/Leaflet/issues/4338
      //https://stackoverflow.com/questions/47381346/how-to-set-up-leaflet-for-a-non-geographical-tile-grid-with-inverted-y-coordinat
      tiles.getTileUrl = function(coords) {
        coords.y = -coords.y - 1;
        return L.TileLayer.prototype.getTileUrl.bind(tiles)(coords);
      }
      tiles.addTo(this.map);
    }
  }

  render(){
    let crs = this.buildCRS(this.props.dimX, this.props.dimY);
    return (
      <Map
        ref={this.handeMapRef.bind(this)}
        center={this.state.center}
        zoom={3}
        minZoom={this.props.minZoom}
        maxZoom={this.props.maxZoom}
        crs={crs}
        onClick={this.handleClick}
      >
        {this.thingsMarkers()}
        {_.get(this.props, 'indoorBase.__children', []).map((indoor, key) => {
          //Paint orange if it's the active indoor group
          indoor.id == this.props.selectedIndoorGroupId
          let style = {
            'color': (indoor.id == this.props.selectedIndoorGroupId) ? '#ff7800' : '#3b79d4',
            'weight': 5,
            'opacity': 0.65
          };
          // @TODO Make sure it works with sub-children
          if(indoor.areaGeoJson){
            return <GeoJSON
              onEachFeature={function(feature, layer) {
                if (indoor.id == this.props.selectedIndoorGroupId && layer.feature.geometry.type === 'Polygon') {
                  if (this.props.edit) {
                    this.setState({selectedFeature: this.state.selectedFeature.clearLayers().addLayer(layer)});
                  }
                  this.setState({center: layer.getBounds().getCenter()})
                }
              }.bind(this)}
              key={key}
              data={(indoor.id == this.props.selectedIndoorGroupId && this.props.edit) ? this.props.feature : indoor.areaGeoJson}
              style={style}
            />
          }
        })}
      </Map>
    )
  }
}

GroupMapIndoor.propTypes = {
  tileUrl:               PropTypes.string,
  things:                PropTypes.array,
  products:              ImmutablePropTypes.Map,
  indoorBase:            PropTypes.object,
  selectedThingId:       PropTypes.number,
  selectedIndoorGroupId: PropTypes.number,
  minZoom:               PropTypes.number,
  maxZoom:               PropTypes.number,
  dimX:                  PropTypes.number,
  dimY:                  PropTypes.number,
}

GroupMapIndoor.defaultProps = {
  minZoom: 0,
  maxZoom: 4,
  indoorBase: {},
  dimX:  0,
  dimY:  0
}

export default GroupMapIndoor;
