'use strict';

import Immutable  from 'immutable';
import GroupTypes from 'constants/GroupTypes';
import File       from 'entities/File';
import OutdoorSiteGroupSubmission     from "data_managers/submissions/OutdoorSiteGroupSubmission";
import OutdoorBuildingGroupSubmission from "data_managers/submissions/OutdoorBuildingGroupSubmission";
import IndoorBaseGroupSubmission      from "data_managers/submissions/IndoorBaseGroupSubmission";
import IndoorGroupSubmission          from "data_managers/submissions/IndoorGroupSubmission";

class Group extends Immutable.Record({
  id: null,
  name: '',
  type: '',
  lvl:  0,
  lat:  0,
  lng: 0,
  dimX: 0,
  dimY: 0,
  unitsPerPixel: 1,
  tileUrl: '',
  minZoom: 0,
  maxZoom: 4,
  areaGeoJson: '',
  planFile: new File(),
  parent: null,
  __children: []
}){

  get isRoot(){
    return this.type == GroupTypes.get('GROUP_TYPE_ROOT')
  }

  get isOutdoor(){
    return this.type == GroupTypes.get('GROUP_TYPE_OUTDOOR_SITE') || this.type == GroupTypes.get('GROUP_TYPE_OUTDOOR_BUILDING')
  }

  get isIndoorBase(){
    return this.type == GroupTypes.get('GROUP_TYPE_INDOOR_BASE')
  }

  get isIndoor(){
    return this.type == GroupTypes.get('GROUP_TYPE_INDOOR')
  }

  get submission(){
    switch(this.type){

      case GroupTypes.get('GROUP_TYPE_OUTDOOR_SITE'):
        return new OutdoorSiteGroupSubmission({
          id:          this.id,
          name:        this.name,
          type:        this.type,
          parent:      this.parent,
          areaGeoJson: this.areaGeoJson
        });
        break;
      case GroupTypes.get('GROUP_TYPE_OUTDOOR_BUILDING'):
        return new OutdoorBuildingGroupSubmission({
          id:     this.id,
          name:   this.name,
          type:   this.type,
          parent: this.parent,
          lat:    this.lat,
          lng:    this.lng
        });
        break;
      case GroupTypes.get('GROUP_TYPE_INDOOR_BASE'):
        return new IndoorBaseGroupSubmission({
          id:            this.id,
          name:          this.name,
          type:          this.type,
          parent:        this.parent,
          dimX:          this.dimX,
          dimY:          this.dimY,
          unitsPerPixel: this.unitsPerPixel,
          tileUrl:       this.tileUrl,
          minZoom:       this.minZoom,
          maxZoom:       this.maxZoom,
          planFile:      this.planFile.get('id')
        });
        break;
      case GroupTypes.get('GROUP_TYPE_INDOOR'):
        return new IndoorGroupSubmission({
          id:          this.id,
          name:        this.name,
          type:        this.type,
          parent:      this.parent,
          areaGeoJson: this.areaGeoJson
        });
        break;
      default:
        throw new Error('Unknown group type');
        break;
    }
  }

};

export default Group;
