import anime from 'animejs';
import { remote } from 'electron';

export default function animateToSize(width, height) {
  const bound = remote.getCurrentWindow().getBounds();
  const originalWidth = bound.width;
  const originalHeight = bound.height;
  let lastBound = {};
  // 为了减小抖动，取消相近的改变
  const params = {
    targets: bound,
    width: Math.abs(width - bound.width) > 5 ? width : bound.width,
    height: Math.abs(height - bound.height) > 5 ? height : bound.height,
    easing: 'easeOutQuint',
    duration: 500,
    update: () => {
      const newBound = {
        width: Math.round(bound.width),
        height: Math.round(bound.height),
        x: Math.round(bound.x - (bound.width - originalWidth) / 2),
        y: Math.round(bound.y - (bound.height - originalHeight) / 2),
      };
      if (JSON.stringify(newBound) !== JSON.stringify(lastBound)) {
        remote.getCurrentWindow().setBounds(newBound);
        lastBound = JSON.parse(JSON.stringify(newBound));
      }
    },
  };
  anime(params);
}
