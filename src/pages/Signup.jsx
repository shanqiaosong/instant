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
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import Avatar from '@material-ui/core/Avatar';
// eslint-disable-next-line import/no-unresolved
// import 'react-image-crop/dist/ReactCrop.css?global';
import ReactCrop from 'react-image-crop';
import { Grid } from '@material-ui/core';
import FormHelperText from '@material-ui/core/FormHelperText';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import { KeyboardDatePicker } from '@material-ui/pickers';
import moment from 'moment';
import { withSnackbar } from 'notistack';
import Store from 'electron-store';
import { connect } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import Header from '../components/Header';
import style from './Signup.sass';
// this is necessary
import utils from '../utils/network';
import animateToSize from '../utils/animateToSize';
import animateToggleMain from '../utils/animateToggleMain';
import { signup } from '../redux/signupSlice';

const store = new Store();

class Signup extends React.Component {
  width = 335;

  height = 661;

  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
      password: '',
      src: null,
      crop: {},
      nickname: '',
      errors: {},
      gender: '',
      email: '',
      birthday: moment('2000-01-01'),
    };
  }

  componentDidMount() {
    animateToggleMain.toggleFromMain();
    // ?????????
    this.setState({
      nickname: 'testing',
      gender: 1,
      email: 'hhh@eee.com',
      password: 'qiaosong',
      birthday: moment('2004-01-01'),
    });
    animateToSize(this.width, this.height);
  }

  validate = (field, value) => {
    // ????????????????????????
    switch (field) {
      case 'password':
        return this.setErrInfo(
          field,
          value.length > 40 || value.length < 8
            ? '?????????????????????8~40??????'
            : null
        );
      case 'nickname':
        return this.setErrInfo(
          field,
          value.length > 40 || value.length < 1
            ? '?????????????????????1~40??????'
            : null
        );
      case 'gender':
        return this.setErrInfo(field, value === '' ? '???????????????' : null);
      case 'email':
        return this.setErrInfo(
          field,
          /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)
            ? null
            : '?????????????????????'
        );
      case 'birthday':
        return this.setErrInfo(
          field,
          value && value.isValid() ? null : '?????????????????????'
        );
      case 'croppedImage':
        return true; // ???????????????????????????
      default:
        return false;
    }
  };

  setErrInfo = (field, info) => {
    this.setState((state) => ({
      errors: { ...state.errors, [field]: info },
    }));
    // ????????????????????????
    return info === null;
  };

  handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  handlePasswordChange = (e) => {
    const password = e.target.value;
    this.setState({
      password,
    });
    this.validate('password', password);
  };

  handleClickShowPassword = () => {
    this.setState((state) => {
      return {
        showPassword: !state.showPassword,
      };
    });
  };

  handleNicknameChange = (e) => {
    const nickname = e.target.value;
    this.setState({
      nickname,
    });
    this.validate('nickname', nickname);
  };

  handleGenderChange = (e) => {
    const gender = Number(e.target.value);
    this.setState({
      gender,
    });
    this.validate('gender', gender);
  };

  handleEmailChange = (e) => {
    const email = e.target.value;
    this.setState({
      email,
    });
    this.validate('email', email);
  };

  handleBirthdayChange = (birthday) => {
    this.setState({
      birthday,
    });
    this.validate('birthday', birthday);
  };

  // eslint-disable-next-line react/destructuring-assignment
  getCroppedImg = (image = this.imageRef, crop = this.state.crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      512,
      512
    );

    // As Base64 string
    return canvas.toDataURL('image/jpeg');
  };

  handleSubmit = async () => {
    const { enqueueSnackbar, history, dispatch } = this.props;
    const fields = ['password', 'nickname', 'gender', 'email', 'birthday'];
    const { validate, state } = this;
    const data = {};
    let checked = true;
    // eslint-disable-next-line no-restricted-syntax
    for (const field of fields) {
      if (!validate(field, state[field])) checked = false;
      data[field] = state[field];
    }
    if (!checked) return;
    data.birthday = data.birthday.format('yyyy-MM-DD');
    // ??????????????????
    data.avatar = state.croppedImage?.slice(23);
    this.setState({
      pending: true,
    });
    try {
      const result = unwrapResult(await dispatch(signup(data)));
      const { password } = data;
      const { account } = result.data;
      const avatar = state.croppedImage;
      store.set('login-default', {
        account,
        password,
        rememberPassword: true,
      });
      store.set('avatar-cache', {
        ...(store.get('avatar-cache') || {}),
        [account]: avatar,
      });
      setTimeout(() => {
        history.push('/login');
        enqueueSnackbar('????????????', {
          variant: 'success',
          autoHideDuration: 1500,
        });
      }, 300);
    } catch (e) {
      console.error(e);
      enqueueSnackbar('????????????????????????', {
        variant: 'error',
      });
      this.setState({
        pending: false,
      });
    }

    // {
    //   account: res.data.account,
    //     password: data.password,
    //   rememberPassword: true,
    //   avatar: state.croppedImage ?? 0,
    // }

    // .then((res) => {
    // })
    // .catch((e) => {
    //
    //
    //
    //
    //
    //
    //
    // });
  };

  render() {
    const {
      showPassword,
      password,
      src,
      crop,
      croppedImage,
      nickname,
      errors,
      gender,
      email,
      birthday,
    } = this.state;
    const { pending } = this.props;
    console.log(pending);
    return (
      <>
        <div className={[style.Signup, 'Signup'].join(' ')}>
          <Header
            background={src ? 'grey' : 'blue'}
            title={src ? '????????????' : '??????'}
            loading={pending}
          />
          <div className={style.draggable} />
          <div className={style.avatarWrap}>
            <label htmlFor="avatarFile">
              <Tooltip arrow title="????????????">
                <Avatar src={croppedImage} className={style.avatar} />
              </Tooltip>
              <input
                type="file"
                className={style.file}
                id="avatarFile"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const reader = new FileReader();
                    reader.addEventListener('load', () =>
                      this.setState({ src: reader.result })
                    );
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
                value=""
              />
            </label>
          </div>
          <div className={src ? style.cropping : style.noCropping}>
            <div className={style.crop}>
              <ReactCrop
                src={src}
                crop={crop}
                keepSelection
                // className={cropStyle}
                onChange={(cropRes) => {
                  // You could also use percentCrop:
                  // this.setState({ crop: percentCrop });
                  this.setState({ crop: cropRes });
                }}
                onImageLoaded={(img) => {
                  this.imageRef = img;
                  const edge = Math.min(img.width, img.height);
                  const newCrop = {
                    unit: 'px',
                    width: edge,
                    height: edge,
                    x: img.width > img.height ? (img.width - edge) / 2 : 0,
                    y: img.width > img.height ? 0 : (img.height - edge) / 2,
                    aspect: 1,
                  };
                  this.setState({
                    crop: newCrop,
                  });
                  return false;
                }}
              />
            </div>
            <Grid
              className={style.btns}
              container
              spacing={1}
              direction="row"
              justify="flex-end"
            >
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    this.setState({
                      croppedImage: this.getCroppedImg(),
                      src: null,
                    });
                  }}
                >
                  ??????
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={() => {
                    this.setState({
                      src: null,
                    });
                  }}
                  variant="outlined"
                  color="secondary"
                >
                  ??????
                </Button>
              </Grid>
            </Grid>
          </div>
          <div className={style.inputs}>
            <TextField
              onChange={this.handleNicknameChange}
              error={Boolean(errors.nickname)}
              helperText={errors.nickname ?? ''}
              value={nickname}
              fullWidth
              label="??????"
            />
            <TextField
              onChange={this.handleEmailChange}
              error={Boolean(errors.email)}
              helperText={errors.email ?? ''}
              value={email}
              fullWidth
              label="??????"
            />
            <FormControl error={Boolean(errors.password)} fullWidth>
              <InputLabel htmlFor="password">??????</InputLabel>
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
            <KeyboardDatePicker
              autoOk
              orientation="landscape"
              cancelLabel="??????"
              okLabel="??????"
              error={Boolean(errors.birthday)}
              helperText={errors.birthday ?? ''}
              disableToolbar
              variant="dialog"
              format="yyyy-MM-DD"
              fullWidth
              label="??????"
              value={birthday}
              onChange={this.handleBirthdayChange}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
            <FormControl error={Boolean(errors.gender)}>
              <RadioGroup
                row
                aria-label="gender"
                name="gender"
                value={gender}
                onChange={this.handleGenderChange}
              >
                <FormControlLabel value={1} control={<Radio />} label="???" />
                <FormControlLabel value={2} control={<Radio />} label="???" />
                <FormControlLabel value={0} control={<Radio />} label="??????" />
              </RadioGroup>
              <FormHelperText>{errors.gender ?? ''}</FormHelperText>
            </FormControl>
            <Grid container justify="center">
              <Button
                onClick={this.handleSubmit}
                variant="contained"
                color="primary"
                className={style.submit}
                disabled={pending}
              >
                ??????
              </Button>
              <Link to="/login">
                <Button
                  variant="text"
                  color="primary"
                  className={style.submit}
                  disabled={pending}
                >
                  ???????????????????????????
                </Button>
              </Link>
            </Grid>
          </div>
        </div>
      </>
    );
  }
}

Signup.propTypes = {
  enqueueSnackbar: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  pending: PropTypes.bool.isRequired,
};

function stateMap({ signupSlice }) {
  return { pending: signupSlice.pending };
}

export default connect(stateMap)(withRouter(withSnackbar(Signup)));
