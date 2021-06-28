import {
  Block,
  EmojiPeople,
  Help,
  HowToReg,
  Image,
  InsertDriveFile,
  Lock,
  VpnKey,
} from '@material-ui/icons';
import React from 'react';
import { ipcRenderer } from 'electron';
import {
  growList,
  messageStatus,
  messageTypes,
  rainList,
} from '../utils/consts';
import {
  decrypt,
  encrypt,
  fromBase64,
  generateKey,
  getMyKey,
  toBase64,
} from '../utils/security';
import friendsStyle from '../components/Friends.sass';
import dialogStyle from '../components/Dialog.sass';
import {
  confirmRequest,
  incomingMessage,
  incomingRequest,
  newFriend,
  saveKey,
  sendFile,
  sendMessage,
  sendRequest,
} from '../redux/chatSlice';
import Storable from './Storable';
import state from '../redux/store';
import { growAnimation, rainAnimation } from '../pages/easterEggs';
import network from '../utils/network';

export default class Message extends Storable {
  constructor(status, info, slice = state.getState().chatSlice) {
    super();
    const {
      content,
      createdAt,
      fromUser,
      toUser,
      id,
      type,
      textContent,
      clientID,
    } = info;
    this.state = slice;
    if (status === messageStatus.committed) {
      // 保存原来的base64字符串
      this.rawContent = content;
      this.createdAt = createdAt;
      this.fromUser = fromUser;
      this.toUser = toUser;
      this.id = id;
      this.type = type;
      // 当type为secured时，标志是否解密成功
      this.isDecrypted = false;
      // 当类型为text时，保存base64解密的文本；
      // 当type为secured并且解密成功时，保存解密成功的文本
      this.textContent = textContent ?? '';
      this.pending = false;
      this.decryptMessage();
    } else if (status === messageStatus.uncommitted) {
      if (type === messageTypes.text || type === messageTypes.secured) {
        if (!content) {
          throw new Error('消息不可以为空');
        }
        if (!toUser) {
          throw new Error('未指定接收方');
        }
      }
      const { account } = this.state;
      this.fromUser = account;
      // 保存用于发送的字符串
      this.rawContent = '';
      // 保存接收方
      this.toUser = toUser;
      // 保存类型
      this.type = type;
      // 当类型为text或secured时，保存可读的文本；当类型为file时，保存原始文件
      this.textContent = content;
      // 记录是否加密成功
      this.isEncrypted = false;
      this.isDecrypted = true;
      this.pending = true;
      this.error = '';
      // 用于发送文件时message转换
      this.clientID = clientID;
      if (type === messageTypes.key) {
        this.textContent = getMyKey()?.publicKey;
        if (!this.textContent) {
          this.textContent = generateKey().publicKey;
        }
      } else if (type.includes(messageTypes.reply)) {
        this.textContent = 'agree';
      } else if (type === messageTypes.file || type === messageTypes.image) {
        if (this.textContent?.size > 50 * 1024 * 1024) {
          throw new Error('文件太大，请将文件大小限制在 50MB 以内');
        }
      }
      this.encryptMessage();
    } else if (status === messageStatus.stored) {
      this.fromStorage(info);
    }
  }

  // 将收到的消息转化为可读的文本
  decryptMessage() {
    if (this.type === messageTypes.secured) {
      let decrypted;
      const myKey = getMyKey(this.state);
      if (!myKey) {
        decrypted = false;
      } else {
        decrypted = fromBase64(decrypt(this.rawContent, myKey.privateKey));
      }
      if (decrypted !== false) {
        this.isDecrypted = true;
        this.textContent = decrypted;
      }
    } else if (
      this.type === messageTypes.text ||
      this.type === messageTypes.key
    ) {
      const decrypted = fromBase64(this.rawContent);
      if (decrypted !== false) {
        this.isDecrypted = true;
        this.textContent = decrypted;
      }
    } else {
      this.textContent = this.rawContent;
    }
  }

