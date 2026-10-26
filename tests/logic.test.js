import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8').split('// Interfaz')[0];
const {cents,total,warrantyEnd,validate,whatsappUrl}=vm.runInNewContext(source+';({cents,total,warrantyEnd,validate,whatsappUrl})');
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
