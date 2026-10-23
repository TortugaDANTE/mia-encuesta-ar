import { getStore } from "@netlify/blobs";
const H={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type","Cache-Control":"no-store"};
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{...H,"Content-Type":"application/json; charset=utf-8"}});
const D=["Agua y recursos naturales","Confianza y participación","Coordinación institucional","Infraestructura y territorio","Otros"];
const cut=(v,n=300)=>String(v??"").slice(0,n).trim();
async function todos(st){const {blobs}=await st.list();const out=[];for(const b of blobs){const r=await st.get(b.key,{type:"json"});if(r)out.push(r);}return out.sort((a,b)=>a.fecha<b.fecha?-1:1);}
function mapa(rs){return rs.filter(r=>!r.prueba).map(r=>({id:r.id,estado:r.estado,desafio:r.desafio,x:r.x,y:r.y}));}
export default async (req)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:H});
 const u=new URL(req.url),p=u.pathname.replace(/^\/api\/?/,"").replace(/\/$/,"");
 const st=getStore({name:"registros",consistency:"strong"});
 try{
 if(p==="registro"&&req.method==="POST"){const b=await req.json();
  if(!D.includes(b.desafio))return J({error:"desafío inválido"},400);
  const id=cut(b.id,40)||(Date.now().toString(36)+Math.random().toString(36).slice(2,7));
  const old=await st.get(id,{type:"json"});
  const r={id,fecha:old?.fecha||cut(b.fecha,40)||new Date().toISOString(),recibido:new Date().toISOString(),estado:cut(b.estado,40),desafio:b.desafio,color:cut(b.color,10),x:+b.x||0,y:+b.y||0,
   nombre:cut(b.nombre,100),tipo_problema:cut(b.tipo_problema,200),situaciones:cut(b.situaciones,1500),contacto:cut(b.contacto,150),pidio_cita:!!(b.pidio_cita||old?.pidio_cita),prueba:!!b.prueba};
  await st.setJSON(id,r);return J({ok:true,id});}
 if(p==="mapa")return J({puntos:mapa(await todos(st))});
 if(p==="datos"){const k=process.env.ADMIN_KEY;if(!k||u.searchParams.get("key")!==k)return J({error:"clave incorrecta"},401);
  if(req.method==="DELETE"){await st.delete(cut(u.searchParams.get("id"),40));return J({ok:true});}
  return J({registros:await todos(st)});}
 return J({error:"ruta no encontrada"},404);
 }catch(e){return J({error:String(e&&e.message||e)},500);}
};
export const config={path:"/api/*"};
