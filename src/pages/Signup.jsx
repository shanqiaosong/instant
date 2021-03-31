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

import Avatar from '@material-ui/core/Avatar';
// eslint-disable-next-line import/no-unresolved
// import 'react-image-crop/dist/ReactCrop.css?global';
import ReactCrop from 'react-image-crop';

import { remote } from 'electron';
import { Grid } from '@material-ui/core';
import style from './Signup.sass';
import Header from '../components/Header';

export default class Signup extends React.Component {
  width = 335;

  height = 440;

  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
      password: '',
      src: null,
      crop: {},
    };
    remote.getCurrentWindow().setSize(this.width, this.height);
  }

  handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  handlePasswordChange = (e) => {
    this.setState({
      password: e.target.value,
    });
  };

  handleClickShowPassword = () => {
    this.setState((state) => {
      return {
        showPassword: !state.showPassword,
      };
    });
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

    // As a blob
    // return new Promise((resolve, reject) => {
    //   canvas.toBlob(
    //     (blob) => {
    //       blob.name = fileName;
    //       resolve(blob);
    //     },
    //     'image/jpeg',
    //     1
    //   );
    // });
  };

  render() {
    const { showPassword, password, src, crop, croppedImage } = this.state;
    return (
      <>
        <Header title={src ? '裁剪头像' : '注册'} />
        <div className={style.Signup}>
          <div className={style.draggable} />
          <div className={style.avatarWrap}>
            <label htmlFor="avatarFile">
              <Avatar src={croppedImage} className={style.avatar} />
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
            <TextField margin="dense" fullWidth label="昵称" />
            <FormControl margin="dense" fullWidth>
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
              />
            </FormControl>
          </div>
        </div>
      </>
    );
  }
}
