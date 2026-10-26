
// Match the visible track count to the number of chords, up to four.
const renderCardsBefore141=renderCards;
renderCards=function(...args){renderCardsBefore141(...args);const chart=$('songChart');chart.style.setProperty('--visible-chords141',Math.max(1,Math.min(4,song.blocks.length)));chart.querySelectorAll('.song-card').forEach((card,i)=>{const button=card.querySelector('.card-select'),beats=document.createElement('span');beats.className='card-beats141';beats.textContent=song.blocks[i].beats+' 拍';button.insertBefore(beats,button.querySelector('.card-progress'));button.setAttribute('aria-label','第 '+(i+1)+' 格，'+button.textContent);button.title=button.textContent})};
renderCards();

