const tracks = [{src:'assets/audio/relaxing.mp3',title:'Relaxing Jazz Music in the Rain'}];
let current=0,audio=document.getElementById('audio'),info=document.getElementById('track-info');
document.getElementById('play').addEventListener('click',()=>audio.paused?audio.play():audio.pause());
document.getElementById('next').addEventListener('click',()=>{current=(current+1)%tracks.length;change();});
document.getElementById('prev').addEventListener('click',()=>{current=(current-1+tracks.length)%tracks.length;change();});
audio.addEventListener('ended',()=>{current=(current+1)%tracks.length;change();});
function change(){audio.src=tracks[current].src;info.textContent='Track: '+tracks[current].title;audio.play();}