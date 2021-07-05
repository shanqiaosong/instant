# Instant - 一个可加密的实时通信软件

> 这是一个基于 Electron 和 React 编写的实时通信软件，作为 JavaScript 程序设计课程的课程设计。

## 使用方法

### 安装

在 Windows 上运行 Instant.Setup.3.0.0.exe 来安装。

### 注册

安装后，点击桌面上的 Instant 图标，打开后点击“注册”，输入个人信息、设置头像和密码，点击注册。

### 登录

使用注册后自动填入的账号，并填入设置的密码，点击登录。

### 添加好友

在左上角输入好友的账号，按回车键并填写打招呼的信息，即可发送申请。等对方同意申请后，便可以发起聊天。

### 发送图片和文件

除了发送文字消息和 Emoji 表情外，Instant 还支持发送文件和图片。只需要将要发送的文件和图片拖入聊天对话框即可。

您也可以直接向输入框内粘贴要发送的图片和文件。

### 加密聊天

与好友开始聊天后，点击聊天框上方的钥匙按钮（🔑），向对方发送自己的公钥。发送后，对方发来的消息将使用您的公钥进行加密，Instant 会自动使用本地保存的私钥解密。

若您想要向朋友发送加密消息，需要对方也发送公钥。

朋友昵称后方的绿色小锁表明已经存储了对方的公钥，这时您向朋友发送的消息将被加密。点击小锁即可取消加密。

每次生成的密钥对将在退出登录后被销毁，因此加密的消息将不再可能再次解密。

### 删除好友

点击好友信息后方的垃圾桶按钮，即可删除好友。

### 自动更新

软件将实时检查是否有更新的版本，若有则会进行弹窗提醒。您也可以点击左边的“更新”按钮来手动触发检查。

### 消息提醒

将主窗口关闭后，Instant 将隐藏在系统托盘。若此时有新消息，则 Instant 图标会开始闪烁，并通过系统通知来进行提示。

## 开发和打包

### 开发

运行命令

```bash
yarn start
```

即可开始开发，Electron 支持热模块替换。

### 打包

运行命令

```bash
yarn package_new
```

可以进行打包和发布，但 Mac 版本只能在 Mac 平台上进行打包。
