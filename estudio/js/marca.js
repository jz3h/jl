/* Coleção Marca: paletas, estilo do nome e as 8 peças novas (desenhos aprovados em .dc.html).
   Os modelos HTML estão em marca_tpl.js, em px do desenho; aqui viram mm. Sem dependências. */
(function(G){'use strict';
const AT=G.AT=G.AT||{};
const PT=0.352778;
const QR='assets/qr.png';

/* ---------- sistema de marca ---------- */
AT.PALETAS={
 longitudinal:{nome:'Longitudinal',ink:'#14323A',onink:'#F4EFE6',acc:'#B23A28',acc2:'#E8866A',paper:'#FBFAF6',soft:'#DCE6E2',line:'#C9D3CF'},
 noite:{nome:'Noite',ink:'#0E1E33',onink:'#F3EBDD',acc:'#8A6A2A',acc2:'#D9B46A',paper:'#F6F1E6',soft:'#E9E1CF',line:'#D6CCB6'},
 musgo:{nome:'Musgo',ink:'#1F3A2E',onink:'#F2EEE2',acc:'#9A5E12',acc2:'#E3A857',paper:'#F7F5EE',soft:'#E3E6D6',line:'#CDD2BF'},
 bordo:{nome:'Bordô',ink:'#4A1525',onink:'#F6EDE2',acc:'#8C5F24',acc2:'#D8B07A',paper:'#FAF6F0',soft:'#EFE3D6',line:'#DCCBB8'},
 grafite:{nome:'Grafite',ink:'#22262B',onink:'#F2F0EC',acc:'#B8432C',acc2:'#F08A6E',paper:'#FAF9F7',soft:'#E7E4DF',line:'#D3CFC8'}
};
AT.METAL_CHAVEIRO='#2C4F86';
AT.ESTILOS_NOME={
 grotesca:{nome:'Grotesca (Bricolage Grotesque)',fam:"'Bricolage Grotesque', sans-serif",peso:800,k:1},
 serifa:{nome:'Serifa (Source Serif 4)',fam:"'Source Serif 4', Georgia, serif",peso:600,k:62/60}
};
AT.MARCA_PADRAO={paleta:'longitudinal',nome:'grotesca'};
AT.GRUPOS_PECA={marca:'Coleção Marca',util:'Consultório e utilidades'};
AT.GRUPOS_LINHA={marca:'Coleção Marca',util:'Consultório'};

/* px do desenho -> mm. Texto nunca abaixo de 6,6 pt no papel. */
function mm(html,U){
  const minPx=6.6*PT/U;
  html=html.replace(/font-size:\s*(\d+(?:\.\d+)?)px/g,(m,n)=>'font-size:'+(Math.max(+n,minPx)*U).toFixed(4)+'mm');
  return html.replace(/(-?\d*\.?\d+)px/g,(m,n)=>(+n*U).toFixed(4)+'mm');
}
function nomeEstilo(c){
  const e=AT.ESTILOS_NOME[c.estilo]||AT.ESTILOS_NOME.grotesca,ser=e===AT.ESTILOS_NOME.serifa;
  return {fam:e.fam,
   n:(px,lh,eg,es)=>'font-family:'+e.fam+';font-size:'+(px*e.k).toFixed(2)+'px;line-height:'+lh+';font-weight:'+e.peso+';letter-spacing:'+(ser?es:eg)};
}
const SERIE_MARC=['longitudinal','noite','bordo'];
const SERIE_A6=[['longitudinal','ink'],['longitudinal','paper'],['bordo','ink'],['noite','paper']];
function pal(c){return AT.PALETAS[c.pal]||AT.PALETAS.longitudinal;}
const serie=c=>c.paleta==='serie'&&c.base.serie;

/* ---------- calendário 2027 (feriados calculados) ---------- */
function meses2027(c){
  const Y=2027;
  const a=Y%19,b=Math.floor(Y/100),cc=Y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(cc/4),k=cc%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  const pm=Math.floor((h+l-7*m+114)/31),pd=((h+l-7*m+114)%31)+1;
  const pascoa=new Date(Y,pm-1,pd);
  const mov=n=>{const x=new Date(pascoa);x.setDate(x.getDate()+n);return (x.getMonth()+1)+'-'+x.getDate();};
  const fer=new Set(['1-1','4-21','5-1','9-7','9-20','10-12','11-2','11-15','11-20','12-25',mov(-48),mov(-47),mov(-2),mov(60)]);
  AT.FERIADOS_2027=[...fer];
  const nomes=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return nomes.map((nome,mi)=>{
    const ini=new Date(Y,mi,1).getDay(),tot=new Date(Y,mi+1,0).getDate(),dias=[];
    for(let x=0;x<ini;x++)dias.push({n:'',peso:400,cor:c.ink});
    for(let dd=1;dd<=tot;dd++){
      const dom=new Date(Y,mi,dd).getDay()===0,f2=fer.has((mi+1)+'-'+dd);
      dias.push({n:dd,peso:f2?800:(dom?600:500),cor:f2?c.acc:c.ink});
    }
    return {nome,cor:mi%2?c.ink:c.acc,dias};
  });
}

/* ---------- desenhos ---------- */
const FRASES_MARC=[
 {num:'1',frase:'Leia devagar. Viva também.'},
 {num:'2',frase:'Um capítulo por dia. Um check-up por ano.'},
 {num:'3',frase:'Toda história merece ser lida inteira.'}];
const TIT_A6=[
 {titulo:'Alguém precisa juntar as peças.',texto:'Cada especialista olha uma parte. O médico de família olha você inteiro e coordena o resto.'},
 {titulo:'Quem lê a sua lista de remédios inteira?',texto:'Traga todos, até os vitamínicos. A gente revisa junto o que segue e o que pode sair.'},
 {titulo:'Antes do próximo especialista, marque uma conversa.',texto:'Às vezes o que falta não é mais um exame. É alguém que escute a história toda.'},
 {titulo:'Check-up não é só exame. É conversa.',texto:'Os exames certos para a sua idade e a sua história. Nada além.'}];
const TALVEZ=[
 'Já passou por vários médicos e ninguém juntou as peças.',
 'Toma muitos remédios e não sabe mais para que serve cada um.',
 'Dorme mal, vive cansado e ouviu que é “só estresse”.',
 'Tem uma dor que não passa e já cansou de analgésico.',
 'Cuida de um pai ou de uma mãe e precisa de um médico que vá até a casa.',
 'Quer prevenir sem uma bateria de exames que não muda nada.'].map((txt,i)=>({n:String(i+1).padStart(2,'0'),txt}));
const ELO='<div style="display: flex; align-items: center"><div style="flex-grow: 1; height: 2px; background: COR"></div><div style="width: 14px; height: 14px; border-radius: 50%; background: COR"></div><div style="width: 24px; height: 2px; background: COR"></div></div>';

const R={};
R.m_cartao=(c,v,w,h)=>{
  const P=pal(c),t=c.estilo==='serifa'?{nome:AT.ESTILOS_NOME.serifa.fam,tam:'62px',peso:600,esp:'-0.02em'}:{nome:AT.ESTILOS_NOME.grotesca.fam,tam:'60px',peso:800,esp:'-0.035em'};
  return mm(AT.TPL.cartao(P,t,QR),w/660);
};
R.m_folheto_a4=(c,v,w,h)=>mm(AT.TPL.folheto(pal(c),TALVEZ,nomeEstilo(c),QR),w/794);
R.m_ima_calendario=(c,v,w,h)=>{const P=pal(c);return mm(AT.TPL.calendario(P,meses2027(P),['D','S','T','Q','Q','S','S'],nomeEstilo(c),QR),w/888);};
R.m_bloco=(c,v,w,h)=>{
  const P=pal(c),vz=['','','','',''];
  const grupos=[{nome:'Mercado',linhas:vz.concat(['',''])},{nome:'Casa',linhas:['','','']},{nome:'Saúde',linhas:['Marcar o check-up do ano','Levar a lista de remédios na consulta','']}];
  return mm(AT.TPL.bloco(P,grupos,nomeEstilo(c),QR),w/594);
};
R.m_marcador=(c,v,w,h)=>{
  const d=c.base,i=Math.max(0,d.variantes.indexOf(v)),P=serie(c)?AT.PALETAS[SERIE_MARC[i%3]]:pal(c);
  const m=Object.assign({},P,FRASES_MARC[i%3]);
  return mm(AT.TPL.marcador(m,['1','2','3','4','5','6','7','8','9'],nomeEstilo(c),QR),w/270);
};
R.m_serie_a6=(c,v,w,h)=>{
  const d=c.base,i=Math.max(0,d.variantes.indexOf(v));
  const [pn,tom]=serie(c)?SERIE_A6[i%4]:[c.pal,i%2?'paper':'ink'];
  const P=AT.PALETAS[pn],m=Object.assign({},TIT_A6[i%4],tom==='ink'?{fundo:P.ink,txt:P.onink,acc:P.acc2}:{fundo:P.paper,txt:P.ink,acc:P.acc});
  return mm(AT.TPL.serie(m,nomeEstilo(c),QR),w/340);
};
R.m_chaveiro=(c,v,w,h)=>{
  const P=pal(c),t=nomeEstilo(c),ser=c.estilo==='serifa';
  const furo=cor=>'<div aria-hidden="true" style="position: absolute; top: 18px; left: 50%; margin-left: -14px; width: 28px; height: 28px; border-radius: 50%; background: #ECE8E1; box-shadow: inset 0 0 0 3px '+cor+'"></div>';
  const base='position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; box-sizing: border-box; text-align: center; font-family: \'Bricolage Grotesque\', sans-serif;';
  let html;
  if(v==='Verso'){
    html=`<div style="${base} background: ${P.paper}; color: ${P.ink}; padding: 62px 18px 24px">
 ${furo(P.acc)}
 <div style="display: flex; flex-direction: column; gap: 10px; align-items: center">
  <div style="font-family: 'Source Serif 4', serif; font-size: 22px; line-height: 1.12; font-style: italic">Meu próximo<br>check-up</div>
  <div style="display: flex; gap: 6px; align-items: flex-end; font-size: 22px; font-weight: 700; color: ${P.acc}">
   <span style="width: 36px; border-bottom: 2px solid ${P.ink}; height: 26px"></span>/<span style="width: 36px; border-bottom: 2px solid ${P.ink}; height: 26px"></span>/<span style="width: 56px; border-bottom: 2px solid ${P.ink}; height: 26px"></span>
  </div>
 </div>
 <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
  <div style="background: #FFFFFF; border-radius: 10px; padding: 4px"><img src="${QR}" alt="QR para jz3h.github.io/jl" style="display: block; width: 116px; height: 116px"></div>
  <div style="font-size: 14px; font-weight: 700">Aponte a câmera e marque</div>
 </div>
 <div style="font-size: 22px; font-weight: 800">(51) 99816-5913</div>
</div>`;
  }else{
    html=`<div style="${base} background: ${P.ink}; color: ${P.onink}; padding: 64px 18px 26px">
 ${furo(P.acc2)}
 <div style="width: 100%; display: flex; align-items: center; gap: 0">
  <div style="flex-grow: 1; height: 2px; background: ${P.acc2}"></div>
  <div style="width: 14px; height: 14px; border-radius: 50%; background: ${P.acc2}"></div>
  <div style="width: 26px; height: 2px; background: ${P.acc2}"></div>
 </div>
 <div style="display: flex; flex-direction: column; gap: 10px">
  <div style="font-size: 14px; font-weight: 700; letter-spacing: 0.3em; color: ${P.acc2}">DR.</div>
  <div style="${t.n(44,0.92,'-0.035em','-0.02em')}">José<br>Linhares</div>
  <div style="font-family: 'Source Serif 4', serif; font-size: 18px; line-height: 1.2; font-style: italic">Médico de Família<br>e Comunidade</div>
 </div>
 <div style="font-size: 14px; font-weight: 600; line-height: 1.35">CRM-RS 49835<br>RQE 41886</div>
</div>`;
  }
  return mm(html,w/222);
};
R.m_tag_natal=(c,v,w,h)=>{
  const P=pal(c),kraft=c.papel==='kraft';
  const ink=kraft?'#2A1D12':P.ink,acc=kraft?'#5A2A14':P.acc;
  const html=`<div style="position: relative; width: 100%; height: 100%; color: ${ink}; padding: 80px 26px 26px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; font-family: 'Bricolage Grotesque', sans-serif">
 <svg aria-hidden="true" viewBox="0 0 300 540" preserveAspectRatio="none" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible"><g fill="none" stroke="${ink}" stroke-width="1.4" stroke-dasharray="6 5" stroke-linecap="butt"><line x1="0" y1="48.6" x2="66" y2="0"/><line x1="234" y1="0" x2="300" y2="48.6"/></g><circle cx="150" cy="36" r="11" fill="none" stroke="${ink}" stroke-width="1.8"/></svg>
 <div style="display: flex; flex-direction: column; gap: 14px">
  <div style="font-size: 14px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: ${acc}">Boas festas</div>
  <div style="font-family: 'Source Serif 4', serif; font-size: 33px; line-height: 1.08; font-style: italic; font-weight: 500">Que 2027 venha com saúde. E com tempo.</div>
  ${ELO.replace(/COR/g,acc)}
 </div>
 <div style="display: flex; flex-direction: column; gap: 18px; font-size: 18px; font-weight: 700">
  <div style="border-bottom: 2px solid ${ink}; padding-bottom: 4px">Para:</div>
  <div style="border-bottom: 2px solid ${ink}; padding-bottom: 4px">De:</div>
 </div>
 <div style="font-size: 14px; font-weight: 600; line-height: 1.35">Dr. José Linhares · Médico de Família<br>CRM-RS 49835 · RQE 41886</div>
</div>`;
  return mm(html,w/300);
};

/* ---------- catálogo ---------- */
const NOTA_TINTA='Fundo chapado em cor: a arte vai até a borda da peça, sem sobra, e as peças encostadas na folha têm a mesma cor para o corte cair entre elas. Fundo escuro gasta mais tinta e molha mais o papel: imprima uma folha de teste, deixe secar e só então empilhe.';
function def(o){
  return Object.assign({papeis:['matte','verge'],papel:'matte',usa:{},montagem:[],qr:true,marca:true,raw:true,semKit:true,familia:'marca',novo:true,fixo:true,frase:'',sub:'',linhas:[],notaTinta:NOTA_TINTA,
   render:null},o);
}
const NOVAS=[
 def({id:'m_cartao',nome:'Cartão dobrável',w:100,h:90,fold:50,alternaGiro:true,papeis:['matte','verge'],papel:'matte',
  desc:'Cartão aberto 100 × 90 mm (dois painéis de 50 × 90, como um cartão de visita), impresso de um lado e dobrado no meio.',
  porque:'Cabe na carteira e leva direto ao agendamento: o QR abre o site do consultório.',
  montagem:['Vinque na marca de dobra (traços duplos nas margens) e dobre ao meio com a arte para fora: o nome fica na frente e o QR atrás. O miolo fica em branco para escrever.']}),
 def({id:'m_folheto_a4',nome:'Folheto A4',w:203,h:290,papeis:['matte','verge'],papel:'matte',
  desc:'Folheto de página quase inteira, 203 × 290 mm (cabe na margem de 3,5 mm).',
  porque:'Explica em uma página para quem o consultório serve e leva ao agendamento.',
  montagem:['Imprima em A4, escala 100%, sem ajustar à página. A arte tem 203 × 290 mm e deixa 3,5 mm livres em volta, então não precisa de impressão sem bordas.']}),
 def({id:'m_ima_calendario',nome:'Ímã calendário 2027',w:140,h:200,papeis:['matte'],papel:'matte',manta:true,
  desc:'Calendário 2027 em formato A5 reduzido, 140 × 200 mm, com feriados nacionais e do RS em destaque. Base para manta magnética.',
  porque:'Fica o ano inteiro na geladeira, com o mês do check-up circulado.',
  montagem:[]}),
 def({id:'m_chaveiro',nome:'Chaveiro-tag (frente e verso)',w:37,h:77,papeis:['verge'],papel:'verge',par:true,variantes:['Frente','Verso'],nfcOk:true,nfcPadrao:true,usa:{argolas:1},
  baseMetal:{w:40,h:80},
  desc:'Duas faces de 37 × 77 mm lado a lado; a base de azul metálico é cortada em 40 × 80 mm (1,5 mm maior em cada lado).',
  porque:'Vai junto com a chave de casa e lembra o check-up todo dia.',
  montagem:['Corte as bases do azul metálico em 40 × 80 mm (sem imprimir). Cole uma face de cada lado, centralizada, com 1,5 mm de borda azul em volta.','Fure no círculo e passe a argola. Fita adesiva transparente por cima deixa à prova de bolso.'],
  notas:['Etiqueta NFC (opcional): cole entre o vergê e a fita, no verso, longe do metal. Grave o endereço jz3h.github.io/jl.','Os cantos saem retos (corte de guilhotina); se quiser arredondar, use um cortador de cantos de 3 mm depois de colar.']}),
 def({id:'m_tag_natal',nome:'Tag de presente',w:50,h:90,papeis:['verge','kraft'],papel:'verge',qr:false,qrNao:true,
  desc:'Tag de presente de fim de ano, 50 × 90 mm, no vergê (cor da marca) ou no kraft (tinta escura).',
  porque:'Acompanha o presente de fim de ano de família, colegas e parceiros.',
  montagem:['Corte os dois cantos do topo na diagonal, pelos tracejados, e fure no círculo.','Amarre com juta no prendedor de madeira ou na sacolinha de celofane.'],
  notaTinta:'Sem fundo chapado: o fundo é o próprio papel (vergê ou kraft), então gasta pouca tinta. No kraft só tinta escura, aplicada automaticamente.'}),
 def({id:'m_marcador',nome:'Marcador de livro',w:45,h:180,papeis:['matte','verge'],papel:'matte',serie:true,
  variantes:FRASES_MARC.map(f=>f.frase),
  opcoes:[{k:'variante',rotulo:'Frase da série',padrao:'',valores:[['','Série: uma frase por folha, alternando']].concat(FRASES_MARC.map(f=>[f.frase,f.num+'. '+f.frase]))}],
  desc:'Marcador 45 × 180 mm. Série de 3 frases; cada folha sai com uma frase só.',
  porque:'Fica no livro que a pessoa está lendo e lembra o check-up do ano.',
  montagem:['Cada folha sai com uma frase só, para as peças encostadas terem a mesma cor. As outras frases da série saem nas folhas seguintes.']}),
 def({id:'m_bloco',nome:'Bloco de geladeira',w:99,h:210,papeis:['matte','verge'],papel:'matte',
  desc:'Lista da semana 99 × 210 mm, com campos em branco e um lembrete de saúde.',
  porque:'Fica na geladeira e é usado toda semana, com o QR sempre à vista.',
  montagem:['Empilhe as folhas alinhadas, passe cola de bloco no topo (cerca de 3 mm), deixe secar e destaque folha a folha.']}),
 def({id:'m_serie_a6',nome:'Série A6 (4 títulos)',w:100,h:142,papeis:['matte','verge'],papel:'matte',serie:true,
  variantes:TIT_A6.map(t=>t.titulo),
  opcoes:[{k:'variante',rotulo:'Título',padrao:'',valores:[['','Série: um título por folha, alternando']].concat(TIT_A6.map((t,i)=>[t.titulo,(i+1)+'. '+t.titulo]))}],
  desc:'Folheto A6 reduzido, 100 × 142 mm. Quatro folhetos com títulos diferentes; cada folha A4 sai com um título só.',
  porque:'Cada folheto responde uma pergunta só, e quem lê escolhe a que serve.',
  montagem:['Cada folha sai com um título só, para as peças encostadas terem a mesma cor. Os outros títulos saem nas folhas seguintes.']})
];
NOVAS.forEach(p=>{p.render=R[p.id];});
AT.PECAS.forEach(p=>{p.familia=p.familia||'util';});
AT.PECAS=NOVAS.concat(AT.PECAS);
AT.pecaMarca=id=>{const d=AT.pecaDef(id);return !!(d&&d.marca);};

/* desenho de uma peça da coleção (chamado por AT.renderPiece) */
AT.renderMarca=function(c,o){
  const w=o.w||c.w,h=o.h||c.h,d=c.base;
  const v=o.variant||(d.variantes?d.variantes[0]:null);
  const inner=d.render(c,v,w,h);
  const html='<div class="pc" data-marca="1" data-piece="'+c.id+'" style="position:relative;width:'+w+'mm;height:'+h+'mm;overflow:hidden;font-family:\'Source Serif 4\',Georgia,serif;color:'+pal(c).ink+'">'+inner+'</div>';
  return {html,warn:[]};
};

/* confere a peça da coleção: texto dentro da zona segura, não cortado, ≥ 6,5 pt, sem sobreposição */
AT.checkMarca=function(pc,w,h){
  const issues=[],SAFE=AT.SAFE,r0=pc.getBoundingClientRect(),k=r0.width/w,tol=0.15;
  const tw=document.createTreeWalker(pc,NodeFilter.SHOW_TEXT),rects=[];
  let n;
  while((n=tw.nextNode())){
    const t=n.textContent.replace(/\s+/g,' ').trim();if(!t)continue;
    const el=n.parentElement,cs=getComputedStyle(el),pt=parseFloat(cs.fontSize)*0.75;
    if(pt<6.5-0.05)issues.push('texto pequeno ('+pt.toFixed(2)+' pt): '+t.slice(0,18));
    const rg=document.createRange();rg.selectNodeContents(n);
    for(const r of rg.getClientRects()){
      if(r.width<0.5||r.height<0.5)continue;
      let ty0=r.top,ty1=r.bottom;const lh=parseFloat(cs.lineHeight);
      if(lh>0&&lh<r.height-0.5){const mid=(r.top+r.bottom)/2;ty0=mid-lh/2;ty1=mid+lh/2;}
      const x0=(r.left-r0.left)/k,y0=(ty0-r0.top)/k,x1=(r.right-r0.left)/k,y1=(ty1-r0.top)/k;
      if(x0<SAFE-tol||y0<SAFE-tol||x1>w-SAFE+tol||y1>h-SAFE+tol)issues.push('texto fora da zona segura: '+t.slice(0,18));
      const sh=(y1-y0)*0.22;rects.push({x0,y0:y0+sh,x1,y1:y1-sh,t});
    }
  }
  pc.querySelectorAll('div,span,p,li').forEach(el=>{
    if(!(el.textContent||'').trim())return;
    if(el.firstElementChild==null&&el.scrollWidth>el.clientWidth+2)issues.push('texto cortado: '+el.textContent.trim().slice(0,18));
  });
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
    const a=rects[i],b=rects[j],ox=Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0),oy=Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0);
    if(ox>0.4&&oy>0.6)issues.push('textos sobrepostos: '+a.t.slice(0,12)+' / '+b.t.slice(0,12));
  }
  return [...new Set(issues)];
};

