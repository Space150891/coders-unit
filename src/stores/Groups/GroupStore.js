import _              from 'lodash';
import Immutable      from 'immutable';
import AppDispatcher  from 'dispatcher';
import {ReduceStore}  from 'flux/utils';
import Highcharts     from 'highcharts';
import GroupConstants from 'constants/actions/Groups/Group';
import AuthConstants  from 'constants/actions/Auth';
import Group          from 'entities/Group';
import Thing          from 'entities/Thing';
import Product        from 'entities/Product';
import Property       from 'entities/Property';
import Platform       from 'entities/Platform';
import Moment         from 'moment';
import File from "entities/File";

class GroupStore extends ReduceStore {

  constructor() {
    super(AppDispatcher);
  }

  hasChanged(){
    const state = this.getState();
    // when navigating between editing group layer Immutable.is return false
    return (false === Immutable.is(state.draft,state.group));
    //return (false === _.isEqual(state.draft,state.group));
  }

  getInitialState(){
    return {
      isLoading:               true,
      isUploadingFloorPlan:    false,
      tree:                    [],
      group:                   new Group(),
      draft:                   new Group(),
      outdoorMapCenter:        {lat: 38.983443,lng: -119.942050},
      alerts:                  [],
      things:                  new Immutable.Map(),
      products:                new Immutable.Map(),
      historyActiveProductId:  null,
      historyActiveProduct:    new Product(),
      historyActivePropertyIds:new Immutable.List(),
      historyActiveProperty:   new Property(),
      historyActiveProperties: [],
      historyTimestampFrom:    (Math.floor(Date.now() / 1000) - 60 * 60),
      historyTimestampTo:      (Math.floor(Date.now() / 1000)),
      selectedTimestampFrom:   (Math.floor(Date.now() / 1000) - 60 * 60),
      selectedTimestampTo:     (Math.floor(Date.now() / 1000)),
      historyData:             [],
      historySeries:           [],
      historyChartConfig:      {},
      doLiveUpdate:            false,
      liveUpdatesInterval:     60,
      selectedThingId:         null,
      historyChartConfigs:     [],
      historyActiveProductIds: new Immutable.List()
    }
  }

