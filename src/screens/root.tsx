import * as React from 'react';
import { Route, HashRouter as Router } from 'react-router-dom';
import App from 'components/App/connected';
// import Settings from 'components/Settings/connected';

/**
 * /images/1/summary
 * /images/1/view?analysis=downs
 * /images/1/edit?analysis=ricketts
 * /images/1/print?analysis=downs&includeSummary
 * /images/1/export?format=svg
 * /superimposition?images=1,2,3
 * /superimposition?images=1,2,3
 * /comparison/images=1,2&includeSummary
 * /new_analysis?type=ceph_lateral
 * /settings
 * /settings/appearance
 * /settings/offline
 * /settings/updates
 * /settings/privacy
 * /about
 */

const RootScreen = () => (
  <Router>
    <Route path="/" component={App} />
  </Router>
);

export default RootScreen;
