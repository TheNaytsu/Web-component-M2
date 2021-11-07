import './lib/webaudio-controls.js';

const getBaseURL = () =>{
    return new URL('.',import.meta.url);
};
let style =`
`;
let template = /*html*/`
<video id="player" src="https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4"></video>
    <br>
    <button id = "play">▶</button>
    <button id = "pause">‖</button>
    <button id = "info">Infos</button>
    <br>
    <br>
    <button id = "recule10s"><<</button>
    <button id = "avance10s">>></button>
    <button id = "vitesse1x">Vitesse x1</button>
    <button id = "vitesse4x">Vitesse x4</button>
    
    <webaudio-knob id="volume" min=0 max=1 value=0.5 step="0.01" 
    tooltip="%s" diameter="20" src="./assets/Aqua.png" sprite="100">Volume</webaudio-knob>`;

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
    }
    definitEcouteurs(){
        console.log("ecouteurs définis")
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
    }
    play() {
        this.player.play();
    }

    pause() {
        this.player.pause();
        console.log("hello");
    }
}
customElements.define("my-player",Myvideoplayer)