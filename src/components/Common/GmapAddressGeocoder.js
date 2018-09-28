import React         from 'react';
import PropTypes     from 'prop-types';
import { FormGroup, Button } from 'react-bootstrap';

export default class GmapAddressGeocoder extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      address: ''
    };
    this.geocoder = new window.google.maps.Geocoder();
  }

  handleAddressChange(e){
    this.setState({address: e.target.value});
  }

  handleGeocode(){
    if(this.state.address){
      this.geocoder.geocode(
      {address: this.state.address},
        function (results, status) {
          if ('OK' === status) {
            let latLng = results[0].geometry.location;
            if(latLng){
              this.props.onGeocode({lat: latLng.lat(), lng: latLng.lng()})
            }
          }
        }.bind(this)
      );
    }
  }

  render()
  {
    return(
      <div className="address-geocoder">
        <FormGroup>
          <label htmlFor="address">
            Find by address
          </label>
          <input
            className="form-control"
            type="text"
            name="address"
            value={this.state.address}
            onChange={this.handleAddressChange.bind(this)}/>
        </FormGroup>
        <Button bsStyle="success" className="btn-raised" onClick={this.handleGeocode.bind(this)}>Find</Button>
      </div>
    )
  }
}

GmapAddressGeocoder.propTypes = {
  onGeocode: PropTypes.func
}
