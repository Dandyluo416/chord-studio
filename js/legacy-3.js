
// v1.4: isolate practice inputs, consolidate settings, put instruments first.
const retiredPatterns140=new Set(['singBassFifth','singOctaves','singDoubleSingleOuter']);
for(let i=accompanimentFamilies130.length-1;i>=0;i--){const f=accompanimentFamilies130[i];f[1]=f[1].filter(id=>!retiredPatterns140.has(id));if(!f[1].length)accompanimentFamilies130.splice(i,1)}
const allowedBefore140=levelPatternAllowed;
levelPatternAllowed=id=>!retiredPatterns140.has(id)&&allowedBefore140(id);
const refreshExploreBefore140=refreshLevelUI;
refreshLevelUI=function(){refreshExploreBefore140();document.querySelectorAll('#patterns .pattern').forEach((el,i)=>{if(retiredPatterns140.has(pats[i]?.id))el.hidden=true});for(const o of [...$('quickPattern').options])if(retiredPatterns140.has(pats[Number(o.value)]?.id))o.remove()};
const refreshSongBefore140=refreshSongLevelOptions;
refreshSongLevelOptions=function(){refreshSongBefore140();const b=currentBlock();if(retiredPatterns140.has(b.pattern)){const o=new Option('既有伴奏（已停用新增）',b.pattern);o.disabled=true;$('editPattern').add(o);$('editPattern').value=b.pattern}};
if(retiredPatterns140.has(J130.pattern)){J130.pattern='singHold';J130.family='和弦齊奏'}
// Clear both evidence and painted keys: clearing only the Set leaves stale keys.
function clearPracticeInput140(){
 sightSelected.clear();virtualPianoNotes.clear();micObserved.clear();micObservedNotes.clear();stableMicFrames.clear();previousMicNotes.clear();finderPreviousMicNotes.clear();finderNoteCooldown.clear();singleMicCandidate=null;singleMicCount=0;singleMicLatched=null;sightLastAccepted=null;sightReleased=true;sightQuietSince=0;polyStableKey='';polyStableSince=performance.now();resetAccompanimentEvidence();
 $('sightKeyboard').querySelectorAll('button').forEach(key=>{key.classList.remove('selected','sounding','pressed','hand-left','hand-right');key.setAttribute('aria-pressed','false')});renderMicNotes();syncPracticeMicState();
}
const buildBefore140=startBuildTask;startBuildTask=function(){stop();clearPracticeInput140();buildBefore140()};$('buildStart').onclick=startBuildTask;
const earBefore140=startEarTask;startEarTask=function(){stop();clearPracticeInput140();earBefore140()};$('earStart').onclick=startEarTask;
const finderStartBefore140=startChordFinder;startChordFinder=function(randomize=false){stop();clearPracticeInput140();finderStartBefore140(randomize)};$('micStart').onclick=()=>startChordFinder(false);$('micNext').onclick=()=>startChordFinder(true);
const sequenceBefore140=makeSightSequence;makeSightSequence=function(){stop();clearPracticeInput140();sequenceBefore140()};$('sightNew').onclick=makeSightSequence;$('sightLength').onchange=()=>{if(sightSequence)makeSightSequence()};
const missionBefore140=setMissionTab;setMissionTab=function(kind){stop();clearPracticeInput140();missionBefore140(kind);clearPracticeInput140()};document.querySelectorAll('.mission-tab').forEach(el=>el.onclick=()=>setMissionTab(el.dataset.mission));
const clearBefore140=$('sightClear').onclick;$('sightClear').onclick=()=>{stop();clearBefore140();clearPracticeInput140()};
// Practice input is routed only to the visible task.
toggleSightNote=function(n,key){
 if($('sightWorkspace').hidden)return;const mode=missionKind,epoch=generation;
 if(sightSelected.has(n))sightSelected.delete(n);else sightSelected.add(n);key.classList.toggle('selected',sightSelected.has(n));key.setAttribute('aria-pressed',String(sightSelected.has(n)));
 audio().then(()=>{if(epoch===generation&&!$('sightWorkspace').hidden&&mode===missionKind)tone(n,.45,context.currentTime,.55)}).catch(()=>{});
 if(mode==='mic'&&chordFinder)chordFinderInput(n%12,'keyboard');
 else if(mode==='build'&&buildTask&&!buildTask.done)answerBuild(n%12,null);
 else if(mode==='read')acceptSightInput([...sightSelected],'keyboard');
};
// Settings live in a modal drawer; opening it does not reflow the lesson.
const drawer140=document.createElement('dialog');drawer140.id='settingsDrawer';drawer140.setAttribute('aria-labelledby','settingsTitle');drawer140.innerHTML='<div class="drawer-heading"><h2 id="settingsTitle">設定</h2><button id="settingsClose" class="listen" aria-label="關閉設定">關閉</button></div><p class="drawer-caption">音高、難度與目前頁面的設定</p>';
appPreferences.before(drawer140);drawer140.append(appPreferences);appPreferences.hidden=true;
const context140=document.createElement('div');context140.id='pageSettings';context140.innerHTML='<section id="teachSettings140" class="drawer-context"><h3>教學練習</h3><div id="teachControls140"></div></section><section id="learnSettings140" class="drawer-context"><h3>探索設定</h3></section><section id="practiceSettings140" class="drawer-context"><h3>練習與收音</h3></section><section id="songSettings140" class="drawer-context"><h3>和弦譜設定</h3></section>';
appPreferences.querySelector('.app-settings-actions').before(context140);
for(const id of ['learnSettings','learnRhythm'])$('learnSettings140').append($(id));$('practiceSettings140').append($('micSettings'));
const songTop140=$('songWorkspace').querySelector('.song-top-settings');if(songTop140)$('songSettings140').append(songTop140);
for(const id of ['songSettingsPanel','phonePracticeOptions'])$('songSettings140').append($(id));
const otherSettings140=document.createElement('div');otherSettings140.className='drawer-context';otherSettings140.innerHTML='<h3>顯示與聲音</h3>';otherSettings140.append($('uiSoundToggle'));const layout140=$('layoutMode').closest('label');if(layout140)otherSettings140.append(layout140);context140.before(otherSettings140);
$('appSettings').innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span>設定</span>';$('appSettings').setAttribute('aria-label','設定');$('appSettings').setAttribute('aria-controls','settingsDrawer');$('appSettings').setAttribute('aria-haspopup','dialog');
function syncDrawerContext140(){const mode=document.body.dataset.workspace;for(const [id,workspace]of [['teachSettings140','teach'],['learnSettings140','learn'],['practiceSettings140','sight'],['songSettings140','song']])$(id).hidden=mode!==workspace}
function closeDrawer140(){if(drawer140.open)drawer140.close();appPreferences.hidden=true;document.body.classList.remove('settings-open');$('appSettings').setAttribute('aria-expanded','false')}
$('appSettings').onclick=()=>{if(drawer140.open){closeDrawer140();return}syncDrawerContext140();appPreferences.hidden=false;drawer140.showModal();document.body.classList.add('settings-open');$('appSettings').setAttribute('aria-expanded','true');$('settingsClose').focus()};$('settingsClose').onclick=closeDrawer140;
drawer140.addEventListener('close',()=>{appPreferences.hidden=true;document.body.classList.remove('settings-open');$('appSettings').setAttribute('aria-expanded','false');$('appSettings').focus()});drawer140.addEventListener('click',e=>{if(e.target===drawer140){const r=drawer140.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDrawer140()}});
// Retain each instrument's IDs, events and practice overlays, but move it above controls.
const exploreInstrument140=$('keyboard').closest('.instrument');$('learnWorkspace').prepend(exploreInstrument140);exploreInstrument140.classList.add('top-instrument140');
$('sightWorkspace').prepend($('phonePiano'));$('phonePiano').open=true;$('phonePiano').classList.add('top-instrument140');
$('songWorkspace').prepend($('phoneSongPiano'));$('phoneSongPiano').open=true;$('phoneSongPiano').classList.add('top-instrument140');
const songQuick140=document.createElement('button');songQuick140.id='topPracticeToggle';songQuick140.className='listen';songQuick140.onclick=()=>{$('songPractice').checked=!$('songPractice').checked;$('songPractice').dispatchEvent(new Event('change',{bubbles:true}));syncSongPractice140()};$('phoneSongPiano').querySelector('.song-keyboard-toolbar').append(songQuick140);
function syncSongPractice140(){songQuick140.textContent='練習提示 '+($('songPractice').checked?'開':'關');songQuick140.setAttribute('aria-pressed',String($('songPractice').checked))}const syncSettingsBefore140=syncSettings;syncSettings=function(){syncSettingsBefore140();syncSongPractice140()};$('songPractice').addEventListener('change',syncSongPractice140);syncSongPractice140();
// Teach level now follows the same difficulty setting as exploration/practice.
J130.level=currentLevel();const journeyBefore140=journeyRender130;journeyRender130=function(){
 $('teachControls140').innerHTML='';journeyBefore140();
 const dock=document.createElement('section');dock.className='top-instrument140 journey-dock';dock.setAttribute('aria-label','教學示範琴鍵');dock.innerHTML='<div class="piano-caption140"><strong>示範琴鍵</strong><span>綠色是目前和弦的右手用音</span></div>';
 dock.append($('jNow'),$('jKeys'));journey130.prepend(dock);
 const levelLabel=$('jLevel').closest('label');levelLabel.remove();const tempoLabel=$('jBpm').closest('label');$('teachControls140').append(tempoLabel);
};
const difficultyBefore140=$('difficulty').onchange;$('difficulty').onchange=()=>{stop();clearPracticeInput140();difficultyBefore140();J130.level=currentLevel();journeyRender130()};
// The lyric editor gets an independent demonstration piano tied to its selected chord.
const lyricPiano140=document.createElement('section');lyricPiano140.id='lyricPiano140';lyricPiano140.className='top-instrument140';lyricPiano140.innerHTML='<div class="piano-caption140"><strong>和弦試聽</strong><span id="lyricPianoLabel140">點選歌詞上的和弦查看琴鍵</span><button id="lyricListen140" class="listen" disabled>聽和弦</button></div><div id="lyricKeys140" class="piano-scroll140"><div class="piano-track140"></div></div>';$('lyricsWorkspace').prepend(lyricPiano140);
let lyricDemoNotes140=[];
function renderLyricPiano140(){const ch=selectedLyricChord().chord;lyricDemoNotes140=ch?qualities[ch.quality][2].map(x=>48+ch.root+x%12):[];$('lyricPianoLabel140').textContent=ch?lyricSymbol(ch)+' · '+lyricDemoNotes140.map(lessonName).join(' · '):'點選歌詞上的和弦查看琴鍵';$('lyricListen140').disabled=!ch;let high=Math.max(72,...lyricDemoNotes140);while(!natural.includes(high%12))high++;const whites=[];for(let n=48;n<=high;n++)if(natural.includes(n%12))whites.push(n);const track=$('lyricKeys140').firstElementChild;track.innerHTML='';track.style.setProperty('--white-count',whites.length);for(let n=48;n<=high;n++){const key=document.createElement('button'),black=!natural.includes(n%12);key.className=(black?'piano-black140':'piano-white140')+(lyricDemoNotes140.includes(n)?' target':'');key.textContent=lessonName(n);key.dataset.note=n;key.setAttribute('aria-label',lessonName(n));if(black)key.style.left=(whites.filter(x=>x<n).length/whites.length*100)+'%';key.onclick=()=>lessonSound([[n]]);track.append(key)}}
$('lyricListen140').onclick=()=>{if(lyricDemoNotes140.length)lessonSound([lyricDemoNotes140])};const editLyricBefore140=editLyricChord;editLyricChord=function(...args){editLyricBefore140(...args);renderLyricPiano140()};
for(const id of ['lyricEditRoot','lyricEditQuality','lyricDeleteChord'])$(id).addEventListener(id==='lyricDeleteChord'?'click':'change',renderLyricPiano140);
// Close any open drawer and clear practice input when moving between workspaces.
const workspaceBefore140=switchWorkspace;switchWorkspace=function(mode){stop();clearPracticeInput140();closeDrawer140();workspaceBefore140(mode);if(mode==='teach')journeyRender130();if(mode==='lyrics')renderLyricPiano140();if(mode==='song')syncSongPractice140();syncDrawerContext140()};
for(const key of ['teach','learn','sight','song','lyrics'])$(key+'Mode').onclick=()=>switchWorkspace(key);
clearPracticeInput140();refreshLevelUI();renderSong();journeyRender130();renderLyricPiano140();syncDrawerContext140();
// Demo highlights follow scheduled audio and are cancelled on every stop/switch.
const toneBefore140=tone;
tone=function(n,d,t,...args){const result=toneBefore140(n,d,t,...args),mode=document.body.dataset.workspace,epoch=generation;const selector=mode==='teach'?'#jKeys button':mode==='sight'?'#sightKeyboard button':mode==='lyrics'?'#lyricKeys140 button':null;if(selector&&context){const delay=Math.max(0,(t-context.currentTime)*1000);later(()=>{if(epoch!==generation||mode!==document.body.dataset.workspace)return;document.querySelectorAll(selector).forEach(key=>{if(Number(key.dataset.note)===n){key.dataset.demoUntil140=String(performance.now()+d*1000);key.classList.add('demo-sounding140')}})},delay);later(()=>{if(epoch!==generation)return;document.querySelectorAll(selector+'.demo-sounding140').forEach(key=>{if(Number(key.dataset.demoUntil140)<=performance.now()+12)key.classList.remove('demo-sounding140')})},delay+d*1000+15)}return result};
const stopBefore140=stop;stop=function(){stopBefore140();document.querySelectorAll('.demo-sounding140').forEach(key=>key.classList.remove('demo-sounding140'))};
missionAudioChord=async function(root,quality){const epoch=generation,mode=missionKind;try{await audio();if(epoch!==generation||mode!==missionKind||$('sightWorkspace').hidden)return;const start=context.currentTime+.04;missionKeyNotes(root,quality).forEach((pc,i)=>tone(60+pc,.85,start+i*.012,.61))}catch(e){if(!$('sightWorkspace').hidden)$('sightStatus').textContent='音訊尚未準備好，請再按一次示範。'}};
const notationBefore140=$('noteDisplay').onchange;$('noteDisplay').onchange=()=>{notationBefore140();journeyRender130();renderLyricPiano140()};
// A dismissible installation guide, shared by first visit and Settings.
const installGuides140={ios:['iPhone／iPad · Safari',['用 Safari 開啟這個網站；若在 LINE 等 App 內，請先改用 Safari。','點「分享」，再選「加入主畫面」。若找不到，可到分享選單的「編輯動作」加入。','若出現「作為網頁 App 開啟」，請開啟，再按「加入」。']],android:['Android · Chrome',['用 Chrome 開啟這個網站。','點右上角「⋮」，選「加入主畫面」或「安裝應用程式」。','依畫面選「安裝」或「新增」，完成後從主畫面開啟。']],desktop:['電腦 · Chrome／Edge',['用 Chrome 或 Edge 開啟這個網站。','點網址列的安裝圖示，或瀏覽器選單中的「安裝應用程式」。','確認安裝；若沒有安裝選項，仍可直接使用網頁。']]};
const installPlatform140=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)?'ios':/Android/.test(navigator.userAgent)?'android':'desktop';
installDialog.innerHTML='<h2 id="appInstallTitle">把和弦研究室加入主畫面</h2><p>下次點一下圖示，就能開始練習。</p><label class="install-platform140">你的裝置<select id="installPlatform140"><option value="ios">iPhone／iPad</option><option value="android">Android</option><option value="desktop">電腦</option></select></label><h3 id="installGuideTitle140"></h3><ol id="installSteps140"></ol><p class="app-settings-copy">首次連網開啟，等待顯示「可離線使用」，之後可離線教學與播放。更新需要網路。</p><label class="install-optout140"><input type="checkbox" id="installSkip140">不再自動提醒</label><div class="install-actions140"><button id="installNative140" class="listen" hidden>立即安裝</button><button id="appInstallClose" class="listen">開始使用</button></div><p class="app-settings-copy">之後也能從「設定 → 安裝到主畫面」查看。</p>';
function renderInstallGuide140(){const guide=installGuides140[$('installPlatform140').value];$('installGuideTitle140').textContent=guide[0];$('installSteps140').replaceChildren(...guide[1].map(text=>{const li=document.createElement('li');li.textContent=text;return li}));$('installNative140').hidden=!installPrompt}
$('installPlatform140').value=installPlatform140;$('installPlatform140').onchange=renderInstallGuide140;
function showInstallGuide140(){closeDrawer140();renderInstallGuide140();if(!installDialog.open)installDialog.showModal()}
$('appInstall').onclick=showInstallGuide140;$('appInstallClose').onclick=()=>installDialog.close();
installDialog.addEventListener('close',()=>{try{sessionStorage.setItem('chord-install-shown','1');if($('installSkip140').checked)localStorage.setItem('chord-install-skip','1')}catch{}});
$('installNative140').onclick=async()=>{if(!installPrompt)return;const prompt=installPrompt;installPrompt=null;$('installNative140').hidden=true;try{await prompt.prompt();const choice=await prompt.userChoice;if(choice.outcome==='accepted')installDialog.close()}catch{renderInstallGuide140()}};
window.addEventListener('beforeinstallprompt',()=>{$('installNative140').hidden=false});window.addEventListener('appinstalled',()=>{installPrompt=null;installDialog.close();try{localStorage.setItem('chord-install-skip','1')}catch{}});
function maybeShowInstallGuide140(){if(standaloneQuery.matches||navigator.standalone===true)return;try{if(localStorage.getItem('chord-install-skip')==='1'||sessionStorage.getItem('chord-install-shown')==='1')return}catch{}if(!document.querySelector('dialog[open]'))showInstallGuide140()}
setTimeout(maybeShowInstallGuide140,700);

