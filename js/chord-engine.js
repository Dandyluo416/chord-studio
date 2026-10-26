/* Structured chord model. No persistence indexes or audio code are changed. */
(function(global){
'use strict';
const natural={C:0,D:2,E:4,F:5,G:7,A:9,B:11}, letters=Object.keys(natural);
const mod=n=>(n%12+12)%12;
const triads={major:[[0,'1'],[4,'3'],[7,'5']],minor:[[0,'1'],[3,'♭3'],[7,'5']],dim:[[0,'1'],[3,'♭3'],[6,'♭5']],aug:[[0,'1'],[4,'3'],[8,'♯5']],sus2:[[0,'1'],[2,'2'],[7,'5']],sus4:[[0,'1'],[5,'4'],[7,'5']]};
function normalize(raw={}){
 const s={letter:letters.includes(raw.letter)?raw.letter:'C',acc:[-1,0,1].includes(raw.acc)?raw.acc:0,quality:triads[raw.quality]?raw.quality:'major',seventh:['7','maj7','dim7'].includes(raw.seventh)?raw.seventh:null,extension:[9,11,13].includes(raw.extension)?raw.extension:null,adds:[...new Set((raw.adds||[]).filter(n=>[6,9,11].includes(n)))].sort((a,b)=>a-b),alterations:[...new Set((raw.alterations||[]).filter(n=>['♭9','♯9','♯11','♭13'].includes(n)))].sort(),inversion:Math.max(0,Math.floor(raw.inversion||0))};
 if(s.seventh==='dim7')s.quality='dim';
 if(s.quality.startsWith('sus')||s.seventh==='dim7')s.extension=null;
 if(s.quality==='sus2')s.adds=s.adds.filter(n=>n!==9);
 if(s.quality==='sus4')s.adds=s.adds.filter(n=>n!==11);
 if(s.extension&&!s.seventh)s.seventh='7';
 if(s.seventh){s.adds=s.adds.filter(n=>n!==6)}else{s.alterations=[]}
 const altPitch={'♭9':1,'♯9':3,'♯11':6,'♭13':8};
 s.alterations=s.alterations.filter(a=>!triads[s.quality].some(t=>t[0]===altPitch[a])&&!(s.quality==='sus2'&&a.includes('9'))&&!(s.quality==='sus4'&&a==='♯11'));
 if(s.alterations.includes('♭9')&&s.alterations.includes('♯9'))s.alterations=s.alterations.filter(n=>n!=='♯9');
 if(s.alterations.includes('♯11'))s.adds=s.adds.filter(n=>n!==11);
 if(s.alterations.some(a=>a.includes('9')))s.adds=s.adds.filter(n=>n!==9);
 return s;
}
function spell(letter,acc,degree,semitones){
 const match=degree.match(/\d+/),d=Number(match[0]),targetLetter=letters[(letters.indexOf(letter)+d-1)%7];
 let delta=mod(natural[letter]+acc+semitones-natural[targetLetter]);if(delta>6)delta-=12;
 return targetLetter+({0:'',1:'♯',2:'𝄪','-1':'♭','-2':'𝄫'}[delta]??(delta>0?'♯'.repeat(delta):'♭'.repeat(-delta)));
}
function build(raw){
 const s=normalize(raw),tones=triads[s.quality].map(t=>[...t]);
 if(s.seventh)tones.push(s.seventh==='dim7'?[9,'𝄫7']:s.seventh==='maj7'?[11,'7']:[10,'♭7']);
 if(s.extension)for(const [n,d]of [[14,9],[17,11],[21,13]])if(d<=s.extension)tones.push([n,String(d)]);
 for(const n of s.adds){const sem={6:9,9:14,11:17}[n];if(!tones.some(t=>t[0]===sem))tones.push([sem,String(n)])}
 for(const a of s.alterations){const d=Number(a.match(/\d+/)[0]),sem={'♭9':13,'♯9':15,'♯11':18,'♭13':20}[a];for(let i=tones.length-1;i>=0;i--)if(Number(tones[i][1].match(/\d+/)[0])===d)tones.splice(i,1);tones.push([sem,a])}
 tones.sort((a,b)=>a[0]-b[0]);
 const prefix={major:'',minor:'m',dim:'dim',aug:'aug',sus2:'sus2',sus4:'sus4'}[s.quality];let suffix=prefix;
 if(s.seventh){const ext=s.extension||7;
  if(s.quality==='dim'&&s.seventh==='dim7')suffix='dim'+ext;
  else if(s.quality==='dim'&&s.seventh==='7')suffix='m'+ext+'♭5';
  else if(s.quality==='dim'&&s.seventh==='maj7')suffix='dim(maj'+ext+')';
  else if(s.quality.startsWith('sus'))suffix=(s.seventh==='maj7'?'maj':'')+ext+prefix;
  else if(s.quality==='minor')suffix=s.seventh==='maj7'?'m(maj'+ext+')':'m'+ext;
  else if(s.quality==='aug')suffix=s.seventh==='maj7'?'aug(maj'+ext+')':ext+'(♯5)';
  else suffix=(s.seventh==='maj7'?'maj':'')+ext;
 }
 const additions=s.adds.filter(n=>!(s.extension&&n>=9&&n<=s.extension));
 if(!s.seventh&&additions.includes(6)){suffix=prefix+'6';if(additions.includes(9))suffix+='/9';if(additions.includes(11))suffix+='(add11)'}
 else if(additions.length){const str=additions.map(n=>'add'+n).join(',');suffix+=(!suffix&&additions.length===1)?str:'('+str+')'}
 if(s.alterations.length)suffix+='('+s.alterations.join(',')+')';
 const root=natural[s.letter]+s.acc,rootName=s.letter+({0:'',1:'♯','-1':'♭'}[s.acc]);
 const components=tones.map(([offset,degree])=>({offset,degree,name:spell(s.letter,s.acc,degree,offset),pc:mod(root+offset)}));
 // Inversions use the distinct chord tones in closed position. Root stays fixed.
 const ordered=[...components];s.inversion%=ordered.length;
 let voiced=ordered.map(t=>({...t,midi:48+mod(root)+t.offset}));
 for(let i=0;i<s.inversion;i++){const t=voiced.shift();let midi=t.midi;while(midi<=voiced[voiced.length-1].midi)midi+=12;voiced.push({...t,midi})}
 return {state:s,root:mod(root),rootName,suffix,symbol:rootName+suffix+(s.inversion?'/'+voiced[0].name:''),components,voiced,bass:voiced[0]};
}
const api={normalize,build,spell};if(typeof module!=='undefined')module.exports=api;global.ChordEngine=api;
})(typeof window==='undefined'?globalThis:window);
