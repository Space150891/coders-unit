import React     from 'react';
// import State     from 'entities/State'

// const unknownState = new State({
//   'value': null,
//   'text': 'Unknown State',
//   'textColor': '#fbfbf7',
//   'bgColor': '#ff0003'
// });

class StatefulPropertiesListItem extends React.Component{

  constructor(props){
    super(props);
  }

  getCurrentState(){
      let currentState = this.props.states.find((state) => {
        return state.get('value') == this.props.value;
      });
      if(currentState) return currentState;
      return false;
  }

  render(){
    let currentState = this.getCurrentState();
    return(
      <div className="item">
        {this.props.name} : {currentState ? <span className="badge" style={{color: currentState.get('textColor'), backgroundColor: currentState.get('bgColor')}}>{currentState.get('text')}</span> : this.props.value}
        <div className="time">
          {this.props.time}
        </div>
      </div>
    );
  }

}

export default StatefulPropertiesListItem;
