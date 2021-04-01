import React from 'react';
import { Button, Grid } from '@material-ui/core';
import { Close, Remove } from '@material-ui/icons';
import PropTypes from 'prop-types';
import style from './Header.sass';

export default function Header(props) {
  const { title, background } = props;
  const bgColors = {
    grey: '#fafafa',
    blue: '#cbdef5',
    dark: '#343434',
  };
  const backgroundColor = bgColors[background];
  return (
    <div
      style={{
        backgroundColor,
      }}
      className={style.Header}
    >
      <div className={style.title}>{title}</div>
      <Grid className={style.btns} container direction="row" justify="flex-end">
        <Button size="small">
          <Close fontSize="inherit" />
        </Button>
        <Button size="small">
          <Remove fontSize="inherit" />
        </Button>
      </Grid>
    </div>
  );
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  background: PropTypes.string.isRequired,
};
