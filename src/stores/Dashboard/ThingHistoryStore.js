import AppDispatcher         from 'dispatcher';
import { ReduceStore }       from 'flux/utils';
import Immutable             from 'immutable';
import Highcharts            from 'highcharts';
import AuthConstants         from 'constants/actions/Auth';
import ThingHistoryConstants from 'constants/actions/Dashboard/ThingHistory';
import Property              from 'entities/Property';
import Moment                from 'moment';

class ThingHistoryStore extends ReduceStore {

  constructor() {
    super(AppDispatcher);
  }

  getInitialState(){
    return {
      isLoading:              true,
      alerts:                 [],
      timestampFrom:          (Math.floor(Date.now() / 1000) - 60 * 60),
      timestampTo:            (Math.floor(Date.now() / 1000)),
      selectedTimestampFrom:  (Math.floor(Date.now() / 1000) - 60 * 60),
      selectedTimestampTo:    (Math.floor(Date.now() / 1000)),
      doLiveUpdate:           true,
      liveUpdatesInterval:    60,
      activePropertyId:       null,
      historyActiveProperty:  new Property(),
      data:                   [],
      chartConfigs:           [],
      activePropertyIds:      new Immutable.List()
    }
  }

  //********************************************************************************

  reduce(state, action){

    let newState = Object.assign({}, state);

    switch(action.actionType) {

      case ThingHistoryConstants.THING_HISTORY_LOAD_START:
        newState.isLoading             = true;
        newState.alerts                = [];
        newState.activePropertyIds     = [];
        newState.activePropertyId      = null;
        newState.historyActiveProperty = new Property();
        return newState;
        break;

      case ThingHistoryConstants.THING_HISTORY_LOAD_END:
        newState.isLoading = false;
        return newState;
        break;

      case ThingHistoryConstants.THING_HISTORY_LOADED:

        newState.activePropertyIds     = action.data.propertyIds;
        newState.timestampFrom         = action.data.timestampFrom;
        newState.timestampTo           = action.data.timestampTo;
        newState.selectedTimestampFrom = action.data.timestampFrom;
        newState.selectedTimestampTo   = action.data.timestampTo;
        newState.historyData           = action.data.historyData;

        //The main reason why the chart config is built here is that this is the way to ensure referential equality
        //That is what prevents highcharts from re-rendering when the parent component state is changing
        //Also see this https://github.com/kirjs/react-highcharts/issues/172
        //@TODO use addPoint instead of full re-render on live update https://www.highcharts.com/stock/demo/dynamic-update
        let chartConfigs = [];
        const from = Moment.unix(state.selectedTimestampFrom);
        const to = Moment.unix(state.selectedTimestampTo);
        const daysBetween = from.diff(to, 'days')
        action.data.historyData.map((e, i) => {
          const property =  state.properties.find((prop) => newState.activePropertyIds[i] === prop.id);
          if(property){
            const item = {
              chart: {
                height: 280,
                spacingBottom: 100
              },
              rangeSelector: {
                selected: 1
              },
              title: {
                text: property.get('name', 'N/A'),
                verticalAlign: 'bottom',
                style: {
                  color: '#fff',
                }
              },
              time: {
                useUTC: false
              },
              xAxis: [{
                startOnTick: true,
                endOnTick: true,
                tickPositioner: function () {
                  let biggerTimeline = [];
                  Highcharts.charts.map((chart) => {
                    if(chart){
                      const timeline = chart.get('axis1').tickPositions.slice();
                      if(timeline.length > biggerTimeline.length){
                        biggerTimeline = timeline;
                      }
                    }
                    if(biggerTimeline.length > 0){
                      return biggerTimeline
                    }
                  })
                },
                id: 'axis1',
                labels: {
                  formatter: function(){
                    return Moment(new Date(this.value)).format(daysBetween === 0 ? 'HH:mm' : 'D. MMM');
                  },
                },
                crosshair: true,
                opposite: true,
                type: 'datetime',
                timezone: "browser" //Make sure that user sees the graph based on his own timezone
              }],
              legend: {
                enabled: true,
                floating: true,
                verticalAlign: 'bottom',
                align:'right',
                y:40
              },
              series: [{
                name: property.get('unit', 'N/A'),
                data: e,
                color: Highcharts.getOptions().colors[i],
                step: property.isModeStateful
              }]
            };
            chartConfigs.push(item);
          }
        })


        newState.chartConfigs = chartConfigs;
        return newState;
        break;

      case ThingHistoryConstants.THING_HISTORY_LIVE_UPDATES_CHANGED:
        newState.doLiveUpdate       = action.data.doLiveUpdate;
        newState.liveUpdatesInterval = action.data.liveUpdatesInterval || state.liveUpdatesInterval;
        return newState;
        break;

      case ThingHistoryConstants.THING_HISTORY_SELECTED_TIMESTAMP_FROM_CHANGED:
        if(action.data < newState.selectedTimestampTo){
          newState.selectedTimestampFrom = action.data;
        }
        return newState;
        break;

      case ThingHistoryConstants.THING_HISTORY_SELECTED_TIMESTAMP_TO_CHANGED:
        if(action.data > newState.selectedTimestampFrom) {
          newState.selectedTimestampTo = action.data;
        }
        return newState;
        break;

      case ThingHistoryConstants.THING_HISTORY_ERROR:
        newState.isLoading = false;
        newState.alerts = [{level: 'danger', messageText: action.error}];
        return newState;
        break;

      case AuthConstants.AUTH_LOGOUT:
        return this.getInitialState();
        break;

      default:
        return newState;
    }

  }

}

export default new ThingHistoryStore();
