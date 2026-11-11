/* Motor de imposição, corte e plano. Mede tudo em mm. */
(function(G){'use strict';
const AT=G.AT=G.AT||{};
const EPS=0.001, W=210, H=297;
const r2=n=>Math.round(n*100)/100;
AT.fmt=n=>{let s=String(r2(n));return s.replace('.',',');};

/* ---------- imposição ---------- */
function block(reg,o){
  const cols=Math.floor((reg.w+EPS)/o.a), rows=Math.floor((reg.h+EPS)/o.b), cells=[];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)cells.push({x:r2(reg.x+c*o.a),y:r2(reg.y+r*o.b),w:o.a,h:o.b,rot:o.rot,col:c,row:r});
  return cells;
}
function layoutKey(cells){return cells.length;}
AT.fit=function(pw,ph,m){
  m=m==null?6:m;
  const U={x:m,y:m,w:W-2*m,h:H-2*m};
  const os=[{a:pw,b:ph,rot:false}];
  if(Math.abs(pw-ph)>EPS)os.push({a:ph,b:pw,rot:true});
  const cands=[];
  os.forEach(o=>cands.push({desc:o.rot?'girada':'em pé',cells:block(U,o)}));
  os.forEach(oi=>{
    const rowsI=Math.floor((U.h+EPS)/oi.b), colsI=Math.floor((U.w+EPS)/oi.a);
    os.forEach(oj=>{
      if(oi===oj&&os.length>0&&oi.rot===oj.rot)return;
      for(let k=1;k<rowsI;k++){ // faixa horizontal
        const top=block({x:U.x,y:U.y,w:U.w,h:k*oi.b},oi);
        const bot=block({x:U.x,y:U.y+k*oi.b,w:U.w,h:U.h-k*oi.b},oj);
        if(bot.length)cands.push({desc:'duas faixas',cells:top.concat(bot)});
      }
      for(let k=1;k<colsI;k++){ // faixa vertical
        const lf=block({x:U.x,y:U.y,w:k*oi.a,h:U.h},oi);
        const rt=block({x:U.x+k*oi.a,y:U.y,w:U.w-k*oi.a,h:U.h},oj);
        if(rt.length)cands.push({desc:'dois blocos',cells:lf.concat(rt)});
      }
    });
  });
  let best=null;
  cands.forEach(c=>{
    if(!c.cells.length)return;
    c.cuts=AT.cuts(c.cells);
    if(!best||c.cells.length>best.cells.length||(c.cells.length===best.cells.length&&c.cuts.total<best.cuts.total))best=c;
  });
  if(!best)return {count:0,cells:[],cuts:{steps:[],v:[],h:[],total:0},desc:'não cabe',m};
  best.count=best.cells.length;best.m=m;
  best.cells.forEach((c,i)=>{c.i=i;});
  return best;
};

/* faixa livre embaixo do bloco: etiquetas de caixa (vinil) ou mini-cartões com QR */
AT.FILL_MIN=20;
AT.fillBand=function(cells,m,paper){
  if(!cells.length)return [];
  const y1=Math.max(...cells.map(c=>c.y+c.h)),h=H-m-y1,w=W-2*m;
  if(h<AT.FILL_MIN-EPS)return [];
  const out=[];
  if(paper==='vinil'){
    const rows=Math.floor((h+EPS)/20);
    for(let r=0;r<rows;r++)for(let c=0;c<3;c++)out.push({x:r2(m+c*60),y:r2(y1+r*20),w:60,h:20,rot:false,fill:true,pecaId:'etiquetas_caixa',variant:['Manhã','Tarde','Noite'][c]});
  }else if(paper==='verge'||paper==='kraft'||paper==='matte'){
    const rows=Math.floor((h+EPS)/30);
    for(let r=0;r<rows;r++)for(let c=0;c<3;c++)out.push({x:r2(m+c*60),y:r2(y1+r*30),w:60,h:30,rot:false,fill:true,pecaId:'mini_cartao'});
  }
  return out;
};
AT.semFill=c=>c.papel==='metal'||!!c.base.manta||!!c.base.raw;
AT.fitFill=function(pw,ph,m,paper,fill){
  const lay=AT.fit(pw,ph,m);
  lay.fill=[];lay.cutsAll=lay.cuts;
  if(fill&&lay.count){
    lay.fill=AT.fillBand(lay.cells,m,paper);
    if(lay.fill.length)lay.cutsAll=AT.cuts(lay.cells.concat(lay.fill));
  }
  return lay;
};

/* ---------- folha-kit: prateleiras de peças diferentes ---------- */
AT.packKit=function(units,m){
  const UW=W-2*m,UH=H-2*m;
  const list=units.slice().sort((a,b)=>b.h-a.h||(a.k<b.k?-1:1));
  const sheets=[];let sh=null,band=null;
  const newSheet=()=>{sh={cells:[],y:0,bands:[]};sheets.push(sh);band=null;};
  list.forEach(u=>{
    if(!sh)newSheet();
    for(;;){
      if(band&&Math.abs(band.h-u.h)<EPS&&band.x+u.w<=UW+EPS){u.x=band.x;u.y=band.y;band.x+=u.w;break;}
      if(sh.y+u.h<=UH+EPS){band={y:sh.y,h:u.h,x:0};sh.y+=u.h;sh.bands.push(band);u.x=0;u.y=band.y;band.x=u.w;if(u.w>UW+EPS)throw new Error('unidade maior que a folha');break;}
      newSheet();
    }
    sh.cells.push({x:r2(m+u.x),y:r2(m+u.y),w:u.w,h:u.h,rot:false,pecaId:u.pecaId,idx:u.idx,variant:u.variant});
  });
  return sheets.map(s=>({cells:s.cells}));
};

/* ---------- cortes (guilhotina) ---------- */
AT.cuts=function(cells,prefer){
  const steps=[];
  function bbox(cs){return {x0:Math.min(...cs.map(c=>c.x)),y0:Math.min(...cs.map(c=>c.y)),x1:Math.max(...cs.map(c=>c.x+c.w)),y1:Math.max(...cs.map(c=>c.y+c.h))};}
  function push(dir,pos,kind,scope,strip){steps.push({dir,pos:r2(pos),kind,scope:{x0:r2(scope.x0),y0:r2(scope.y0),x1:r2(scope.x1),y1:r2(scope.y1)},strip});}
  function rec(R,cs,depth,strip){
    const bb=bbox(cs);
    if(bb.x0-R.x0>EPS)push('v',bb.x0,'refilo',R,strip);
    if(R.x1-bb.x1>EPS)push('v',bb.x1,'refilo',R,strip);
    if(bb.y0-R.y0>EPS)push('h',bb.y0,'refilo',R,strip);
    if(R.y1-bb.y1>EPS)push('h',bb.y1,'refilo',R,strip);
    if(cs.length===1)return;
    const edges=(dir)=>{
      const s=new Set();cs.forEach(c=>{const a=dir==='v'?c.x:c.y,b=dir==='v'?c.x+c.w:c.y+c.h;s.add(r2(a));s.add(r2(b));});
      const lo=dir==='v'?bb.x0:bb.y0,hi=dir==='v'?bb.x1:bb.y1;
      return [...s].filter(p=>p>lo+EPS&&p<hi-EPS).filter(p=>!cs.some(c=>{const a=dir==='v'?c.x:c.y,b=dir==='v'?c.x+c.w:c.y+c.h;return a<p-EPS&&b>p+EPS;})).sort((a,b)=>a-b);
    };
    let dir='v',ps;
    if(prefer==='h'&&depth===0){dir='h';ps=edges('h');if(!ps.length){dir='v';ps=edges('v');}}else{ps=edges('v');if(!ps.length){dir='h';ps=edges('h');}}
    if(!ps.length)throw new Error('layout não é de guilhotina');
    const kind=(depth===0&&(dir==='v'||prefer==='h'))?'faixa':'transversal';
    ps.forEach(p=>push(dir,p,kind,bb,strip));
    const bounds=[dir==='v'?bb.x0:bb.y0].concat(ps,[dir==='v'?bb.x1:bb.y1]);
    for(let i=0;i<bounds.length-1;i++){
      const a=bounds[i],b=bounds[i+1];
      const sub=cs.filter(c=>{const p=dir==='v'?c.x:c.y;return p>=a-EPS&&p<b-EPS;});
      const reg=dir==='v'?{x0:a,x1:b,y0:bb.y0,y1:bb.y1}:{x0:bb.x0,x1:bb.x1,y0:a,y1:b};
      rec(reg,sub,depth+1,(strip?strip+'.':'')+(i+1));
    }
  }
  if(!cells.length)return {steps:[],v:[],h:[],total:0};
  rec({x0:0,y0:0,x1:W,y1:H},cells,0,'');
  steps.forEach((s,i)=>{s.n=i+1;});
  const uniq=a=>[...new Set(a.map(r2))].sort((x,y)=>x-y);
  return {prefer:prefer||'v',steps,v:uniq(steps.filter(s=>s.dir==='v').map(s=>s.pos)),h:uniq(steps.filter(s=>s.dir==='h').map(s=>s.pos)),total:steps.length};
};

/* texto do roteiro de corte */
AT.roteiro=function(cuts,pilha){
  const out=[];const f=AT.fmt;
  out.push({txt:'Junte até '+(pilha||8)+' folhas, bem alinhadas. Nunca passe de 8 por vez.',aviso:true});
  let last=null;
  cuts.steps.forEach(s=>{
    let txt;
    if(s.dir==='v'){
      const rel=s.pos-s.scope.x0;
      txt=(s.kind==='refilo'?'Refile':'Corte')+' na vertical, x = '+f(s.pos)+' mm da borda esquerda da folha'+(rel>0.01&&s.kind!=='refilo'?' ('+f(rel)+' mm a partir da borda esquerda da faixa)':'')+'.';
    }else{
      const rel=s.pos-s.scope.y0;
      txt=(s.kind==='refilo'?'Refile':'Corte')+' na horizontal, y = '+f(s.pos)+' mm da borda de cima da folha'+(rel>0.01&&s.kind!=='refilo'?' ('+f(rel)+' mm a partir da borda de cima da faixa)':'')+'.';
    }
    const grp=s.kind==='refilo'?'Refilo das bordas':s.kind==='faixa'?(s.dir==='h'?'1. Cortes horizontais: separam as faixas':'Faixas no sentido longo'):(s.dir==='v'&&cuts.prefer==='h'?'2. Cortes verticais':'Cortes transversais');
    const g=grp+(s.strip&&s.kind==='transversal'?' · faixa '+s.strip:'');
    if(g!==last){out.push({grupo:g});last=g;}
    out.push({n:s.n,txt,step:s});
  });
  return out;
};

/* ---------- peça efetiva ---------- */
AT.pecaDef=id=>AT.PECAS.find(p=>p.id===id);
AT.efetiva=function(st,id){
  const d=AT.pecaDef(id);if(!d)return null;
  const o=(st.pecas&&st.pecas[id])||{};
  const cfg=st.config;
  const c=Object.assign({},d,{
    w:d.w,h:d.h,papel:d.papel,simbolo:cfg.simbolo,tinta:cfg.tinta,fonte:cfg.fonte,qr:d.qr===true||(d.qr===undefined),fundo:d.fundoPadrao||false,nfc:!!d.nfcPadrao,
    frase:d.frase,sub:d.sub,endereco:'',linhas:(d.linhas||[]).slice(),porque:d.porque,idLongo:!!d.idLongo
  },o);
  c.base=d;
  if(!d.papeis.includes(c.papel))c.papel=d.papel;
  if(c.papel==='metal'){c.nfc=false;c.fundo=false;}
  if(!(c.papel==='matte'||c.papel==='vinil'))c.fundo=false;
  if(!c.fonte||!AT.FONTES[c.fonte])c.fonte=cfg.fonte;
  return c;
};
AT.efetivaPapel=function(st,pecaId,papel){
  const c=AT.efetiva(st,pecaId);
  if(papel&&c.base.papeis.includes(papel)){c.papel=papel;if(papel==='metal'){c.nfc=false;c.fundo=false;}if(!(c.papel==='matte'||c.papel==='vinil'))c.fundo=false;}
  return c;
};
AT.inkFor=function(c){
  const t=AT.TINTAS[c.tinta]||AT.TINTAS.azul;
  if(c.papel==='kraft')return {a:AT.KRAFT_TINTA,b:AT.KRAFT_TINTA,t:AT.KRAFT_TINTA,tint:'transparent'};
  return t;
};
/* tamanho impresso: no azul metálico a arte é menor (borda azul) */
AT.tamanhoImpresso=function(c,borda){
  if(c.papel==='metal')return {w:r2(c.w-2*borda),h:r2(c.h-2*borda)};
  return {w:c.w,h:c.h};
};


/* folha-kit: junta as sobras de peças diferentes (mesma linha e mesmo papel) numa folha só */
AT.linhaDe=function(pecaId){const k=Object.keys(AT.LINHAS).find(l=>AT.LINHAS[l].pecas[pecaId]);return k||'avulsa';};
AT._finalizaPlano=function(st,res,need,add,pilha,m){
  res.kit={folhas:[],economia:0,detalhe:[]};
  const grupos={};
  res.itens.forEach(o=>{
    if(!o.fit||o.papel==='metal'||o.c.base.manta||o.printPaper==='comum')return;
    const full=Math.floor(o.qtd/o.perSheet),rem=o.qtd-full*o.perSheet;
    if(rem<=0)return;
    const k=o.printPaper+'|'+AT.linhaDe(o.pecaId)+'|'+o.c.fonte+o.c.tinta;
    (grupos[k]=grupos[k]||[]).push({o,full,rem});
  });
  Object.entries(grupos).forEach(([k,L])=>{
    if(L.length<2)return;
    const units=[];
    L.forEach(g=>{for(let i=0;i<g.rem;i++)units.push({k:g.o.pecaId,pecaId:g.o.pecaId,idx:g.o.idx,w:g.o.tam.w,h:g.o.tam.h,variant:(g.o.c.base.variantes||[null])[i%((g.o.c.base.variantes||[1]).length)]});});
    let packed;try{packed=AT.packKit(units,m);}catch(e){return;}
    if(packed.length>=L.length)return;
    const paper=L[0].o.printPaper;
    packed.forEach(ps=>{
      const fill=AT.fillBand(ps.cells,m,paper);
      const all=ps.cells.concat(fill);
      const cuts=AT.cuts(all,'h');
      res.kit.folhas.push({paper,linha:AT.linhaDe(L[0].o.pecaId),cells:ps.cells,fill,cuts,idxs:[...new Set(ps.cells.map(c=>c.idx))]});
    });
    L.forEach(g=>{
      const o=g.o;
      o.kitQtd=g.rem;o.sheets=g.full;o.sobra=0;
      o.cortes=g.full?o.layout.cutsAll.total*Math.ceil(g.full/pilha):0;
    });
    need[paper]=(need[paper]||0)-L.length+packed.length;
    const eco=L.length-packed.length;res.kit.economia+=eco;
    res.kit.detalhe.push({paper,linha:AT.linhaDe(L[0].o.pecaId),antes:L.length,depois:packed.length,pecas:L.map(g=>g.o.nome)});
  });
  res.kit.folhas.forEach(f=>{res.cortes.total+=f.cuts.total;res.cortes.pilhas+=1;res.cortes.folhas+=1;});
};

/* ---------- plano ---------- */
AT.calcPlano=function(st){
  const cfg=st.config,m=cfg.margem,bd=cfg.borda,pilha=cfg.pilha;
  const inv={};st.inventario.forEach(i=>{inv[i.id]=i;});
  const res={itens:[],papel:{},ferr:{},cortes:{total:0,pilhas:0,folhas:0},fila:[],montagem:[],alertas:[],sugestoes:[],folhasTotal:0};
  const need={};const add=(k,n)=>{need[k]=(need[k]||0)+n;};
  const itens=(st.plano.itens||[]).filter(i=>AT.pecaDef(i.pecaId)&&i.qtd>0);
  itens.forEach((it,idx)=>{
    const c=AT.efetiva(st,it.pecaId);
    if(it.papel&&c.base.papeis.includes(it.papel)){c.papel=it.papel;if(it.papel==='metal'){c.nfc=false;c.fundo=false;}if(!(c.papel==='matte'||c.papel==='vinil'))c.fundo=false;}
    const tam=AT.tamanhoImpresso(c,bd);
    const noFill=AT.semFill(c);
    const lay=AT.fitFill(tam.w,tam.h,m,c.papel==='metal'?'verge':c.papel,!noFill);
    const o={idx,pecaId:it.pecaId,nome:c.nome,qtd:it.qtd,papel:c.papel,tam,layout:lay,perSheet:lay.count,fit:lay.count>0,extra:[],c};
    if(!lay.count){res.alertas.push({tipo:'erro',txt:c.nome+' não cabe numa A4 com margem de '+m+' mm.'});res.itens.push(o);return;}
    o.sheets=Math.ceil(it.qtd/lay.count);o.sobra=o.sheets*lay.count-it.qtd;
    const printPaper=c.papel==='metal'?'verge':c.papel;
    o.printPaper=printPaper;
    add(printPaper,o.sheets);
    let cutsStacks=Math.ceil(o.sheets/pilha),cutTotal=lay.cutsAll.total*cutsStacks;
    if(c.papel==='metal'){
      const lb=AT.fit(c.w,c.h,m);
      o.base={layout:lb,perSheet:lb.count,sheets:lb.count?Math.ceil(it.qtd/lb.count):0};
      add('metal',o.base.sheets);add('comum',1);
      cutTotal+=lb.cuts.total*Math.ceil(o.base.sheets/pilha);
      if(!lb.count)res.alertas.push({tipo:'erro',txt:c.nome+': a base azul não cabe numa A4.'});
    }
    o.cortes=cutTotal;o.cutTotalArte=cutTotal;res.itens.push(o);return;
  });
  AT._finalizaPlano(st,res,need,add,pilha,m);
  itens.forEach(()=>{});
  res.itens.forEach(o=>{
    if(!o.fit)return;const c=o.c,it={qtd:o.qtd};
    res.cortes.total+=o.cortes;res.cortes.pilhas+=Math.ceil(o.sheets/pilha);res.cortes.folhas+=o.sheets+(o.base?o.base.sheets:0);
    if(c.base.manta)add('manta',o.sheets);
    Object.entries(c.base.usa||{}).forEach(([k,v])=>add(k,v*it.qtd));
    if(c.nfc&&c.papel!=='metal')add('nfc',it.qtd);
  });
  /* saldo */
  Object.keys(need).forEach(k=>{
    const i=inv[k]||{nome:k,qtd:null,unid:''};
    const have=i.qtd;const saldo=have==null?null:have-need[k];
    res.papel[k]={id:k,nome:i.nome,unid:i.unid,need:r2(need[k]),have,saldo:saldo==null?null:r2(saldo),min:i.min,
      falta:saldo!=null&&saldo<0,baixo:saldo!=null&&saldo>=0&&i.min!=null&&saldo<i.min,semQtd:have==null};
  });
  Object.values(res.papel).forEach(p=>{
    if(p.falta)res.alertas.push({tipo:'falta',txt:'Falta '+p.nome+': precisa de '+AT.fmt(p.need)+' e há '+p.have+' ('+AT.fmt(-p.saldo)+' a menos).',id:p.id});
    else if(p.baixo)res.alertas.push({tipo:'baixo',txt:'Estoque baixo de '+p.nome+' depois do plano: sobram '+AT.fmt(p.saldo)+' (mínimo '+p.min+').',id:p.id});
    else if(p.semQtd)res.alertas.push({tipo:'info',txt:'Preencha a quantidade de '+p.nome+' no Inventário. O plano precisa de '+AT.fmt(p.need)+'.',id:p.id});
  });
  /* sugestões de papel alternativo */
  Object.values(res.papel).filter(p=>p.falta).forEach(p=>{
    res.itens.filter(o=>o.fit&&(o.printPaper===p.id||(p.id==='metal'&&o.papel==='metal'))).forEach(o=>{
      o.c.base.papeis.filter(q=>q!==o.papel).forEach(q=>{
        if(q==='metal')return;
        const pp=q==='metal'?'verge':q;
        const t=AT.tamanhoImpresso(Object.assign({},o.c,{papel:q}),bd);
        const l=AT.fit(t.w,t.h,m);if(!l.count)return;
        const sh=Math.ceil(o.qtd/l.count);
        const h=inv[pp]&&inv[pp].qtd;if(h==null)return;
        const sal=h-(need[pp]||0)-sh;
        if(sal>=0)res.sugestoes.push({idx:o.idx,pecaId:o.pecaId,de:o.papel,para:q,folhas:sh,saldo:sal,txt:'Trocar '+o.nome+' de '+AT.PAPEIS[o.papel].curto+' para '+AT.PAPEIS[q].curto+': usa '+sh+' folhas e sobram '+sal+'.'});
      });
    });
  });
  res.ferr=Object.fromEntries(Object.entries(res.papel).filter(([k])=>!AT.PAPEIS[k]&&true));
  /* fila de impressão agrupada por papel */
  AT.ORDEM_PAPEL.filter(k=>k!=='metal').forEach(pp=>{
    const jobs=[];let n=0;
    res.itens.forEach(o=>{
      if(!o.fit)return;
      if(o.printPaper===pp&&pp!=='comum'&&o.sheets>0){jobs.push({idx:o.idx,pecaId:o.pecaId,nome:o.nome+(o.papel==='metal'?' (arte para colar no azul)':''),de:n+1,ate:n+o.sheets,sheets:o.sheets,tipo:'arte'});n+=o.sheets;}
      if(pp==='comum'&&o.base){jobs.push({idx:o.idx,pecaId:o.pecaId,nome:'Gabarito de colagem: '+o.nome,de:n+1,ate:n+1,sheets:1,tipo:'gabarito'});n+=1;}
    });
    res.kit.folhas.forEach((f,ki)=>{if(f.paper===pp){jobs.push({kit:ki,nome:'Folha-kit: '+[...new Set(f.cells.map(c=>AT.pecaDef(c.pecaId).nome))].join(' + '),de:n+1,ate:n+1,sheets:1,tipo:'kit'});n+=1;}});
    if(n)res.fila.push({papel:pp,total:n,jobs});
  });
  res.folhasTotal=res.fila.reduce((a,g)=>a+g.total,0);
  /* montagem */
  res.itens.forEach(o=>{
    if(!o.fit)return;
    const steps=[];
    if(o.papel==='metal'){
      steps.push('Corte as bases do azul metálico em '+AT.fmt(o.c.w)+' × '+AT.fmt(o.c.h)+' mm (sem imprimir; o azul nunca entra na impressora com tinta).');
      steps.push('Corte as artes do vergê em '+AT.fmt(o.tam.w)+' × '+AT.fmt(o.tam.h)+' mm.');
      steps.push('Use o gabarito de colagem: base no contorno, arte no tracejado, borda azul de '+AT.fmt(bd)+' mm em volta.');
    }else{if(o.sheets>0)steps.push('Corte as '+o.sheets+' folhas pelo roteiro (peças de '+AT.fmt(o.c.w)+' × '+AT.fmt(o.c.h)+' mm).');if(o.kitQtd)steps.push('As outras '+o.kitQtd+' peças saem da folha-kit (veja Folhas e corte).');}
    if(o.c.base.manta)steps.push('Antes de cortar: cole a folha matte impressa na manta magnética. Corte as duas juntas. A manta nunca entra na impressora.');
    (o.c.base.montagem||[]).forEach(s=>steps.push(s));
    if(o.c.nfc&&o.papel!=='metal')steps.push('Cole a etiqueta NFC no verso, sobre o papel (nunca sobre o azul metálico). Grave e teste antes de fechar.');
    if(o.c.fold)steps.push('Vinque e dobre na marca de dobra.');
    res.montagem.push({idx:o.idx,pecaId:o.pecaId,nome:o.nome,qtd:o.qtd,steps});
  });
  res.itens.forEach(o=>{
    if(o.c&&o.c.papel==='kraft'&&o.fit)res.alertas.push({tipo:'info',txt:o.nome+' no kraft: tinta escura apenas (aplicada automaticamente).'});
  });
  return res;
};

/* assistente: acha o maior número de kits que cabe */
AT.itensDaLinha=function(linhaId,kits){
  const L=AT.LINHAS[linhaId];return Object.entries(L.pecas).map(([id,q])=>({pecaId:id,qtd:q*kits}));
};
AT.cabe=function(st,itens){
  const tmp=JSON.parse(JSON.stringify(st));tmp.plano={itens};
  const r=AT.calcPlano(tmp);return {ok:!r.alertas.some(a=>a.tipo==='falta'||a.tipo==='erro'),r};
};
AT.maxKits=function(st,linhaId,desejado,extraItens){
  let k=desejado,res=null;
  const mk=n=>(extraItens||[]).concat(AT.itensDaLinha(linhaId,n));
  let c=AT.cabe(st,mk(k));
  if(c.ok)return {kits:k,r:c.r,limitado:false};
  let lo=0,hi=k;
  while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(AT.cabe(st,mk(mid)).ok)lo=mid;else hi=mid-1;}
  c=AT.cabe(st,mk(lo));
  return {kits:lo,r:c.r,limitado:true};
};
})(window);
