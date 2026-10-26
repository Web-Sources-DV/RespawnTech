import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8').split('// Interfaz')[0];
const {cents,total,warrantyEnd,validate,whatsappUrl,reference,nextReference}=vm.runInNewContext(source+';({cents,total,warrantyEnd,validate,whatsappUrl,reference,nextReference})');
test('importes, abono, servicios y garantía desde listo',()=>{
 const job={id:'RT-test',client:'Ana',device:'Laptop',type:'Laptop',status:'Recibido',phone:'',serial:'',notes:'',warranty:'',created:'2026-10-26',readyDate:'',warrantyDays:30,deposit:1000,services:[{name:'Revisión',price:cents('12.35')},{name:'Mantenimiento',price:cents('20.10')}]};
 assert.equal(total(validate(job)),3245);assert.equal(cents('1.005'),101);assert.equal(warrantyEnd('2026-12-20',30),'2027-01-19');assert.equal(warrantyEnd('',30),'');assert.throws(()=>cents(-1));assert.throws(()=>cents('invalid'));assert.throws(()=>validate({...job,deposit:4000}));assert.throws(()=>validate({...job,status:'Listo'}));assert.throws(()=>validate({...job,readyDate:'2026-02-30'}));assert.throws(()=>validate({...job,services:[]}));
});

test('WhatsApp usa wa.me, indicativo de Panamá y resumen codificado',()=>{
 const job={client:'Ana & José',phone:'6316-4022',device:'PS5',id:'RT-test',deposit:500,status:'Recibido',services:[{name:'Revisión',price:1500}]};
 const url=new URL(whatsappUrl(job));
 assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/50763164022');
 assert.match(url.searchParams.get('text'),/Ana & José/);assert.match(url.searchParams.get('text'),/Revisión:/);assert.match(url.searchParams.get('text'),/Saldo:.*10.00/);assert.throws(()=>whatsappUrl({...job,phone:''}));
});

test('referencias cortas, historial antiguo y recuperación del consecutivo',()=>{
 const old={id:'RT-0001-832a9ed9-7a32-4467-ae84-14edd87bed97'};
 assert.equal(reference(old),'RT-0001');
 assert.equal(nextReference([]),'RT-0001');
 assert.equal(nextReference([old]),'RT-0002');
 assert.equal(nextReference([{id:'interno',reference:'RT-0042'}]),'RT-0043');
 assert.equal(nextReference([old],10),'RT-0011');
 assert.equal(nextReference([old],'incorrecto'),'RT-0002');
 assert.equal(nextReference([{id:'RT-9999-anterior'}]),'RT-10000');
 const url=new URL(whatsappUrl({...old,phone:'63164022',client:'Ana',device:'PS5',services:[],deposit:0,status:'Cotización'}));
 assert.match(url.searchParams.get('text'),/Referencia: RT-0001\n/);
 assert.doesNotMatch(url.searchParams.get('text'),/832a9ed9/);
});
