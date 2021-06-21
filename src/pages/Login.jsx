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
import Store from 'electron-store';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Header from '../components/Header';
import style from './Signup.sass';
import animateToSize from '../utils/animateToSize';
import animateToggleMain from '../utils/animateToggleMain';
import { login } from '../redux/loginSlice';
import { setInitInfo } from '../redux/chatSlice';

const store = new Store();

class Login extends React.Component {
  width = 335;

  height = 452;

  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
      password: '',
      avatar: null,
      account: '',
    };
  }

  componentDidMount() {
    // 测试用
    animateToSize(this.width, this.height);
    animateToggleMain.toggleFromMain();

    if (store.has('login-default')) {
      console.log(store.get('login-default'));
      const { password, account } = store.get('login-default');
      const avatar = (store.get('avatar-cache') || {})[account];
      this.setState({
        avatar,
        password,
        account,
      });
    }
  }

  handleAccountChange = (e) => {
    const account = parseInt(e.target.value, 10) || '';
    this.setState({
      account,
      avatar: (store.get('avatar-cache') || {})[account],
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

  handleLogin = () => {
    const { password, account } = this.state;
    const { history, dispatch } = this.props;

    dispatch(
      login({
        password,
        account,
      })
    ).then((result) => {
      if (result.meta.requestStatus === 'rejected') return;
      store.set('login-default', { password, account });
      dispatch(setInitInfo(result.payload.data));
      setTimeout(() => {
        history.push('/main');
      }, 300);
    });
  };

  render() {
    const { showPassword, account, password, avatar } = this.state;
    const { errors, pending } = this.props;
    return (
      <>
        <div className={[style.Signup, 'Signup'].join(' ')}>
          <Header title="登录" loading={pending} />
          <div className={style.draggable} />
          <div className={style.avatarWrap}>
            <TransitionGroup>
              <CSSTransition key={avatar} classNames="fade" timeout={250}>
                <Avatar src={avatar} className={style.avatar} />
              </CSSTransition>
            </TransitionGroup>
          </div>
          <div className={style.inputs}>
            <TextField
              onChange={this.handleAccountChange}
              error={Boolean(errors.account)}
              helperText={errors.account ?? ''}
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
                onClick={this.handleLogin}
                variant="contained"
                color="primary"
                className={style.submit}
                disabled={pending}
              >
                登录
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

Login.propTypes = {
  history: PropTypes.object.isRequired,
  pending: PropTypes.bool.isRequired,
  errors: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
function stateMap({ loginSlice }) {
  return { pending: loginSlice.pending, errors: loginSlice.errors };
}

export default connect(stateMap)(withRouter(withSnackbar(Login)));
