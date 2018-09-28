import React              from 'react';
import PropTypes          from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import iMatrixPropTypes from 'utils/iMatrixPropTypes';
import GroupActions     from 'actions/Groups/GroupActions';
import Gmap             from 'components/Common/Gmap';
import GmapMarker       from 'entities/GmapMarker';
import Immutable        from 'immutable';

class GroupMapOutdoor extends React.Component{

  constructor(props){
    super(props);
  }

  getMarkersData(){

    let markersData = Immutable.Map();

    //Add one marker per outdoor thing
    this.props.things.map((thing) => {

      let thingId = thing.get('id');
      let lat = thing.get('lat');
      let lng = thing.get('lng');

      if(lat != 0 && lng != 0){
        let thingMarker = new GmapMarker({
          title:       thing.get('name'),
          description: thing.get('sn'),
          position: {
            lat: lat,
            lng: lng
          }
        });
        markersData = markersData.set(thingId, thingMarker);
      }
    });

    //@TODO Actually need to render all the buildings that belong to the site here
    //Also see if this is a building group
    //If so - it will have a lat/lng on it
    if(this.props.group.get('lat', false) && this.props.group.get('lng', false)){
      let buildingMarker = new GmapMarker({
        title:       this.props.group.get('name'),
        position: {
          lat: this.props.group.get('lat'),
          lng: this.props.group.get('lng')
        }
      });
      markersData = markersData.set(this.props.group.get('id'), buildingMarker);
    };

    return markersData;
  }

  render(){
    return(<Gmap
      markersData={this.getMarkersData()}
      geoJson={this.props.geoJson}
      selectedMarkerId={this.props.selectedThingId || null}
      onMarkerClick={GroupActions.selectThing}
    />);
  }

}

GroupMapOutdoor.propTypes = {
  group:           ImmutablePropTypes.record,
  things:          ImmutablePropTypes.map,
  geoJson:         PropTypes.string,
  selectedThingId: PropTypes.oneOfType([iMatrixPropTypes.null, PropTypes.number])
}

export default GroupMapOutdoor;
