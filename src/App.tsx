import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import './App.global.css';
import { remote } from 'electron';
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

class Test extends Component {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <div>test</div>;
  }
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/test" component={Test} />
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
