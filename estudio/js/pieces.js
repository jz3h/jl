/* Catálogo paramétrico de peças e desenho (HTML em mm). */
(function(G){'use strict';
const AT=G.AT=G.AT||{};
const PT=0.352778, SAFE=AT.SAFE, ID=AT.ID;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
let cv=null;
function em(text,weight,fk,ls){
  let w;
  try{cv=cv||document.createElement('canvas').getContext('2d');cv.font=weight+' 100px '+AT.FONTES[fk].css+',sans-serif';w=cv.measureText(text).width/100;}
  catch(e){w=String(text).length*AT.FONTES[fk].k;}
  return w+(ls||0)*String(text).length;
}
function wrap(text,maxMm,pt,weight,fk,ls){
  const out=[];
  String(text).split('\n').forEach(par=>{
    const words=par.split(/\s+/).filter(Boolean);let cur='';
    if(!words.length){out.push('');return;}
    words.forEach(w=>{const t=cur?cur+' '+w:w;if(!cur||em(t,weight,fk,ls)*pt*PT<=maxMm)cur=t;else{out.push(cur);cur=w;}});
    out.push(cur);
  });
  return out;
}
function fitText(text,o){
  const w=o.w*0.975,lh=o.lh||1.15,ls=o.ls||0;
  for(let pt=o.max;pt>=o.min-1e-6;pt-=0.25){
    const L=wrap(text,w,pt,o.weight,o.fk,ls);
    if(L.length*pt*lh*PT<=o.h+0.01&&L.every(l=>em(l,o.weight,o.fk,ls)*pt*PT<=w+0.01))return {pt,lines:L,h:L.length*pt*lh*PT,ok:true};
  }
  const L=wrap(text,w,o.min,o.weight,o.fk,ls);
  return {pt:o.min,lines:L,h:L.length*o.min*lh*PT,ok:false};
}
AT.fitText=fitText;
/* classe de tamanho: define os mínimos tipográficos no papel */
AT.classe=function(w,h){const a=w*h;return a>=28000?'A5':a>=14000?'A6':'S';};
AT.MIN={S:{id:6.5,corrido:8,rotulo:7},A6:{id:9,corrido:9,rotulo:7.5},A5:{id:9,corrido:12,rotulo:9}};

/* ---------- ferramentas de desenho ---------- */
function makeX(c,w,h,variant){
  const ink=AT.inkFor(c),fk=c.fonte,fam=AT.FONTES[fk].css;
  const ix=c.fundo?SAFE+2.2:SAFE;
  const cl=AT.classe(c.w,c.h),mn=AT.MIN[cl];
  const X={c,w,h,ix,cw:w-2*ix,ch:h-2*ix,ink,fk,fam,variant,warn:[],cl,mn,body:mn.corrido,idPt:mn.id,lab:mn.rotulo};
  X.t=function(str,o){
    o=Object.assign({weight:700,lh:1.12,min:8,max:20,color:ink.t,align:'left',mt:0,mb:0},o);
    const s=o.ls?String(str).toUpperCase():str;
    const r=fitText(s,{w:o.w,h:o.h,max:o.max,min:o.min,weight:o.weight,fk,lh:o.lh,ls:o.ls?0.08:0});
    if(!r.ok)X.warn.push('texto não cabe: '+String(str).slice(0,24));
    const html='<div style="font:'+o.weight+' '+r.pt+'pt/'+o.lh+' '+fam+';color:'+o.color+';text-align:'+o.align+';white-space:nowrap;margin:'+o.mt+'mm 0 '+o.mb+'mm;'+(o.ls?'letter-spacing:.08em;':'')+'">'+r.lines.map(esc).join(' <br>')+'</div>';
    return {html,h:r.h+o.mt+o.mb,pt:r.pt,lines:r.lines.length};
  };
  X.sym=function(hmm){
    const s=AT.SIMBOLOS[c.simbolo]||AT.SIMBOLOS.flower_of_life;
    const tw=Math.max(.3,Math.min(.65,.2+hmm*.016));      // espessura do traço em mm
    const sw=tw*100/hmm*(s.ar>1?1/s.ar*1:1)*(s.ar>1?s.ar:1);
    const inner=s.svg.replace(/@P1@/g,ink.b).replace(/@P2@/g,ink.a);
    const vbH=parseFloat(s.vb.split(' ')[3]);
    const swu=tw*vbH/hmm;
    return '<svg viewBox="'+s.vb+'" width="'+(hmm*s.ar)+'mm" height="'+hmm+'mm" style="display:block;flex:none;overflow:visible" aria-hidden="true"><g fill="none" stroke-width="'+swu.toFixed(2)+'" stroke-linecap="round" stroke-linejoin="round">'+inner+'</g></svg>';
  };
  X.symW=hmm=>hmm*(AT.SIMBOLOS[c.simbolo]||AT.SIMBOLOS.flower_of_life).ar;
  X.qrImg=function(mm){return '<img alt="QR para jz3h.github.io/jl" src="assets/qr.png" style="display:block;flex:none;width:'+mm+'mm;height:'+mm+'mm;image-rendering:pixelated;background:#fff">';};
  /* QR com legenda "Aponte a câmera" */
  X.qrCap=function(mm,o){
    o=o||{};const pt=o.pt||Math.max(6.5,Math.min(X.mn.rotulo+1,mm/3.2));
    const r=fitText(o.txt||'Aponte a câmera',{w:mm,h:20,max:pt,min:pt,weight:700,fk,lh:1.1});
    const html='<div style="display:flex;flex-direction:column;align-items:center;width:'+mm+'mm;flex:none">'+X.qrImg(mm)+
      '<div style="font:700 '+r.pt+'pt/1.1 '+fam+';color:'+ink.t+';text-align:center;white-space:nowrap;margin-top:.5mm">'+r.lines.map(esc).join(' <br>')+'</div></div>';
    return {html,h:mm+0.5+r.h,w:mm};
  };
  /* identificação: tamanho fixo (nunca encolhe). tel:false tira a linha do WhatsApp */
  X.id=function(wmm,o){
    o=o||{};
    const nome=c.idLongo?ID.longo:ID.curto;
    const s=nome+' · MÉDICO · '+ID.crm+' · '+ID.esp+' · '+ID.rqe;
    const pt=o.pt||X.idPt;
    const L=wrap(s,wmm*0.975,pt,800,fk);
    if(!L.every(l=>em(l,800,fk)*pt*PT<=wmm*0.975+0.01))X.warn.push('identificação não cabe');
    const lines=L.map((l,i)=>{l=esc(l);return i===0?l.replace(esc(nome),'<b style="font-weight:800">'+esc(nome)+'</b>'):l;});
    const tel=o.tel===false?'':'<b style="font-weight:800">WhatsApp '+ID.tel+'</b>';
    const n=L.length+(tel?1:0);
    const h=n*pt*1.2*PT;
    return {html:'<div style="font:600 '+pt+'pt/1.2 '+fam+';color:'+(o.color||ink.t)+';white-space:nowrap;text-align:'+(o.align||'left')+'">'+lines.join(' <br>')+(tel?' <br>'+tel:'')+'</div>',h,pt};
  };
  X.field=function(label,o){
    o=Object.assign({h:5,pt:X.lab,w:null},o);
    return '<div style="height:'+o.h+'mm;display:flex;align-items:flex-end;border-bottom:0.25mm solid '+ink.t+';font:600 '+o.pt+'pt/1 '+fam+';color:'+ink.t+';white-space:nowrap;padding-bottom:.4mm;'+(o.w?'width:'+o.w+'mm;':'')+'">'+esc(label)+'</div>';
  };
  X.col=(inner,st)=>'<div style="display:flex;flex-direction:column;'+(st||'')+'">'+inner+'</div>';
  X.nfcBox=()=>'<div style="width:20mm;height:10mm;border:0.25mm dashed '+ink.t+';display:flex;align-items:center;justify-content:center;font:700 6.5pt/1 '+fam+';color:'+ink.t+';flex:none;box-sizing:border-box">NFC 20×10</div>';
  X.hole=()=>'<div style="width:3mm;height:3mm;border:0.25mm solid '+ink.t+';border-radius:50%;box-sizing:border-box;flex:none"></div>';
  X.tels=(o)=>{
    o=o||{};const big=o.big||14,pt=o.pt||8;
    const row=(n,l)=>'<div style="display:flex;align-items:baseline;gap:2mm;white-space:nowrap"><span style="font:800 '+big+'pt/1 '+fam+';color:'+ink.b+';width:'+(big*PT*1.75+0.5)+'mm">'+n+'</span><span style="font:700 '+pt+'pt/1.1 '+fam+';color:'+ink.t+'">'+l+'</span></div>';
    return row('192','SAMU, emergência')+row('188','CVV, apoio emocional')+row('193','Bombeiros');
  };
  X.endereco=function(wmm,pt){
    const e=(c.endereco||'').trim();
    if(e)return X.t(e,{w:wmm,h:12,max:pt||X.body,min:X.mn.rotulo,weight:600});
    return {html:X.field('Endereço:',{h:pt?pt*0.6:6,pt:pt||X.lab}),h:pt?pt*0.6:6};
  };
  return X;
}

/* ---------- peças ---------- */
const P=[];
function def(o){P.push(Object.assign({papeis:['verge','kraft','matte'],papel:'verge',usa:{},montagem:[],qr:true},o));}
const TEL='(51) 99816-5913';

/* cartão base: símbolo + frase à esquerda, QR com legenda à direita, identificação na base */
function card(X,o){
  const c=X.c;o=Object.assign({sym:11,qr:22,fmax:16,fmin:8,gap:2.2},o);
  const useQr=c.qr&&o.qr>0;
  const idr=X.id(X.cw,{tel:o.tel});
  const q=useQr?X.qrCap(o.qr):null;
  const leftW=X.cw-(q?o.qr+o.gap:0);
  const bodyH=X.ch-idr.h-o.gap;
  const sy=o.sym>0?o.sym+o.gap:0;
  const fr=X.t(c.frase||'',{w:leftW,h:Math.max(bodyH-sy-(c.sub?8:0),6),max:o.fmax,min:o.fmin,weight:800,lh:1.08});
  const sub=c.sub?X.t(c.sub,{w:leftW,h:Math.max(bodyH-sy-fr.h-1,3),max:X.body+1,min:X.body,weight:500,lh:1.25,mt:1}).html:'';
  const left=X.col((o.sym>0?'<div style="margin-bottom:'+o.gap+'mm">'+X.sym(o.sym)+'</div>':'')+fr.html+sub,'width:'+leftW+'mm;min-width:0');
  const right=q?X.col(q.html,'justify-content:flex-end;margin-left:auto;flex:none'):'';
  return '<div style="display:flex;gap:'+o.gap+'mm;flex:1;min-height:0">'+left+right+'</div><div style="margin-top:'+o.gap+'mm">'+idr.html+'</div>';
}

def({id:'cartao_dobravel',nome:'Cartão dobrável',w:200,h:90,fold:100,papeis:['verge','kraft','matte'],papel:'verge',fraseLivre:true,
 frase:'Menos culpa, mais presença.',sub:'Um cartão para guardar e entregar a quem você quer bem.',
 porque:'Vira cartão de recado: a pessoa escreve dentro e entrega a quem ama.',
 montagem:['Vinque na marca e dobre. A parte impressa fica por fora; escreva dentro à mão.'],
 render(X){
  const c=X.c,pw=100-2*X.ix,gap=2*X.ix,q=c.qr?X.qrCap(28,{pt:8}):null;
  const idr=X.id(pw-(q?q.w+4:0));
  const su=X.t(c.sub||'',{w:pw,h:30,max:11,min:X.body,weight:500,lh:1.3});
  const L=X.col('<div style="flex:1">'+su.html+'</div><div style="display:flex;align-items:flex-end;justify-content:space-between;gap:4mm"><div style="width:'+(pw-(q?q.w+4:0))+'mm">'+idr.html+'</div>'+(q?q.html:'')+'</div>','width:'+pw+'mm;height:'+X.ch+'mm');
  const fr=X.t(c.frase,{w:pw,h:44,max:26,min:12,weight:800,lh:1.06});
  const R=X.col('<div>'+X.sym(20)+'</div><div style="margin-top:6mm">'+fr.html+'</div>','width:'+pw+'mm;height:'+X.ch+'mm;justify-content:center');
  return '<div style="display:flex;gap:'+gap+'mm;height:100%">'+L+R+'</div>';
 }});

def({id:'cartao',nome:'Cartão 90×55',w:90,h:55,papeis:['verge','kraft','matte','metal'],papel:'verge',fraseLivre:true,nfcOk:true,
 frase:'Menos culpa, mais presença.',sub:'',porque:'Cabe na carteira e leva a pessoa direto ao agendamento.',
 render(X){return card(X,{sym:11,qr:22,fmax:17,fmin:9});}});

def({id:'mini_cartao',nome:'Mini-cartão com QR',w:60,h:30,papeis:['verge','kraft','matte'],papel:'verge',fraseLivre:true,
 frase:'Menos culpa, mais presença.',sub:'',porque:'Sobra de folha vira cartão pequeno para deixar em balcões e livros.',
 render(X){
  const c=X.c,q=c.qr?X.qrCap(17,{pt:6.5}):null;
  const lw=X.cw-(q?q.w+2:0);
  const idr=X.id(lw);
  const fr=X.t(c.frase,{w:lw,h:X.ch-idr.h-1.5,max:10,min:8,weight:800,lh:1.05});
  return '<div style="display:flex;gap:2mm;flex:1;min-height:0"><div style="width:'+lw+'mm;display:flex;flex-direction:column;justify-content:space-between">'+fr.html+idr.html+'</div>'+(q?'<div style="margin-left:auto;display:flex;flex-direction:column;justify-content:flex-end">'+q.html+'</div>':'')+'</div>';
 }});

def({id:'cartao_emergencia',qrNao:true,qr:false,nome:'Cartão de emergência',w:85,h:55,papeis:['matte','verge'],papel:'matte',nfcOk:true,
 frase:'Em caso de emergência',linhas:['Meu nome','Avisar (nome e telefone)','Alergias','Doenças e remédios'],
 porque:'Fica na carteira: quem socorre acha na hora a quem avisar.',
 render(X){
  const c=X.c,w=X.cw;
  const ti=X.t(c.frase,{w:w,h:5,max:11,min:9,weight:800,color:X.ink.a});
  const tels='<div style="font:800 7.5pt/1 '+X.fam+';color:'+X.ink.b+';white-space:nowrap">SAMU 192 · CVV 188 · Bombeiros 193</div>';
  const idr=X.id(w);
  const fl=(c.linhas||[]).slice(0,4).map(l=>X.field(l,{h:5.4})).join('');
  return ti.html+'<div style="margin:.8mm 0 0">'+tels+'</div>'+
   '<div style="display:flex;flex-direction:column;flex:1;justify-content:space-between;margin-top:.5mm">'+fl+'</div>'+
   '<div style="margin-top:1.5mm">'+idr.html+'</div>';
 }});

def({id:'lista_remedios',qrNao:true,qr:false,nome:'Lista de remédios',w:170,h:55,fold:85,papeis:['matte','verge'],papel:'matte',
 frase:'Minha lista de remédios',sub:'Leve na carteira. Mostre em toda consulta.',linhas:['Nome','Alergias'],
 porque:'Quem cuida da pessoa e quem atende no pronto-socorro vê tudo num cartão só.',
 montagem:['Dobre ao meio na marca: a tabela fica de um lado e o nome do outro.'],
 render(X){
  const c=X.c,pw=85-2*X.ix,gap=2*X.ix;
  const ti=X.t(c.frase,{w:pw,h:7,max:13,min:10,weight:800,lh:1.05,color:X.ink.a});
  const su=X.t(c.sub||'',{w:pw,h:9,max:9,min:8,weight:500,lh:1.25,mt:1});
  const idr=X.id(pw);
  const L=X.col(ti.html+su.html+'<div style="margin-top:auto;display:flex;flex-direction:column;gap:.6mm;margin-bottom:2mm">'+(c.linhas||[]).map(l=>X.field(l,{h:5.6})).join('')+'</div>'+idr.html,'width:'+pw+'mm;height:'+X.ch+'mm');
  const hd=['Remédio','Dose','Horário'];
  const rows=Array.from({length:6}).map(()=>'<div style="border-bottom:0.25mm solid '+X.ink.t+'"></div>').join('');
  const R=X.col('<div style="display:grid;grid-template-columns:5fr 3fr 3fr;gap:1.5mm;font:800 '+X.lab+'pt/1 '+X.fam+';color:'+X.ink.a+';padding-bottom:1mm;border-bottom:0.4mm solid '+X.ink.a+'">'+hd.map(h=>'<span>'+h+'</span>').join('')+'</div><div style="flex:1;display:grid;grid-template-rows:repeat(6,1fr)">'+rows+'</div>','width:'+pw+'mm;height:'+X.ch+'mm');
  return '<div style="display:flex;gap:'+gap+'mm;height:100%">'+L+R+'</div>';
 }});

def({id:'encaminhamento',nome:'Cartão de encaminhamento',w:90,h:55,papeis:['verge','matte','metal'],papel:'matte',
 frase:'Para o Dr. José Linhares',sub:'Encaminhamento',linhas:['Paciente','Motivo','Quem encaminha'],
 porque:'O colega preenche em segundos e o paciente sai com o contato certo.',
 render(X){
  const c=X.c,q=c.qr?X.qrCap(20):null,lw=X.cw-(q?q.w+3:0);
  const lab=X.t(c.sub||'',{w:lw,h:3.5,max:7,min:7,weight:800,color:X.ink.b,ls:1});
  const ti=X.t(c.frase,{w:lw,h:12,max:12,min:9,weight:800,lh:1.05,mt:.5,color:X.ink.a});
  const fl=(c.linhas||[]).slice(0,3).map(l=>X.field(l,{h:5.4})).join('');
  const idr=X.id(X.cw);
  return '<div style="display:flex;gap:3mm;flex:1;min-height:0"><div style="width:'+lw+'mm;display:flex;flex-direction:column">'+lab.html+ti.html+'<div style="margin-top:auto;display:flex;flex-direction:column;gap:.6mm">'+fl+'</div></div>'+(q?'<div style="margin-left:auto;display:flex;flex-direction:column;justify-content:flex-end">'+q.html+'</div>':'')+'</div><div style="margin-top:1.5mm">'+idr.html+'</div>';
 }});

def({id:'ima_telefones',nome:'Ímã de telefones',w:90,h:60,papeis:['matte'],papel:'matte',manta:true,
 frase:'Telefones da casa',sub:'Seu médico de família',
 porque:'Fica na geladeira: na hora do susto, os números certos estão à vista.',
 render(X){
  const c=X.c,q=c.qr?X.qrCap(22):null,lw=X.cw-(q?q.w+3:0);
  const ti=X.t(c.frase,{w:lw,h:4,max:8,min:8,weight:800,color:X.ink.a,ls:1});
  const idr=X.id(X.cw,{tel:false});
  const tel='<div style="font:800 18pt/1 '+X.fam+';color:'+X.ink.a+';white-space:nowrap">'+TEL+'</div>';
  const left=X.col(ti.html+'<div style="display:flex;flex-direction:column;gap:2.4mm;margin-top:2.4mm">'+X.tels({big:21,pt:10.5})+'</div>','width:'+lw+'mm');
  return '<div style="display:flex;gap:3mm">'+left+(q?'<div style="margin-left:auto">'+q.html+'</div>':'')+'</div><div style="margin-top:auto;border-top:0.4mm solid '+X.ink.a+';padding-top:1.2mm">'+
   '<div style="font:700 8pt/1.1 '+X.fam+';color:'+X.ink.t+'">'+esc(c.sub)+'</div>'+tel+'<div style="height:1mm"></div>'+idr.html+'</div>';
 }});

function longa(X,o){
  const c=X.c,big=o.big;
  const q=c.qr?X.qrCap(big,{pt:o.cap}):null;
  const idr=X.id(X.cw);
  const e=X.endereco(X.cw-(q?big:0)-4,o.body);
  const head='<div style="display:flex;align-items:center;gap:3mm;margin-bottom:'+o.g+'mm">'+X.sym(o.sym)+X.t('Medicina de família · Porto Alegre',{w:X.cw-X.symW(o.sym)-4,h:9,max:o.body,min:X.mn.rotulo,weight:800,color:X.ink.b,ls:1}).html+'</div>';
  const li=(c.linhas||[]).filter(Boolean).map(l=>{const r=X.t(l,{w:X.cw-5,h:o.lh*1.6,max:o.body+(o.big>30?3:1.5),min:X.body,weight:600,lh:1.25});return '<div style="display:flex;gap:2.4mm;margin-top:'+(o.big>30?3.4:2.4)+'mm"><span style="flex:none;width:1.8mm;height:1.8mm;border-radius:50%;background:'+X.ink.a+';margin-top:'+(r.pt*PT*0.5)+'mm"></span>'+r.html+'</div>';}).join('');
  const sos='<div style="font:700 '+o.body+'pt/1.2 '+X.fam+';color:'+X.ink.b+';margin-top:2mm">Em emergência, ligue 192 (SAMU).</div>';
  const qrb='<div style="display:flex;align-items:flex-start;gap:4mm;border-top:0.5mm solid '+X.ink.a+';padding-top:3mm;margin-top:auto">'+(q?q.html:'')+
   '<div style="flex:1;min-width:0">'+X.t('Aponte a câmera e agende',{w:X.cw-(q?big:0)-4,h:14,max:o.body+3,min:X.body,weight:800,color:X.ink.a}).html+'<div style="font:800 '+(o.body+5)+'pt/1.2 '+X.fam+';color:'+X.ink.t+';margin-top:1mm;white-space:nowrap">'+TEL+'</div><div style="margin-top:1.5mm">'+e.html+'</div></div></div>';
  const used=o.sym+o.g+(q?big+1+o.capH:0)+idr.h+o.body*0.7+16;
  const fixed=idr.h+(c.qr?big+o.capH+8:30)+o.sym+o.g+o.body*1.2*PT*2+8;
  const room=X.ch-fixed;
  const fr=X.t(c.frase,{w:X.cw,h:Math.max(room*0.42,o.fmin*1.1*PT*2),max:o.fmax,min:o.fmin,weight:800,lh:1.05,mb:o.g});
  const su=c.sub?X.t(c.sub,{w:X.cw,h:Math.max(room*0.28,o.sh),max:o.body+(o.big>30?4:2.5),min:X.body,weight:500,lh:1.34}).html:'';
  return head+fr.html+su+'<div style="margin-top:1mm">'+li+'</div>'+qrb+'<div style="margin-top:2.5mm">'+idr.html+'</div>'+sos;
}
def({id:'panfleto_a5',temEndereco:true,nome:'Panfleto A5',w:148,h:210,papeis:['matte','verge','kraft'],papel:'matte',idLongo:true,fraseLivre:true,
 frase:'Um médico para a família inteira.',
 sub:'O médico de família acompanha a mesma pessoa ao longo dos anos. Conhece a história, os remédios e a casa de quem atende.',
 linhas:['Crianças, adultos e idosos no mesmo consultório','Revisão da lista de remédios','Acompanhamento de pressão, diabetes e outras condições de longo prazo','Prevenção sem exame desnecessário'],
 porque:'Explica em quatro linhas o que faz um médico de família e leva ao agendamento.',
 render(X){return longa(X,{big:34,cap:12,capH:8,fmax:44,fmin:20,g:4,sh:20,lh:16,body:12,sym:24});}});
def({id:'folheto_a6',temEndereco:true,nome:'Folheto A6',w:105,h:148,papeis:['matte','verge','kraft'],papel:'matte',idLongo:true,fraseLivre:true,
 frase:'Um médico para a família inteira.',
 sub:'O médico de família acompanha a mesma pessoa ao longo dos anos.',
 linhas:['Crianças, adultos e idosos no mesmo consultório','Revisão da lista de remédios','Prevenção sem exame desnecessário'],
 porque:'Versão de bolso do panfleto, boa para balcões e farmácias parceiras.',
 render(X){return longa(X,{big:26,cap:8,capH:6,fmax:28,fmin:14,g:3,sh:14,lh:12,body:9,sym:16});}});

def({id:'diario_a5',nome:'Diário da pressão',w:148,h:210,papeis:['matte','verge'],papel:'matte',
 frase:'Diário da pressão',sub:'Anote e traga na consulta.',linhas:['Dia','Manhã','Noite','Como eu estava'],
 porque:'A pessoa anota todo dia e leva o diário pronto para a consulta.',
 render(X){
  const c=X.c,cols='3fr 4fr 4fr 5fr',q=c.qr?X.qrCap(22,{pt:9}):null;
  const ti=X.t(c.frase,{w:X.cw*0.62,h:12,max:26,min:16,weight:800,color:X.ink.a});
  const su=X.t(c.sub||'',{w:X.cw,h:7,max:13,min:12,weight:500,mt:1});
  const hd=(c.linhas||[]).slice(0,4);
  const idr=X.id(X.cw-(q?q.w+4:0));
  const rows=Array.from({length:14}).map(()=>'<div style="display:grid;grid-template-columns:'+cols+';border-bottom:0.3mm solid '+X.ink.t+'"><div style="border-right:0.3mm solid '+X.ink.t+'"></div><div style="border-right:0.3mm solid '+X.ink.t+'"></div><div style="border-right:0.3mm solid '+X.ink.t+'"></div><div></div></div>').join('');
  return '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:4mm"><div>'+X.sym(12)+'<div style="height:2mm"></div>'+ti.html+'</div><div style="width:'+(X.cw*0.34)+'mm">'+X.field('Nome:',{h:7,pt:11})+'</div></div>'+su.html+
   '<div style="display:grid;grid-template-columns:'+cols+';margin-top:3mm;border-bottom:0.5mm solid '+X.ink.a+';border-top:0.5mm solid '+X.ink.a+';font:800 11pt/1 '+X.fam+';color:'+X.ink.a+'">'+hd.map(h=>'<div style="padding:2.2mm 2mm">'+esc(h)+'</div>').join('')+'</div>'+
   '<div style="flex:1;display:grid;grid-template-rows:repeat(14,1fr);border-left:0.3mm solid '+X.ink.t+';border-right:0.3mm solid '+X.ink.t+'">'+rows+'</div>'+
   '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:3mm"><div>'+idr.html+'</div>'+(q?q.html:'')+'</div>';
 }});

def({id:'marcador',nome:'Marcador de página',w:48,h:180,papeis:['verge','kraft','matte','metal'],papel:'verge',fraseLivre:true,
 frase:'O corpo precisa de pausa.',sub:'',usa:{juta:0.3},
 porque:'Fica no livro por meses, e cada abertura lembra de quem cuida.',
 montagem:['Fure no círculo guia (furador de 3 mm) e passe a juta de 2 mm.'],
 render(X){
  const c=X.c,q=c.qr?X.qrCap(Math.min(24,X.cw)):null;
  const idr=X.id(X.cw);
  const fr=X.t(c.frase,{w:X.cw,h:70,max:19,min:11,weight:800,lh:1.08,align:'center'});
  return '<div style="display:flex;justify-content:center;margin-bottom:5mm">'+X.hole()+'</div><div style="display:flex;justify-content:center;margin-bottom:6mm">'+X.sym(Math.min(20,X.cw*0.5))+'</div>'+fr.html+
   (c.sub?X.t(c.sub,{w:X.cw,h:30,max:9,min:8,weight:500,lh:1.3,mt:3,align:'center'}).html:'')+
   '<div style="margin-top:auto">'+(q?'<div style="display:flex;justify-content:center;margin-bottom:3mm">'+q.html+'</div>':'')+idr.html+'</div>';
 }});

def({id:'tag_kit',nome:'Tag de kit',w:50,h:90,papeis:['kraft','verge','matte','metal'],papel:'kraft',fraseLivre:true,nfcOk:true,
 frase:'Menos culpa, mais presença.',linhas:['Para'],usa:{argolas:1,celofane:1},
 porque:'Identifica o kit e o presente: a pessoa guarda o chaveiro e o contato.',
 montagem:['Fure no círculo guia, passe a argola e embale na sacolinha de celofane.'],
 render(X){
  const c=X.c,w=X.cw,q=c.qr?X.qrCap(18,{pt:6.5}):null;
  const idr=X.id(w);
  const fixed=3+2.5+10+3+9+(c.nfc?12:0)+(q?q.h+2:0)+idr.h+3;
  const fr=X.t(c.frase,{w,h:Math.max(X.ch-fixed,8),max:14,min:8.5,weight:800,lh:1.08,align:'center'});
  return '<div style="display:flex;justify-content:center;margin-bottom:2.5mm">'+X.hole()+'</div><div style="display:flex;justify-content:center;margin-bottom:3mm">'+X.sym(10)+'</div>'+fr.html+
   '<div style="margin-top:3mm">'+X.field((c.linhas||['Para'])[0]+':',{h:6,pt:X.lab})+'</div>'+
   (c.nfc?'<div style="margin-top:2mm;display:flex;justify-content:center">'+X.nfcBox()+'</div>':'')+
   '<div style="margin-top:auto">'+(q?'<div style="display:flex;justify-content:center;margin-bottom:2mm">'+q.html+'</div>':'')+idr.html+'</div>';
 }});

def({id:'adesivo_quadrado',nome:'Adesivo quadrado',w:60,h:60,papeis:['vinil'],papel:'vinil',fundoPadrao:true,fraseLivre:true,
 frase:'O corpo precisa de pausa.',sub:'',porque:'Vai no notebook, no caderno ou na garrafa e conta quem cuida.',
 montagem:['Destaque e cole em superfície limpa e seca.'],
 render(X){return card(X,{sym:9,qr:17,fmax:13,fmin:8.5,gap:2});}});

def({id:'adesivo_bolacha',qrNao:true,qr:false,nome:'Adesivo de bolacha de MDF',w:80,h:80,papeis:['vinil'],papel:'vinil',fundoPadrao:true,fraseLivre:true,raw:true,usa:{bolachas:1},
 frase:'O corpo precisa de pausa.',sub:'',porque:'Protege a mesa e deixa a frase à vista na hora do café.',
 montagem:['Arte redonda de 75 mm: destaque o vinil, arredonde os cantos com tesoura e cole no centro da bolacha de MDF.'],
 render(X){
  const c=X.c,d=X.w-2*SAFE,cx=X.w/2,cy=X.h/2;
  const bw=46,bx=cx-bw/2;
  const idr=X.id(bw,{tel:true,color:X.ink.t});
  const fr=X.t(c.frase,{w:bw,h:22,max:14,min:9,weight:800,lh:1.08,align:'center'});
  const top=cy-d/2;
  const circ='<div data-bg="1" style="position:absolute;left:'+SAFE+'mm;top:'+SAFE+'mm;width:'+d+'mm;height:'+d+'mm;border-radius:50%;box-sizing:border-box;'+(c.fundo?'background:'+X.ink.tint+';':'')+'border:0.4mm solid '+X.ink.a+'"></div>';
  const inner='<div style="position:absolute;left:'+bx+'mm;top:'+(top+9)+'mm;width:'+bw+'mm;display:flex;flex-direction:column;align-items:center;gap:1.6mm">'+X.sym(11)+fr.html+'</div>'+
   '<div style="position:absolute;left:'+bx+'mm;top:'+(cy+d/2-9-idr.h)+'mm;width:'+bw+'mm;text-align:center">'+idr.html.replace('text-align:left','text-align:center')+'</div>';
  return circ+inner;
 }});

def({id:'adesivo_chaveiro',nome:'Adesivo de chaveiro',w:40,h:40,papeis:['vinil'],papel:'vinil',fundoPadrao:false,nfcOk:true,usa:{chaveiros:1},
 frase:'Encoste o celular.',sub:'',porque:'Fica no chaveiro: quem o acha chega até o médico com um toque.',
 montagem:['Cole no chaveiro pronto.'],
 render(X){
  const c=X.c,q=c.qr?X.qrCap(13,{pt:6.5}):null;
  const idr=X.id(X.cw);
  const lw=X.cw-(q?q.w+2:0);
  const fr=X.t(c.frase,{w:lw,h:X.ch-idr.h-2,max:10,min:8,weight:800,align:'left',lh:1.05});
  return '<div style="display:flex;gap:2mm;flex:1;min-height:0"><div style="width:'+lw+'mm">'+fr.html+(c.nfc?'<div style="margin-top:1.5mm">'+X.nfcBox()+'</div>':'')+'</div>'+(q?'<div style="margin-left:auto">'+q.html+'</div>':'')+'</div><div style="margin-top:1.5mm">'+idr.html+'</div>';
 }});

def({id:'adesivo_degrau',qr:false,nome:'Adesivo de degrau',w:250,h:35,papeis:['vinil'],papel:'vinil',fundoPadrao:true,fraseLivre:true,
 frase:'Mais um degrau. Seu corpo conta.',sub:'',porque:'Fica no degrau da escada: um incentivo que se lê subindo.',
 montagem:['Cole no espelho do degrau, em superfície limpa e seca.'],
 render(X){
  const c=X.c,idw=88,q=c.qr?X.qrCap(X.ch-5,{pt:6.5}):null;
  const idr=X.id(idw);
  const fr=X.t(c.frase,{w:X.cw-idw-X.symW(16)-10-(q?q.w+5:0),h:X.ch-2,max:28,min:12,weight:800,lh:1.05});
  return '<div style="display:flex;align-items:center;gap:5mm;height:100%">'+X.sym(16)+'<div style="flex:1">'+fr.html+'</div><div style="width:'+idw+'mm">'+idr.html+'</div>'+(q?q.html:'')+'</div>';
 }});

function kit(X){
  const c=X.c,col=c.versao==='colega',b=X.body;
  const q=c.qr?X.qrCap(26,{pt:8}):null;
  const lab=col?X.t('De colega para colega',{w:X.cw,h:4,max:8,min:8,weight:800,color:X.ink.b,ls:1,mt:.5}).html:'';
  const idr=X.id(X.cw);
  const li=(c.linhas||[]).filter(Boolean).map(l=>{const r=X.t(l,{w:X.cw,h:11,max:b+.5,min:b,weight:600,lh:1.2});return '<div style="border-top:0.25mm solid '+X.ink.t+';padding-top:1.3mm;margin-top:1.3mm">'+r.html+'</div>';}).join('');
  const nli=(c.linhas||[]).filter(Boolean).length;
  const fixed=11+(col?5:0)+nli*8.2+(q?q.h:20)+idr.h+(c.sub?24:0)+10;
  const fr=X.t(c.frase,{w:X.cw,h:Math.max(X.ch-fixed,14),max:col?18:21,min:12,weight:800,lh:1.06,mt:1.5,color:X.ink.a});
  const su=c.sub?X.t(c.sub,{w:X.cw,h:24,max:b+1,min:b,weight:500,lh:1.3,mt:1.5}).html:'';
  const assin=col?'<div style="font:700 '+b+'pt/1.3 '+X.fam+';color:'+X.ink.t+'">Fale direto comigo.<br>Os cartões de encaminhamento estão no kit.<br><b style="font-weight:800">'+TEL+'</b></div>':'<div style="font:700 '+b+'pt/1.3 '+X.fam+';color:'+X.ink.t+'"><b style="font-weight:800">'+TEL+'</b><br>Com carinho,<br><span style="font:800 13pt/1.2 '+X.fam+';color:'+X.ink.a+'">José</span></div>';
  return '<div style="margin-bottom:2mm">'+X.sym(10)+'</div>'+lab+fr.html+su+'<div style="margin-top:2mm">'+li+'</div>'+
   '<div style="margin-top:auto;display:flex;align-items:flex-end;gap:3mm;margin-bottom:3mm">'+(q?q.html:'')+assin+'</div>'+idr.html;
}
def({id:'cartao_kit_familia',nome:'Cartão do kit · família',w:105,h:148,papeis:['verge','matte','kraft'],papel:'verge',versao:'familia',usa:{celofane:1},
 frase:'Um cuidado para deixar em casa.',sub:'Separei estas coisas para você. São simples e ajudam no dia em que alguém precisar.',
 linhas:['Ímã com os telefones de emergência','Cartão de emergência para a carteira','Cartão da lista de remédios','Diário da pressão','Chaveiro: encoste o celular e fale comigo'],
 porque:'Explica o que há no kit e vira o primeiro contato direto com o médico.',
 render:kit});
def({id:'cartao_kit_colega',nome:'Cartão do kit · colegas',w:105,h:148,papeis:['verge','matte','kraft'],papel:'verge',versao:'colega',usa:{celofane:1},
 frase:'Quando o caso pedir alguém que junte as pontas.',sub:'Sou médico de família. Recebo quem precisa de um médico de referência e devolvo o paciente com retorno por escrito.',
 linhas:['Muitos remédios, muitos especialistas','Pessoa idosa e quem cuida dela','Dor crônica e saúde mental','Quem não consegue sair de casa'],
 porque:'O colega entende em segundos quando encaminhar e como falar comigo.',
 render:kit});

def({id:'display_a5',temEndereco:true,nome:'Display de balcão A5',w:148,h:210,papeis:['matte','verge'],papel:'matte',idLongo:true,usa:{display:1},
 frase:'Aponte a câmera e agende',sub:'Médico de família em Porto Alegre',
 porque:'Fica no balcão do parceiro: quem espera o atendimento agenda pelo celular.',
 montagem:['Encaixe a folha no display de acrílico em L (A5).'],
 render(X){
  const c=X.c,qs=Math.min(74,X.cw-10);
  const idr=X.id(X.cw);
  const e=X.endereco(X.cw*0.7,12);
  const fixed=20+6+(c.qr?qs+8:0)+idr.h+22+8+(c.sub?14:0);
  const fr=X.t(c.frase,{w:X.cw,h:Math.max(X.ch-fixed,24),max:36,min:20,weight:800,lh:1.05,align:'center',color:X.ink.a});
  return '<div style="display:flex;justify-content:center;margin-bottom:5mm">'+X.sym(20)+'</div>'+fr.html+
   (c.qr?'<div style="display:flex;justify-content:center;margin-top:5mm">'+X.qrImg(qs)+'</div>':'')+
   (c.sub?X.t(c.sub,{w:X.cw,h:14,max:14,min:12,weight:600,align:'center',mt:4}).html:'')+
   '<div style="text-align:center;font:800 18pt/1.2 '+X.fam+';color:'+X.ink.t+';margin-top:3mm;white-space:nowrap">'+TEL+'</div>'+
   '<div style="width:'+(X.cw*0.7)+'mm;align-self:center;margin-top:3mm">'+e.html+'</div>'+
   '<div style="margin-top:auto">'+idr.html.replace('text-align:left','text-align:center')+'</div>';
 }});

def({id:'perguntas_consulta',nome:'Perguntas para a minha consulta',w:105,h:148,papeis:['matte','verge'],papel:'verge',
 frase:'Perguntas para a minha consulta',sub:'Escreva antes. Leve junto.',
 porque:'Quem escreve as dúvidas antes chega mais tranquilo e sai com menos dúvidas.',
 render(X){
  const c=X.c,n=8,q=c.qr?X.qrCap(20,{pt:8}):null;
  const idr=X.id(X.cw-(q?q.w+3:0));
  const ti=X.t(c.frase,{w:X.cw,h:20,max:18,min:12,weight:800,color:X.ink.a,lh:1.08});
  const su=X.t(c.sub||'',{w:X.cw,h:7,max:10,min:9,weight:500,mt:1.2});
  const rows=Array.from({length:n}).map((_,i)=>'<div style="border-bottom:0.25mm solid '+X.ink.t+';display:flex;align-items:flex-end;font:700 8pt/1 '+X.fam+';color:'+X.ink.b+';padding-bottom:.5mm">'+(i+1)+'</div>').join('');
  return '<div style="margin-bottom:2mm">'+X.sym(10)+'</div>'+ti.html+su.html+'<div style="flex:1;display:grid;grid-template-rows:repeat('+n+',1fr);margin:2mm 0">'+rows+'</div>'+
   '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:3mm"><div>'+idr.html+'</div>'+(q?q.html:'')+'</div>';
 }});

def({id:'semana_remedios',nome:'Semana dos remédios',w:148,h:210,papeis:['matte','verge'],papel:'matte',
 frase:'Semana dos remédios',sub:'Marque ao tomar.',linhas:['Manhã','Tarde','Noite'],
 porque:'Uma folha por semana na porta da geladeira organiza a rotina de quem cuida.',
 render(X){
  const c=X.c,dias=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'],q=c.qr?X.qrCap(22,{pt:9}):null;
  const ti=X.t(c.frase,{w:X.cw*0.62,h:12,max:26,min:16,weight:800,color:X.ink.a});
  const su=X.t(c.sub||'',{w:X.cw,h:7,max:13,min:12,weight:500,mt:1});
  const cols='2.4fr 3fr 3fr 3fr';
  const hd=['Dia'].concat((c.linhas||[]).slice(0,3));
  const rows=dias.map(d=>'<div style="display:grid;grid-template-columns:'+cols+';border-bottom:0.3mm solid '+X.ink.t+'"><div style="font:700 11pt/1 '+X.fam+';padding:2mm;border-right:0.3mm solid '+X.ink.t+';color:'+X.ink.t+'">'+d+'</div><div style="border-right:0.3mm solid '+X.ink.t+'"></div><div style="border-right:0.3mm solid '+X.ink.t+'"></div><div></div></div>').join('');
  const idr=X.id(X.cw-(q?q.w+4:0));
  return '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:4mm"><div>'+X.sym(12)+'<div style="height:2mm"></div>'+ti.html+'</div><div style="width:'+(X.cw*0.32)+'mm">'+X.field('Nome:',{h:7,pt:11})+'</div></div>'+su.html+
   '<div style="display:grid;grid-template-columns:'+cols+';margin-top:3mm;border-top:0.5mm solid '+X.ink.a+';border-bottom:0.5mm solid '+X.ink.a+';font:800 11pt/1 '+X.fam+';color:'+X.ink.a+'">'+hd.map(h=>'<div style="padding:2.4mm 2mm">'+esc(h)+'</div>').join('')+'</div>'+
   '<div style="flex:1;display:grid;grid-template-rows:repeat(7,1fr);border-left:0.3mm solid '+X.ink.t+';border-right:0.3mm solid '+X.ink.t+'">'+rows+'</div>'+
   '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:3mm"><div>'+idr.html+'</div>'+(q?q.html:'')+'</div>';
 }});

def({id:'cartao_cuidador',nome:'Cartão do cuidador',w:105,h:148,papeis:['matte','verge'],papel:'matte',nfcOk:true,
 frase:'Cartão do cuidador',sub:'Contatos e rotina de quem eu cuido.',linhas:['Pessoa cuidada','Contato 1 (nome e telefone)','Contato 2 (nome e telefone)','Manhã','Tarde','Noite'],
 porque:'Quem reveza no cuidado encontra tudo em um cartão: contatos e rotina.',
 render(X){
  const c=X.c,L=c.linhas||[],q=c.qr?X.qrCap(20,{pt:8}):null;
  const ti=X.t(c.frase,{w:X.cw,h:14,max:24,min:13,weight:800,color:X.ink.a});
  const su=X.t(c.sub||'',{w:X.cw,h:9,max:11,min:9,weight:500,mt:1});
  const sec=(t)=>'<div style="font:800 8pt/1 '+X.fam+';color:'+X.ink.b+';text-transform:uppercase;letter-spacing:.08em;margin:3mm 0 .4mm">'+t+'</div>';
  const f=l=>X.field(l,{h:10.5,pt:8.5});
  const tels='<div style="font:800 8pt/1.2 '+X.fam+';color:'+X.ink.b+';white-space:nowrap;margin-top:3mm">SAMU 192 · CVV 188 · Bombeiros 193</div>';
  const idr=X.id(X.cw-(q?q.w+3:0));
  return '<div style="margin-bottom:2mm">'+X.sym(14)+'</div>'+ti.html+su.html+sec('Contatos')+L.slice(0,3).map(f).join('')+sec('Rotina')+L.slice(3,6).map(f).join('')+tels+
   '<div style="margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;gap:3mm"><div>'+idr.html+'</div>'+(q?q.html:'')+'</div>';
 }});

def({id:'etiquetas_caixa',qrNao:true,qr:false,nome:'Etiquetas de caixa de remédio',w:60,h:20,papeis:['vinil'],papel:'vinil',variantes:['Manhã','Tarde','Noite'],
 frase:'',porque:'Cada caixa ganha o momento do dia: ninguém troca de remédio por engano de horário.',
 montagem:['Destaque e cole na tampa ou na lateral de cada caixa de remédio.'],
 render(X){
  const v=X.variant||'Manhã';
  const idw=X.cw-21;
  const w=X.t(v,{w:19,h:X.ch-1,max:16,min:11,weight:800,color:X.ink.a,lh:1});
  const idr=X.id(idw);
  return '<div style="display:flex;align-items:center;gap:2mm;height:100%"><div style="width:19mm">'+w.html+'</div><div style="width:'+idw+'mm">'+idr.html+'</div></div>';
 }});

AT.PECAS=P;

/* ---------- desenho final ---------- */
AT.renderPiece=function(c,o){
  o=o||{};
  const w=o.w||c.w,h=o.h||c.h;
  const X=makeX(c,w,h,o.variant);
  const raw=c.base.raw;
  const body=c.base.render(X);
  const fill=(c.fundo&&!raw)?'<div data-bg="1" style="position:absolute;left:'+SAFE+'mm;top:'+SAFE+'mm;right:'+SAFE+'mm;bottom:'+SAFE+'mm;background:'+X.ink.tint+';border-radius:1.2mm"></div>':'';
  const inner=raw?body:'<div class="in" style="position:absolute;left:'+X.ix+'mm;top:'+X.ix+'mm;width:'+X.cw+'mm;height:'+X.ch+'mm;display:flex;flex-direction:column;overflow:hidden">'+body+'</div>';
  const html='<div class="pc" data-piece="'+c.id+'" style="position:relative;width:'+w+'mm;height:'+h+'mm;font-family:'+X.fam+',sans-serif;color:'+X.ink.t+';overflow:hidden">'+fill+inner+'</div>';
  return {html,warn:X.warn};
};
/* confere se algo passa da zona segura (em mm) */
AT.checkOverflow=function(pcEl,w,h){
  const issues=[],r0=pcEl.getBoundingClientRect(),k=r0.width/w;
  const tol=0.2;
  pcEl.querySelectorAll('*').forEach(el=>{
    if(el.dataset&&el.dataset.bg)return;
    if(el.tagName==='BR')return;
    if(el.tagName!=='svg'&&el.tagName!=='IMG'&&!(el.closest('svg'))&&(el.scrollHeight>el.clientHeight+Math.max(5,el.clientHeight*0.15)||el.scrollWidth>el.clientWidth+1)){issues.push((el.textContent||'').slice(0,18)+' passa da área');}
    if(el.classList.contains('in'))return;
    const r=el.getBoundingClientRect();if(!r.width&&!r.height)return;
    const x0=(r.left-r0.left)/k,y0=(r.top-r0.top)/k,x1=(r.right-r0.left)/k,y1=(r.bottom-r0.top)/k;
    if(x0<SAFE-tol||y0<SAFE-tol||x1>w-SAFE+tol||y1>h-SAFE+tol)issues.push((el.tagName+' '+(el.textContent||'').slice(0,18)).trim()+' fora da zona segura');
  });
  return issues;
};
})(window);
