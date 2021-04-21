import React from 'react';
import { HashRouter as Router, Route, Link } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import MomentUtils from '@date-io/moment';
import { SnackbarProvider } from 'notistack';
import Grow from '@material-ui/core/Grow';

import './App.global.sass';
import { remote } from 'electron';
import CssBaseline from '@material-ui/core/CssBaseline';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AnimatedSwitch from './components/AnimatedSwitch';
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
  const theme = createMuiTheme({
    palette: {
      primary: {
        light: '#a250ff',
        main: '#6b19ff',
        dark: '#5908e7',
        contrastText: '#fff',
      },
      secondary: {
        light: '#e26525',
        main: '#de1e04',
        dark: '#871010',
        contrastText: '#ffffff',
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        maxSnack={1}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        TransitionComponent={Grow}
      >
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <CssBaseline />
          <div className="main-window">
            <Router>
              <AnimatedSwitch>
                <Route path="/signup" component={Signup} />
                <Route path="/login" component={Login} />
                <Route path="/" exact component={Hello} />
              </AnimatedSwitch>
            </Router>
          </div>
        </MuiPickersUtilsProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
