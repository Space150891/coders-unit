var React             = require('react');
var PropTypes         = require('prop-types');
var { Button, Modal } = require('react-bootstrap');

class Confirm extends React.Component{

  constructor(props){
    super(props);
    this.state = {isOpened: Boolean(this.props.visible)};
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.visible != undefined){
      this.setState({
        isOpened: nextProps.visible
      });
    }
  }

  onButtonClick() {
    this.setState({
      isOpened: true
    });
  }

  onClose() {
    this.setState({
      isOpened: false
    });
    if(this.props.onClose) this.props.onClose();
  }

  onConfirm() {
    this.setState({
      isOpened: false
    });
    this.props.onConfirm();
  }

  render() {
    var cancelButton = this.props.showCancelButton ? <Button bsStyle="default"  onClick={this.onClose.bind(this)}>{this.props.cancelText}</Button> : null;
    var modal = (
      <Modal show={this.state.isOpened} onHide={this.onClose.bind(this)}>
        <Modal.Header>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.body}
        </Modal.Body>
        <Modal.Footer>
          {cancelButton}
          <Button bsStyle={this.props.confirmBSStyle}  onClick={this.onConfirm.bind(this)}>{this.props.confirmText}</Button>
        </Modal.Footer>
      </Modal>
    );
    var content;
    if (this.props.children) {
      var btn = React.Children.only(this.props.children);
      btn = React.cloneElement(btn, {
          onClick: this.onButtonClick.bind(this),
          style: this.props.style
        },
        btn.props.children
      );
      content = <span>
        {btn}
        {modal}
      </span>
    } else {
      content = (
        <span>
          <Button onClick={this.onButtonClick.bind(this)}  style={this.props.style}>
            {this.props.buttonText}
          </Button>
          {modal}
        </span>
      );
    }
    return content;
  }
}

Confirm.defaultProps = {
    cancelText:      'Cancel',
    confirmText:     'Confirm',
    confirmBSStyle:  'danger',
    showCancelButton: true
}

Confirm.propTypes = {
    body:             PropTypes.node.isRequired,
    buttonText:       PropTypes.node,
    cancelText:       PropTypes.node,
    confirmBSStyle:   PropTypes.string,
    confirmText:      PropTypes.node,
    onConfirm:        PropTypes.func.isRequired,
    onClose:          PropTypes.func,
    showCancelButton: PropTypes.bool.isRequired,
    title:            PropTypes.node.isRequired,
    visible:          PropTypes.bool
}

module.exports = Confirm;
