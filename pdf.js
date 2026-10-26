// PDF Carta de una página, con texto seleccionable y sin depender del diálogo de impresión.
async function createQuotePdf(job) {
 if (!window.jspdf) throw Error('Falta la biblioteca PDF. Recarga la app con conexión.');
 const pdf=new window.jspdf.jsPDF({unit:'pt',format:'letter'});
 const ref=reference(job);
 pdf.setProperties({title:ref+' · RespawnTech',author:'RespawnTech'});
 const img=new Image();
 img.src=localStorage.getItem('respawntech.logo.v1') || './icon.svg';
 await img.decode();
 const canvas=document.createElement('canvas');canvas.width=400;canvas.height=400;
 const ctx=canvas.getContext('2d');
 const ratio=Math.min(400/img.width,400/img.height);
 ctx.drawImage(img,(400-img.width*ratio)/2,(400-img.height*ratio)/2,img.width*ratio,img.height*ratio);
 pdf.setFillColor(16,16,28);pdf.rect(32,30,548,90,'F');
 pdf.addImage(canvas.toDataURL('image/png'),'PNG',44,40,68,68);
 pdf.setTextColor(0,243,255);pdf.setFont('helvetica','bold');pdf.setFontSize(21);pdf.text('RespawnTech',126,65);
 pdf.setFontSize(9);pdf.setTextColor(255,255,255);pdf.text('Nosotros reparamos. Tú vuelves a disfrutar.',126,84);
 pdf.text('+507 6316-4022 · Respawnvilla@gmail.com',126,99);
 const blocks=[
  {text:'ORDEN / COTIZACIÓN · '+ref,bold:true},
  {text:'Emisión: '+job.created.slice(0,10)+' · Estado: '+job.status},
  {text:'CLIENTE Y EQUIPO',bold:true,gap:8},
  {text:job.client+' · '+(job.phone || 'Sin teléfono')+(job.email?' · '+job.email:'')},
  {text:job.type+' · '+job.device+' · Serie: '+(job.serial || 'No indicada')},
  {text:job.notes || 'Sin observaciones adicionales.'},
  {text:'SERVICIOS',right:'IMPORTE',bold:true,gap:8},
  ...job.services.map(s=>({text:s.name,right:money(s.price)})),
  {text:'TOTAL',right:money(total(job)),bold:true,gap:8},
  {text:'Abono',right:money(job.deposit)},
  {text:'Saldo pendiente',right:money(total(job)-job.deposit),bold:true},
  {text:'GARANTÍA',bold:true,gap:10},
  {text:'Garantía de 15 días solo en el servicio realizado, a partir de la fecha en que el equipo queda listo. RespawnTech no se hace responsable por pérdida de datos. El respaldo de la información es responsabilidad del cliente.'},
  {text:job.readyDate?'Inicio: '+job.readyDate+'. Vence: '+warrantyEnd(job.readyDate,15)+'.':'Fecha de inicio pendiente: el equipo aún no está listo.'}
 ];
 // Mide antes de dibujar; reduce proporcionalmente para no cortar textos ni crear otra página.
 pdf.setFontSize(10);
 const layout=blocks.map(block=>{
  pdf.setFont('helvetica',block.bold?'bold':'normal');
  return {...block,lines:pdf.splitTextToSize(block.text,block.right?420:520)};
 });
 const height=layout.reduce((sum,b)=>sum+(b.gap || 0)+b.lines.length*14+4,0);
 const scale=Math.min(1,540/height);
 let y=143;
 for(const block of layout){
  y+=(block.gap || 0)*scale;
  pdf.setFont('helvetica',block.bold?'bold':'normal');pdf.setFontSize(10*scale);
  pdf.setTextColor(...(block.bold?[105,35,165]:[30,32,45]));
  for(const line of block.lines){pdf.text(line,44,y);y+=14*scale;}
  if(block.right)pdf.text(block.right,568,y-block.lines.length*14*scale,{align:'right'});
  y+=4*scale;
 }
 pdf.setDrawColor(176,38,255);pdf.line(44,721,568,721);
 pdf.setFont('helvetica','normal');pdf.setFontSize(9);pdf.setTextColor(60,60,75);
 pdf.text('Cotización válida por 15 días desde su emisión.',44,740);
 pdf.text('Vence: '+warrantyEnd(job.created.slice(0,10),15),44,755);
 return pdf;
}
