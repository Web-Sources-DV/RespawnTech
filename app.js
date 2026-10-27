// Reglas compartidas. Sin dependencias ni módulos en el navegador.
const services = ['Revisión', 'Mantenimiento', 'Instalación de software', 'Cambio de pasta térmica', 'Instalación de Windows', 'Reparación de HDMI', 'Limpieza de consola'];
const statuses = ['Cotización', 'Recibido', 'En proceso', 'Listo', 'Entregado'];
const money = n => new Intl.NumberFormat('es-PA', {style:'currency',currency:'USD',currencyDisplay:'narrowSymbol'}).format(n / 100);
function cents(value) { const n = Number(value); if (!Number.isFinite(n) || n < 0 || n > 1000000) throw Error('Importe inválido. Usa un valor entre 0 y 1,000,000.'); return Math.round((n + Number.EPSILON) * 100); }
function total(job) { return job.services.reduce((sum, s) => sum + s.price, 0); }
function warrantyEnd(date, days) { if (!date || !days) return ''; const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }
function validate(job) {
 if (!job || typeof job.id !== 'string' || !job.id || typeof job.client !== 'string' || !job.client.trim() || typeof job.device !== 'string' || !job.device.trim() || !statuses.includes(job.status) || !['Computadora','Laptop','Consola'].includes(job.type)) throw Error('Registro de trabajo inválido.');
 if (job.reference !== undefined && (typeof job.reference !== 'string' || !/^RT-\d{4,}$/.test(job.reference))) throw Error('Referencia inválida.');
 if (job.email !== undefined && (typeof job.email !== 'string' || job.email.length > 150 || (job.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(job.email)))) throw Error('Email inválido.');
 for (const key of ['phone','serial','notes','warranty','created','readyDate']) if (typeof job[key] !== 'string' || job[key].length > 4000) throw Error('Datos de trabajo inválidos.');
 if (!Array.isArray(job.services) || !job.services.length || job.services.length > services.length || job.services.some(s => !services.includes(s.name) || !Number.isSafeInteger(s.price) || s.price < 0 || s.price > 100000000)) throw Error('Selecciona al menos un servicio con precio válido.');
 if (!Number.isInteger(job.warrantyDays) || job.warrantyDays < 0 || job.warrantyDays > 3650 || !Number.isSafeInteger(job.deposit) || job.deposit < 0 || job.deposit > total(job)) throw Error('Revisa la garantía y el abono: no puede superar el total.');
 if (job.readyDate && (!/^\d{4}-\d{2}-\d{2}$/.test(job.readyDate) || !Number.isFinite(Date.parse(job.readyDate)) || new Date(job.readyDate).toISOString().slice(0,10) !== job.readyDate)) throw Error('Fecha inválida.');
 if (['Listo','Entregado'].includes(job.status) && !job.readyDate) throw Error('Indica la fecha en que el equipo quedó listo.');
 return job;
}

