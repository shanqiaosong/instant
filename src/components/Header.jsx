import React from 'react';
import { Button, Grid } from '@material-ui/core';
import { Close, Remove } from '@material-ui/icons';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';
import style from './Header.sass';

export default function Header(props) {
  const { title, loading } = props;
  return (
    <div className={style.Header}>
      <LinearProgress
        style={{
          opacity: loading ? 1 : 0,
        }}
      />
      <div className={style.title}>{title}</div>
      <Grid className={style.btns} container direction="row" justify="flex-end">
        <Button size="small">
          <Remove fontSize="inherit" />
        </Button>
        <Button size="small">
          <Close fontSize="inherit" />
        </Button>
      </Grid>
    </div>
  );
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
};
