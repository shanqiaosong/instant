import React from 'react';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import { SnackbarProvider } from 'notistack';
import Grow from '@material-ui/core/Grow';

import './App.global.sass';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Provider } from 'react-redux';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AnimatedSwitch from './components/AnimatedSwitch';
import Main from './pages/Main';
import store from './redux/store';

moment.locale('zh-cn');

const Hello = () => {
  return <Redirect to="/login" />;
};

export default function App() {
  const theme = createMuiTheme({
    overrides: {
      MuiTouchRipple: {
        child: {
          backgroundColor: 'rgba(176,176,255,0.88)',
        },
      },
    },
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
    <Provider store={store}>
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
                  <Route path="/main" component={Main} />
                  <Route path="/" exact component={Hello} />
                </AnimatedSwitch>
              </Router>
            </div>
          </MuiPickersUtilsProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}
