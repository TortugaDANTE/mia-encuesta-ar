const $=s=>document.querySelector(s),C=MIA_CFG,D=DESAFIOS,NS='http://www.w3.org/2000/svg';
let sel={desafio:null,estado:null,x:0,y:0},id=MIAStore.nuevoId(),ultimo=null;
function svgMapa(cont,{tocable=false}={}){cont.innerHTML='';const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox',`0 0 ${MX.W} ${MX.H}`);s.setAttribute('role','img');s.setAttribute('aria-label','Mapa de México por estados');
 const g=document.createElementNS(NS,'g'),dots=document.createElementNS(NS,'g');MX.S.forEach(e=>{const p=document.createElementNS(NS,'path');p.setAttribute('d',e.d);p.dataset.n=e.n;const t=document.createElementNS(NS,'title');t.textContent=e.n;p.appendChild(t);g.appendChild(p);});
 s.appendChild(g);s.appendChild(dots);cont.appendChild(s);
 if(tocable)s.addEventListener('click',ev=>{const p=ev.target.closest('path');if(!p)return;const pt=s.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;const q=pt.matrixTransform(s.getScreenCTM().inverse());elegirEstado(p.dataset.n,q.x,q.y);});
 return {s,dots};}
function dot(g,x,y,c,r=7,yo){const k=document.createElementNS(NS,'circle');k.setAttribute('cx',x);k.setAttribute('cy',y);k.setAttribute('r',r);k.setAttribute('fill',c);k.setAttribute('stroke',yo?'#FF914C':'#fff');k.setAttribute('stroke-width',yo?4:2);g.appendChild(k);}
const color=n=>(D.find(d=>d.n===n)||{c:'#888'}).c;
function pintar(m,pts){m.dots.innerHTML='';pts.forEach(p=>{let x=p.x,y=p.y;if(!x){const e=MX.S.find(s=>s.n===p.estado);if(!e)return;x=e.c[0]+(Math.random()-.5)*16;y=e.c[1]+(Math.random()-.5)*16;}dot(m.dots,x,y,color(p.desafio),7,p.id===id);});}
function ley(el){el.innerHTML=D.map(d=>`<span><i style="background:${d.c}"></i>${d.i} ${d.n}</span>`).join('');}
function ir(n){document.querySelectorAll('section').forEach(s=>s.classList.add('oculto'));$('#'+n).classList.remove('oculto');scrollTo(0,0);}
// Paso 1
$('#listaDes').innerHTML=D.map((d,i)=>`<button class="des" data-i="${i}"><span class="dot" style="background:${d.c}">${d.i}</span>${d.n}</button>`).join('');
$('#listaDes').onclick=e=>{const b=e.target.closest('.des');if(!b)return;document.querySelectorAll('.des').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');sel.desafio=D[+b.dataset.i].n;$('#b1').disabled=false;};
$('#b1').onclick=async()=>{ir('p2');$('#desElegido').textContent=sel.desafio;$('#desElegido').style.color=color(sel.desafio)==='#1F1F1F'?'#1F1F1F':color(sel.desafio);window.M2=svgMapa($('#mapa'),{tocable:true});pintar(M2,await MIAStore.puntos());};
// Paso 2
const sEst=$('#selEstado');sEst.innerHTML='<option value="">— o elige tu estado de la lista —</option>'+MX.S.map(s=>`<option>${s.n}</option>`).join('');
sEst.onchange=()=>{const e=MX.S.find(s=>s.n===sEst.value);if(e)elegirEstado(e.n,e.c[0],e.c[1]);};
async function elegirEstado(n,x,y){sel.estado=n;sel.x=Math.round(x);sel.y=Math.round(y);sEst.value=n;$('#estadoTxt').textContent='📍 '+n;
 M2.s.querySelectorAll('path').forEach(p=>p.classList.toggle('sel',p.dataset.n===n));pintar(M2,[...(await MIAStore.puntos()),{id,estado:n,desafio:sel.desafio,x:sel.x,y:sel.y}]);$('#b2').disabled=false;}
$('#b2').onclick=()=>ir('p3');
// Paso 3
$('#form').onsubmit=async e=>{e.preventDefault();const f=e.target;$('#b3').disabled=true;$('#b3').textContent='Guardando…';
 const r={id,fecha:new Date().toISOString(),estado:sel.estado,desafio:sel.desafio,color:color(sel.desafio),x:sel.x,y:sel.y,nombre:f.nombre.value,tipo_problema:f.tipo.value,situaciones:f.sit.value,contacto:f.contacto.value,pidio_cita:false,prueba:/^prueba/i.test(f.nombre.value)};
 ultimo=r;const donde=await MIAStore.guardar(r);
 $('#guardado').textContent=donde==='nube'?'✅ ¡Tu punto quedó registrado en el mapa!':'✅ Guardado en tu teléfono. Se enviará solo en cuanto haya conexión.';
 ir('p4');const m=svgMapa($('#mapaFinal'));let P=await MIAStore.puntos();if(!P.some(x=>x.id===r.id))P.push(r);pintar(m,P);resumen(P);actualizarWA();};
function resumen(pts){const t=pts.length||1;$('#barras').innerHTML=D.map(d=>{const n=pts.filter(p=>p.desafio===d.n).length,pc=Math.round(n*100/t);return `<div>${d.i} ${d.n}: <b>${pc}%</b> (${n})</div><div class="bar" style="width:${Math.max(pc,2)}%;background:${d.c}"></div>`}).join('')+`<p class="nota">${pts.length} puntos en el mapa</p>`;}
function msgWA(){const r=ultimo||{};return `Hola MIA, soy ${r.nombre||'[nombre]'}${r.estado?' de '+r.estado:''}. Me interesa agendar una cita. Nuestro principal desafío es: ${r.desafio||'[desafío]'}${r.tipo_problema?' ('+r.tipo_problema+')':''}.`;}
const waURL=()=>`https://wa.me/${C.WA}?text=`+encodeURIComponent(msgWA());
function actualizarWA(){$('#bWA').href=waURL();$('#waFijo').href=waURL();$('#bMail').href=`mailto:${C.MAIL}?subject=${encodeURIComponent('Cita con MIA')}&body=${encodeURIComponent(msgWA())}`;}
function citaClick(){if(ultimo){ultimo.pidio_cita=true;MIAStore.guardar(ultimo);}}
$('#bWA').addEventListener('click',citaClick);$('#waFijo').addEventListener('click',citaClick);
$('#bOtro').onclick=()=>location.reload();
ley($('#ley2'));ley($('#ley4'));actualizarWA();
