// 1. Render songs
// 2. Scroll top
// 3. play / pause / seek
// 4. CD rotate
// 5. Next / prev
// 6. Random
// 7. Next / Repeat when ended
// 8. Active song
// 9. Scroll active song into view
// 10. Play song when click

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8';

const player = $('.player');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    isRandom: false,
    currentIndex: 0,
    isPlaying: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
          name: "Look What You Made Me Do",
          singer: "Taylor Swift",
          path: "./musicPathMp3/look.mp3",
          image: "./musicImg/3.jpg"
        },
        {
          name: "Coming for You",
          singer: "SwitchOTR",
          path: "./musicPathMp3/coming.mp3",
          image:"./musicImg/6.jpg"
        },
        {
          name: "The Ocean",
          singer: "Mike Perry ft Shy Martin",
          path:"./musicPathMp3/theOcean.mp3",
          image: "https://i.ytimg.com/vi/QvswgfLDuPg/maxresdefault.jpg"
        },
        {
          name: "Mạc Vấn Quy Kỳ",
          singer: "莫問歸期  蔣雪兒",
          path: "./musicPathMp3/mac.mp3",
          image:
            "https://a10.gaanacdn.com/images/song/39/24225939/crop_480x480_1536749130.jpg"
        },
        {
          name: "LAST REUNION",
          singer: "Peter Roe",
          path: "./musicPathMp3/last.mp3",
          image:
            "https://a10.gaanacdn.com/images/albums/72/3019572/crop_480x480_3019572.jpg"
        },
        {
          name: "TEDDY",
          singer: "Veiru",
          path: "./musicPathMp3/teddy.mp3",
          image:
            "https://a10.gaanacdn.com/gn_img/albums/YoEWlabzXB/oEWlj5gYKz/size_xxl_1586752323.webp"
        },
        {
            name: "Holo",
            singer: "Ampyx",
            path: "./musicPathMp3/holo.mp3",
            image:"./musicImg/2.jpg"
        }
    ],
    setConfig: function(key,value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config));
    },
    render: function(){
        const htmls = this.songs.map( (song, index) => {
            return `
                <div class="song ${ index === this.currentIndex ? 'active' : '' }" data-index='${index}' >
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        })
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function(){
        Object.defineProperty(this,'currentSong',{
            get: function(){
                return this.songs[this.currentIndex];
            }
        })
    },
    loandCurrentSong: function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path;
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    handleEvents: function(){
        const widthCd = cd.offsetWidth;
        const _this = this;

        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ],{
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        document.onscroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidthcd = widthCd - scrollTop;
            cd.style.width = newWidthcd > 0 ? newWidthcd + 'px' : 0 ;
            cd.style.opacity = newWidthcd / widthCd;
        }
        playBtn.onclick = function(){
            if ( _this.isPlaying ){
                audio.pause();
            }else{
                audio.play();
            }
        }
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
        audio.ontimeupdate = function(){
            if ( audio.duration ){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100 );
                progress.value = progressPercent ;
            }
        }
        progress.oninput = function(){
            const seekTime = audio.duration / 100 * this.value;
            audio.currentTime = seekTime;
        }
        nextBtn.onclick = function(){
            if ( _this.isRandom ){
                _this.playRandomSong()
            }
            else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        prevBtn.onclick = function(){
            if ( _this.isRandom ){
                _this.playRandomSong()
            }
            else{
                _this.prevSong();
            }  
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        randomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom);
        }
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat);
        }
        audio.onended = function(){
            if ( _this.isRepeat )
                audio.play()
            else
                nextBtn.click();
        },
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');
            if ( songNode || e.target.closest('.option') ){
                if ( songNode ){
                    _this.currentIndex = songNode.dataset.index*1 ;
                    _this.loandCurrentSong();
                    _this.render();
                    audio.play();
                }
            }
        }
    },
    nextSong: function(){
        this.currentIndex++ ;
        if ( this.currentIndex >= this.songs.length ){
            this.currentIndex = 0;
        }
        this.loandCurrentSong();
    },
    prevSong: function(){
        this.currentIndex--;
        if ( this.currentIndex < 0 ){
            this.currentIndex = this.songs.length - 1;
        }
        this.loandCurrentSong();
    },
    playRandomSong: function(){
        let newtIndex = this.currentIndex
        do{
            this.currentIndex = Math.floor(Math.random() * this.songs.length);
        }
        while( newtIndex === this.currentIndex )
        this.loandCurrentSong();
    },
    scrollToActiveSong: function () {
        setTimeout (() => {
          $('.song.active').scrollIntoView({
            behavior: "smooth",
            block: "nearest"
          })
        },300)
    },    
    start: function(){

        this.loadConfig();
        
        this.render();

        this.defineProperties();

        this.loandCurrentSong();

        this.handleEvents();

        repeatBtn.classList.toggle('active',this.isRepeat);
        randomBtn.classList.toggle('active',this.isRandom);

    }
}

app.start();

