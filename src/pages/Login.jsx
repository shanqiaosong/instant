import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';

import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { Link, withRouter } from 'react-router-dom';

import Avatar from '@material-ui/core/Avatar';
// eslint-disable-next-line import/no-unresolved
// import 'react-image-crop/dist/ReactCrop.css?global';
import { Grid } from '@material-ui/core';
import FormHelperText from '@material-ui/core/FormHelperText';
import { withSnackbar } from 'notistack';
import Header from '../components/Header';
import style from './Signup.sass';
import animateToSize from '../utils/animateToSize';

class Login extends React.Component {
  width = 335;

  height = 460;

  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      showPassword: false,
      password: '',
      pending: false,
    };
  }

  componentDidMount() {
    // 测试用
    this.setState({});
    animateToSize(this.width, this.height);
  }

  handleAccountChange = (e) => {
    this.setState({
      account: e.target.value,
    });
  };

  handlePasswordChange = (e) => {
    const password = e.target.value;
    this.setState({
      password,
    });
  };

  handleClickShowPassword = () => {
    this.setState((state) => {
      return {
        showPassword: !state.showPassword,
      };
    });
  };

  render() {
    const { errors, showPassword, account, password, pending } = this.state;
    return (
      <>
        <div className={[style.Signup, 'Signup'].join(' ')}>
          <Header title="登录" loading={false} />
          <div className={style.draggable} />
          <div className={style.avatarWrap}>
            <Avatar className={style.avatar} />
          </div>
          <div className={style.inputs}>
            <TextField
              onChange={this.handleAccountChange}
              value={account}
              fullWidth
              label="账号"
            />
            <FormControl error={Boolean(errors.password)} fullWidth>
              <InputLabel htmlFor="password">密码</InputLabel>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={this.handlePasswordChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={this.handleClickShowPassword}
                      onMouseDown={this.handleMouseDownPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                aria-describedby="component-error-text"
              />
              <FormHelperText id="component-error-text">
                {errors.password}
              </FormHelperText>
            </FormControl>

            <Grid container justify="center">
              <Button
                onClick={this.handleSubmit}
                variant="contained"
                color="primary"
                className={style.submit}
                disabled={pending}
              >
                登陆
              </Button>
              <Link to="/signup">
                <Button
                  variant="text"
                  color="primary"
                  className={style.submit}
                  disabled={pending}
                >
                  注册
                </Button>
              </Link>
            </Grid>
          </div>
        </div>
      </>
    );
  }
}

Login.propTypes = {};

export default withRouter(withSnackbar(Login));
