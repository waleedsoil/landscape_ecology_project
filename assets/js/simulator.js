/* Group 4 knoll simulator: the real terrain, the four plots and the December sun.
   Shows where the plots are and how much direct sun each one gets during the logging period. */
window.G4_SIM=true;
(function(){
const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)];
const D2R=Math.PI/180,LAT=51.5597*D2R,LON=9.9648,TZ=1;
/* DGM: 1 m raster of the course files, block-averaged to 3 m; upper-left corner 566453 E, 5712620 N (UTM 32N). */
const NR=262,NC=252,CELL=3,OX=378,OZ=393,BASE=170,VEX=1.5,E0=566453,N0=5712620;
if(!window.DGM){document.getElementById('fig').insertAdjacentHTML('afterbegin','<div class="msg">The terrain data (data/dgm.js) did not load.</div>');return}
const raw=atob(window.DGM.b64),Z=new Float32Array(NR*NC);
for(let i=0;i<Z.length;i++){const q=raw.charCodeAt(2*i)|raw.charCodeAt(2*i+1)<<8;Z[i]=q===65535?NaN:q/10+BASE}
const H=(x,z)=>{const c=(x+OX)/CELL,r=(z+OZ)/CELL,c0=Math.floor(c),r0=Math.floor(r);if(c0<0||r0<0||c0>=NC-1||r0>=NR-1)return NaN;const fc=c-c0,fr=r-r0,i=r0*NC+c0;return Z[i]*(1-fc)*(1-fr)+Z[i+1]*fc*(1-fr)+Z[i+NC]*(1-fc)*fr+Z[i+NC+1]*fc*fr};
const Y=e=>(e-BASE)*VEX;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const card8=deg=>['N','NE','E','SE','S','SW','W','NW'][Math.round(((deg%360)+360)%360/45)%8];

/* ---------- plots ---------- */
/* EDIT HERE: plot centres in UTM zone 32N (Easting, Northing).
   Field positions by GPS, 21 Nov 2026 (GPS read 266 m at all four; the DGM gives about 259 m):
   N-C 51.5600164, 9.9637715 · N-D 51.5600262, 9.9646563 · S-D 51.5595586, 9.9657023 · S-C 51.5593172, 9.9649828 */
const PLOTS_UTM={'N-C':[566809,5712544],'N-D':[566871,5712546],'S-C':[566894,5712467],'S-D':[566944,5712495]};
const DEF={};Object.keys(PLOTS_UTM).forEach(id=>{DEF[id]=[PLOTS_UTM[id][0]-E0-OX,N0-OZ-PLOTS_UTM[id][1]]});
const ASP={N:'North-facing',S:'South-facing'},FOR={C:'Coniferous',D:'Deciduous'};
const SITES=[{id:'N-C',asp:'N',fr:'C'},{id:'N-D',asp:'N',fr:'D'},{id:'S-C',asp:'S',fr:'C'},{id:'S-D',asp:'S',fr:'D'}];
const KEY='g4-sim-plots-v2';let saved=null;
try{saved=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
function terrainAt(s){
 const e=4,dx=(H(s.x+e,s.z)-H(s.x-e,s.z))/(2*e),dz=(H(s.x,s.z+e)-H(s.x,s.z-e))/(2*e),l=Math.hypot(dx,1,dz);
 s.e=H(s.x,s.z);s.n=[-dx/l,1/l,-dz/l];s.slope=Math.acos(1/l)/D2R;s.aspect=(Math.atan2(-dx,dz)/D2R+360)%360;
 const hz=new Float32Array(72);let sv=0;
 for(let k=0;k<72;k++){const az=(k*5+2.5)*D2R,ux=Math.sin(az),uz=-Math.cos(az);let mx=0;
  for(let t=3;t<1200;t+=t<90?3:6){const g=H(s.x+ux*t,s.z+uz*t);if(isNaN(g))break;const a=Math.atan2(g-(s.e+1),t);if(a>mx)mx=a}
  hz[k]=mx/D2R;sv+=Math.cos(mx)**2}
 s.hor=hz;s.svf=sv/72}
SITES.forEach(s=>{const p=saved&&saved[s.id]&&isFinite(H(saved[s.id][0],saved[s.id][1]))?saved[s.id]:DEF[s.id];s.x=p[0];s.z=p[1];terrainAt(s)});
const isDefault=()=>SITES.every(s=>s.x===DEF[s.id][0]&&s.z===DEF[s.id][1]);
const CLV=()=>SITES.reduce((a,s)=>a+s.e,0)/4;
const utm=s=>[Math.round(E0+s.x+OX),Math.round(N0-(s.z+OZ))];

/* ---------- sun ---------- */
function solar(doy,min){
 const g=2*Math.PI/365*(doy-1+(min/60-12)/24);
 const dec=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g);
 const eot=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));
 const ha=((min+eot+4*LON-60*TZ)/4-180)*D2R;
 const alt=Math.asin(Math.sin(LAT)*Math.sin(dec)+Math.cos(LAT)*Math.cos(dec)*Math.cos(ha));
 const az=Math.atan2(Math.sin(ha),Math.cos(ha)*Math.sin(LAT)-Math.tan(dec)*Math.cos(LAT))+Math.PI;
 return{alt,az}}
