import { ipcRenderer } from 'electron';

function toggleToMain() {
  ipcRenderer.sendSync('toMain');
  document.querySelector('.main-window').classList.add('mainStatus');
  document.querySelector('#root').classList.add('mainStatus');
  setTimeout(
    () => document.querySelector('.main-window').classList.add('shrink'),
    300
  );
  setTimeout(
    () => document.querySelector('.main-window').classList.add('noAnimate'),
    600
  );
}

function toggleFromMain() {
  ipcRenderer.sendSync('toSmall');
  document.querySelector('.main-window').classList.remove('noAnimate');
  document.querySelector('.main-window').classList.remove('mainStatus');
  document.querySelector('#root').classList.remove('mainStatus');
  document.querySelector('.main-window').classList.remove('shrink');
}

export default {
  toggleFromMain,
  toggleToMain,
};
