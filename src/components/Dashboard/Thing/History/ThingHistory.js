import React                  from 'react';
import { Container }          from 'flux/utils';
import { FormControl, Alert } from 'react-bootstrap';
import Moment                 from 'moment';
import DatePicker             from 'react-datetime';
import ThingHistoryActions    from 'actions/Dashboard/ThingHistoryActions';
import ThingStore             from 'stores/Dashboard/ThingStore';
import ThingHistoryStore      from 'stores/Dashboard/ThingHistoryStore';
import ThingHistoryItemSelect from 'components/Dashboard/Thing/History/ThingHistoryItemSelect';
import Toggle                 from 'react-toggle-button';
import ReactHighcharts        from 'react-highcharts'; // Expects that Highcharts was loaded in the code.
import ThemeVars              from 'theme_vars';
import { Link }               from 'react-router';
import Immutable              from 'immutable';
import TimespansConstants     from 'constants/UpdateTimespans';
import _                      from 'lodash';

import Highcharts from 'highcharts';

Highcharts.Pointer.prototype.reset = () => {};

Highcharts.Point.prototype.highlight = function (event) {
  this.onMouseOver(); // Show the hover marker
  this.series.chart.tooltip.refresh(this); // Show the tooltip
  this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
};

class ThingHistory extends React.Component{

  constructor(props){
    super(props);
    let timestampFrom = (Math.floor(Date.now() / 1000) - 60);
    let timestampTo   = (Math.floor(Date.now() / 1000));
    ThingHistoryActions.load(props.params.id,  null, timestampFrom, timestampTo);

    this.offset = 0;

    this.handleMouseMove = this.handleMouseMove.bind(this);
  }


  static getStores() {
    return [ThingHistoryStore, ThingStore];
  }

  static calculateState() {

    let newState   = ThingHistoryStore.getState();
    let thingState = ThingStore.getState();

    newState.thing      = thingState.thing;
    newState.product    = thingState.product;
    newState.properties = thingState.properties;

    let activeProperty = {};

    activeProperty = newState.properties.find((value) => {
      return value.id === newState.activePropertyId
    });

    newState.activeProperty = activeProperty;

    return newState;
  }

  componentWillUpdate() {
    this.offset = window.pageYOffset;
  }

  componentDidUpdate() {
    window.scrollTo(0, this.offset);
  }

  componentDidMount(){
    this.updateTimer = setInterval(() => {
      if(true === this.state.doLiveUpdate){
        if(!this.state.isLoading){
          let timestampFrom = (Math.floor(Date.now() / 1000) - 60 * this.state.liveUpdatesInterval);
          let timestampTo   = (Math.floor(Date.now() / 1000));

          ThingHistoryActions.loadHistories(this.props.params.id, this.state.activePropertyIds, timestampFrom, timestampTo);
        }
      }
    }, 10000);
  }

  componentWillReceiveProps(nextProps){
    if(this.props.params.id != nextProps.params.id){
      ThingHistoryActions.load(
        nextProps.params.id,
        false,
        this.state.selectedTimestampFrom,
        this.state.selectedTimestampTo
      )
    }
  }

  componentWillUnmount(){
    clearInterval(this.updateTimer);
  }

  // getActivePropertyMinMaxValues(){
  //   let min = _.get(this.state, 'activeProperty.min', 0);
  //   let max = _.get(this.state, 'activeProperty.max', 100);
  //   return  [min,max];
  // }

  handleMouseMove (e) {
    let point = null;
    let event = null;
    Highcharts.charts.forEach(chart => {
      if(chart && chart.pointer && chart.series){
        event = chart.pointer.normalize(e); // Find coordinates within the chart
        point = chart.series[0].searchPoint(event, true); // Get the hovered point
      }
      if (point) {
        point.highlight(e);
      }
    });
  }

  doNeedToApply(){
    if(true === this.state.doLiveUpdate) return false;
    if(this.state.timestampFrom == this.state.selectedTimestampFrom & this.state.timestampTo == this.state.selectedTimestampTo) return false;
    return true;
  }

  handlePropertySelect(propertyId){

    let propertyIds = new Immutable.List();
    propertyIds = this.state.activePropertyIds;

    const _index = this.state.activePropertyIds.indexOf(+propertyId);
    if(_index === -1){
      propertyIds.push(propertyId);
    }else {
      propertyIds.splice(_index, 1)
    }

    let sortedIds = new Immutable.List();

    sortedIds = this.state.properties
      .filter((e) => propertyIds.indexOf(e.id) !== -1)
      .toArray()
      .map((e) => e.id);

    let timestampFrom = (Math.floor(Date.now() / 1000) - 60 * this.state.liveUpdatesInterval);
    let timestampTo   = (Math.floor(Date.now() / 1000));
    ThingHistoryActions.load(this.props.params.id, sortedIds, timestampFrom, timestampTo);
  }

