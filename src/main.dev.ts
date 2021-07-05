/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, Menu, Tray } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import crypto from 'crypto';
import fs from 'fs';
import MenuBuilder from './menu';

Store.initRenderer();

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let appTray = null;
let blink;
let unBlink;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 335,
    height: 440,
    minHeight: 440,
    minWidth: 335,
    frame: false,
    transparent: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  mainWindow.setMaximizable(false);

  // 系统托盘图标闪烁
  let count = 0;
  let timer = null;

  blink = () => {
    if (mainWindow && mainWindow.flashFrame) {
      mainWindow.flashFrame(true);
    }
    clearInterval(timer);
    timer = setInterval(() => {
      count += 1;
      if (count % 2 === 0) {
        appTray.setImage(getAssetPath('icon32.ico'));
      } else {
        appTray.setImage(getAssetPath('icona.ico'));
      }
    }, 500);
  };

  unBlink = () => {
    clearInterval(timer);
    appTray.setImage(getAssetPath('icon32.ico'));
    if (mainWindow && mainWindow.flashFrame) {
      mainWindow?.flashFrame(false);
    }
  };

  // 系统托盘右键菜单
  const trayMenuTemplate = [
    {
      label: '打开',
      click() {
        unBlink();
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: '退出',
      click() {
        app.quit();
      },
    },
  ];
  appTray = new Tray(getAssetPath('icon32.ico'));
  // 图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  // 设置此托盘图标的悬停提示内容
  appTray.setToolTip('Instant 与您的朋友保持连接');
  // 设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);

  // 单点击 1.主窗口显示隐藏切换 2.清除闪烁
  appTray.on('click', () => {
    unBlink();
    mainWindow?.show();
    mainWindow?.focus();
  });

  // mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow?.loadURL(`file://${__dirname}/index.html#/login`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
app.on('browser-window-focus', () => {
  unBlink();
});

ipcMain.on('generateKey', (event) => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    // The standard secure default length for RSA keys is 2048 bits
    modulusLength: 2048,
  });
  event.returnValue = {
    publicKey: publicKey.export({ format: 'pem', type: 'spki' }),
    privateKey: privateKey.export({ format: 'pem', type: 'pkcs1' }),
  };
});

ipcMain.on('isFocused', (event) => {
  event.returnValue = mainWindow?.isFocused();
});
ipcMain.on('focus', (event) => {
  event.returnValue = true;
  mainWindow?.focus();
  unBlink();
});
ipcMain.on('flash', (event) => {
  event.returnValue = true;
  blink();
});

ipcMain.on('hide', (event) => {
  event.returnValue = true;
  mainWindow?.hide();
});

ipcMain.on('close', (event) => {
  event.returnValue = true;
  mainWindow?.close();
});

ipcMain.on('minimize', (event) => {
  event.returnValue = true;
  mainWindow?.minimize();
});

ipcMain.on('toMain', (event) => {
  event.returnValue = true;
  mainWindow?.setMinimumSize(1036, 573);
});

ipcMain.on('toSmall', (event) => {
  event.returnValue = true;
  mainWindow?.setMinimumSize(335, 440);
});

ipcMain.on('readFile', (event, addr) => {
  try {
    event.returnValue = fs.readFileSync(addr);
  } catch (e) {
    event.returnValue = false;
  }
});
