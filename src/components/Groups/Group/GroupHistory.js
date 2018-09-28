import React                        from 'react';
import _                            from 'lodash';
import { Container }                from 'flux/utils';
import {  Link }                    from 'react-router';
import { FormControl, ButtonGroup } from 'react-bootstrap';
import GroupActions                 from 'actions/Groups/GroupActions';
import Moment                       from 'moment';
import DatePicker                   from 'react-datetime';
import GroupStore                   from 'stores/Groups/GroupStore';
import Toggle                       from 'react-toggle-button';
import ReactHighcharts              from 'react-highcharts'; // Expects that Highcharts was loaded in the code.
import SpinnerCog                   from 'components/SpinnerCog';
import GroupHistoryPropertiesList   from 'components/Groups/Group/History/GroupHistoryItemsList';
import ThemeVars                    from 'theme_vars';
import Immutable                    from 'immutable';
import TimespansConstants           from 'constants/UpdateTimespans';

import Highcharts from 'highcharts';

Highcharts.Pointer.prototype.reset = function() {
  return undefined;
};


class Group extends React.Component{

  constructor(props){
    super(props);
    this.offset = 0;
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  static getStores() {
    return [GroupStore];
  }

  static calculateState() {
    return GroupStore.getState();
  }

  componentWillUpdate() {
    this.offset = window.pageYOffset;
  }

  componentDidUpdate() {
    window.scrollTo(0, this.offset);
  }

  componentDidMount(){

    if(this.state.group.get('id') != this.props.params.groupId){
      GroupActions.load(this.props.params.groupId)
        .then(() => {
          GroupActions.loadProducts(this.props.params.groupId);
        });
    }

    //@TODO use addPoint instead of full re-render on live update https://www.highcharts.com/stock/demo/dynamic-update
    this.updateTimer = setInterval(() => {
      if(true === this.state.doLiveUpdate){
        if(this.state.historyActiveProductId && this.state.historyActivePropertyIds.length > 0){

          let timestampFrom = (Math.floor(Date.now() / 1000) - 60 * this.state.liveUpdatesInterval);
          let timestampTo   = (Math.floor(Date.now() / 1000));

          const { selectedTimestampFrom, selectedTimestampTo, historyTimestampFrom, historyTimestampTo, historyActiveProductId} = this.state;

          const newTimestampFrom =  selectedTimestampFrom === historyTimestampFrom ? timestampFrom : selectedTimestampFrom;
          const newTimestampTo   =  selectedTimestampTo   === historyTimestampTo   ? timestampTo   : selectedTimestampTo;

          GroupActions.loadHistories(
            this.props.params.groupId,
            this.state.historyActiveProductId,
            this.state.historyActivePropertyIds,
            newTimestampFrom,
            newTimestampTo
          );
        }
      }
    }, 10000);
  }

  componentWillReceiveProps(nextProps){
    if(this.state.group.get('id') != nextProps.params.groupId){
      GroupActions.load(nextProps.params.groupId)
        .then(() => {
          GroupActions.loadProducts(nextProps.params.groupId);
        });
    }
  }

  doNeedToApply(){
    if(true === this.state.doLiveUpdate) return false;
    if(this.state.historyTimestampFrom == this.state.selectedTimestampFrom & this.state.historyTimestampTo == this.state.selectedTimestampTo) return false;
    return true;
  }

  handleMouseMove (e) {
    let points = null;
    Highcharts.charts.forEach((chart, i) => {
      chart = Highcharts.charts[i];
      if(chart && chart.pointer && chart.series){
        chart = Highcharts.charts[i];
        e = chart.pointer.normalize(e);

        points = [];
        chart.series.forEach((s) => {
          points.push(s.searchPoint(e, true))
        })
        const ready = points.filter(e => !!e).length > 0;
        if (ready) {
          chart.series.forEach((s, i) => {
            if(points[i]){
              chart.tooltip.refresh(points[i]);
            }
          })
        }
      }
    });
  }

  handlePropertySelect(propertyId, properties){
    let propertyIds = new Immutable.List();
    propertyIds = this.state.historyActiveProductIds;
    const _index = propertyIds.indexOf(+propertyId);

    if(_index === -1){
      propertyIds.push(propertyId);
    }else {
      propertyIds.splice(_index, 1);
    }

    let sortedIds = new Immutable.List();

    sortedIds = properties
      .filter((e) => propertyIds.indexOf(e.id) !== -1)
      .toArray()
      .map((e) => e.id);

    const timestampFrom = (Math.floor(Date.now() / 1000) - 60 * this.state.liveUpdatesInterval);
    const timestampTo   = (Math.floor(Date.now() / 1000));

    const { selectedTimestampFrom, selectedTimestampTo, historyTimestampFrom, historyTimestampTo, historyActiveProductId} = this.state;
    const from =  selectedTimestampFrom === historyTimestampFrom ? timestampFrom : selectedTimestampFrom;
    const to =  selectedTimestampTo === historyTimestampTo ? timestampTo : selectedTimestampTo;

    GroupActions.selectHistoryProperty(sortedIds);
    GroupActions.loadHistories(
      this.props.params.groupId,
      historyActiveProductId,
      sortedIds,
      from,
      to,
    )
  }

  componentWillUnmount(){
    clearInterval(this.updateTimer);
  }

  render(){

    let isLoading = this.state.isLoading;

    if(isLoading){
      return(
        <div className="view-group">
          <SpinnerCog fontSize="64px" color="#ccc" marginTop="45%" marginBottom="45%" marginLeft="50%"></SpinnerCog>
        </div>
      );
    }
    // console.log('historyActiveProductIds', historyActiveProductIds);
    return(
      <div className="view-group">
        <div className="title">
          <h3>
            {this.state.group.get('title')}
          </h3>
          <div className="switch">
            <ButtonGroup>
              <Link
                disabled={isLoading}
                className={'btn btn-default'}
                to={'/groups/' + this.props.params.groupId + '/locations'}>
                Locations
              </Link>
              <Link
                disabled={isLoading}
                className={'btn btn-default active'}
                to={'/groups/' + this.props.params.groupId + '/history'}>
                History
              </Link>
            </ButtonGroup>
          </div>
        </div>
        <div className="graph">
          {/*<div className="col-xs-12">*/}
            {/*<div className="col-xs-6 col-md-3">*/}
              {/*<DatePicker*/}
                {/*value={Moment.unix(this.state.selectedTimestampFrom)}*/}
                {/*inputProps={{disabled: this.state.doLiveUpdate}}*/}
                {/*onChange={(momentFrom)=>{*/}
                  {/*let timestampFrom= momentFrom.unix();*/}
                  {/*ThingHistoryActions.changeSelectedTimestampFrom(timestampFrom);*/}
                  {/*//ThingHistoryStore.load(this.props.params.groupId, false, false, timestampFrom);*/}
                {/*}}*/}
              {/*/>*/}
            {/*</div>*/}
            {/*<div className="col-xs-6 col-md-3">*/}
              {/*<DatePicker*/}
                {/*value={Moment.unix(this.state.selectedTimestampTo)}*/}
                {/*inputProps={{disabled: this.state.doLiveUpdate}}*/}
                {/*onChange={(momentTo)=>{*/}
                  {/*let timestampTo = momentTo.unix();*/}
                  {/*ThingHistoryActions.changeSelectedTimestampTo(timestampTo);*/}
                  {/*//ThingHistoryStore.load(this.props.params.groupId, false, false, false, timestampTo);*/}
                {/*}}*/}
              {/*/>*/}
            {/*</div>*/}
          {/*</div>*/}
            <div>
              <div className="toggle">
                <Toggle
                  onToggle={() => {
                    GroupActions.changeLiveUpdates(!this.state.doLiveUpdate);
                  }}
                  value={this.state.doLiveUpdate}
                  colors={{
                    active:   {base: ThemeVars.toggleColorActiveBase  , hover: ThemeVars.toggleColorActiveHover  },
                    inactive: {base: ThemeVars.toggleColorInactiveBase, hover: ThemeVars.toggleColorInactiveHover}
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
                  value={this.state.liveUpdatesInterval}
                  disabled={!this.state.doLiveUpdate}
                  onChange={(event) => {
                    GroupActions.changeLiveUpdates(this.state.doLiveUpdate, event.target.value);
                  }}>

                  {TimespansConstants.map((entry, i) => (
                    <option value={entry.value} key={i}>{entry.label}</option>
                  ))}

                </FormControl>
              </div>
              <div className="col-xs-12 col-md-3">
                <DatePicker
                  value={Moment.unix(this.state.selectedTimestampFrom)}
                  inputProps={{disabled: this.state.doLiveUpdate}}
                  onChange={(momentFrom)=>{
                    let timestampFrom= momentFrom.unix();
                    GroupActions.changeSelectedTimestampFrom(timestampFrom);
                  }}
                />
              </div>
              <div className="col-xs-12 col-md-3">
                <DatePicker
                  value={Moment.unix(this.state.selectedTimestampTo)}
                  inputProps={{disabled: this.state.doLiveUpdate}}
                  onChange={(momentTo)=>{
                    let timestampTo = momentTo.unix();
                    GroupActions.changeSelectedTimestampTo(timestampTo);
                  }}
                />
              </div>
              <div className="col-xs-12 col-md-2">
                {
                  this.doNeedToApply()
                    ?
                    <a href="#" className="btn btn-sm btn-raised btn-primary" onClick={() => {

                      GroupActions.loadHistories(
                        this.props.params.groupId,
                        this.state.historyActiveProductId,
                        this.state.historyActivePropertyIds,
                        this.state.selectedTimestampFrom,
                        this.state.selectedTimestampTo
                      );

                    }}>Apply</a>
                    :
                    null
                }
              </div>
            </div>
            <GroupHistoryPropertiesList
              products={this.state.products}
              activeProductId={this.state.historyActiveProductId}
              activePropertyIds={this.state.historyActiveProductIds}
              onProductChange={GroupActions.selectHistoryProduct}
              onPropertyChange={this.handlePropertySelect.bind(this)}
            />
             <div onMouseMove={this.handleMouseMove}>
              {
                _.get(this.state, ['historyChartConfigs', 'length'], 0) > 0
                ?
                this.state.historyChartConfigs
                .map((chart, i)=> {
                  if(chart.series.length > 0){
                    return <ReactHighcharts key={i} config={chart} isPureConfig = {true}></ReactHighcharts>
                  }else {
                    return <div className="chart-placeholder" key={i}> No data for {chart.title.text}</div>
                  }
                })
                :
                'No data available. Please review fetching criteria.'
              }
            </div>
          </div>
      </div>
    );
  }
}

export default Container.create(Group);
