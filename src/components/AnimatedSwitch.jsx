import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';

const AnimatedSwitch = (props) => {
  const { children } = props;
  return (
    <Route
      render={({ location }) => (
        <TransitionGroup>
          <CSSTransition
            key={location.pathname}
            classNames="fade"
            timeout={300}
          >
            <Switch location={location}>{children}</Switch>
          </CSSTransition>
        </TransitionGroup>
      )}
    />
  );
};

AnimatedSwitch.propTypes = {
  children: PropTypes.array.isRequired,
};

export default AnimatedSwitch;
