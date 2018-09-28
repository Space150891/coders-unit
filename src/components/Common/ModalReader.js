import PropTypes from 'prop-types';
import React from 'react';
import {Button, Modal} from 'react-bootstrap'

class ModalReader extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      isOpen: false
    };
  }

  handleLinkClick(){
    this.setState({isOpen: true});
  }

  handleModalClose() {
    this.setState({
      isOpen: false
    });
  }

  render(){
    return(
      <span>
        <a href="#" onClick={this.handleLinkClick.bind(this)}>{this.props.title}</a>
        <Modal show={this.state.isOpen} onHide={this.onClose}>
          <Modal.Header>
            <Modal.Title>{this.props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <pre>
              {this.props.body}
            </pre>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle={this.props.confirmBSStyle} onClick={this.handleModalClose.bind(this)}>{this.props.dismissText}</Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  }

}
ModalReader.propTypes = {
  title: PropTypes.string,
  body: PropTypes.string,
  dismissText: PropTypes.string
};

ModalReader.defaultProps = {
  dismissText: 'Close'
};

export default ModalReader;