import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
function setup(fetch){
 const saved={};const oauth2={hasGrantedAllScopes:()=>true,revoke:()=>{},initTokenClient:options=>({requestAccessToken:()=>{saved.options=options;options.callback({access_token:'test-token',expires_in:3600});}})};
 const api=vm.runInNewContext(readFileSync(new URL('../gmail.js',import.meta.url),'utf8')+';GmailDraft',{window:{google:{accounts:{oauth2}}},google:{accounts:{oauth2}},crypto:webcrypto,TextEncoder,btoa,fetch,setTimeout,clearTimeout});return {api,saved};
}
test('MIME conserva PDF, destinatario, asunto UTF-8 y cuerpo vacío; bloquea inyección',()=>{
 const {api}=setup();const bytes=new Uint8Array([37,80,68,70,45,49,0,255]);
 const raw=api.mime('ana@example.com','Cotización RT-0001 · RespawnTech','RT-0001.pdf',bytes);
 assert.match(raw,/^[A-Za-z0-9_-]+$/);const mime=Buffer.from(raw,'base64url').toString();
 assert.match(mime,/To: ana@example.com\r\n/);assert.match(mime,/filename="RT-0001.pdf"/);
 assert.match(mime,/Content-Type: text\/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n\r\n/);
 assert.ok(mime.includes(Buffer.from(bytes).toString('base64')));
 const subject=/Subject: =\?UTF-8\?B\?(.+)\?=/.exec(mime)[1];assert.equal(Buffer.from(subject,'base64').toString(),'Cotización RT-0001 · RespawnTech');
 assert.throws(()=>api.mime('a@b.com\r\nBcc:evil@example.com','x','RT-0001.pdf',bytes));assert.throws(()=>api.mime('a@b.com','x','bad\r\n.pdf',bytes));assert.throws(()=>api.clientId('secret'));
});
test('Gmail crea un borrador, no envía mensajes y no reintenta peticiones ambiguas',async()=>{
 const calls=[];let fail=false;
 const {api}=setup(async(url,options)=>{calls.push({url,options});if(url.includes('userinfo'))return {ok:true,json:async()=>({email:'owner@example.com'})};if(fail)throw Error('offline');return {ok:true,json:async()=>({id:'draft-1'})};});
 await new Promise((resolve,reject)=>api.authorize('123-test.apps.googleusercontent.com',resolve,reject));
 const result=await api.create({raw:'encoded-pdf'});assert.match(result.url,/authuser=owner%40example.com#drafts$/);
 assert.equal(calls[1].url,'https://gmail.googleapis.com/gmail/v1/users/me/drafts');assert.equal(calls[1].options.method,'POST');assert.deepEqual(JSON.parse(calls[1].options.body),{message:{raw:'encoded-pdf'}});
 assert.ok(calls.every(c=>!c.url.includes('/send')));fail=true;await assert.rejects(api.create({raw:'x'}),/antes de volver a intentarlo/);assert.equal(calls.length,4);
 api.forget();await assert.rejects(api.create({raw:'x'}),/autorización venció/);
});
