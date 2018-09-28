import React            from 'react';
import { Container }    from 'flux/utils';
import ProductStore     from 'stores/Products/ProductStore';
import ProductActions   from 'actions/Products/ProductActions';
import Confirm          from 'components/Common/Confirm';
import PropertiesList   from 'components/Products/Product/PropertiesList';
import SpinnerCog       from 'components/SpinnerCog';
import { Link }         from 'react-router';
import { Alert }        from 'react-bootstrap';

class Product extends React.Component{

  constructor(props){
    super(props);

    //The following is moved here because the componentDidMount (and willMount) are called after the initial state is assigned
    //So when component changes - it first renders the previous state of newly rendered one and only then starts loading sequence
    ProductActions.load(props.params.id);
  }

  static getStores(){
    return [ProductStore];
  }

  static calculateState(){
    return ProductStore.getState();
  }

  componentWillMount(){}

  componentWillReceiveProps(nextProps){
    if(nextProps.params.id != this.props.params.id){
      ProductActions.load(nextProps.params.id);
    }
  }

  render(){

    if(true === this.state.isLoading){
      return <SpinnerCog fontSize="64px" color="#ccc" marginTop="45%" marginBottom="45%" marginLeft="50%"></SpinnerCog>
    }

    if(this.state.product){

      return(<div className="view-product">
        <div className="header row">
          <div className="info col-xs-12 col-md-8 col-lg-10">
            <div className="title">
              <h3>{this.state.product.get('name')|| 'N/A'}</h3>
              <div className="actions">
                <div className="icons">
                  <Link to={`/products/${this.props.params.id}/edit`}>
                    <i className="fa fa-pencil info" aria-hidden="true"></i>
                  </Link>
                  <Confirm
                    onConfirm={function(){ProductActions.delete(this.props.params.id)}.bind(this)}
                    body="Are you sure you want to delete this product? This action cannot be undone."
                    confirmText="Confirm Delete"
                    title="Confirmation Required">
                    <a href="#">
                      <i className="fa fa-trash danger" aria-hidden="true"></i>
                    </a>
                  </Confirm>
                  <Confirm
                    onConfirm={function(){ProductActions.downloadSources(this.props.params.id)}.bind(this)}
                    body="This action will generate and download the source code files that can be used with your thing. Would you like to proceed?"
                    confirmText="Download"
                    title="Confirmation Required">
                    <a href="#">
                      <i className="fa fa-cloud-download success" aria-hidden="true"></i>
                    </a>
                  </Confirm>
                </div>
              </div>
            </div>
            <div className="details">
              <div className={'row col-xs-12 ' + (this.state.product.get('photoFileUri') ? 'col-md-10' : null) }>
                <div>
                  <table>
                    <tbody>
                      <tr>
                        <td>Platform:</td>
                        <td>{this.state.product.get('platform').name || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Shortname:</td>
                        <td>{this.state.product.get('shortname')     || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>ID:</td>
                        <td>{this.state.product.get('id') && this.state.product.get('id') .toString ? '0x0' + this.state.product.get('id') .toString(16) : 'NEW'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="product-photo col-xs-12 col-md-4 col-lg-2">
            <img src={this.state.product.get('photoFileUri')} alt=""/>
          </div>
        </div>

        {this.state.alerts.map((message, key)=> {
          return <Alert key={key} bsStyle={message.level}>
            {message.messageText}
          </Alert>
        })}

        <div className="controls">
          <h3>Properties</h3>
          <PropertiesList data={this.state.product.get('properties')}/>
          <h5>Integrated</h5>
          <PropertiesList data={this.state.product.get('platform').get('properties')} isIntegrated={true}/>
        </div>
      </div>);

    }

    return(
      <div>
        {this.state.alerts.map((message, key)=> {
          return <Alert key={key} bsStyle={message.level}>
          {message.messageText}
          </Alert>
        })}
      </div>
    );

  }

}

export default Container.create(Product);
