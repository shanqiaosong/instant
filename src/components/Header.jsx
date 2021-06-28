import React, { useEffect, useState } from 'react';
import { Button, Grid } from '@material-ui/core';
import { Close, Remove } from '@material-ui/icons';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';
import { ipcRenderer } from 'electron';
import style from './Header.sass';

export default function Header(props) {
  const { title, loading } = props;
  const [innerLoading, setInnerLoaing] = useState(false);

  useEffect(() => {
    if (loading) {
      setInnerLoaing(true);
    } else {
      setTimeout(() => setInnerLoaing(false), 300);
    }
  }, [loading]);

  return (
    <div className={style.Header}>
      <LinearProgress
        style={{
          opacity: innerLoading ? 1 : 0,
        }}
      />
      <div className={style.title}>{title}</div>
      <Grid className={style.btns} container direction="row" justify="flex-end">
        <Button onClick={() => ipcRenderer.sendSync('minimize')} size="small">
          <Remove fontSize="inherit" />
        </Button>
        <Button onClick={() => ipcRenderer.sendSync('hide')} size="small">
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