const dirOf=o=>[Math.cos(o.alt)*Math.sin(o.az),Math.sin(o.alt),-Math.cos(o.alt)*Math.cos(o.az)];
const NDAY=16,DAYS=[];
for(let d=0;d<NDAY;d++){let rise=null,set=null;for(let m=360;m<=1140;m+=2){if(solar(330+d,m).alt>0){if(rise===null)rise=m;set=m}}DAYS.push({rise,set})}
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const dlab=d=>{const n=26+d;return n<=30?`${n} Nov`:`${n-30} Dec`};
const hm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');
const NSTEP=2088;
const kDay=k=>Math.floor(k/144),kMin=k=>(k%144)*10;
/* direct beam on the plot surface: 0 below the terrain horizon or behind the slope, else cos of the incidence angle */
function beam(s,d){
 if(d[1]<=0)return 0;
 const azd=(Math.atan2(d[0],-d[2])/D2R+360)%360;
 if(Math.asin(d[1])/D2R<=s.hor[Math.floor(azd/5)%72])return 0;
 return Math.max(0,s.n[0]*d[0]+s.n[1]*d[1]+s.n[2]*d[2])}
let DOSE={};
function dose(day){
 if(DOSE[day])return DOSE[day];
 const D=DAYS[day],sum={};let flat=0;SITES.forEach(s=>sum[s.id]=0);
 for(let m=D.rise;m<=D.set;m+=4){const d=dirOf(solar(330+day,m));flat+=Math.max(0,d[1]);SITES.forEach(s=>sum[s.id]+=beam(s,d))}
 const r={};SITES.forEach(s=>r[s.id]=flat>0?sum[s.id]/flat:0);return DOSE[day]=r}

