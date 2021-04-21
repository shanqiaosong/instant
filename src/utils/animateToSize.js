import anime from 'animejs';
import { remote } from 'electron';

export default function animateToSize(width, height) {
  const bound = remote.getCurrentWindow().getBounds();
  const originalWidth = bound.width;
  const originalHeight = bound.height;
  // 为了减小抖动，取消相近的改变
  const params = {
    targets: bound,
    width: Math.abs(width - bound.width) > 5 ? width : bound.width,
    height: Math.abs(height - bound.height) > 5 ? height : bound.height,
    easing: 'spring(0.5,100,10,15)',
    update: () => {
      remote.getCurrentWindow().setBounds({
        width: Math.round(bound.width),
        height: Math.round(bound.height),
        x: Math.round(bound.x - (bound.width - originalWidth) / 2),
        y: Math.round(bound.y - (bound.height - originalHeight) / 2),
      });
    },
  };
  console.log(JSON.parse(JSON.stringify(params)));
  anime(params);
}
