import React from 'react';
import { HashRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

import './App.global.sass';
import { remote } from 'electron';
import CssBaseline from '@material-ui/core/CssBaseline';
import Signup from './pages/Signup';
import 'fontsource-roboto';
// import icon from '../assets/icon.svg';

const Hello = () => {
  return (
    <div>
      hhhh
      <Link to="/test">Hello</Link>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus */}
      <div
        role="button"
        onClick={() => {
          let width = 1024;
          let height = 728;
          const intv = setInterval(() => {
            width -= 8;
            height -= 8;
            remote.getCurrentWindow().setSize(width, height);
            if (width <= 500 || height <= 500) {
              clearInterval(intv);
            }
          });
        }}
      >
        Change size
      </div>
    </div>
  );
};

export default function App() {
  return (
    <>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <CssBaseline />
        <Router>
          <Switch>
            <Route path="/signup" component={Signup} />
            <Route path="/" exact component={Hello} />
          </Switch>
        </Router>
      </MuiPickersUtilsProvider>
    </>
  );
}