/* ---------- UI ---------- */
const P={map:'terrain',cur:'S-D',k:7*144+73};
let placing=null;
const fmt1=x=>(Math.abs(x)<0.05?0:x).toFixed(1);
function renderCard(){
 const s=SITES.find(q=>q.id===P.cur),[E,N]=utm(s),cl=CLV(),off=s.e-cl,a=s.aspect,ok=s.asp==='N'?(a>=300||a<=60):(a>=120&&a<=240),day=kDay(P.k);
 $('#card').innerHTML=`<dl class="facts"><dt>Plot</dt><dd><b>${s.id}</b> · ${ASP[s.asp].toLowerCase()} ${FOR[s.fr].toLowerCase()}</dd>
 <dt>Elevation</dt><dd>${s.e.toFixed(1)} m · <span class="${Math.abs(off)<=1?'ok':'warn'}">${Math.abs(off)<.05?'on':(off>0?'+':'−')+Math.abs(off).toFixed(1)+' m from'}</span> the mean contour (${cl.toFixed(1)} m)</dd>
 <dt>Slope</dt><dd>${s.slope.toFixed(0)}° · faces <span class="${ok?'ok':'warn'}">${a.toFixed(0)}° (${card8(a)})</span></dd>
 <dt>Direct sun</dt><dd>${fmt1(dose(day)[s.id])}× flat ground on ${dlab(day)}</dd>
 <dt>UTM 32N</dt><dd>${E} E · ${N} N</dd></dl>
 <div class="btns"><button type="button" class="btn pri" id="mv">Move ${s.id}</button><button type="button" class="btn" id="cp">Copy coordinates</button>${isDefault()?'':'<button type="button" class="btn" id="rs">Reset</button>'}</div>
 <p class="note" id="cpmsg">${isDefault()?'Field positions measured by GPS on 21 Nov.':'Your positions are kept in this browser.'}</p>`;
 $('#mv').onclick=()=>{placing=s.id;$('#fig').classList.add('placing');$('#banner').textContent=`Click the terrain to place ${s.id} · Esc cancels`};
 $('#cp').onclick=()=>{const t='Plot\tEasting\tNorthing\tElev_m\tSlope_deg\tAspect_deg\n'+SITES.map(q=>{const[e,n]=utm(q);return`${q.id}\t${e}\t${n}\t${q.e.toFixed(1)}\t${q.slope.toFixed(0)}\t${q.aspect.toFixed(0)}`}).join('\n');
  const show=()=>{$('#cpmsg').innerHTML='<pre class="co"></pre>';$('#cpmsg pre').textContent=t};
  try{navigator.clipboard.writeText(t).then(()=>{$('#cpmsg').textContent='Copied as a tab-separated table (UTM 32N).'},show)}catch(e){show()}};
 if($('#rs'))$('#rs').onclick=()=>{try{localStorage.removeItem(KEY)}catch(e){}SITES.forEach(q=>{q.x=DEF[q.id][0];q.z=DEF[q.id][1];terrainAt(q)});moved()}}
