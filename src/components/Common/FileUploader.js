import React        from 'react';
import PropTypes    from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import File         from 'entities/File';
import { Button }   from 'react-bootstrap';
import SpinnerCog   from 'components/SpinnerCog';
import GroupActions from "actions/Groups/GroupActions";

class FileUploader extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      file: null
    };
  }

  handleChange(e){
    let files = e.target.files || e.dataTransfer.files;
    if(files.length > 0){
      this.setState({file: files[0]});
    }
  }

  handleStartUpload(){
    if(this.state.file){
      this.props.onUpload(this.state.file);
    }
  }

  render(){

    if(true === this.props.isUploading){
      return(
        <div className="file-upload">
          <SpinnerCog fontSize="18px" color="#ccc" marginTop="15px"> Uploading...</SpinnerCog>
        </div>
      );
    }

    return(
      <div className="file-upload">
        {this.props.currentFileMeta.get('id', false)
          ?
          <div className="curent-file-meta">
            <div className="file-meta">
              <span className="item name">{this.props.currentFileMeta.get('name')}</span>
              <span className="item type">{this.props.currentFileMeta.get('mime')}</span>
              <span className="item fsize">{+this.props.currentFileMeta.get('fsize') / 1024 } KB</span>
            </div>
            <Button
              bsSize="small"
              bsStyle="danger"
              className="btn-raised"
              onClick={this.props.onReset}>Reset</Button>
          </div>
          :
          <div className="new-file-upload">
            <input
              type="file"
              name="file"
              accept={this.props.accept}
              onChange={this.handleChange.bind(this)}
            />
            {this.state.file
              ?
              <Button
                bsSize="small"
                bsStyle="success"
                className="btn-raised"
                onClick={this.handleStartUpload.bind(this)}>Upload</Button>
              :
              null
            }
          </div>
        }
      </div>
    );
  }
}

FileUploader.propTypes = {
  isUploading:     PropTypes.bool.isRequired,
  currentFileMeta: ImmutablePropTypes.record.isRequired,
  onReset:         PropTypes.func.isRequired,
  onUpload:        PropTypes.func.isRequired,
  accept:          PropTypes.string.isRequired
};

export default FileUploader;
