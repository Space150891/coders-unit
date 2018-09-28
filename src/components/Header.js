import React                    from 'react';
import { Link }                 from 'react-router'
import AuthStore                from '../stores/AuthStore';
import {Navbar, Header, Brand } from 'react-bootstrap';
import ThemeVars                from 'theme_vars';

class HeaderComponent extends React.Component {

  constructor(props) {
    super(props);
    this.toggleClass = this.toggleClass.bind(this);
    this.state = {
      activeMobileMenu: false,
    };
  }

  toggleClass() {
    this.setState({ activeMobileMenu: !this.state.activeMobileMenu });
  }

  render() {
    return (
      <React.Fragment>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              {ThemeVars.headerlogoUrl ? <a href={ThemeVars.headerlogoUrl}></a> : null}
            </Navbar.Brand>
            <span className="navbar-mobile" onClick={this.toggleClass}>X</span>
          </Navbar.Header>
          {AuthStore.isAuthenticated()
            ?
            <ul className="nav navbar-nav">
              <li>
                <Link to="/" activeClassName="active">Dashboard</Link>
              </li>
              <li>
                <Link to="/products" activeClassName="active">Products</Link>
              </li>
              <li>
                <Link to="/user">My Settings</Link>
              </li>
              <li>
                <a href="https://imatrix.io/guides" target="__blank">Guides</a>
              </li>
              <li>
                <Link to="/logout">Logout</Link>
              </li>
            </ul>
            :
            <ul className="nav navbar-nav">
              <li>
                <Link to="/login" activeClassName="active">Login</Link>
              </li>
            </ul>
          }
        </Navbar>
        <div className={this.state.activeMobileMenu ? 'mobileMenu menuOpen' : 'mobileMenu'}>
          <span className="navbar-close-btn" onClick={this.toggleClass}>X</span>
          {AuthStore.isAuthenticated()
            ?
            <ul className="nav navbar-nav" onClick={this.toggleClass}>
              <li>
                <Link to="/" activeClassName="active">Dashboard</Link>
              </li>
              <li>
                <Link to="/products" activeClassName="active">Products</Link>
              </li>
              <li>
                <Link to="/user">My Settings</Link>
              </li>
              <li>
                <a href="https://imatrix.io/guides" target="__blank">Guides</a>
              </li>
              <li>
                <Link to="/logout">Logout</Link>
              </li>
            </ul>
            :
            <ul className="nav navbar-nav" onClick={this.toggleClass}>
              <li>
                <Link to="/login" activeClassName="active">Login</Link>
              </li>
            </ul>
          }
        </div>
        <div className={this.state.activeMobileMenu ? 'overlay ovrActv' : 'overlay'} onClick={() => {if (this.state.activeMobileMenu) {this.toggleClass()}}} />
      </React.Fragment>
    );
  }
}

export default HeaderComponent;
