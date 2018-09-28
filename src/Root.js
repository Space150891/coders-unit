import React                         from 'react';
import { Router, Route, IndexRoute } from 'react-router';
import App                           from 'components/App';

import AuthLayout from 'components/Auth/Layout';

import ProductsLayout from 'components/Products/Layout';
import ProductsIndex  from 'components/Products/Index';
import Product        from 'components/Products/Product/Product';
import ProductForm    from 'components/Products/Product/ProductForm';

import DashboardLayout from 'components/Dashboard/Layout';
import DashboardIndex  from 'components/Dashboard/Index';
import ThingReadings   from 'components/Dashboard/Thing/Readings/ThingReadings';
import ThingHistory    from 'components/Dashboard/Thing/History/ThingHistory';
import ThingMap        from 'components/Dashboard/Thing/Map/ThingMap';

import GroupTypes          from 'constants/GroupTypes';
import GroupsLayout        from 'components/Groups/Layout';
import GroupLocations      from 'components/Groups/Group/GroupLocations';
import GroupHistory        from 'components/Groups/Group/GroupHistory';
import OutdoorSiteGroupForm     from "components/Groups/Group/OutdoorSiteGroupForm";
import OutdoorBuildingGroupForm from "components/Groups/Group/OutdoorBuildingGroupForm";
import IndoorBaseGroupForm from "components/Groups/Group/IndoorBaseGroupForm";
import IndoorGroupNewForm     from "components/Groups/Group/IndoorGroupNewForm";
import IndoorGroupEditForm     from "components/Groups/Group/IndoorGroupEditForm";

import ThingsLayout from 'components/Things/Layout';
import ThingsIndex  from 'components/Things/Index';
import Thing        from 'components/Things/Thing/Thing';
import ThingForm    from 'components/Things/Thing/ThingForm';

import UsersLayout from 'components/Users/Layout';
import UserForm    from 'components/Users/User/UserForm';

import SignupForm        from 'components/Auth/SignupForm';
import PasswordResetForm from 'components/Auth/PasswordResetForm';
import LoginForm         from 'components/Auth/LoginForm';
import Logout            from 'components/Auth/Logout';
import AuthStore         from 'stores/AuthStore';

class Root extends React.Component {

  requireAuth(nextState, replace) {
    if (!AuthStore.isAuthenticated())
      replace({
        pathname: '/login',
        state: { nextPathname: nextState.location.pathname }
      });
  }

  //Nice examples ---> https://github.com/erikras/react-redux-universal-hot-example/blob/master/src/routes.js
  //http://stackoverflow.com/questions/31084779/how-to-restrict-access-to-routes-in-react-router
  //http://stackoverflow.com/questions/34119793/react-router-redirection-after-login
  //http://stackoverflow.com/questions/33996484/using-multiple-layouts-for-react-router-components
  render() {
    return (
      <Router history={this.props.history}>
        <Route path='' component={AuthLayout}>
          <Route path='signup' component={SignupForm} />
          <Route path='password-reset(/:token)' component={PasswordResetForm} />
          <Route path='login'  component={LoginForm} />
          <Route path='logout' component={Logout}   onEnter={this.requireAuth}/>
        </Route>
        <Route path='/' component={App}>
          <Route path='' component={DashboardLayout} onEnter={this.requireAuth} >
            <IndexRoute component={DashboardIndex}/>
            <Route path="thing/:id/readings"       component={ThingReadings}/>
            <Route path="thing/:id/history"        component={ThingHistory} />
            <Route path="thing/:id/map"            component={ThingMap} />
          </Route>
          <Route path='groups' component={GroupsLayout} onEnter={this.requireAuth}>
            {/*@TODO Merge create / edit endpoints and use component to decide which form to load*/}
            <Route path={":parentId/" + GroupTypes.get('GROUP_TYPE_OUTDOOR_SITE')     + "/new"} component={OutdoorSiteGroupForm}/>
            <Route path={":parentId/" + GroupTypes.get('GROUP_TYPE_OUTDOOR_BUILDING') + "/new"} component={OutdoorBuildingGroupForm}/>
            <Route path={":parentId/" + GroupTypes.get('GROUP_TYPE_INDOOR_BASE')      + "/new"} component={IndoorBaseGroupForm}/>
            <Route path={":parentId/" + GroupTypes.get('GROUP_TYPE_INDOOR')           + "/new"} component={IndoorGroupNewForm}/>
            <Route path={":groupId/" + GroupTypes.get('GROUP_TYPE_OUTDOOR_SITE')      + "/edit"} component={OutdoorSiteGroupForm}/>
            <Route path={":groupId/" + GroupTypes.get('GROUP_TYPE_OUTDOOR_BUILDING')  + "/edit"} component={OutdoorBuildingGroupForm}/>
            <Route path={":groupId/" + GroupTypes.get('GROUP_TYPE_INDOOR_BASE')       + "/edit"} component={IndoorBaseGroupForm}/>
            <Route path={":groupId/" + GroupTypes.get('GROUP_TYPE_INDOOR')            + "/edit"} component={IndoorGroupEditForm}/>
            <Route path=":groupId/locations"         component={GroupLocations} />
            <Route path=":groupId/history"           component={GroupHistory} />
          </Route>
          <Route path='products' component={ProductsLayout} onEnter={this.requireAuth}>
            <IndexRoute component={ProductsIndex}/>
            <Route path="new"      component={ProductForm}/>
            <Route path=":id"      component={Product}/>
            <Route path=":id/edit" component={ProductForm}/>
          </Route>
          <Route path='things' component={ThingsLayout} onEnter={this.requireAuth}>
            <IndexRoute component={ThingsIndex}/>
            <Route path="new"      component={ThingForm}/>
            <Route path=":id"      component={Thing}/>
            <Route path=":id/edit" component={ThingForm}/>
          </Route>
          <Route path='user' component={UsersLayout} onEnter={this.requireAuth}>
            <IndexRoute component={UserForm}/>
            {/*<Route path="update" component={UserForm}/>*/}
          </Route>
        </Route>
      </Router>
    );
  }
}

export default Root;