  reduce(state, action){

    let newState = Object.assign({}, state);

    switch(action.actionType) {

      case GroupConstants.GROUPS_GROUP_LOAD_START:
        newState.isLoading = true;
        newState.things    = new Immutable.Map();
        newState.products  = new Immutable.Map();
        newState.historyActiveProductId  = null;
        newState.historyActiveProduct    = new Product();
        newState.historyActivePropertyIds = [];
        newState.historyActiveProperty   = new Property();
        newState.historyData             = [];
        newState.historySeries           = [];
        newState.historyChartConfig      = {};
        newState.historyChartConfigs     = [];
        newState.historyActiveProductIds = new Immutable.List();
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_LOAD_END:
        newState.isLoading = false;
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_TREE_LOADED:
        newState.tree = action.data;
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_LOADED:
        newState.group = new Group(action.data);
        if(action.data.planFile){
          newState.group = newState.group.set('planFile', new File(action.data.planFile));
        }
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_THINGS_LOADED:
        let thingsMap = new Immutable.Map();
        action.data.map(
          (thingData) => {thingsMap = thingsMap.set(thingData.id, new Thing(thingData))}
        );
        console.log('thingsMap', thingsMap.toArray())
        newState.things = thingsMap;
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_PRODUCTS_LOADED:
        let productsMap = new Immutable.Map();
        action.data.map(
          //@TODO Add a better way to deserialize Products and other stuff - perhaps some helper under the entity
          (productData) => {productsMap = productsMap.set(productData.id, new Product({
            id:           productData.id,
            name:         productData.name,
            shortname:    productData.shortname,
            platform:     Immutable.fromJS(productData.platform, function(k, v){
              if('' === k){
                return new Platform(v);
              }
              if('properties' === k){
                return Immutable.fromJS(v.toJS(), function(k,v){
                  if('' === k){
                    return v.toMap();
                  }
                  if('states' === k){
                    return v.toList();
                  }
                  //this has to go before the return v
                  if(v.get('id') != undefined && v.get('name') != undefined){
                    return new Property(v);
                  }
                  return v.toMap();
                })
              }
              return v.toMap();
            }),
            organization:                 productData.organization,
            isPublished:                  productData.isPublished,
            isAtCommandMode:              productData.isAtCommandMode,
            doStartInStationMode:         productData.doStartInStationMode,
            doLogWifiAp:                  productData.doLogWifiAp,
            doLogWifiRssi:                productData.doLogWifiRssi,
            doLogWifiRfNoise:             productData.doLogWifiRfNoise,
            interface:                    productData.interface,
            properties:                   Immutable.fromJS(productData.properties, function(k,v){
              if('' === k){
                return v.toMap();
              }
              if('states' === k){
                return v.toList();
              }
              //this has to go before the return v
              if(v.get('id') != undefined && v.get('name') != undefined){
                return new Property(v);
              }
              return v.toMap();
            }),
            disabledIntegratedProperties: Immutable.fromJS(productData.disabledIntegratedProperties, function(k,v){
              if('' === k) return v.map((property) => {
                if(property.get('id') != undefined){
                  return property.get('id');
                }
              }).toSet();
              return v;
            }),
            photoFileUri:                 productData.photoFileUri,
            iconFileUri:                  productData.iconFileUri,
            defaultApSsid:                productData.defaultApSsid,
            defaultApKey:                 productData.defaultApKey,
            defaultApSecurityMode:        productData.defaultApSecurityMode
          }))}
        );
        if(action.data.length === 1){
          newState.historyActiveProductId = action.data[0].id;
        }
        newState.products = productsMap;
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_HISTORY_PRODUCT_SELECTED:
        newState.historyActiveProductId = action.data.productId;
        newState.historyChartConfigs = [];
        newState.historyActiveProductIds= [];

        let activeProduct = newState.products.find((product) => {
          return product.id === newState.historyActiveProductId;
        });

        newState.historyActiveProduct = activeProduct || new Product();

        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_HISTORY_PROPERTY_SELECTED:
        newState.historyActivePropertyIds = action.data.propertyIds;

        //@TODO Merge these on the API end instead?
        let platformProperties = _.get(newState.historyActiveProduct, 'platform.properties', new Immutable.Map());
        let productProperties  = _.get(newState.historyActiveProduct, 'properties', new Immutable.Map());

        let historyActiveProperties = [];

        newState.historyActivePropertyIds.map((propertyId) => {
          let prop = productProperties.find((property) => {
            return property.id === propertyId;
          });
          if(!prop){
            prop = platformProperties.find((property) => {
              return property.id === propertyId;
            });
          }
          historyActiveProperties.push(prop)
        })

        newState.historyActiveProperties = historyActiveProperties || new Property();

        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_HISTORY_LOADED:
        newState.timestampFrom           = action.data.timestampFrom;
        newState.timetampTo              = action.data.timestampTo;
        newState.historyData             = action.data.historyData;
        newState.historyActiveProductIds = action.data.propertyIds;

        //The main reason why the chart config is built here is that this is the way to ensure referential equality
        //That is what prevents highcharts from re-rendering when the parent component state is changing
        //Also see this https://github.com/kirjs/react-highcharts/issues/172
        //@TODO use addPoint instead of full re-render on live update https://www.highcharts.com/stock/demo/dynamic-update
        let chartConfigs = [];

        const from = Moment.unix(state.selectedTimestampFrom);
        const to = Moment.unix(state.selectedTimestampTo);
        const daysBetween = from.diff(to, 'days')
        let biggerTimeline = [];

        action.data.historyData.forEach((item, i) => {

          let series = [];

          for(let key in item){
            let thingSeries = item[key];
            let sn   = _.get(thingSeries, ['tags', 'sn'], 'N/A');
            let data = _.get(thingSeries, 'values', []);
            series[key] = {name: sn, data};

            //Stateful properties should be displayed as stepped lines
            if(newState.historyActiveProperties[i].isModeStateful){
              series[key].step = true;
            }

          }

          let chartConfig = {
            chart: {
              height: 280,
              spacingBottom: 35,
              marginBottom: 55,
              marginTop: 80,
            },
            legend: {
              verticalAlign: 'bottom',
              align:'right',
            },
            rangeSelector: {
              selected: 1
            },
            title: {
              text: 'Readings',
              align: 'left',
              verticalAlign: 'bottom',
              floating: true,
              style: {
                color: '#000',
                fontSize: '14px',
                fontWeight: 'normal',
                textTransform: 'none',
                textDecoration: 'underline'
              }
            },
            time: {
              useUTC: false
            },
            plotOptions: {
              series: {
                point: {
                  events: {
                    mouseOver: function(){
                      let x = this.x,
                      points = [],
                      charts = Highcharts.charts,
                      each = Highcharts.each;
                      each(charts, function(chart){
                        if(chart && chart.series){
                          each(chart.series, function(series){
                            if(series.data){
                              each(series.data, function(point){
                                if (point.x === x && point.series.yAxis.options.index !== 1) {
                                  points.push(point)
                                }
                              })
                            }
                          });
                          points.forEach((p) => {
                            p.setState('hover');
                          });
                          chart.xAxis[0].drawCrosshair(item, points[0]);
                        }
                      });
                    },
                    mouseOut: function(){
                      let x = this.x,
                      points = [],
                      charts = Highcharts.charts,
                      each = Highcharts.each;
                      each(charts, function(chart){
                        if(chart && chart.series){
                          each(chart.series, function(series){
                            if(series.data){
                              each(series.data, function(point){
                                if (point.x === x) {
                                  points.push(point);
                                }
                              })
                            }
                          });
                          points.forEach((p) => {
                            p.setState();
                          });
                        }
                      })
                    }
                  }
                }
              }
            },
            xAxis: [{
              tickPositioner: function () {
                Highcharts.charts.map((chart) => {
                  if(chart){
                    const timeline = chart.get('axis1').tickPositions.slice();
                    if(timeline.length > biggerTimeline.length){
                      biggerTimeline = timeline;
                    }
                  }
                })
                if(biggerTimeline.length > 0){
                  let removedSpaces = biggerTimeline.slice();
                  removedSpaces.shift();
                  return removedSpaces;
                }
              },
              id: 'axis1',
              labels: {
                formatter: function(){
                  return Moment(new Date(this.value)).format(daysBetween === 0 ? 'HH:mm' : 'D. MMM');
                }
              },
              crosshair: true,
              type: 'datetime',
              opposite: true,
              timezone: "browser" //Make sure that user sees the graph based on his own timezone
            }],
            tooltip: {
              followPointer: true
            },
            series: series
          };

          _.set(chartConfig, 'title.text', newState.historyActiveProperties[i].name);

          //For unit based properties - add units
          if(newState.historyActiveProperties[i].isModeUnits){
            _.set(chartConfig, 'title.text', _.get(chartConfig, 'title.text', 'Readings') + ', ' + newState.historyActiveProperties[i].units);
          }

          //Don't allow decimals on stateful properties
          if(newState.historyActiveProperties[i].isModeStateful){
            _.set(chartConfig, 'yAxis.allowDecimals', false);
          }

          //Set proper min / max values on Y
          _.set(chartConfig, 'yAxis.min', newState.historyActiveProperties[i].min);
          _.set(chartConfig, 'yAxis.max', newState.historyActiveProperties[i].max);

          chartConfigs.push(chartConfig);
        })

        newState.historyChartConfigs = chartConfigs;

        return newState;

        break;

      case GroupConstants.GROUPS_GROUP_LIVE_UPDATES_CHANGE:
        newState.doLiveUpdate = action.data.doLiveUpdate;
        newState.liveUpdatesInterval = action.data.liveUpdatesInterval || state.liveUpdatesInterval;

        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_THING_SELECTED:
        newState.selectedThingId = action.data;
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_HISTORY_SELECTED_TIMESTAMP_FROM_CHANGED:
        if(action.data < newState.selectedTimestampTo){
          newState.selectedTimestampFrom = action.data;
        }
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_HISTORY_SELECTED_TIMESTAMP_TO_CHANGED:
        if(action.data > newState.selectedTimestampFrom) {
          newState.selectedTimestampTo = action.data;
        }
        return newState;
        break;

     //EDIT FORM

      case GroupConstants.GROUPS_GROUP_FORM_CREATE:
        newState = this.getInitialState();
        newState.group = newState.group.set('type',   action.data.type);
        newState.group = newState.group.set('parent', action.data.parentId);
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_FORM_EDIT_START:
        newState.draft = newState.group;
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_FORM_CHANGED:
        return ((newState) => {

          const propertyName = action.data.name;
          const newValue     = action.data.newValue;
          const oldValue     = action.data.oldValue;

          if(newValue != oldValue){
            newState.draft = newState.draft.set(propertyName, newValue);
          }
          return newState;

        })(newState);
        break;

      case GroupConstants.GROUPS_GROUP_FORM_DISCARD:
        //Make sure that user doesn't end up in the middle of an ocean when doing map editing
        newState.outdoorMapCenter = {lat: 38.983443,lng: -119.942050};
        newState.draft = newState.group;
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_FORM_SAVE_START:
        newState.isLoading = true;
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_FORM_SAVE_SUCCESS:
        newState.alerts = [{level: 'success', messageText: 'Your group has been successfully saved'}];
        newState.group = newState.draft;
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_FORM_SAVE_END:
        newState.isLoading = false;
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_ERROR:
        newState.isLoading = false;
        newState.isUploadingFloorPlan = false;
        newState.alerts = [{level: 'danger', messageText: action.error}];
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_FORM_EDIT_END:
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_MAP_OUTDOOR_CENTER_CHANGED:
        newState.outdoorMapCenter = action.data.outdoorMapCenter;
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_MAP_OUTDOOR_MARKERS_CHANGED:
        newState.outdoorMapMarkersData = action.data.outdoorMapMarkersData;
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_FORM_FLOOR_UPLOAD_START:
        newState.isUploadingFloorPlan = true;
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_FORM_FLOOR_FILE_LOADED:
        //Make sure that we've got a valid indoor base draft
        //If we do - assign the file ID accordingly
        if(newState.draft.isIndoorBase && action.data){
          newState.draft = newState.draft.set('planFile', new File(action.data));
        }
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_FORM_FLOOR_FILE_RESET:
        newState.draft = newState.draft.set('planFile', new File());
        return newState;
        break;

      case GroupConstants.GROUPS_GROUP_FORM_FLOOR_UPLOAD_END:
        //@TODO Pass some file info here
        newState.isUploadingFloorPlan = false;
        return newState;
        break;

      case AuthConstants.AUTH_LOGOUT:
        return this.getInitialState();
        break;

      default:
        return state;
    }

  }

}

export default new GroupStore();
