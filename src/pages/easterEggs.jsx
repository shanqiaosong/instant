import React from 'react';
import ReactDOM from 'react-dom';
import style from './easterEggs.sass';

const emojiCount = 16;
const duration = 1.1;

export function growAnimation(char) {
  const container = document.createElement('div');
  container.className = style.root;
  document.body.append(container);
  const elements = Array.from({ length: emojiCount }).map((_, idx) => {
    const left = 10 + 80 * Math.random();
    const top = 10 + 80 * Math.random();
    const size = 55 + 20 * Math.random();
    return (
      <div
        /* eslint-disable-next-line react/no-array-index-key */
        key={idx + Math.random()}
        style={{
          left: `${left}%`,
          top: `${top}%`,
          animationDelay: `${(duration * idx) / emojiCount}s`,
          fontSize: `${size}px`,
          width: `${size * 2}px`,
          height: `${size * 2}px`,
          lineHeight: `${size}px`,
          marginLeft: `${-size / 2}px`,
          marginTop: `${-size / 2}px`,
          textAlign: 'center',
        }}
        className={style.element}
      >
        <span
          style={{
            transform: `rotateZ(${30 * Math.random() - 15}deg)`,
            display: 'block',
          }}
        >
          {char}
        </span>
      </div>
    );
  });
  ReactDOM.render(elements, container);
  setTimeout(() => {
    container.remove();
  }, 5000);
}

export function rainAnimation(char) {
  const container = document.createElement('div');
  container.className = style.root;
  document.body.append(container);
  const elements = Array.from({ length: emojiCount }).map((_, idx) => {
    const left = 10 + 80 * Math.random();
    const top = 10 + 80 * Math.random();
    const size = 55 + 20 * Math.random();
    return (
      <div
        /* eslint-disable-next-line react/no-array-index-key */
        key={idx + Math.random()}
        style={{
          left: `${left}%`,
          top: `${top}%`,
          animationDelay: `${(duration * idx) / emojiCount}s`,
          fontSize: `${size}px`,
          width: `${size * 2}px`,
          height: `${size * 2}px`,
          lineHeight: `${size}px`,
          marginLeft: `${-size / 2}px`,
          marginTop: `${-size / 2}px`,
          textAlign: 'center',
        }}
        className={style.rainElement}
      >
        <span
          style={{
            display: 'block',
          }}
        >
          {char}
        </span>
      </div>
    );
  });
  ReactDOM.render(elements, container);
  setTimeout(() => {
    container.remove();
  }, 5000);
}
