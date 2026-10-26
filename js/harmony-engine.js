/* Shared enharmonic spelling and explainable, non-exclusive harmonic inference. */
(function(g){'use strict';
const CE=typeof module!=='undefined'?require('./chord-engine.js'):g.ChordEngine;
const mod=n=>(n%12+12)%12, NAT={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const FLAT=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'],SHARP=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const scales={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10]};
function parseName(n){n=String(n).replace(/#/g,'♯').replace(/b/g,'♭');return {letter:n[0]?.toUpperCase(),acc:[...n.slice(1)].reduce((s,c)=>s+({'♯':1,'♭':-1,'𝄪':2,'𝄫':-2}[c]||0),0)}}
function pc(n){const p=parseName(n);return mod(NAT[p.letter]+p.acc)}
function keyName(key){return key.name||((key.mode==='minor'?[9,4,11,6,1,8]:[7,2,9,4,11,6]).includes(key.tonic)?SHARP:FLAT)[key.tonic]}
function rootName(root,key,override){if(override&&pc(override)===mod(root))return override.replace(/#/g,'♯').replace(/b/g,'♭');if(!key)return FLAT[mod(root)];const r=parseName(keyName(key)),delta=mod(root-key.tonic),scale=scales[key.mode]||scales.major;let degree=scale.indexOf(delta);if(degree>=0)return CE.spell(r.letter,r.acc,String(degree+1),delta);const chromatic={1:'♭2',3:'♭3',6:'♯4',8:'♭6',10:'♭7'};return CE.spell(r.letter,r.acc,chromatic[delta]||String(scale.findIndex(n=>n===mod(delta-1))+1||1),delta)}
function names(root,quality,key,override){const r=parseName(rootName(root,key,override));return quality[2].map((n,i)=>CE.spell(r.letter,r.acc,quality[3][i],n))}
function roman(block,key,catalog){const q=catalog[block.quality??block.q],d=mod(block.root-key.tonic),minor=q[2].includes(3),dim=q[2].includes(6)&&minor;const bases={0:'I',1:'♭II',2:'II',3:'♭III',4:'III',5:'IV',6:'♯IV',7:'V',8:'♭VI',9:'VI',10:'♭VII',11:'VII'};let s=bases[d];if(minor)s=s.toLowerCase();if(dim)s+=q[2].includes(10)?'ø':'°';else if(q[2].includes(8)&&q[2].includes(4))s+='+';if(q[2].length>=4)s+=q[3].includes('7')?'maj7':q[3].some(x=>x.includes('7'))?'7':q[3].includes('6')?'6':'';return s}
function analyze(blocks,catalog,manual){if(!blocks.length)return null;const scores=[];
 for(const mode of ['major','minor'])for(let tonic=0;tonic<12;tonic++){const key={tonic,mode},scale=new Set(scales[mode].map(n=>mod(n+tonic)));let score=0;for(let i=0;i<blocks.length;i++){const b=blocks[i],q=catalog[b.quality??b.q],pcs=q[2].map(n=>mod(b.root+n)),outside=pcs.filter(n=>!scale.has(n)).length;score+=outside===0?2.4:-outside*.8;const next=blocks[i+1];const dom=q[2].includes(4)&&q[2].includes(10);if(dom&&next&&mod(b.root+5)===next.root){score+=mod(b.root-tonic)===7?3.6:1.1;}if(b.root===tonic&&q[2].includes(mode==='major'?4:3)){score+=.8;if(i===0)score+=.7;if(i===blocks.length-1)score+=1.4}if(mode==='minor'&&mod(b.root-tonic)===7&&q[2].includes(4))score+=1.4;}scores.push({...key,score})}
 scores.sort((a,b)=>b.score-a.score);const key=manual?{...manual,score:0}:scores[0],gap=scores[0].score-scores[1].score;
 const scale=new Set(scales[key.mode].map(n=>mod(n+key.tonic)));
 const functions=blocks.map((b,i)=>{const q=catalog[b.quality??b.q],next=blocks[i+1],d=mod(b.root-key.tonic),pcs=q[2].map(n=>mod(b.root+n));let label=roman(b,key,catalog),kind='diatonic',hint='';const out=pcs.some(n=>!scale.has(n));const dominant=q[2].includes(4)&&q[2].includes(10);const dim=q[2].includes(3)&&q[2].includes(6)&&q[2].includes(9);
  // German/Italian/French sixth is an interpretation of the same pitch set, only before V.
  const aug6=d===8&&pcs.includes(mod(key.tonic+6))&&pcs.includes(key.tonic)&&next&&mod(next.root-key.tonic)===7;
  if(aug6){kind='augmented-sixth';label=pcs.includes(mod(key.tonic+3))?'Ger+6':pcs.includes(mod(key.tonic+2))?'Fr+6':'It+6';hint='通往屬和弦，可解釋為增六和弦；和弦代號仍保留原輸入。'}
  else if(dominant&&next&&mod(b.root+5)===next.root&&d!==7){kind='secondary';label='V7/'+roman({...next,quality:next.quality??next.q},key,catalog).replace(/(?:maj)?7$/,'');hint='副屬和弦，指向下一個和弦；不直接視為轉調。'}
  else if(dim){kind='diminished';hint='此減七和弦可有多種等音詮釋，依後續解決判斷。';if(next&&mod(next.root-b.root)===1)label='vii°7/'+roman(next,key,catalog).replace(/(?:maj)?7$/,'')}
  else if(out&&((key.mode==='major'&&[0,3,5,8,10].includes(d))||(key.mode==='minor'&&[0,5,9].includes(d)))){kind='borrowed';hint='可視為平行大小調借用，並非錯音。'}
  else if(out){kind='chromatic';hint='此和弦的記譜可能需要依和聲脈絡調整。'}
  let spelledRoot=rootName(b.root,key,b.rootSpelling);
  if(!b.rootSpelling&&kind==='diminished'&&next&&mod(next.root-b.root)===1){const nextName=parseName(rootName(next.root,key,next.rootSpelling));spelledRoot=CE.spell(nextName.letter,nextName.acc,'7',11)}
  const spelled=names(b.root,q,key,spelledRoot);
  if(aug6){const k=parseName(keyName(key)),index=pcs.indexOf(mod(key.tonic+6));spelled[index]=CE.spell(k.letter,k.acc,'♯4',6)}
  return {label,kind,hint,rootName:spelledRoot,names:spelled};
 });
 // A local key change requires a cadence plus a repeated local tonic, never one altered chord.
 const modulations=[];if(blocks.length>=6)for(let i=2;i<=blocks.length-4;i++){const tail=blocks.slice(i);const local=analyzeShort(tail,catalog);if(local&&local.tonic!==key.tonic){const count=tail.filter(b=>b.root===local.tonic).length;const cadence=tail.some((b,j)=>j<tail.length-1&&mod(b.root-local.tonic)===7&&tail[j+1].root===local.tonic&&catalog[b.quality??b.q][2].includes(4));if(count>=2&&cadence&&!modulations.some(m=>m.tonic===local.tonic))modulations.push({...local,index:i,label:'可能轉調：'+keyName(local)+(local.mode==='major'?' 大調':' 小調')})}}
 return {key:{...key,name:keyName(key)},uncertain:!manual&&(gap<1||blocks.length<3),alternatives:scores.slice(0,3).map(k=>({...k,name:keyName(k)})),functions,modulations};
}
function analyzeShort(bs,qs){let best=null;for(const b of bs){const q=qs[b.quality??b.q];if(q[2].includes(4)||q[2].includes(3)){const k={tonic:b.root,mode:q[2].includes(3)?'minor':'major'},scale=scales[k.mode].map(n=>mod(n+k.tonic)),score=bs.reduce((s,c)=>s+qs[c.quality??c.q][2].filter(n=>scale.includes(mod(n+c.root))).length,0);if(!best||score>best.score)best={...k,score}}}return best}
const api={parseName,pc,keyName,rootName,names,roman,analyze};if(typeof module!=='undefined')module.exports=api;g.HarmonyEngine=api;
})(typeof window==='undefined'?globalThis:window);
