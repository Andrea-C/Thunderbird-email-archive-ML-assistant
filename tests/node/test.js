// Node tests for background/background.js with a stubbed Thunderbird API.
// Run from the repo root:  node tests/node/test.js background/background.js
// The "Training error: No messages newer than 18 months" line is expected output.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(process.argv[2],'utf8');
const store={};
const msgs={1:{id:1,author:'Amazon <no-reply@amazon.it>',subject:'Ordine 12345 spedito'},2:{id:2,author:'Mario <mario@acme.it>',subject:'Re: preventivo'}};
const full={1:{parts:[{contentType:'text/plain',body:'Il tuo pacco è in consegna\n\n-- \nAmazon firma'}]},2:{parts:[{contentType:'multipart/alternative',parts:[{contentType:'text/plain',body:'Ok per il preventivo fornitura\n\nOn Mon, Mario wrote:\n> vecchio testo citato'}]}]}};
let getFullCalls=0;
const browser={menus:{create(){},onClicked:{addListener(){}}},runtime:{getManifest:()=>({version:'3.0.0'}),sendMessage:async()=>{}},
 storage:{local:{get:async k=>typeof k==='string'?(k in store?{[k]:store[k]}:{}):{...store},set:async o=>Object.assign(store,o),remove:async k=>[].concat(k).forEach(x=>delete store[x])}},
 folders:{query:async()=>[{id:'f1',path:'/Ordini'},{id:'f2',path:'/Lavoro'}],getFolderInfo:async id=>({totalMessageCount:1})},
 messages:{list:async id=>({messages:[id==='f1'?msgs[1]:msgs[2]]}),getFull:async id=>{getFullCalls++;return full[id]}}};
const ctx={browser,window:{},console:{log(){},warn:console.warn,error:console.error},Set,Map,Math,JSON,Date,Promise,Array,String,Object,setTimeout,DOMParser:function(){this.parseFromString=()=>({querySelectorAll:()=>[],body:{querySelectorAll:()=>[],textContent:'x'}})}};
vm.createContext(ctx); vm.runInContext(src+'\n;this.T={getTrainingCutoff,isOlderThanCutoff,computeAuc,fitIsotonic,calibrateConfidence,fitConfidenceCalibration,computeEvaluation,isHoldOutMessage,cleanBodyText,extractBodyText,mapWithConcurrency,BaseClassifier,buildMessageText};',ctx);
const T=ctx.T, E=ctx.window.emailArchive;
(async()=>{
 require('./extra.js')(T,assert);
 await require('./folders.js')(E,browser,store,assert);
 await require('./eval.js')(T,E,browser,store,assert);
 await require('./calib.js')(T,E,browser,store,assert);
 await require('./datefilter.js')(T,E,browser,store,assert);
 console.log('ALL TESTS PASSED');
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
