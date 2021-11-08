import './lib/webaudio-controls.js';

const getBaseURL = () =>{
    return new URL('.',import.meta.url);
};

let ctx = window.AudioContext || window.webkitAudioContext;
let player, pannerSlider, pannerNode;
let audioContext;

let style =`
#all{
margin-left: 20%;
width:43%;
float: left;
}
#play{
  height: 20px;
  width: 20px;
}
#pause{
  height: 20px;
  width: 20px;
}
#avance10s{
  height: 15px;
  width: 20px;
}
#recule10s{
  height: 15px;
  width: 20px;
}
#info{
  margin-top: 20px;
  float: right;
}
#volume{
  margin-left: 10px;
}
#playlist{
margin-right: 20%;
float: right;
}

 .infoControls {
    margin: 0 auto;
    width: 100%;
    border-radius: 3px;
    color: #ff5752;
    font-family: 'Fredoka One';
}


`;

let template = /*html*/`
<div id="all">
<video width="100%" id="player"></video>

    <input type="image"  id="play" src="./assets/Play.png "/>
    <input type="image"  id="pause" src="./assets/Pause.png "/>
    <button id = "info">Infos</button>
    <input type="image"  id="recule10s" src="./assets/Arriere.png "/>
    <input type="image"  id="avance10s" src="./assets/Avant.png "/>
    <button id = "vitesse1x">x1</button>
    <button id = "vitesse4x">x4</button>
    <button id = "videoprec">Vidéo précédente</button>
    <webaudio-knob id="volume" min=0 max=1 value=0.5 step="0.01" 
    tooltip="%s" diameter="40" src="./assets/Aqua.png" sprite="100">Volume</webaudio-knob>
    <br>

        <br>
        <label>60Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 0);"></input>
        <output id="gain0">0 dB</output>
        <br>
        <label>170Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 1);"></input>
        <output id="gain1">0 dB</output>
        <br>
        <label>350Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 2);"></input>
        <output id="gain2">0 dB</output>
        <br>
        <label>1000Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 3);"></input>
        <output id="gain3">0 dB</output>
        <br>
        <label>3500Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 4);"></input>
        <output id="gain4">0 dB</output>
        <br>
        <label>10000Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 5);"></input>
        <output id="gain5">0 dB</output>
    </div>

    <div id="playlist">
    <h1 style="text-align: center;" id="titre">Videos</h1>
    <video id="base" style="width: 200px" src="https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4"></video>
    <br>
    <video id="tokyo" style="width: 200px" src="https://cdn.videvo.net/videvo_files/video/free/2017-05/large_watermarked/170111_063_Tokyo_DowntownNight_1080p_preview.mp4"></video>
    <br>
    <video id="paris" style="width: 200px" src="https://cdn.videvo.net/videvo_files/video/free/2015-07/large_watermarked/A0312_F1506_H2_Tour_Eiffel_from_park_AM_WA_02_preview.mp4"></video>
    <br>
    <video id="londres" style="width: 200px" src="https://cdn.videvo.net/videvo_files/video/free/2014-09/large_watermarked/London_Eye_Videvo_preview.mp4"></video>
    </div>
`;

class Myvideoplayer extends HTMLElement{
    constructor(){
        super();
        console.log("BaseURL = " + getBaseURL());
        this.attachShadow({mode:"open"})
    }
    fixRelativeURLs() {
        // pour les knobs
        let knobs = this.shadowRoot.querySelectorAll('webaudio-knob, webaudio-switch, webaudio-slider');
        knobs.forEach((e) => {
            let path = e.getAttribute('src');
            e.src = getBaseURL() + '/' + path;
        });
    }
    connectedCallback(){
        this.shadowRoot.innerHTML = `<style>${style}</style>${template}`;
        this.fixRelativeURLs();
        this.player = this.shadowRoot.querySelector("#player")
        this.player.src = this.getAttribute("src");
        this.definitEcouteurs();
        audioContext = new ctx();
        player = this.shadowRoot.querySelector('#player');
        player.onplay = (e) => {audioContext.resume();}
        this.buildAudioGraphPanner();
    }
    definitEcouteurs(){
        console.log("ecouteurs définis")
        var src = this.player.src;
        this.shadowRoot.querySelector("#play").onclick=() =>{
            this.player.play();
        }
        this.shadowRoot.querySelector("#pause").onclick=() =>{
            this.player.pause();
        }
        this.shadowRoot.querySelector("#recule10s").onclick=() =>{
            this.player.currentTime -= 10;
        }
        this.shadowRoot.querySelector("#avance10s").onclick=() =>{
            this.player.currentTime += 10;
        }
        this.shadowRoot.querySelector("#vitesse1x").onclick=() =>{
            this.player.playbackRate =1;
        }
        this.shadowRoot.querySelector("#vitesse4x").onclick=() =>{
            this.player.playbackRate =4;
        }
        this.shadowRoot.querySelector("#info").onclick=() =>{
            console.log("Durée de la vidéo : "+Math.floor(this.player.duration/60)+" minutes et "+Math.floor(this.player.duration%60)+" secondes");
            console.log("Temps courant : "+ Math.floor(this.player.currentTime/60)+" minutes et "+Math.floor(this.player.currentTime%60)+" secondes");
        }
        this.shadowRoot.querySelector("#volume").oninput = (event) => {
            const vol = parseFloat(event.target.value);
            this.player.volume = vol;
        }
        this.shadowRoot.querySelector("#base").onclick=() =>{
            src = this.player.src;
            this.player.src = this.shadowRoot.querySelector("#base").src;
        }
        this.shadowRoot.querySelector("#tokyo").onclick=() =>{
            src = this.player.src;
            this.player.src = this.shadowRoot.querySelector("#tokyo").src;
        }
        this.shadowRoot.querySelector("#paris").onclick=() =>{
            src = this.player.src;
            this.player.src = this.shadowRoot.querySelector("#paris").src;
        }
        this.shadowRoot.querySelector("#londres").onclick=() =>{
            src = this.player.src;
            this.player.src = this.shadowRoot.querySelector("#londres").src;
        }
        this.shadowRoot.querySelector("#videoprec").onclick=() =>{
            let srctemp = this.player.src
            this.player.src = src;
            src = srctemp;
        }

    }
    play() {
        this.player.play();
    }

    pause() {
        this.player.pause();
        console.log("hello");
    }

    buildAudioGraphPanner() {
        // create source and gain node
        var source = audioContext.createMediaElementSource(player);
        pannerNode = audioContext.createStereoPanner();

        // connect nodes together
        source.connect(pannerNode);
        pannerNode.connect(audioContext.destination);
    }

    changeGain(sliderVal,nbFilter) {
        var value = parseFloat(sliderVal);
        filters[nbFilter].gain.value = value;

        // update output labels
        var output = document.querySelector("#gain"+nbFilter);
        output.value = value + " dB";
    }
}
customElements.define("my-player",Myvideoplayer)