function reference(job) {
 if (job.reference !== undefined) return job.reference;
 const match = /^RT-(\d+)(?:-|$)/.exec(job.id);
 return match ? 'RT-'+match[1].padStart(4,'0') : job.id;
}
function nextReference(list, savedCounter = 0) {
 const saved = Number(savedCounter);
 const highest = list.reduce((max, job) => {
  const match = /^RT-(\d+)$/.exec(reference(job));
  return match ? Math.max(max, Number(match[1])) : max;
 }, Number.isSafeInteger(saved) && saved >= 0 ? saved : 0);
 if (!Number.isSafeInteger(highest + 1)) throw Error('El consecutivo supera el límite permitido.');
 return 'RT-'+String(highest + 1).padStart(4,'0');
}
function whatsappUrl(job) {
 const digits=job.phone.replace(/\D/g,'');
 const phone=digits.length===8?'507'+digits:digits;
 if(!/^\d{10,15}$/.test(phone)) throw Error('Agrega un teléfono válido con indicativo de país.');
 const message=`Hola ${job.client}, te comparto tu cotización de RespawnTech.\nEquipo: ${job.device}\n${job.services.map(s=>s.name+': '+money(s.price)).join('\n')}\nTotal: ${money(total(job))}\nAbono: ${money(job.deposit)}\nSaldo: ${money(total(job)-job.deposit)}\nEstado: ${job.status}\nReferencia: ${reference(job)}\nCotización válida por 15 días desde su emisión. Garantía de 15 días en el servicio realizado, desde que el equipo queda listo.`;
 return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
// Interfaz
const $ = s => document.querySelector(s), key = 'respawntech.jobs.v1';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let jobs = [], current, storageHealthy = true;
function notice(message) { $('#notice').textContent = message; }
try { const raw = localStorage.getItem(key); if(raw) { const data = JSON.parse(raw); if(!Array.isArray(data)) throw Error(); jobs = data.map(validate); } } catch { storageHealthy = false; notice('No se pudo leer el historial. No se sobrescribirán los datos: conserva un respaldo y revisa el almacenamiento.'); $('#new').disabled = true; $('#new-side').disabled = true; }
function persist(next) { if(!storageHealthy) { notice("Historial bloqueado para proteger datos que no se pudieron leer."); return false; } try { localStorage.setItem(key, JSON.stringify(next)); jobs = next; render(); return true; } catch { notice('No se pudo guardar. Revisa el espacio y los permisos del navegador; el formulario sigue abierto.'); return false; } }
function render() {
 $('#count').textContent = jobs.length; $('#pending').textContent = jobs.filter(j => ['Recibido','En proceso'].includes(j.status)).length; $('#ready').textContent = jobs.filter(j => j.status === 'Listo').length; $('#amount').textContent = money(jobs.reduce((s,j) => s + total(j),0));
 const search = $('#search').value.toLocaleLowerCase(); const selected = jobs.filter(j => (!$('#filter').value || j.status === $('#filter').value) && [j.client,j.device,reference(j),j.serial].join(' ').toLocaleLowerCase().includes(search));
 $('#list').innerHTML = selected.length ? selected.map(j => `<article class="job"><span class="device-icon" aria-hidden="true">${j.type === 'Consola' ? '◇' : '▣'}</span><div class="job-info"><strong>${escape(j.client)}</strong><small>${escape(j.device)} · ${escape(reference(j))}</small></div><span class="badge ${j.status === 'Listo' ? 'ready' : ''}">${escape(j.status)}</span><strong>${money(total(j))}</strong><div class="job-actions"><button data-view="${escape(j.id)}">Ver / PDF</button><button data-edit="${escape(j.id)}">Editar</button></div></article>`).join('') : `<div class="empty"><div class="empty-icon">⌘</div><h3>${jobs.length ? 'Sin resultados' : 'Tu próximo trabajo empieza aquí'}</h3><p>${jobs.length ? 'Prueba con otro nombre o estado.' : 'Registra tu primera revisión, mantenimiento o instalación de software.'}</p>${jobs.length ? '' : '<button class="primary" id="empty-new">＋ Crear primer trabajo</button>'}</div>`;
 $('#empty-new')?.addEventListener('click',()=>openEditor());
}
$('#services').innerHTML = services.map((s,i) => `<div class="service"><label><input type="checkbox" name="service${i}">${s}</label><input name="price${i}" type="number" min="0" max="1000000" step="0.01" value="0" disabled aria-label="Precio de ${s}"></div>`).join('');
const form = $('#form');
function openEditor(job) { if(!storageHealthy) return; form.reset(); form.elements.email.value = job?.email || ''; form.elements.id.value = job?.id || ''; $('#editor-title').textContent = job ? 'Editar trabajo' : 'Nuevo trabajo'; if(job) for(const name of ['client','phone','type','device','serial','status','notes','readyDate']) form.elements[name].value = job[name]; form.elements.deposit.value = job ? job.deposit / 100 : 0;
 services.forEach((s,i) => { const found = job?.services.find(item => item.name === s); form.elements['service'+i].checked = !!found; form.elements['price'+i].disabled = !found; form.elements['price'+i].value = found ? found.price / 100 : 0; }); updateTotal(); $('#editor').showModal(); }
function updateTotal() { let sum=0; services.forEach((s,i) => { const checked = form.elements['service'+i].checked; form.elements['price'+i].disabled = !checked; if(checked) { try {sum+=cents(form.elements['price'+i].value);} catch {} } }); $('#form-total').textContent=money(sum); }
form.addEventListener('input',updateTotal);
form.elements.status.addEventListener('change',()=>{if(['Listo','Entregado'].includes(form.elements.status.value) && !form.elements.readyDate.value) { const d=new Date(); form.elements.readyDate.value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }});
form.addEventListener('submit', async e => {
 e.preventDefault();
 const button = form.querySelector('[type=submit]');
 button.disabled = true;
 try {
  const save = () => {
   // Recupera los cambios de otras pestañas antes de asignar el consecutivo.
   const latest = JSON.parse(localStorage.getItem(key) || '[]');
   if (!Array.isArray(latest)) throw Error('Historial inválido.');
   jobs = latest.map(validate);
   const data = Object.fromEntries(new FormData(form));
   const old = jobs.find(j => j.id === data.id);
   if (data.id && !old) throw Error('No se encontró la cotización que estás editando.');
   const job = validate({...data, id: old?.id || crypto.randomUUID(),
    reference: old ? reference(old) : nextReference(jobs, localStorage.getItem('respawntech.counter.v1')),
    created: old?.created || new Date().toISOString(), deposit: cents(data.deposit), warrantyDays: 15,
    warranty: 'Garantía de 15 días solo en el servicio realizado, a partir de la fecha en que el equipo queda listo. RespawnTech no se hace responsable por pérdida de datos. El respaldo de la información es responsabilidad del cliente.',
    services: services.flatMap((name,i) => data['service'+i] ? [{name,price:cents(data['price'+i])}] : [])});
   if (persist(old ? jobs.map(j => j.id === old.id ? job : j) : [job,...jobs])) {
    $('#editor').close(); notice('Trabajo guardado: '+reference(job));
   }
  };
  if (navigator.locks) await navigator.locks.request('respawntech-save', save); else save();
 } catch(error) { notice(error.message); }
 finally { button.disabled = false; }
});
function view(job) { current=job; const end=warrantyEnd(job.readyDate,15); $('#document').innerHTML=`<div class="doc-top"><div><img class="document-logo" src="${escape(localStorage.getItem('respawntech.logo.v1') || './icon.svg')}" alt="Logo RespawnTech"><h2>RespawnTech</h2><p>Nosotros reparamos. Tú vuelves a disfrutar.</p></div><div><strong>Orden / Cotización</strong><p>${escape(reference(job))}<br>${escape(job.created.slice(0,10))}</p></div></div><h3>Cliente y equipo</h3><p><strong>${escape(job.client)}</strong> · ${escape(job.phone)}<br>${escape(job.type)} · ${escape(job.device)}<br>Serie: ${escape(job.serial || 'No indicada')}<br>Estado: ${escape(job.status)}</p><p>${escape(job.notes)}</p><table><thead><tr><th>Servicio</th><th>Importe</th></tr></thead><tbody>${job.services.map(s=>`<tr><td>${escape(s.name)}</td><td>${money(s.price)}</td></tr>`).join('')}</tbody></table><p class="doc-total">Total: <strong>${money(total(job))}</strong><br>Abono: ${money(job.deposit)}<br>Saldo: ${money(total(job)-job.deposit)}</p><h3>Garantía</h3><p>Garantía de 15 días solo en el servicio realizado, a partir de la fecha en que el equipo queda listo. RespawnTech no se hace responsable por pérdida de datos. El respaldo de la información es responsabilidad del cliente.</p><p>${job.readyDate ? 'Inicio: '+escape(job.readyDate)+'. Vence: '+end+'.' : 'Fecha de inicio pendiente: el equipo aún no está listo.'}</p><p class="doc-footer">RespawnTech · +507 6316-4022<br>Respawnvilla@gmail.com<br>Cotización válida por 15 días desde su emisión. Vence: ${warrantyEnd(job.created.slice(0,10),15)}.</p>`; $('#detail').showModal(); }
$('#list').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; const id=b.dataset.view || b.dataset.edit; const job=jobs.find(j=>j.id===id); if(job) b.dataset.view ? view(job) : openEditor(job); });
for(const id of ['#new','#new-side']) $(id).onclick=()=>openEditor();
for(const id of ['#cancel','#close']) $(id).onclick=()=>$('#editor').close();
$('#detail-close').onclick=()=>$('#detail').close(); $('#print').onclick=async()=>{
 const button=$('#print'); button.disabled=true;
 try { const pdf=await createQuotePdf(current); pdf.save(reference(current)+'.pdf'); notice('PDF generado. Puedes adjuntarlo en WhatsApp.'); }
 catch(error) { notice('No se pudo generar el PDF: '+error.message); }
 finally {button.disabled=false;}
}; $('#dashboard').onclick=()=>window.scrollTo({top:0,behavior:'smooth'}); $('#search').oninput=render; $('#filter').onchange=render;
$('#whatsapp').onclick=()=>{try {const url=whatsappUrl(current);window.open(url,'_blank','noopener,noreferrer');notice('Se abrió el enlace de WhatsApp. Revisa y envía el mensaje; adjunta el PDF aparte.');}catch(error){notice(error.message);}};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,jobs},null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=`RespawnTech-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#import').onchange=async e=>{try {if(!storageHealthy)throw Error('Importación bloqueada para conservar datos ilegibles.');const file=e.target.files[0];if(!file)return;if(file.size>5000000)throw Error('El respaldo supera 5 MB.');const data=JSON.parse(await file.text());if(data.version!==1 || !Array.isArray(data.jobs) || data.jobs.length>10000)throw Error('Respaldo incompatible.'); const imported=data.jobs.map(validate);if(new Set(imported.map(j=>j.id)).size!==imported.length)throw Error('Respaldo con referencias duplicadas.'); const merged=new Map(jobs.map(j=>[j.id,j]));let conflicts=0;for(const j of imported){if(merged.has(j.id)){conflicts++;continue;}merged.set(j.id,j);} if(persist([...merged.values()]))notice(`Respaldo importado. ${conflicts} referencias existentes conservadas sin sobrescribir.`); }catch(error){notice('No se importó: '+error.message);}finally{e.target.value='';}};
function connection(){ $('#connection').textContent=navigator.onLine?'Guardado local · Con conexión':'Sin conexión · Guardado local'; } window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();render();
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'}).catch(()=>notice('No se activó el modo sin internet. Usa HTTPS o un servidor local y recarga.'));


// El logo se convierte a PNG sin insertar contenido de un archivo en el DOM.
const logoKey='respawntech.logo.v1';
let logoLoading=false;
function showLogo() {
 const source=localStorage.getItem(logoKey) || './icon.svg';
 $('#brand-logo').src=source; $('#favicon').href=source; $('#logo-preview').src=source;
}
try { showLogo(); } catch { notice('No se pudo leer el logo guardado.'); }
$('#open-logo').onclick=()=>{ $('#logo-message').textContent=''; $('#logo-editor').showModal(); };
for(const id of ['#close-logo','#done-logo']) $(id).onclick=()=>$('#logo-editor').close();
async function loadLogo(file) {
 if(!file || logoLoading) return;
 logoLoading=true; $('#logo-file').disabled=true;
 $('#logo-message').textContent='Cargando imagen…';
 try {
  const supported=['image/png','image/jpeg','image/webp'].includes(file.type) || (!file.type && /\.(png|jpe?g|webp)$/i.test(file.name));
  if(!supported || file.size>5*1024*1024) throw Error('Usa una imagen PNG, JPG o WebP de hasta 5 MB.');
  // FileReader evita depender de URLs blob en navegadores integrados.
  const source=await new Promise((resolve,reject)=>{
   const reader=new FileReader();reader.onload=()=>resolve(reader.result);
   reader.onerror=()=>reject(Error('No se pudo leer el archivo. Prueba con otra copia de la imagen.'));
   reader.readAsDataURL(file);
  });
  const img=new Image(); img.src=source;
  try { await img.decode(); } catch { throw Error('No se pudo abrir esa imagen. Guárdala como PNG o JPG e inténtalo de nuevo.'); }
  const ratio=Math.min(1,800/Math.max(img.width,img.height)); const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(img.width*ratio));canvas.height=Math.max(1,Math.round(img.height*ratio));
  canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
  try { localStorage.setItem(logoKey,canvas.toDataURL('image/png')); }
  catch { throw Error('No se pudo guardar el logo. Revisa el espacio y los permisos de almacenamiento del navegador.'); }
  showLogo(); $('#logo-message').textContent='Logo guardado. Ya aparece en la app y se incluirá en tus PDF.';
 } catch(error) { $('#logo-message').textContent=error.message; }
 finally { logoLoading=false; $('#logo-file').disabled=false; $('#logo-file').value=''; }
}
$('#logo-file').onchange=e=>loadLogo(e.target.files[0]);
$('#logo-editor').addEventListener('paste',e=>{
 const file=Array.from(e.clipboardData?.items || []).find(item=>item.kind==='file')?.getAsFile();
 if(file){e.preventDefault();loadLogo(file);}
 else $('#logo-message').textContent='Copia la imagen, no su enlace: usa «Copiar imagen» y vuelve a pegarla aquí.';
});
$('#logo-drop').addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';});
$('#logo-drop').addEventListener('drop',e=>{e.preventDefault();loadLogo(e.dataTransfer.files[0]);});

// Solicita una navegación nueva; conserva historial y logo del mismo origen.
$('#update-app').onclick=()=>{
 const url=new URL('./',location.href);url.searchParams.set('actualizar',Date.now());location.assign(url.href);
};

let preparedEmail=null,emailBusy=false;
const gmailClientKey='respawntech.gmail.client.v1';
function emailStatus(text){$('#email-message').textContent=text;}
async function loadGoogle(){
 $('#create-gmail-draft').disabled=true;$('#retry-gmail').hidden=true;
 try{await GmailDraft.load();$('#create-gmail-draft').disabled=false;}
 catch(error){emailStatus(error.message);$('#retry-gmail').hidden=false;}
}
$('#email-quote').onclick=()=>{
 preparedEmail=null;$('#recipient-email').value=current.email || '';$('#open-gmail').hidden=true;$('#create-gmail-draft').hidden=true;
 try{$('#gmail-client-id').value=localStorage.getItem(gmailClientKey) || '';}catch{$('#gmail-client-id').value='';}
 $('#gmail-settings').open=!$('#gmail-client-id').value;emailStatus('');$('#email-editor').showModal();
};
$('#close-email').onclick=()=>{if(!emailBusy)$('#email-editor').close();};
$('#email-editor').addEventListener('cancel',e=>{if(emailBusy)e.preventDefault();});
function invalidateEmail(){preparedEmail=null;$('#create-gmail-draft').hidden=true;$('#open-gmail').hidden=true;}
$('#recipient-email').oninput=invalidateEmail;
$('#gmail-client-id').oninput=()=>{GmailDraft.forget();invalidateEmail();};
$('#email-form').onsubmit=async e=>{
 e.preventDefault();if(emailBusy)return;emailBusy=true;$('#prepare-email').disabled=true;$('#recipient-email').disabled=true;$('#gmail-client-id').disabled=true;invalidateEmail();emailStatus('Preparando PDF…');
 try{
  const id=GmailDraft.clientId($('#gmail-client-id').value.trim()),email=$('#recipient-email').value.trim();
  const job=validate({...current,email});const pdf=await createQuotePdf(job);
  const raw=GmailDraft.mime(email,'Cotización '+reference(job)+' · RespawnTech',reference(job)+'.pdf',new Uint8Array(pdf.output('arraybuffer')));
  const latest=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(latest))throw Error('Historial inválido.');
  if(!latest.some(j=>j.id===job.id))throw Error('La cotización ya no está en el historial.');
  localStorage.setItem(gmailClientKey,id);
  if(!persist(latest.map(validate).map(j=>j.id===job.id?{...j,email}:j)))throw Error('No se pudo guardar el correo del cliente.');
  current=job;preparedEmail={raw,clientId:id};$('#create-gmail-draft').hidden=false;emailStatus('PDF listo. Conecta Gmail para crear el borrador con adjunto.');loadGoogle();
 }catch(error){emailStatus(error.message);}
 finally{emailBusy=false;$('#prepare-email').disabled=false;$('#recipient-email').disabled=false;$('#gmail-client-id').disabled=false;}
};
$('#retry-gmail').onclick=loadGoogle;
$('#create-gmail-draft').onclick=()=>{
 if(!preparedEmail || emailBusy)return;emailBusy=true;
 $('#create-gmail-draft').disabled=true;$('#prepare-email').disabled=true;$('#recipient-email').disabled=true;$('#gmail-client-id').disabled=true;$('#disconnect-gmail').disabled=true;
 const finish=()=>{emailBusy=false;$('#create-gmail-draft').disabled=false;$('#prepare-email').disabled=false;$('#recipient-email').disabled=false;$('#gmail-client-id').disabled=false;$('#disconnect-gmail').disabled=false;};
 emailStatus('Autoriza tu cuenta Google para crear el borrador…');
 GmailDraft.authorize(preparedEmail.clientId,async()=>{
  emailStatus('Creando borrador con PDF adjunto…');
  try{const result=await GmailDraft.create(preparedEmail);$('#open-gmail').href=result.url;$('#open-gmail').hidden=false;$('#create-gmail-draft').hidden=true;emailStatus('Borrador creado en '+result.account+'. Abre Gmail, escribe el mensaje y envíalo cuando esté listo.');preparedEmail=null;}
  catch(error){emailStatus(error.message);}finally{finish();}
 },error=>{emailStatus(error.message);finish();});
};
$('#disconnect-gmail').onclick=()=>{GmailDraft.forget();invalidateEmail();emailStatus('Conexión local cerrada. Puedes autorizar otra cuenta cuando prepares un PDF.');};
