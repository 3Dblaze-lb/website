/* Christmas look: lights + light snow (look only) */
(function(){if(!document.body.classList.contains('xmas'))return;
var h=document.querySelector('header.top');if(h){var c=['#C8102E','#F2C14E','#01796F','#1A8CFF'],g='';for(var i=0;i<80;i++){var x=i*25+12;g+='<circle cx="'+x+'" cy="'+(i%2?10:8)+'" r="4" fill="'+c[i%4]+'"/>';}
var d=document.createElement('div');d.className='xlights';d.innerHTML='<svg viewBox="0 0 2000 18" preserveAspectRatio="xMinYMid slice"><path d="'+(function(){var p='M0 3';for(var k=0;k<80;k++)p+=' Q'+(k*25+12.5)+' 9 '+(k*25+25)+' 3';return p})()+'" stroke="#3A4352" stroke-width="1" fill="none"/>'+g+'</svg>';h.appendChild(d);}
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var cv=document.createElement('canvas');cv.id='xsnow';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);var x=cv.getContext('2d'),W,H,F=[];
function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight;var n=Math.round(Math.min(70,W/18));F=[];for(var i=0;i<n;i++)F.push({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2.4,s:.3+Math.random()*.8,w:Math.random()*6})}
rs();addEventListener('resize',rs);
(function t(){x.clearRect(0,0,W,H);x.fillStyle='rgba(180,200,215,.75)';for(var i=0;i<F.length;i++){var f=F[i];f.y+=f.s;f.w+=.01;f.x+=Math.sin(f.w)*.35;if(f.y>H+4){f.y=-4;f.x=Math.random()*W}x.beginPath();x.arc(f.x,f.y,f.r,0,6.283);x.fill()}requestAnimationFrame(t)})();})();
/* Santa on a rope: goes down as you scroll (look only) */
(function(){if(!document.body.classList.contains('xmas'))return;
var w=document.createElement('div');w.className='xsanta';w.setAttribute('aria-hidden','true');
w.innerHTML='<i></i><svg viewBox="0 0 100 150"><path d="M50 0v26" stroke="#A8834B" stroke-width="3"/>'+
'<path d="M30 96 Q12 64 44 24" stroke="#C8102E" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M72 96 Q90 64 56 24" stroke="#C8102E" stroke-width="10" fill="none" stroke-linecap="round"/>'+
'<circle cx="45" cy="22" r="6.5" fill="#0B1220"/><circle cx="56" cy="22" r="6.5" fill="#0B1220"/>'+
'<path d="M28 92 Q30 84 40 88 L62 88 Q72 84 74 92 L78 124 L24 124 Z" fill="#C8102E"/>'+
'<rect x="49" y="96" width="4" height="28" fill="#fff"/><rect x="24" y="112" width="54" height="7" fill="#0B1220"/><rect x="46" y="110" width="10" height="11" rx="1.5" fill="none" stroke="#F2C14E" stroke-width="2.5"/>'+
'<rect x="30" y="124" width="16" height="16" fill="#C8102E"/><rect x="56" y="124" width="16" height="16" fill="#C8102E"/>'+
'<path d="M26 140 h22 v8 h-24 Q24 140 26 140Z" fill="#0B1220"/><path d="M54 140 h22 Q78 140 78 148 h-24Z" fill="#0B1220"/>'+
'<circle cx="51" cy="64" r="15" fill="#F5C9A8"/><circle cx="45" cy="61" r="2" fill="#0B1220"/><circle cx="57" cy="61" r="2" fill="#0B1220"/><circle cx="51" cy="67" r="3" fill="#E8907A"/>'+
'<path d="M34 66 Q36 94 51 98 Q66 94 68 66 Q61 76 51 73 Q41 76 34 66Z" fill="#fff"/><path d="M42 72 Q51 68 60 72 Q51 76 42 72Z" fill="#fff" stroke="#E6E9EE" stroke-width="1"/>'+
'<path d="M33 48 Q48 22 70 36 L76 48 Q52 42 30 50 Z" fill="#C8102E"/><circle cx="75" cy="40" r="6" fill="#fff"/><rect x="28" y="46" width="46" height="9" rx="4.5" fill="#fff"/></svg>';
document.body.appendChild(w);var rope=w.firstChild,hd=document.querySelector('header.top');
function up(){var top=hd?hd.getBoundingClientRect().bottom:0,max=innerHeight-w.lastChild.getBoundingClientRect().height-top-16,d=document.documentElement,f=d.scrollHeight>innerHeight?scrollY/(d.scrollHeight-innerHeight):0;f=Math.max(0,Math.min(1,f));w.style.top=Math.max(0,top)+'px';rope.style.height=Math.max(14,14+f*Math.max(0,max-14))+'px'}
addEventListener('scroll',up,{passive:true});addEventListener('resize',up);up();setTimeout(up,600);})();
