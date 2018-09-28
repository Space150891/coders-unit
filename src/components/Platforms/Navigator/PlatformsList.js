import React from 'react';
import PlatformsListItem from 'components/Platforms/Navigator/PlatformsListItem';

class PlatformsList extends React.Component{

  constructor(props){
    super(props);
  }

  render(){
    return(
      <div id="platforms-list" className="list">
        {this.props.data.map((itemData, key) => {
          return <PlatformsListItem key={key} data={itemData}></PlatformsListItem>
        })}
      </div>
    );
  }

}

export default PlatformsList
