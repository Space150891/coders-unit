import PropTypes                from 'prop-types';
import React                    from 'react';
import Immutable                from 'immutable';
import ImmutablePropTypes       from 'react-immutable-proptypes';
import PropertyTypes            from 'constants/PropertyTypes';
import PropertyModes            from 'constants/PropertyModes';
import ProductAction            from 'actions/Products/ProductActions';
import WarningThresholdsPopover from 'components/Products/Product/WarningThresholdsPopover';

class PropertiesList extends React.Component{

  constructor(props){
    super(props);
  }

  isPropertyEnabled(propertyId){
    return !this.props.disabledIntegratedProperties.has(propertyId);
  }

  render(){
    if(this.props.data && this.props.data.size > 0){
      return(
        <table className="table">
          <tbody>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>ID</th>
              <th>Units</th>
              <th>Data Type</th>
              <th>Mode</th>
              <th>Warning Levels</th>
              {true === this.props.isIntegrated ? null : <th>External Functions</th>}
              {true === this.props.showActions && true === this.props.isIntegrated ?
                <th>Enabled</th>
                :
                <th>&nbsp;</th>
              }
            </tr>
            {this.props.data
              .entrySeq()
              .map((entry) => {
                let key      = entry[0];
                let property = entry[1];
                return(
                  <tr key={key} className={property.get('isEnabled') ? null : 'disabled'}>
                    <td>{property.get('name')}      </td>
                    <td>{property.get('type') == PropertyTypes.get('PROPERTY_TYPE_CONTROL') ? 'Control' : property.get('type') == PropertyTypes.get('PROPERTY_TYPE_SENSOR') ? 'Sensor' : 'N/A'}</td>
                    <td className="hex">{property.get('id') ? '0x0' + property.get('id').toString(16) : 'NEW'}</td>
                    <td>{property.get('units')}      </td>
                    <td>{property.get('dataType')}   </td>
                    <td>{property.get('mode') == PropertyModes.get('PROPERTY_MODE_UNITS') ? 'Scalar' : property.get('mode') == PropertyModes.get('PROPERTY_MODE_STATEFUL') ? 'Stateful' : 'N/A'}</td>
                    <td>
                      <WarningThresholdsPopover popoverKey={key} warningThresholds={property.get('warningThresholds')}/>
                    </td>
                    {true === this.props.isIntegrated ?
                      null
                    :
                      <td>
                        {property.get('isArduinoModule')  === true ? <span className="label label-primary">Arduino</span> : null}
                      </td>
                    }
                    {true === this.props.showActions && !(true === this.props.isIntegrated) ?
                      <td>
                        <a href="#" onClick={() => {ProductAction.formPropertyEditStart(key)}}>
                          <i className="fa fa-cog i-icon medium circle-transition" aria-hidden="true"></i>
                        </a>
                        <a href="#" onClick={() => {ProductAction.formPropertyRemove(key)}}>
                          <i className="fa fa-trash i-icon medium circle-transition" aria-hidden="true"></i>
                        </a>
                      </td>
                    : null}
                    {true === this.props.showActions && true === this.props.isIntegrated ?
                      <td>
                        <input
                          type="checkbox"
                          checked={this.isPropertyEnabled(property.get('id'))}
                          onChange={() => (ProductAction.formChildrenIntegratedDisabledChange(property.get('id'), this.isPropertyEnabled(property.get('id'))))}
                        />
                      </td>
                      : null}
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      );
    }

    return(
      <div>
        { true === this.props.isIntegrated
          ?
          <div>No integrated properties defined for the platform used with this product.</div>
          :
          <div>No properties defined. Edit this product to add some.</div>
        }
      </div>
    );

  }
}

PropertiesList.defaultProps = {
  data:         new Immutable.Map(),
  showActions:  false,
  isIntegrated: false,
  disabledIntegratedProperties:  new Immutable.Set()
};

PropertiesList.propTypes = {
  data:         ImmutablePropTypes.map,
  showActions:  PropTypes.bool,
  isIntegrated: PropTypes.bool,
  disabledIntegratedProperties:  ImmutablePropTypes.set
};

export default PropertiesList;
