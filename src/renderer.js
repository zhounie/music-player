// const { ipcRenderer } = require('electron')
import { dialog } from '@electron/remote'
import './index.css';
import path from 'path'
import fs from 'fs'

document.addEventListener('DOMContentLoaded', () => {

  const currentMp3Name = document.getElementById('currentMp3Name')
  const playStatus = document.getElementById('playStatus')
  const playlist = document.getElementById('playlist');
  const playlistbox = document.getElementById('playlistbox');
  const openFileBtn2 = document.getElementById('openFileBtn2')
  const openFileBtn = document.getElementById('openFileBtn')
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const audioDom = document.querySelector('audio')
  const preDom = document.getElementById('pre')
  const nextDom = document.getElementById('next')
  const menuBtn = document.getElementById('menuBtn')
  const historyListDom = document.getElementById('historyList')
  const historylistbox = document.getElementById('historylistbox');

  // 播放历史记录
  const historyList = JSON.parse(localStorage.getItem('historyList') || '[]')
  if (historyList.length) {
    historylistbox.innerHTML = historyList.map((item, index) => {
      const bgcss = index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
      return `<li
                class="${bgcss} hover:bg-gray-200 cursor-pointer p-1.5 pl-4 truncate" data-index="${index}"
                data-src="${item}"
                data-index="${index}"
              >
                  <span>${item.match(/[^\\/]*$/)[0]}</span>
              </li>`
    }).join('')
  }
  

  menuBtn.addEventListener('click', () => {
    console.log(historyListDom.style.display);
    if (historyListDom.style.display === 'block') {
      historyListDom.style.display = 'none'
    } else {
      historyListDom.style.display = 'block'
    }
  })

  // 0 列表循环, 1 单曲播放, 2 随机播放
  let state = 0

  playStatus.addEventListener('click', (event) => {
    // 设置播放方式
    if (playStatus.className.includes('icon-liebiaoxunhuan')) {
      playStatus.classList = 'iconfont icon-danquxunhuan'
      state = 1
    } else if (playStatus.className.includes('icon-danquxunhuan')) {
      playStatus.classList = 'iconfont icon-24gl-shuffle'
      state = 2
    } else {
      playStatus.classList = 'iconfont icon-liebiaoxunhuan'
      state = 0
    }
  })


  let audio = null;

  let currentIndex = 0
  let musicList = []

  
  // playlistbox.innerHTML = musicList.map((item, index) => {
  //   const bgcss = index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
  //   return `<li class="${bgcss} hover:bg-gray-200 p-1.5" data-src="${item.path}">
  //     <span>${index+1}</span>
  //     <span>${item.name}</span>
  //   </li>`
  // }).join('')

  if (historyList.length) {
    musicList = historyList
    setList()
  }

  audioDom.addEventListener('ended', (event) => {
    // 设置下一首播放
    let src = getNextSrc()
    play(src)
  })

  historylistbox.addEventListener('dblclick', (event) => {
    const src = event.target.getAttribute('data-src');
    const index = event.target.getAttribute('data-index');
    console.log(event.target);
    if (src) {
      // currentMp3Name.innerText = src.match(/[^\\/]*$/)[0];
      currentIndex = index
      play(src)
    }
  });
  

  playlist.addEventListener('dblclick', (event) => {
    const src = event.target.getAttribute('data-src');
    const index = event.target.getAttribute('data-index');
    if (src) {
      // currentMp3Name.innerText = src.match(/[^\\/]*$/)[0];
      currentIndex = index
      play(src)
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

  preDom?.addEventListener('click', () => {
    let src = getPreSrc()
    console.log(src);
    play(src)
  })

  nextDom?.addEventListener('click', () => {
    let src = getNextSrc()
    play(src)
  })

  function getNextSrc () {
    let index = currentIndex
    if (state === 1) {
      index = currentIndex
    } else if (state === 2) {
      index = currentIndex
    } else {
      index = (musicList.length + currentIndex + 1) % musicList.length
    }
    currentIndex = index
    return musicList[index]
  }

  function getPreSrc () {
    return historyList[1]
  }

  function play(src) {
    currentMp3Name.innerText = src.match(/[^\\/]*$/)[0];
    audioDom.src = src

    for(let i = 0; i< playlistbox.children.length; i++) {
      if (playlistbox.children[i].getAttribute('data-src') === src) {
        playlistbox.children[i].children[0].innerHTML = `<i class="iconfont icon-laba text-red-500"></i>`
      } else {
        playlistbox.children[i].children[0].innerHTML = `${+playlistbox.children[i].getAttribute('data-index') + 1}.`
      }
    }
    
    if (audio) {
      audio.pause();
    }
    if (!historyList.includes(src)) {
      historyList.unshift(src)
      localStorage.setItem('historyList', JSON.stringify(historyList))
    }

    audio = document.createElement('audio');  
    audio.src = src  
    audio.controls = true;  
  }

  function openFile() {
    dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory']
    }).then((result) => {
      console.log(result.canceled);
      console.log(result.filePaths);
      fs.readdir(result.filePaths[0], (err, rawFiles) => {
        openFileBtn2.style = 'display: block'
        if (err) {
          console.log(err);
        } else {
          const files = rawFiles.filter(item => {
            return item.includes('.mp3')
          })
          musicList = files.map(item => path.resolve(result.filePaths[0], item))
          setList(result.filePaths[0])
        }
      })
    }).catch((err) => {
      console.log(err)
    });
  }

  // 设置播放列表
  function setList () {
    if (musicList.length) {
      openFileBtn2.style = 'display: none'
    }
    playlistbox.innerHTML = musicList.map((item, index) => {
      const bgcss = index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
      return `<li
                class="${bgcss} hover:bg-gray-200 p-1.5" data-index="${index}"
                data-src="${item}"
                data-index="${index}"
              >
                  <span>${index+1}.</span>
                  <span>${item.match(/[^\\/]*$/)[0]}</span>
              </li>`
    }).join('')
  }
  
  openFileBtn.addEventListener('click', openFile)
  openFileBtn2.addEventListener('click', openFile)
  
});




