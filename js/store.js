// Almacenamiento: nube (Netlify) + respaldo local con reintento.
(function(){const C=window.MIA_CFG,K='mia_registros',Q='mia_pendientes';
const rd=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}},wr=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
function guardarLocal(r){const a=rd(K).filter(x=>x.id!==r.id);a.push(r);wr(K,a);const q=rd(Q).filter(x=>x.id!==r.id);q.push(r);wr(Q,q);}
async function enviar(r){const res=await fetch(C.API+'/registro',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(r)});if(!res.ok)throw new Error('HTTP '+res.status);return res.json();}
async function sincronizar(){const q=rd(Q);if(!q.length)return 0;const quedan=[];for(const r of q){try{await enviar(r);}catch(e){quedan.push(r);}}wr(Q,quedan);return q.length-quedan.length;}
async function guardar(r){guardarLocal(r);try{await enviar(r);wr(Q,rd(Q).filter(x=>x.id!==r.id));return 'nube';}catch(e){return 'local';}}
async function puntos(){let p=[];try{const r=await fetch(C.API+'/mapa',{cache:'no-store'});if(r.ok)p=(await r.json()).puntos||[];}catch(e){}
 const ids=new Set(p.map(x=>x.id));rd(K).filter(x=>!x.prueba).forEach(x=>{if(!ids.has(x.id))p.push(x);});return p;}
window.MIAStore={guardar,sincronizar,puntos,locales:()=>rd(K),pendientes:()=>rd(Q),borrarLocal:()=>{wr(K,[]);wr(Q,[]);},
 nuevoId:()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7)};
setInterval(sincronizar,20000);addEventListener('online',sincronizar);setTimeout(sincronizar,1500);})();
