// const { ipcRenderer } = require('electron')
import { dialog } from '@electron/remote'
import './index.css';
import path, { resolve } from 'path'
import fs from 'fs'
import { parseBuffer } from 'music-metadata'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)

document.addEventListener('DOMContentLoaded', () => {

  const currentMp3Name = document.getElementById('currentMp3Name')
  const playStatus = document.getElementById('playStatus')
  const playlist = document.getElementById('playlist');
  const playlistbox = document.getElementById('playlistbox');
  const welcom = document.getElementById('welcom')
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
  // if (historyList.length) {
  //   historylistbox.innerHTML = historyList.map((item, index) => {
  //     const bgcss = index % 2 === 0 ? 'bg-gray-100' : 'bg-transparent'
  //     return `<li
  //               class="${bgcss} hover:bg-gray-200 cursor-pointer p-1.5 pl-4 truncate" data-index="${index}"
  //               data-src="${item}"
  //               data-index="${index}"
  //             >
  //                 <span>${item.match(/[^\\/]*$/)[0]}</span>
  //             </li>`
  //   }).join('')
  // }
  

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
  

  playlistbox.addEventListener('dblclick', (event) => {
    const src = event.target.parentElement.getAttribute('data-src');
    const index = event.target.parentElement.getAttribute('data-index');
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
    let src = getNextSrc(true)
    play(src)
  })

  function getNextSrc (isNext) {
    let index = currentIndex
    if (isNext) {
      index = (musicList.length + currentIndex + 1) % musicList.length
    } else if (state === 1) {
      index = currentIndex
    } else if (state === 2) {
      index = currentIndex
    } else {
      index = (musicList.length + currentIndex + 1) % musicList.length
    }
    currentIndex = index
    return musicList[index].path
  }

  function getPreSrc () {
    return historyList[1]
  }

  function play(src) {
    currentMp3Name.innerText = src.match(/[^\\/]*$/)[0];
    audioDom.src = src

    for(let i = 0; i< playlistbox.children.length; i++) {
      if (playlistbox.children[i].getAttribute('data-src') === src) {
        playlistbox.children[i].children[0].innerHTML = `<i class="iconfont icon-laba text-indigo-500"></i>`
      } else {
        playlistbox.children[i].children[0].innerHTML = `${+playlistbox.children[i].getAttribute('data-index') + 1}.`
      }
    }
    
    if (audio) {
      audio.pause();
    }

    audio = document.createElement('audio');  
    audio.src = src  
    audio.controls = true;  
  }

  function openFile() {
    dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory']
    }).then((result) => {
      const dirPath = result.filePaths[0]
      fs.readdir(dirPath, async (err, rawFiles) => {
        if (err) {
          console.log(err);
        } else {
          welcom.style = 'display: block'
          const files = rawFiles.filter(item => item.includes('.mp3'))

          const listResult = files.map(async(item) => {
            const filePath = path.resolve(dirPath, item)
            let meta = {}
            const fileBuffer = fs.readFileSync(filePath)
            const fileInfo = fs.statSync(filePath)
            console.log(fileInfo);
            meta = await parseBuffer(fileBuffer, {mimeType: 'audio/mpeg', size: fileInfo.size}, {duration: true})
            console.log(meta);
            const { common, format } = meta

            let picture = ''
            if (Array.isArray(common.picture) && common.picture.length) {
              const buffer = common.picture[0].data
              // const type = common.picture[0].format
              const base64 = Buffer.from(buffer).toString('base64');
              // const blob = new Blob([buffer], { type: type }); // or the appropriate MIME type for the image format
              picture = `data:image/jpeg;base64,${base64}`
            }

            return {
              picture: picture,
              title: common.title,
              artist: common.artist,
              album: common.album,
              duration: format.duration,
              size: fileInfo.size,
              path: filePath
            }
          })
          Promise.all(listResult).then(list => {
            musicList = list
            localStorage.setItem('historyList', JSON.stringify(musicList))
            setList()
          })
        }
      })
    }).catch((err) => {
      console.log(err)
    });
  }

  // 设置播放列表
  function setList () {
    if (musicList.length) {
      welcom.style = 'display: none'
    }
    playlistbox.innerHTML = musicList.map((item, index) => {
      const bgcss = index % 2 === 0 ? 'bg-gray-50' : 'bg-transparent'
      return `<tr
                class="${bgcss} hover:bg-gray-200 font-light"
                data-src="${item.path}"
                data-index="${index}"
              >
                <td class="py-4 pl-4 rounded-l-md"><span>${index+1}.</span></td>
                <td class="py-4 flex items-center space-x-2">
                  <img class="w-10 h-10 object-cover" src="${item.picture || './assets/img/bg.png'}" />
                  <span>${item.title}.</span>
                </td>
                <td class="py-4 text-gray-400"><span>${item.artist}.</span></td>
                <td class="py-4 text-gray-400"><span>${item.album}.</span></td>
                <td class="py-4 text-gray-400"><span>${dayjs.duration(item.duration, 's').asMinutes().toFixed(2)}</span></td>
                <td class="py-4 text-gray-400 rounded-r-md"><span>${(item.size / 1024 / 1024).toFixed(2)}MB</span></td>
              </tr>`
    }).join('')
  }
  
  openFileBtn.addEventListener('click', openFile)
  
});




