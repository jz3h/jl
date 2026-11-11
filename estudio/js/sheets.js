/* Folhas A4: peças + marcas de corte nas margens. */
(function(G){'use strict';
const AT=G.AT=G.AT||{};
const W=210,H=297,r2=n=>Math.round(n*100)/100;
const MK='#000000';

AT.marksSvg=function(info,o){
  const m=info.m,f=AT.fmt;let s='';
  const L=(x1,y1,x2,y2,ex)=>'<line x1="'+r2(x1)+'" y1="'+r2(y1)+'" x2="'+r2(x2)+'" y2="'+r2(y2)+'" '+(ex||'')+'/>';
  let pv=-99;
  info.cuts.v.forEach(x=>{
    s+=L(x,m-1.5,x,m-0.3,'class="mk" data-d="v" data-p="'+x+'"')+L(x,H-m+0.3,x,H-m+1.5,'class="mk" data-d="v" data-p="'+x+'"');
    const cl=(x-pv)<8;pv=x;
    s+=cl?'<text x="'+r2(x-0.45)+'" y="'+r2(m-0.55)+'" text-anchor="end" class="mt">'+f(x)+'</text>':'<text x="'+r2(x+0.45)+'" y="'+r2(m-0.55)+'" class="mt">'+f(x)+'</text>';
  });
  let ph=-99;
  info.cuts.h.forEach(y=>{
    s+=L(m-1.5,y,m-0.3,y,'class="mk" data-d="h" data-p="'+y+'"')+L(W-m+0.3,y,W-m+1.5,y,'class="mk" data-d="h" data-p="'+y+'"');
    const cl=(y-ph)<8;ph=y;
    s+='<text transform="translate('+r2(m-0.75)+' '+r2(cl?y-0.45:y+3.6)+') rotate(-90)" class="mt">'+f(y)+'</text>';
  });
  (info.folds||[]).forEach(fd=>{
    const T=(x1,y1,x2,y2)=>L(x1,y1,x2,y2,'class="fd" data-d="'+fd.dir+'" data-p="'+fd.pos+'"');
    if(fd.dir==='v'){
      [-0.3,0.3].forEach(o=>{s+=T(fd.pos+o,m-1.5,fd.pos+o,m-0.3)+T(fd.pos+o,H-m+0.3,fd.pos+o,H-m+1.5);});
      s+='<text x="'+r2(fd.pos+0.8)+'" y="'+r2(m-0.55)+'" class="mt">dobra</text>';
    }else{
      [-0.3,0.3].forEach(o=>{s+=T(m-1.5,fd.pos+o,m-0.3,fd.pos+o)+T(W-m+0.3,fd.pos+o,W-m+1.5,fd.pos+o);});
      s+='<text transform="translate('+r2(m-0.75)+' '+r2(fd.pos+4.1)+') rotate(-90)" class="mt">dobra</text>';
    }
  });
  /* régua de calibração de 100 mm */
  const ry=m-2.6;
  s+=L(55,ry,155,ry,'class="rg" stroke-width="0.15"');
  for(let i=0;i<=10;i++)s+=L(55+i*10,ry-(i%5===0?0.7:0.4),55+i*10,ry+(i%5===0?0.7:0.4),'class="rg" stroke-width="0.12"');
  s+='<text x="156.5" y="'+r2(ry+0.4)+'" class="mt">100 mm</text><text x="40" y="'+r2(ry+0.4)+'" class="mt">régua de conferência</text>';
  if(o&&o.guides){
    const c=info.cuts,b=info.bbox;
    c.v.forEach(x=>{s+=L(x,b.y0,x,b.y1,'class="gd"');});
    c.h.forEach(y=>{s+=L(b.x0,y,b.x1,y,'class="gd"');});
  }
  return '<svg class="marks" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'mm" height="'+H+'mm" style="position:absolute;left:0;top:0;pointer-events:none">'+
   '<g fill="none" stroke="'+MK+'" stroke-linecap="butt"><style>.mk{stroke:'+MK+';stroke-width:.12}.fd{stroke:'+MK+';stroke-width:.12}.rg{stroke:'+MK+'}.mt{font:3.3px/1 Arial,Helvetica,sans-serif;fill:'+MK+';stroke:none}.gd{stroke:#CBD5E1;stroke-width:.1323;stroke-dasharray:.8 .6}</style>'+s+'</g></svg>';
};

function bboxOf(cells){return {x0:Math.min(...cells.map(c=>c.x)),y0:Math.min(...cells.map(c=>c.y)),x1:Math.max(...cells.map(c=>c.x+c.w)),y1:Math.max(...cells.map(c=>c.y+c.h))};}

/* renderiza uma célula (peça efetiva + variante) com cache */
function cellHtml(cl,c,cache,warn,tam){
  const k=c.id+'|'+c.papel+'|'+(cl.variant||'')+'|'+tam.w+'x'+tam.h;
  if(!cache[k]){const r=AT.renderPiece(c,{w:tam.w,h:tam.h,variant:cl.variant});cache[k]=r.html;r.warn.forEach(x=>warn.push(c.nome+': '+x));}
  const p=cache[k];
  const inner=cl.rot?'<div style="position:absolute;left:0;top:0;width:'+tam.w+'mm;height:'+tam.h+'mm;transform-origin:0 0;transform:translate('+cl.w+'mm,0) rotate(90deg)">'+p+'</div>':p;
  return '<div class="cell" data-peca="'+c.id+'"'+(cl.fill?' data-fill="1"':'')+' style="position:absolute;left:'+cl.x+'mm;top:'+cl.y+'mm;width:'+cl.w+'mm;height:'+cl.h+'mm;overflow:hidden">'+inner+'</div>';
}
function foldsOf(c,cells){
  const folds=[];
  if(c.base.fold&&c.papel!=='metal'){
    const seen={};
    cells.forEach(cl=>{
      const d=cl.rot?'h':'v',pos=r2((cl.rot?cl.y:cl.x)+c.base.fold);
      const k=d+pos;if(!seen[k]){seen[k]=1;folds.push({dir:d,pos});}
    });
  }
  return folds;
}

/* c = peça efetiva; folha de arte (com faixa livre preenchida quando >= 20 mm) */
AT.sheetArte=function(st,c,o){
  o=o||{};
  const cfg=st.config,m=cfg.margem;
  const tam=AT.tamanhoImpresso(c,cfg.borda);
  const paper=c.papel==='metal'?'verge':c.papel;
  const lay=AT.fitFill(tam.w,tam.h,m,paper,!AT.semFill(c));
  if(!lay.count)return {html:'<section class="sheet"><p style="padding:20mm">Não cabe na A4.</p></section>',info:null,warn:['não cabe']};
  const vars=c.base.variantes;
  const cache={},warn=[];
  let cellsHtml='';
  lay.cells.forEach(cl=>{cellsHtml+=cellHtml(Object.assign({variant:vars?vars[cl.col%vars.length]:null},cl),c,cache,warn,tam);});
  const fcache={};
  lay.fill.forEach(cl=>{
    const fc=AT.efetivaPapel(st,cl.pecaId,paper);
    cellsHtml+=cellHtml(cl,fc,fcache,warn,{w:cl.w,h:cl.h});
  });
  const folds=foldsOf(c,lay.cells);
  const all=lay.cells.concat(lay.fill);
  const info={pecaId:c.id,nome:c.nome,papel:paper,kind:'arte',m,cuts:lay.cutsAll,folds,cells:all.map(x=>({x:x.x,y:x.y,w:x.w,h:x.h,rot:x.rot,fill:!!x.fill,pecaId:x.pecaId||c.id})),
   bbox:bboxOf(all),fundo:!!c.fundo,count:lay.count,nFill:lay.fill.length,pw:tam.w,ph:tam.h,metal:c.papel==='metal'};
  const label=o.label?'<div class="slabel">'+o.label+'</div>':'';
  const html='<section class="sheet" data-paper="'+info.papel+'" data-peca="'+c.id+'" data-kind="arte">'+cellsHtml+AT.marksSvg(info,{guides:cfg.guias})+label+'</section>';
  return {html,info,warn,layout:lay};
};

/* folha-kit: peças diferentes de uma mesma linha e papel numa folha só */
AT.sheetKit=function(st,plano,kf){
  const cfg=st.config,m=cfg.margem,warn=[],cache={},fcache={},folds=[];
  let cellsHtml='';
  kf.cells.forEach(cl=>{
    const it=plano.itens.find(x=>x.idx===cl.idx);
    cellsHtml+=cellHtml(cl,it.c,cache,warn,{w:cl.w,h:cl.h});
    foldsOf(it.c,[cl]).forEach(f=>{if(!folds.some(x=>x.dir===f.dir&&x.pos===f.pos))folds.push(f);});
  });
  kf.fill.forEach(cl=>{cellsHtml+=cellHtml(cl,AT.efetivaPapel(st,cl.pecaId,kf.paper),fcache,warn,{w:cl.w,h:cl.h});});
  const all=kf.cells.concat(kf.fill);
  const info={pecaId:'kit',nome:'Folha-kit',papel:kf.paper,kind:'kit',m,cuts:kf.cuts,folds:folds,cells:all.map(x=>({x:x.x,y:x.y,w:x.w,h:x.h,rot:false,fill:!!x.fill,pecaId:x.pecaId})),bbox:bboxOf(all),count:kf.cells.length,nFill:kf.fill.length};
  const html='<section class="sheet" data-paper="'+kf.paper+'" data-peca="kit" data-kind="kit">'+cellsHtml+AT.marksSvg(info,{guides:cfg.guias})+'</section>';
  return {html,info,warn};
};

/* gabarito de colagem (papel comum): contorno da base e tracejado da arte */
AT.sheetGabarito=function(st,c,o){
  const cfg=st.config,m=cfg.margem,b=cfg.borda;
  const lay=AT.fit(c.w,c.h,m);
  let cellsHtml='';
  lay.cells.forEach(cl=>{
    const iw=cl.w-2*b,ih=cl.h-2*b;
    cellsHtml+='<div style="position:absolute;left:'+cl.x+'mm;top:'+cl.y+'mm;width:'+cl.w+'mm;height:'+cl.h+'mm;box-sizing:border-box;border:0.25mm solid #475569"><div style="position:absolute;left:'+b+'mm;top:'+b+'mm;width:'+iw+'mm;height:'+ih+'mm;box-sizing:border-box;border:0.25mm dashed #64748B;display:flex;align-items:center;justify-content:center;font:600 6pt/1.2 Arial,sans-serif;color:#475569;text-align:center">arte<br>'+AT.fmt(iw)+' × '+AT.fmt(ih)+'</div></div>';
  });
  const info={pecaId:c.id,nome:c.nome,papel:'comum',kind:'gabarito',m,cuts:{v:[],h:[],steps:[],total:0},folds:[],cells:lay.cells.map(x=>({x:x.x,y:x.y,w:x.w,h:x.h,rot:x.rot})),bbox:bboxOf(lay.cells),count:lay.count};
  const txt='<div style="position:absolute;left:'+m+'mm;top:'+(H-m-5)+'mm;font:600 7pt/1.2 Arial,sans-serif;color:#334155;width:'+(W-2*m)+'mm">Gabarito de colagem · '+c.nome+' · coloque a base azul no contorno cheio e a arte do vergê no tracejado (borda azul de '+AT.fmt(b)+' mm). Imprima em papel comum.</div>';
  return {html:'<section class="sheet" data-paper="comum" data-peca="'+c.id+'" data-kind="gabarito">'+cellsHtml+txt+'</section>',info,warn:[]};
};

/* todas as folhas de um grupo de papel da fila */
AT.sheetsDoPlano=function(st,plano,papel){
  const out=[],infos=[],warns=[];
  const grupos=plano.fila.filter(g=>!papel||g.papel===papel);
  grupos.forEach(g=>{
    g.jobs.forEach(j=>{
      const it=plano.itens.find(x=>x.idx===j.idx);
      const c=it&&it.c;
      if(j.tipo==='kit'){const r=AT.sheetKit(st,plano,plano.kit.folhas[j.kit]);out.push(r.html);infos.push(r.info);r.warn.forEach(w=>warns.push(w));return;}
      if(j.tipo==='gabarito'){const r=AT.sheetGabarito(st,c);out.push(r.html);infos.push(r.info);return;}
      for(let n=0;n<j.sheets;n++){
        const r=AT.sheetArte(st,c,{});out.push(r.html);infos.push(r.info);r.warn.forEach(w=>warns.push(c.nome+': '+w));
      }
    });
  });
  return {html:out.join(''),infos,warns};
};
})(window);