  // 将要发送的消息编码为适合发送的格式
  encryptMessage() {
    if (this.type === messageTypes.secured) {
      const {
        selectedFriend: { account },
        keys: { [account]: friendKey },
      } = this.state;
      if (!friendKey) {
        throw new Error('没有可用于加密的公钥');
      }
      const encrypted = encrypt(toBase64(this.textContent), friendKey);
      if (encrypted) {
        this.rawContent = encrypted;
      } else {
        throw new Error('无法加密，可能由于文本过长');
      }
    } else if (
      this.type === messageTypes.text ||
      this.type === messageTypes.key
    ) {
      this.rawContent = toBase64(this.textContent);
    } else {
      this.rawContent = this.textContent;
    }
  }

  // 生成用于列表展示的组件
  getPreview() {
    const style = friendsStyle;
    if (this.type === messageTypes.text) {
      return this.textContent;
    }
    if (this.type.includes('reply')) {
      return (
        <div>
          <HowToReg className={style.typeIcon} /> 我通过了你的好友请求
        </div>
      );
    }
    if (
      this.type === messageTypes.request ||
      this.type === messageTypes.requested
    ) {
      return (
        <div>
          <EmojiPeople className={style.typeIcon} /> {this.rawContent}
        </div>
      );
    }
    if (this.type === messageTypes.key) {
      return (
        <div>
          <VpnKey className={style.typeIcon} /> 这是我的公钥
        </div>
      );
    }
    if (this.type === messageTypes.secured) {
      return (
        <div>
          <Lock className={style.typeIcon} /> 加密的消息
        </div>
      );
    }
    if (this.type === messageTypes.file) {
      return (
        <div>
          <InsertDriveFile className={style.typeIcon} /> 文件
        </div>
      );
    }
    if (this.type === messageTypes.image) {
      return (
        <div>
          <Image className={style.typeIcon} /> 图片
        </div>
      );
    }
    return (
      <div>
        <Help className={style.typeIcon} /> 未识别的消息
      </div>
    );
  }

