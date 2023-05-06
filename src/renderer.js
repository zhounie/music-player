
import './index.css';

// const { BrowserWindow } = require('@electron/remote');

let audio = null;

const musicList = [
 {path: 'assets/mp3/1.mp3', name: '1.mp3'},
 {path: 'assets/mp3/2.mp3', name: '2.mp3'},
]

document.addEventListener('DOMContentLoaded', () => {
  const playlist = document.getElementById('playlist');
  const playlistbox = document.getElementById('playlistbox');
  
  playlistbox.innerHTML = musicList.map((item, index) => {
    const bgcss = index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
    return `<li class="${bgcss} hover:bg-gray-200 p-1.5" data-src="${item.path}">
      <span>${index+1}</span>
      <span>${item.name}</span>
    </li>`
  }).join('')

  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const audioDom = document.querySelector('audio')

  playlist.addEventListener('click', (event) => {
    const src = event.target.getAttribute('data-src');
    if (src) {
      audioDom.src = src
      if (audio) {
        audio.pause();
      }

      audio = document.createElement('audio');  
      audio.src = src  
      audio.controls = true;  
    }
  });
  
  playBtn?.addEventListener('click', () => {
    if (audio) {
      audio.play();
    }
  });
  
  pauseBtn?.addEventListener('click', () => {
    if (audio) {
      audio.pause();
    }
  });
});