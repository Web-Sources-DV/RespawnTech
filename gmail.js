// Gmail usa OAuth en el navegador. Nunca se guardan contraseñas ni tokens.
const GmailDraft = (() => {
 const scope='https://www.googleapis.com/auth/gmail.compose';
 let token=null,expires=0,loading=null;
 function base64(bytes){let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text);}
 function utf8(text){return base64(new TextEncoder().encode(text));}
 function mime(to,subject,filename,pdf){
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)||/[\r\n]/.test(to))throw Error('Correo del cliente inválido.');
  if(!/^RT-\d+\.pdf$/.test(filename))throw Error('Nombre de PDF inválido.');
  const boundary='respawn-'+crypto.randomUUID();
  const wrap=s=>s.match(/.{1,76}/g)?.join('\r\n') || '';
  const raw=[`To: ${to}`,`Subject: =?UTF-8?B?${utf8(subject)}?=`,'MIME-Version: 1.0',`Content-Type: multipart/mixed; boundary="${boundary}"`,'',`--${boundary}`,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','','',`--${boundary}`,'Content-Type: application/pdf',`Content-Disposition: attachment; filename="${filename}"`,'Content-Transfer-Encoding: base64','',wrap(base64(pdf)),`--${boundary}--`,''].join('\r\n');
  return utf8(raw).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 }
 function clientId(value){if(!/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(value))throw Error('Indica el ID de cliente OAuth web de Google (termina en .apps.googleusercontent.com).');return value;}
 function load(){
  if(window.google?.accounts?.oauth2)return Promise.resolve();
  if(loading)return loading;
  loading=new Promise((resolve,reject)=>{
   const script=document.createElement('script');let timer;
   const fail=()=>{clearTimeout(timer);script.remove();loading=null;reject(Error('No se pudo conectar con Google. Revisa internet y abre la app en Chrome, Edge o Safari.'));};
   script.src='https://accounts.google.com/gsi/client';script.async=true;script.onload=()=>{clearTimeout(timer);window.google?.accounts?.oauth2?resolve():fail();};script.onerror=fail;timer=setTimeout(fail,20000);document.head.append(script);
  });return loading;
 }
 function authorize(id,success,failure){
  try{
   clientId(id);
   if(token && expires>Date.now()+60000){success();return;}
   if(!window.google?.accounts?.oauth2)throw Error('Google aún no está listo. Pulsa Reintentar conexión.');
   const client=google.accounts.oauth2.initTokenClient({client_id:id,scope:scope+' openid email',include_granted_scopes:false,
    callback:response=>{
     if(response.error || !response.access_token){failure(Error('No se autorizó Gmail. Puedes volver a conectar tu cuenta.'));return;}
     if(!google.accounts.oauth2.hasGrantedAllScopes(response,scope)){failure(Error('Debes autorizar la creación de borradores de Gmail.'));return;}
     token=response.access_token;expires=Date.now()+Number(response.expires_in || 0)*1000;success();
    },error_callback:()=>failure(Error('La ventana de Google se cerró o fue bloqueada. Permite ventanas emergentes y vuelve a conectar.'))});
   client.requestAccessToken({prompt:'select_account'});
  }catch(error){failure(error);}
 }
 async function create(prepared){
  if(!token || expires<=Date.now())throw Error('La autorización venció. Vuelve a conectar Gmail.');
  // Obtener la cuenta autorizada permite abrir sus borradores, aunque haya varias sesiones.
  const userResponse=await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:'Bearer '+token}});
  if(!userResponse.ok)throw Error('No se pudo identificar tu cuenta Google. Vuelve a conectar Gmail.');
  const user=await userResponse.json();if(!user.email)throw Error('Google no devolvió el correo de la cuenta autorizada.');
  let response;
  try{response=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({message:{raw:prepared.raw}})});}
  catch{throw Error('Se perdió la conexión. Revisa Borradores en Gmail antes de volver a intentarlo para evitar duplicados.');}
  if(!response.ok){if(response.status===401){token=null;expires=0;}throw Error(response.status===403?'Google rechazó el acceso. Revisa que Gmail API esté habilitada y tu cuenta sea un usuario de prueba autorizado.':'No se pudo crear el borrador en Gmail (HTTP '+response.status+').');}
  let draft;try{draft=await response.json();}catch{throw Error('No se pudo confirmar la respuesta. Revisa Borradores en Gmail antes de reintentar.');}
  if(!draft.id)throw Error('Google no confirmó el borrador. Revisa Borradores antes de reintentar.');
  return {url:'https://mail.google.com/mail/?authuser='+encodeURIComponent(user.email)+'#drafts',account:user.email};
 }
 function forget(){const active=token;token=null;expires=0;if(active && window.google?.accounts?.oauth2)google.accounts.oauth2.revoke(active,()=>{});}
 return {mime,clientId,load,authorize,create,forget};
})();