/* ---------- linhas da coleção nova (aparecem primeiro) ---------- */
const ANT=AT.LINHAS;
Object.values(ANT).forEach(l=>{l.grupo='util';l.nome=l.nome.replace(/^Linha /,'Consultório · ');});
AT.LINHAS=Object.assign({
 primeiro_contato:{grupo:'marca',marca:true,nome:'Primeiro contato',desc:'Para a primeira conversa: cartão dobrável, folheto da série A6 e marcador.',pecas:{m_cartao:1,m_serie_a6:1,m_marcador:1}},
 m_casa:{grupo:'marca',marca:true,nome:'Casa',desc:'Para ficar em casa: ímã calendário, bloco de geladeira e tag.',pecas:{m_ima_calendario:1,m_bloco:1,m_tag_natal:1}},
 fim_de_ano:{grupo:'marca',marca:true,nome:'Fim de ano',desc:'Para presentear: tag de presente, marcador e ímã calendário.',pecas:{m_tag_natal:1,m_marcador:1,m_ima_calendario:1}},
 chaveiro:{grupo:'marca',marca:true,nome:'Chaveiro',desc:'Chaveiro-tag com frente e verso e o cartão dobrável.',pecas:{m_chaveiro:1,m_cartao:1}},
 m_balcao:{grupo:'marca',marca:true,nome:'Balcão',desc:'Para parceiros: folheto A4, série A6 e cartões.',pecas:{m_folheto_a4:1,m_serie_a6:4,m_cartao:10}}
},ANT);
})(window);