function select(id){P.cur=id;$$('.mx button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===id));if(G)G.mark();renderCard()}
function moved(){try{localStorage.setItem(KEY,JSON.stringify(Object.fromEntries(SITES.map(s=>[s.id,[s.x,s.z]]))))}catch(e){}DOSE={};if(G)G.rebuild();renderCard();setK(P.k)}
addEventListener('keydown',e=>{if(e.key==='Escape'){placing=null;$('#fig').classList.remove('placing')}});
function renderSun(d,day){
 const D=dose(day),nMax=Math.max(D['N-C'],D['N-D']),sAvg=(D['S-C']+D['S-D'])/2;
 $('#sunhead').textContent=nMax<0.15?`On ${dlab(day)} the north plots get ${nMax<0.01?'no':'almost no'} direct sun; the south plots get ${sAvg.toFixed(1)}× flat ground`:`On ${dlab(day)} the south plots get ${(sAvg/Math.max(nMax,1e-6)).toFixed(1)}× the direct sun of the north plots`;
 const row=(id,cls,now,day)=>`<b>${id}</b><div class="bar ${cls}"><i style="width:${(now*100).toFixed(0)}%"></i></div><span class="num">${(now*100).toFixed(0)}%</span><span class="num">${day}</span>`;
 $('#sunrows').innerHTML=`<span class="hd">Plot</span><span class="hd">Direct sun now</span><span class="hd num">Now</span><span class="hd num">Day</span>`+
  SITES.map(s=>row(s.id,s.asp,beam(s,d),fmt1(D[s.id])+'×')).join('')+row('Flat','F',Math.max(0,d[1]),'1.0×')}

/* ---------- time slider ---------- */
const tk=$('#tk');let playing=false,lastDay=-1;
function setK(k){P.k=clamp(Math.round(k),0,NSTEP-1);tk.value=P.k;const day=kDay(P.k),m=kMin(P.k)+5,so=solar(330+day,m),d=dirOf(so);
 $('#tread').textContent=`${WD[(4+day)%7]} ${dlab(day)}, ${hm(kMin(P.k))} CET · sun ${so.alt>0?(so.alt/D2R).toFixed(0)+'° high, '+card8(so.az/D2R):'below the horizon'} · sunrise ${hm(DAYS[day].rise)}, sunset ${hm(DAYS[day].set)}`;
 if(G)G.sun(d,so.alt);renderSun(d,day);if(day!==lastDay){lastDay=day;renderCard()}}
tk.oninput=()=>setK(+tk.value);
$('#play').onclick=()=>{playing=!playing;$('#play').setAttribute('aria-pressed',playing);$('#play').textContent=playing?'Pause':'Play';if(playing)tick()};
function tick(){if(!playing)return;setK((P.k+1)%NSTEP);requestAnimationFrame(tick)}
$$('#maps button').forEach(b=>b.onclick=()=>{P.map=b.dataset.m;$('#fig').dataset.map=P.map;$$('#maps button').forEach(q=>q.setAttribute('aria-pressed',q.dataset.m===P.map));if(G)G.paint()});
$$('.mx button').forEach(b=>b.onclick=()=>select(b.dataset.s));

/* ---------- 3D ---------- */
let G=null;
function build(){
 const fig=$('#fig');
 if(!window.THREE){fig.insertAdjacentHTML('afterbegin','<div class="msg">The 3D model could not load (three.js missing or blocked). The rest of the page still works.</div>');return}
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){fig.insertAdjacentHTML('afterbegin','<div class="msg">WebGL is off in this browser, so the 3D model cannot be shown. The rest of the page still works.</div>');return}
 renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;fig.prepend(renderer.domElement);
 const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,1,2,6000);
 const T=new THREE.Vector3(SITES.reduce((a,s)=>a+DEF[s.id][0],0)/4,Y(259),SITES.reduce((a,s)=>a+DEF[s.id][1],0)/4),MID=new THREE.Vector3(0,Y(225),0);
 const VIEWS={se:[T,[90,210,190]],s:[T,[0,210,470]],n:[T,[0,210,-470]],all:[MID,[520,640,760]],top:[MID,[0,1250,1]]};
 let ctl=null;if(THREE.OrbitControls){ctl=new THREE.OrbitControls(cam,renderer.domElement);ctl.enableDamping=true;ctl.maxPolarAngle=1.48;ctl.minDistance=50;ctl.maxDistance=1800}
 const go=k=>{const[t,o]=VIEWS[k];cam.position.set(t.x+o[0],t.y+o[1],t.z+o[2]);if(ctl){ctl.target.copy(t);ctl.update()}else cam.lookAt(t)};go('se');
 const hemi=new THREE.HemisphereLight(0xe4eef7,0x5a5440,.62);scene.add(hemi);
 const sun=new THREE.DirectionalLight(0xfff0d8,1);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);
 Object.assign(sun.shadow.camera,{left:-560,right:560,top:560,bottom:-560,near:1,far:2400});sun.shadow.bias=-.0005;sun.shadow.normalBias=.6;sun.target.position.copy(MID);scene.add(sun,sun.target);
 const pos=new Float32Array(NR*NC*3),col=new Float32Array(NR*NC*3),idx=[];
 for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){const i=r*NC+c;pos[3*i]=c*CELL-OX;pos[3*i+1]=isNaN(Z[i])?0:Y(Z[i]);pos[3*i+2]=r*CELL-OZ}
 for(let r=0;r<NR-1;r++)for(let c=0;c<NC-1;c++){const a=r*NC+c,b=a+1,d=a+NC,e=d+1;if(!isNaN(Z[a])&&!isNaN(Z[b])&&!isNaN(Z[d])&&!isNaN(Z[e]))idx.push(a,d,b,b,d,e)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setIndex(idx);geo.computeVertexNormals();
 const terrain=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true}));terrain.receiveShadow=true;scene.add(terrain);
 const SL=new Float32Array(NR*NC),AS=new Float32Array(NR*NC),NX=new Float32Array(NR*NC),NZ=new Float32Array(NR*NC),zz=(r,c)=>Z[clamp(r,0,NR-1)*NC+clamp(c,0,NC-1)];
 for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){const i=r*NC+c,dx=(zz(r,c+1)-zz(r,c-1))/(2*CELL),dz=(zz(r+1,c)-zz(r-1,c))/(2*CELL);if(isNaN(dx)||isNaN(dz))continue;SL[i]=Math.atan(Math.hypot(dx,dz))/D2R;AS[i]=(Math.atan2(-dx,dz)/D2R+360)%360;NX[i]=-dx;NZ[i]=-dz}
 // December sun map: direct beam on the local surface, 3 Dec, self-shading only, relative to flat ground
 const SUN=new Float32Array(NR*NC);{let flat=0;const ds=[];for(let m=DAYS[7].rise;m<=DAYS[7].set;m+=15){const d=dirOf(solar(337,m));ds.push(d);flat+=Math.max(0,d[1])}
  for(let i=0;i<NR*NC;i++){if(isNaN(Z[i]))continue;const l=Math.hypot(NX[i],1,NZ[i]);let s=0;for(const d of ds)s+=Math.max(0,(NX[i]*d[0]+d[1]+NZ[i]*d[2])/l);SUN[i]=s/flat}}
 const C=x=>new THREE.Color(x),cLow=C(0xa9b98f),cHigh=C(0xe8e6cf),cN=C(0x6f98c8),cS=C(0xeba560),cCon=C(0x31593d),cDec=C(0xa58258),s0=C(0x2c4f7c),s1=C(0xe8e6cf),s2=C(0xf08a24),tc=new THREE.Color();
 function paint(){for(let i=0;i<NR*NC;i++){if(isNaN(Z[i]))continue;
  if(P.map==='sun'){const v=SUN[i];v<1?tc.copy(s0).lerp(s1,v):tc.copy(s1).lerp(s2,Math.min(1,(v-1)/1.5))}
  else{tc.copy(cLow).lerp(cHigh,clamp((Z[i]-185)/90,0,1));const a=AS[i],w=Math.min(1,SL[i]/14),ka=P.map==='aspect'?0.8:0.22;if(a>=315||a<45)tc.lerp(cN,w*ka);else if(a>=135&&a<225)tc.lerp(cS,w*ka)}
  const x=pos[3*i],z=pos[3*i+2];let fw=0,st=null;for(const s of SITES){const q=clamp((32-Math.hypot(x-s.x,z-s.z))/12,0,1);if(q>fw){fw=q;st=s}}
  if(fw)tc.lerp(st.fr==='C'?cCon:cDec,fw*.6);col[3*i]=tc.r;col[3*i+1]=tc.g;col[3*i+2]=tc.b}geo.attributes.color.needsUpdate=true}
 function contour(L){const seg=[];for(let r=0;r<NR-1;r++)for(let c=0;c<NC-1;c++){const i=r*NC+c,v=[Z[i],Z[i+1],Z[i+NC+1],Z[i+NC]];if(v.some(isNaN))continue;const Pp=[[c,r],[c+1,r],[c+1,r+1],[c,r+1]],pts=[];
  for(let k=0;k<4;k++){const a=v[k]-L,b=v[(k+1)%4]-L;if((a<0)!==(b<0)){const t=a/(a-b),p=Pp[k],q=Pp[(k+1)%4];pts.push((p[0]+(q[0]-p[0])*t)*CELL-OX,(p[1]+(q[1]-p[1])*t)*CELL-OZ)}}
  if(pts.length>=4)seg.push(pts.slice(0,4));if(pts.length===8)seg.push(pts.slice(4))}return seg}
 const thin=[];for(let L=185;L<=275;L+=5)contour(L).forEach(s=>thin.push(s[0],Y(L)+.5,s[1],s[2],Y(L)+.5,s[3]));
 const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(thin,3));scene.add(new THREE.LineSegments(tg,new THREE.LineBasicMaterial({color:0x7a5a3a,transparent:true,opacity:.45})));
 let seed=11;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
 const trunkM=new THREE.MeshLambertMaterial({color:0x4a3626}),conM=new THREE.MeshLambertMaterial({color:0x24513a}),decM=new THREE.MeshLambertMaterial({color:0x8d7158,transparent:true,opacity:.5});
 const coneA=new THREE.ConeGeometry(3.6,9,7),coneB=new THREE.ConeGeometry(2.6,7,7),trC=new THREE.CylinderGeometry(.4,.6,5,5),trD=new THREE.CylinderGeometry(.35,.7,11,5),crown=new THREE.IcosahedronGeometry(5.2,0);
 const poleM=new THREE.MeshLambertMaterial({color:0xf2f2ee}),redM=new THREE.MeshBasicMaterial({color:0xd22b3c,side:THREE.DoubleSide});
 const plots=new THREE.Group(),study=new THREE.Group();scene.add(plots,study);
 function tree(g,x,z,type,sc){const e=H(x,z);if(isNaN(e))return;const t=new THREE.Group();t.position.set(x,Y(e),z);t.scale.setScalar(sc);t.rotation.y=rnd()*6.28;
  if(type==='C'){const a=new THREE.Mesh(trC,trunkM),b=new THREE.Mesh(coneA,conM),c=new THREE.Mesh(coneB,conM);a.position.y=2.5;b.position.y=8;c.position.y=12;[a,b,c].forEach(q=>q.castShadow=true);t.add(a,b,c)}
  else{const a=new THREE.Mesh(trD,trunkM),c=new THREE.Mesh(crown,decM);a.position.y=5.5;a.castShadow=true;c.position.y=12;c.scale.set(1,1.15,1);t.add(a,c)}g.add(t)}
 function rebuild(){plots.clear();seed=11;
  SITES.forEach(s=>{const g=new THREE.Group();for(let i=0;i<14;i++){const a=rnd()*6.283,r=9+rnd()*16;tree(g,s.x+Math.cos(a)*r,s.z+Math.sin(a)*r,s.fr,.8+rnd()*.45)}
   const pole=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,16,6),poleM);pole.position.set(s.x,Y(s.e)+8,s.z);pole.castShadow=true;g.add(pole);
   const pts=[];for(let i=0;i<48;i++){const a=i/48*6.283,x=s.x+Math.cos(a)*8,z=s.z+Math.sin(a)*8,e=H(x,z);pts.push(new THREE.Vector3(x,Y(isNaN(e)?s.e:e)+.6,z))}
   s.ring=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),96,.6,5,true),new THREE.MeshBasicMaterial({color:0xffffff}));g.add(s.ring);plots.add(g)});
  study.clear();const cl=CLV(),w=1.4,q=[];contour(cl).forEach(([x1,z1,x2,z2])=>{const dx=x2-x1,dz=z2-z1,l=Math.hypot(dx,dz)||1,nx=-dz/l*w,nz=dx/l*w,y=Y(cl)+.9;q.push(x1+nx,y,z1+nz,x1-nx,y,z1-nz,x2+nx,y,z2+nz,x2+nx,y,z2+nz,x1-nx,y,z1-nz,x2-nx,y,z2-nz)});
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(q,3));study.add(new THREE.Mesh(rg,redM));paint();mark()}
 const sunBall=new THREE.Mesh(new THREE.SphereGeometry(22,16,12),new THREE.MeshBasicMaterial({color:0xffc94a}));scene.add(sunBall);
 const pts=[];for(let m=DAYS[7].rise;m<=DAYS[7].set;m+=6){const d=dirOf(solar(337,m));pts.push(new THREE.Vector3(MID.x+d[0]*900,MID.y+d[1]*900,MID.z+d[2]*900))}
 const path=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineDashedMaterial({color:0xe0a030,dashSize:16,gapSize:12}));path.computeLineDistances();scene.add(path);
 function setSun(d,alt){sun.position.set(MID.x+d[0]*900,MID.y+d[1]*900,MID.z+d[2]*900);sunBall.position.copy(sun.position);const up=alt>0;sunBall.visible=up;
  sun.intensity=up?Math.min(1.1,.35+2.2*Math.sin(alt)):0;hemi.intensity=up?0.55:0.28}
 const labs=SITES.map(s=>{const b=document.createElement('button');b.className=`lab a${s.asp}`;b.dataset.s=s.id;b.innerHTML=`<b>${s.id}</b>`;b.onclick=()=>select(s.id);fig.appendChild(b);return b});
 function mark(){SITES.forEach(s=>s.ring&&s.ring.material.color.set(s.id===P.cur?0xd22b3c:0xffffff));labs.forEach(b=>b.classList.toggle('on',b.dataset.s===P.cur))}
 const v=new THREE.Vector3(),v2=new THREE.Vector3(),needle=$('#needle');
 function place(){const W=fig.clientWidth,Hh=fig.clientHeight;
  SITES.forEach((s,i)=>{v.set(s.x,Y(s.e)+17,s.z).project(cam);const b=labs[i];if(v.z>1){b.style.display='none';return}b.style.display='';b.style.transform=`translate(${(v.x+1)/2*W}px,${(1-v.y)/2*Hh}px) translate(-50%,calc(-100% - 6px))`});
  const t=ctl?ctl.target:T;v.copy(t).project(cam);v2.set(t.x,t.y,t.z-40).project(cam);needle.style.transform=`rotate(${Math.atan2(-(v2.y-v.y)*Hh,(v2.x-v.x)*W)*180/Math.PI+90}deg)`}
 const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let down=null;
 renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
 renderer.domElement.addEventListener('pointerup',e=>{if(!placing||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const b=renderer.domElement.getBoundingClientRect();ndc.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(ndc,cam);
  const hit=ray.intersectObject(terrain)[0];if(!hit)return;const s=SITES.find(q=>q.id===placing),ox=s.x,oz=s.z;s.x=Math.round(hit.point.x);s.z=Math.round(hit.point.z);terrainAt(s);if(isNaN(s.e)){s.x=ox;s.z=oz;terrainAt(s);return}placing=null;fig.classList.remove('placing');moved()});
 new ResizeObserver(()=>{const W=fig.clientWidth,Hh=fig.clientHeight;renderer.setSize(W,Hh);cam.aspect=W/Hh;cam.updateProjectionMatrix()}).observe(fig);
 $$('.views button[data-v]').forEach(b=>b.onclick=()=>go(b.dataset.v));
 (function loop(){requestAnimationFrame(loop);if(ctl)ctl.update();place();renderer.render(scene,cam)})();
 /* live location: a blue dot on the terrain, a draped circle for the GPS accuracy and a "You" label */
 const meM=new THREE.MeshBasicMaterial({color:0x1f7ae0}),me=new THREE.Group();me.visible=false;scene.add(me);
 const meDot=new THREE.Mesh(new THREE.SphereGeometry(3,16,12),meM);me.add(meDot);
 const mePole=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,12,6),meM);me.add(mePole);
 let meRing=null,meFirst=true;const meLab=document.createElement('div');meLab.className='lab me';meLab.innerHTML='<b>You</b>';meLab.style.display='none';fig.appendChild(meLab);
 function setMe(x,z,e,acc){me.visible=true;meDot.position.set(x,Y(e)+3,z);mePole.position.set(x,Y(e)+6,z);
  if(meRing){me.remove(meRing);meRing.geometry.dispose()}const r=clamp(acc,3,150),pts=[];
  for(let i=0;i<64;i++){const a=i/64*6.283,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,g=H(px,pz);pts.push(new THREE.Vector3(px,Y(isNaN(g)?e:g)+.8,pz))}
  meRing=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),128,.5,4,true),meM);me.add(meRing);
  if(meFirst){meFirst=false;if(ctl){const o=cam.position.clone().sub(ctl.target);ctl.target.set(x,Y(e),z);cam.position.copy(ctl.target).add(o);ctl.update()}}}
 function hideMe(){me.visible=false;meLab.style.display='none';meFirst=true}
 const place0=place;place=function(){place0();if(!me.visible){meLab.style.display='none';return}v.copy(meDot.position).setY(meDot.position.y+12).project(cam);
  if(v.z>1){meLab.style.display='none';return}meLab.style.display='';meLab.style.transform=`translate(${(v.x+1)/2*fig.clientWidth}px,${(1-v.y)/2*fig.clientHeight}px) translate(-50%,calc(-100% - 6px))`};
 G={paint,rebuild,mark,sun:setSun,me:setMe,hideMe};rebuild()}