  render(){
    const {
      chartConfigs,
      activePropertyIds,
      thing,
      properties,
      product,
      doLiveUpdate,
      liveUpdatesInterval,
      selectedTimestampFrom,
      selectedTimestampTo,
      isLoading,
      alerts
    } = this.state;

    return(
      <div className="thing-history-view">
        <div className="header">
          <div className="title">
            <h3>{product.get('name') || 'Thing'} S/N:{thing.get('sn') || 'NEW'} history</h3>
            <div className="actions">
              <div className="icons">
                <Link to={`/thing/${thing.get('id')}/readings`}>
                  <i className="fa fa-tachometer success" aria-hidden="true"></i>
                </Link>
              </div>
            </div>
          </div>
          <div className="live-update-toggle">
            <div className="toggle">
              <Toggle
                onToggle={() => {
                  if(!isLoading){
                    ThingHistoryActions.changeLiveUpdates(!doLiveUpdate);
                  }
                }}
                value={doLiveUpdate}
                colors={{
                  active:   {base: ThemeVars.toggleColorActiveBase  , hover: ThemeVars.toggleColorActiveHover   },
                  inactive: {base: ThemeVars.toggleColorInactiveBase, hover: ThemeVars.toggleColorInactiveHover }
                }}
              />
            </div>
            <div className="toggle-label">
              Live Update
            </div>
          </div>
          <div className="row graph-controls">
            <div className="col-xs-12 col-md-2">
              <FormControl
                componentClass="select"
                value={liveUpdatesInterval}
                disabled={!doLiveUpdate || isLoading}
                onChange={(event) => {
                  ThingHistoryActions.changeLiveUpdates(doLiveUpdate, event.target.value);
                }}>
                  {TimespansConstants.map((entry, i) => (
                    <option value={entry.value} key={i}>{entry.label}</option>
                  ))}
              </FormControl>
            </div>
            <div className="col-xs-12 col-md-3">
              <DatePicker
                value={Moment.unix(selectedTimestampFrom)}
                inputProps={{disabled: doLiveUpdate  || isLoading}}
                onChange={(momentFrom)=>{
                  let timestampFrom= momentFrom.unix();
                  ThingHistoryActions.changeSelectedTimestampFrom(timestampFrom);
                }}
              />
            </div>
            <div className="col-xs-12 col-md-3">
              <DatePicker
                value={Moment.unix(selectedTimestampTo)}
                inputProps={{disabled: doLiveUpdate || isLoading}}
                onChange={(momentTo)=>{
                  let timestampTo = momentTo.unix();
                  ThingHistoryActions.changeSelectedTimestampTo(timestampTo);
                }}
              />
            </div>
            <div className="col-xs-12 col-md-2">
              {
                this.doNeedToApply()
                  ?
                  <a href="#" className="btn btn-sm btn-raised btn-primary" onClick={() => {
                    ThingHistoryActions.load(
                      this.props.params.id,
                      activePropertyIds,
                      selectedTimestampFrom,
                      selectedTimestampTo
                    )
                  }}>Apply</a>
                  :
                  null
              }
            </div>
          </div>
        </div>
        {alerts.map((message, key)=> {
          return <Alert key={key} bsStyle={message.level}>
            {message.messageText}
          </Alert>
        })}

        <ThingHistoryItemSelect
          isLoading = {isLoading}
          properties       = {properties}
          activePropertyIds = {activePropertyIds}
          onPropertyChange = {this.handlePropertySelect.bind(this)}
        />
        <div onMouseMove={this.handleMouseMove}>
          {
            _.get(this.state, ['historyData', 'length'], 0) > 0
              ?

              chartConfigs
              .map((chart, i)=> {
                if(chart.series[0].data.length > 0){
                  return <ReactHighcharts key={i} config={chart} isPureConfig = {true}></ReactHighcharts>
                }else {
                  return <div className="chart-placeholder" key={i}> No data for {chart.title.text}</div>
                }
              })
              :
              'No data available. Please review fetching criteria.'
          }
        </div>

        {/*{_.get(this.state, ['series', 'length'], 0) > 0*/}

          {/*?*/}

          {/*<Chart*/}
            {/*chartType="LineChart"*/}
            {/*rows={this.state.series}*/}
            {/*columns={[*/}
              {/*{*/}
                {/*'type': 'datetime',*/}
                {/*'label' : 'Time'*/}
              {/*},*/}
              {/*{*/}
                {/*'type' : 'number',*/}
                {/*'label' : _.get(this.state, 'activeProperty.units', 'Data')*/}
              {/*}*/}
            {/*]}*/}
            {/*options={{*/}
              {/*'chartArea': {'width': '90%', 'height': '80%'},*/}
              {/*'legend':    {'position': 'bottom'},*/}
              {/*'vAxis':     this.getVAxisOptions()*/}
            {/*}}*/}
            {/*dateFormat={{*/}
              {/*column: 0,*/}
              {/*options: {*/}
                {/*pattern: "yyyy-MM-dd HH:mm:ss.SSS"*/}
              {/*}*/}
            {/*}}*/}
            {/*graph_id="thingHistory"*/}
            {/*width="100%"*/}
            {/*height="500px"*/}
            {/*legend_toggle*/}
          {/*/>*/}

          {/*:*/}

          {/*'No data available. Please review fetching criteria.'*/}
        {/*}*/}
      </div>
    );
  }
}

export default Container.create(ThingHistory);
