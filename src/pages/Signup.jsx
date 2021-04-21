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
import Header from '../components/Header';
import style from './Signup.sass';
import utils from '../utils/network';
import animateToSize from '../utils/animateToSize';

class Signup extends React.Component {
  width = 335;

  height = 663;

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
      pending: false,
    };
  }

  componentDidMount() {
    // 测试用
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
    // 返回是否通过测试
    switch (field) {
      case 'password':
        return this.setErrInfo(
          field,
          value.length > 40 || value.length < 8
            ? '密码长度必须在8~40之间'
            : null
        );
      case 'nickname':
        return this.setErrInfo(
          field,
          value.length > 40 || value.length < 1
            ? '昵称长度必须在1~40之间'
            : null
        );
      case 'gender':
        return this.setErrInfo(field, value === '' ? '请选择性别' : null);
      case 'email':
        return this.setErrInfo(
          field,
          /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)
            ? null
            : '邮箱格式不正确'
        );
      case 'birthday':
        return this.setErrInfo(
          field,
          value && value.isValid() ? null : '请输入有效日期'
        );
      case 'croppedImage':
        return true; // 不强制要求上传头像
      default:
        return false;
    }
  };

  setErrInfo = (field, info) => {
    this.setState((state) => ({
      errors: { ...state.errors, [field]: info },
    }));
    // 返回是否通过测试
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

  handleSubmit = () => {
    const { enqueueSnackbar, history } = this.props;
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
    // 为了去掉前缀
    data.avatar = state.croppedImage?.slice(23);
    this.setState({
      pending: true,
    });
    utils
      .post('/signup', data)
      .then((res) => {
        console.log(res);
        enqueueSnackbar('注册成功', {
          variant: 'success',
          autoHideDuration: 1500,
        });
        this.setState({
          pending: false,
        });
        console.log(data);
        history.push('/login');
        return res;
      })
      .catch((e) => {
        console.error(e);
        enqueueSnackbar('网络或服务器错误', {
          variant: 'error',
        });
        this.setState({
          pending: false,
        });
      });
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
      pending,
    } = this.state;
    return (
      <>
        <div className={[style.Signup, 'Signup'].join(' ')}>
          <Header
            background={src ? 'grey' : 'blue'}
            title={src ? '裁剪头像' : '注册'}
            loading={pending}
          />
          <div className={style.draggable} />
          <div className={style.avatarWrap}>
            <label htmlFor="avatarFile">
              <Tooltip arrow title="上传头像">
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
                  确定
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
                  取消
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
              label="昵称"
            />
            <TextField
              onChange={this.handleEmailChange}
              error={Boolean(errors.email)}
              helperText={errors.email ?? ''}
              value={email}
              fullWidth
              label="邮箱"
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
            <KeyboardDatePicker
              error={Boolean(errors.birthday)}
              helperText={errors.birthday ?? ''}
              disableToolbar
              variant="inline"
              format="yyyy-MM-DD"
              fullWidth
              label="生日"
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
                <FormControlLabel value={1} control={<Radio />} label="男" />
                <FormControlLabel value={2} control={<Radio />} label="女" />
                <FormControlLabel value={0} control={<Radio />} label="其他" />
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
                注册
              </Button>
              <Link to="/login">
                <Button
                  variant="text"
                  color="primary"
                  className={style.submit}
                  disabled={pending}
                >
                  已有账号，直接登陆
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
};

export default withRouter(withSnackbar(Signup));