  // 生成用于对话框展示的组件
  getDialogView() {
    const style = dialogStyle;
    if (this.type === messageTypes.text) {
      return this.textContent;
    }
    const dragStartHandler = (ev) => {
      // 添加拖拽数据
      ev.dataTransfer.clearData();
      ev.dataTransfer.setData('text/plain', this.getNotificationView());
    };
    if (this.type.includes('reply')) {
      return (
        <div onDragStart={dragStartHandler}>
          <HowToReg className={style.typeIcon} /> 我通过了你的好友请求
        </div>
      );
    }
    if (
      this.type === messageTypes.request ||
      this.type === messageTypes.requested
    ) {
      return (
        <div onDragStart={dragStartHandler}>
          <EmojiPeople className={style.typeIcon} /> {this.rawContent}
        </div>
      );
    }
    if (this.type === messageTypes.key) {
      return (
        <div onDragStart={dragStartHandler}>
          <VpnKey className={style.typeIcon} /> 这是我的公钥
        </div>
      );
    }
    if (this.type === messageTypes.secured) {
      if (this.isDecrypted) {
        return (
          <div onDragStart={dragStartHandler}>
            <Lock className={style.typeIcon} /> {this.textContent}
          </div>
        );
      }
      return (
        <div onDragStart={dragStartHandler}>
          <Block className={style.typeIcon} /> 无法解密
        </div>
      );
    }
    if (this.type === messageTypes.file) {
      return (
        <div onDragStart={dragStartHandler}>
          <a className={style.link} href={network.fileURL(this.textContent)}>
            <InsertDriveFile className={style.typeIcon} /> {this.textContent}
          </a>
        </div>
      );
    }
    if (this.type === messageTypes.image) {
      return (
        <div>
          <img
            onDragStart={(ev) => {
              console.log(ev);
              // ev.preventDefault();
              // ev.stopPropagation();
              ev.dataTransfer.clearData('string');
              // 防止看到地址
              ev.dataTransfer.clearData('text/plain');
              ev.dataTransfer.clearData('text/html');
              ev.dataTransfer.clearData('text/uri-list');
              ev.dataTransfer.setData('text/plain', this.getNotificationView());
              if (ev.target.complete) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.height = ev.target.naturalHeight;
                canvas.width = ev.target.naturalWidth;
                ctx.drawImage(ev.target, 0, 0);
                ev.dataTransfer.setData(
                  'custom/file',
                  `${this.textContent}.png`
                );
                canvas.toBlob((blob) => {
                  console.log(blob);
                  window.customFile = new File(
                    [blob],
                    `${this.textContent}.png`,
                    {
                      type: 'image/png',
                    }
                  );
                });
              }
              console.log(ev.dataTransfer.items[0]);
            }}
            className={style.image}
            src={network.fileURL(this.textContent)}
            alt="pic"
          />
        </div>
      );
    }
    return (
      <div>
        <Help className={style.typeIcon} /> 未识别的消息
      </div>
    );
  }

  getRequestListView() {
    return {
      id: this.id,
      content: this.textContent,
    };
  }

  getNotificationView() {
    if (this.type === messageTypes.text) {
      return this.textContent;
    }
    if (this.type === messageTypes.secured) {
      return '加密的消息';
    }
    if (this.type === messageTypes.request) {
      return `请求添加您为好友：${this.textContent}`;
    }
    if (this.type === messageTypes.key) {
      return '[公钥]';
    }
    if (this.type === messageTypes.image) {
      return '[图片]';
    }
    if (this.type === messageTypes.file) {
      return '[文件]';
    }
    if (this.type.includes(messageTypes.reply)) {
      return '我同意了您的好友请求';
    }
    return '[未识别的消息]';
  }

  // 转换为网络传输数据
  toSendable() {
    const { type, rawContent, toUser, fromUser, clientID } = this;
    return {
      type,
      content: rawContent,
      toUser,
      fromUser,
      clientID,
    };
  }

  // 发送
  send() {
    this.checkEasterEgg();
    this.clientID = String(Date.now()) + String(Math.random());
    if (this.type === messageTypes.request) {
      state.dispatch(
        sendRequest({
          message: this,
        })
      );
    } else if (this.type.includes(messageTypes.reply)) {
      state.dispatch(
        confirmRequest({
          message: this,
        })
      );
    } else if (this.type === messageTypes.file) {
      state.dispatch(
        sendFile({
          message: this,
        })
      );
    } else if (this.type === messageTypes.image) {
      state.dispatch(
        sendFile({
          message: this,
        })
      );
    } else {
      state.dispatch(
        sendMessage({
          message: this,
        })
      );
    }
  }

  // 对收到的消息进行提示和处理
  react() {
    this.checkEasterEgg();
    this.sendNotification();
    if (this.type === messageTypes.request) {
      state.dispatch(incomingRequest({ message: this }));
    } else if (this.type.includes(messageTypes.reply)) {
      state.dispatch(newFriend({ message: this }));
    } else {
      state.dispatch(incomingMessage({ message: this }));
      if (this.type === messageTypes.key) {
        state.dispatch(saveKey({ user: this.fromUser, key: this.textContent }));
      }
    }
  }

  checkEasterEgg() {
    if (this.type !== 'text' && this.type !== 'secured') return;
    if (
      this.fromUser !== this.state.selectedFriend.account &&
      this.fromUser !== this.state.account
    )
      return;
    if (growList.includes(this.textContent)) {
      growAnimation(this.textContent);
    } else if (rainList.includes(this.textContent)) {
      rainAnimation(this.textContent);
    }
  }

  sendNotification() {
    if (ipcRenderer.sendSync('isFocused')) return;
    ipcRenderer.sendSync('flash');
    const friend = this.state.friends.find(
      ({ account }) => account === this.fromUser
    );
    let nickname = '新朋友';
    if (friend) {
      nickname = friend.nickname;
    }
    const NOTIFICATION_TITLE = `来自 ${nickname} 的消息`;
    const NOTIFICATION_BODY = this.getNotificationView();

    new Notification(NOTIFICATION_TITLE, {
      body: NOTIFICATION_BODY,
    }).onclick = () => ipcRenderer.sendSync('focus');
  }
}
