import _      from 'lodash';
import PropTypes from 'prop-types';
import React  from 'react';
import zxcvbn from 'zxcvbn';
import { FormControl, ProgressBar } from 'react-bootstrap';

//https://github.com/shockjs/bootstrap-react-password-strength/blob/master/src/index.js
export default class BootstrapPasswordStrength extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      result: zxcvbn(nextProps.value)
    });
  }

  render()
  {
    const { labelText } = this.props;
    const passwordLabel = (labelText) ? labelText : 'Enter password';
    const scoreClasses = [
      { label: <span>Very weak</span>, bsStyle: 'danger', striped: true, active: true, now: 20 },
      { label: <span>Weak</span>,  bsStyle: 'danger', striped: true, active: true, now: 40 },
      { label: <span>Ok</span>,  bsStyle: 'warning', striped: true, active: true, now: 60 },
      { label: <span>Strong</span>,  bsStyle: 'success', now: 80 },
      { label: <span>Very strong</span>,  bsStyle: 'success', now: 100 }
    ];
    const scoreClass = scoreClasses[_.get(this.state, ['result', 'score'], 0)];
    const label = <label>{ passwordLabel }</label>;

    const inputProps = Object.assign({}, this.props, {
      label: label,
      type: 'password'
    });

    return(
      <section>
        <FormControl { ...inputProps } />
        { this.state.result && this.props.value &&
        <ProgressBar { ...scoreClass } /> }
      </section>
    )
  }
}

BootstrapPasswordStrength.propTypes = {
  value: PropTypes.string
};