/* ---------- live location ---------- */
/* WGS84 latitude/longitude to UTM zone 32N (ETRS89 and WGS84 differ by well under 1 m here) */
function toUTM32(lat,lon){const a=6378137,f=1/298.257223563,k0=.9996,e2=f*(2-f),ep2=e2/(1-e2),p=lat*D2R,A=Math.cos(p)*(lon-9)*D2R,
 N=a/Math.sqrt(1-e2*Math.sin(p)**2),T=Math.tan(p)**2,C=ep2*Math.cos(p)**2,
 M=a*((1-e2/4-3*e2*e2/64-5*e2**3/256)*p-(3*e2/8+3*e2*e2/32+45*e2**3/1024)*Math.sin(2*p)+(15*e2*e2/256+45*e2**3/1024)*Math.sin(4*p)-35*e2**3/3072*Math.sin(6*p));
 return[500000+k0*N*(A+(1-T+C)*A**3/6+(5-18*T+T*T+72*C-58*ep2)*A**5/120),
  k0*(M+N*Math.tan(p)*(A*A/2+(5-T+9*C+4*C*C)*A**4/24+(61-58*T+T*T+600*C-330*ep2)*A**6/720))]}
let watch=null;const locBtn=$('#loc'),locMsg=$('#locmsg');
const locSay=t=>{locMsg.textContent=t;locMsg.hidden=!t};
function locStop(){if(watch!==null)navigator.geolocation.clearWatch(watch);watch=null;locBtn.setAttribute('aria-pressed','false');locBtn.textContent='My location';if(G)G.hideMe();locSay('')}
function locFix(pos){const{latitude:la,longitude:lo,accuracy:acc}=pos.coords,[E,N]=toUTM32(la,lo),x=E-E0-OX,z=N0-OZ-N,e=H(x,z);
 if(isNaN(e)){if(G)G.hideMe();const cx=SITES.reduce((a,s)=>a+s.x,0)/4,cz=SITES.reduce((a,s)=>a+s.z,0)/4,d=Math.hypot(x-cx,z-cz);
  locSay(`You are outside the model area, ${d<2000?Math.round(d)+' m':(d/1000).toFixed(1)+' km'} from the plots. The dot appears when you are in the Forest Botanical Garden.`);return}
 if(G)G.me(x,z,e,acc);let near=null,nd=1e9;SITES.forEach(s=>{const d=Math.hypot(x-s.x,z-s.z);if(d<nd){nd=d;near=s}});
 const dx=near.x-x,dz=near.z-z,dir=card8((Math.atan2(dx,-dz)/D2R+360)%360);
 locSay(`${nd<3?`You are at ${near.id}`:`Nearest plot: ${near.id}, ${Math.round(nd)} m to the ${dir}`} · ground ${e.toFixed(0)} m (DGM) · GPS accuracy ±${Math.round(acc)} m`)}
function locErr(err){if(err.code!==1&&watch!==null){locSay('Still looking for a GPS fix. Under dense canopy this can take a minute.');return}const t=err.code===1?'Location is blocked for this site. Allow it in the browser or phone settings, then press My location again.':err.code===3?'No GPS fix yet. Step out from under dense canopy or wait a moment, then press My location again.':'Your location is not available right now.';locStop();locSay(t)}
locBtn.onclick=()=>{if(watch!==null){locStop();return}
 if(!('geolocation' in navigator)||!window.isSecureContext){locSay('This browser cannot share a location here. Open the page over https (the GitHub Pages address).');return}
 locBtn.setAttribute('aria-pressed','true');locBtn.textContent='Stop location';locSay('Finding your location…');
 watch=navigator.geolocation.watchPosition(locFix,locErr,{enableHighAccuracy:true,maximumAge:5000,timeout:30000})};

/* ---------- boot ---------- */
$$('#maps button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===P.map));
try{build()}catch(e){console.error(e);$('#fig').insertAdjacentHTML('afterbegin','<div class="msg">The 3D model hit an error; the rest of the page still works.</div>')}
select(P.cur);setK(P.k);
})();
