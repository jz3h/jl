/* Interface do Ateliê de Guerrilha. */
(function(G){'use strict';
const AT=G.AT, D=document;
const $=(s,r)=>(r||D).querySelector(s), $$=(s,r)=>Array.from((r||D).querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const clone=o=>JSON.parse(JSON.stringify(o));
const KEY='atelie.v1', PX=96/25.4;
const fmt=AT.fmt;
let verPapel=null,pvReal=false,selFolhaModo='peca',selKit={linha:'casa',papel:'matte'};
let st, tab='inventario', selPeca='m_cartao', selLinha='primeiro_contato', selFolha={pecaId:'m_cartao',papel:null}, printSel={papel:null,single:null}, saveT=null, lastPrint=null;
const ART={verge:'o vergê',kraft:'o kraft',matte:'o matte',vinil:'o vinil',comum:'o papel comum',metal:'o azul metálico'};

/* ---------- estado ---------- */
function defaults(){
  const s={v:1,inventario:clone(AT.INV_PADRAO),
   config:{margem:3.5,guias:false,pilha:6,borda:3,fonte:'jakarta',simbolo:'flower_of_life',tinta:'azul',marca:Object.assign({},AT.MARCA_PADRAO)},
   pecas:{},plano:{itens:[]},linhaAtiva:'m_casa',kits:10,linhasCfg:{},distrib:{},check:{},estrategia:{check:{},placar:{},link:'',pub:'',bairro:''}};
  s.plano.itens=AT.itensDaLinha('m_casa',10);
  return s;
}
function merge(base,o){
  if(!o||typeof o!=='object')return base;
  ['config','pecas','plano','linhasCfg','distrib','check','estrategia'].forEach(k=>{if(o[k]&&typeof o[k]==='object')base[k]=Object.assign(base[k],o[k]);});
  if(Array.isArray(o.inventario)){
    const m={};o.inventario.forEach(i=>{m[i.id]=i;});
    base.inventario=base.inventario.map(d=>m[d.id]?Object.assign({},d,{qtd:m[d.id].qtd==null||m[d.id].qtd===''?null:Number(m[d.id].qtd),min:m[d.id].min==null||m[d.id].min===''?null:Number(m[d.id].min)}):d);
  }
  base.config.marca=Object.assign({},AT.MARCA_PADRAO,base.config.marca||{});
  if(o.linhaAtiva&&AT.LINHAS[o.linhaAtiva])base.linhaAtiva=o.linhaAtiva;
  if(o.kits>0)base.kits=o.kits;
  return base;
}
function load(){try{const j=localStorage.getItem(KEY);if(j)return merge(defaults(),JSON.parse(j));}catch(e){}return defaults();}
G.addEventListener('pagehide',()=>{try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}});
function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}},200);}
function setState(s){st=s;AT.st=st;save();}

/* ---------- abas ---------- */
const TABS=[['inventario','Inventário','i-inv'],['pecas','Peças','i-peca'],['linhas','Linhas','i-linha'],['plano','Plano','i-plano'],['folhas','Folhas e corte','i-corte'],['imprimir','Imprimir','i-print'],['distribuicao','Distribuição','i-mapa'],['estrategia','Estratégia','i-estr'],['projeto','Projeto','i-proj']];
const REND={inventario:()=>renderInventario(),pecas:()=>renderPecas(),linhas:()=>renderLinhas(),plano:()=>renderPlano(),folhas:()=>renderFolhas(),imprimir:()=>renderImprimir(),distribuicao:()=>renderDistrib(),estrategia:()=>renderEstrategia(),projeto:()=>renderProjeto()};
function buildNav(){
  $('#tabs').innerHTML=TABS.map(t=>'<button role="tab" id="t-'+t[0]+'" aria-controls="tab-'+t[0]+'" aria-selected="false" data-tab="'+t[0]+'"><svg aria-hidden="true"><use href="#i-'+t[2].slice(2)+'"/></svg><span>'+t[1]+'</span></button>').join('');
}
function showTab(id,noHash){
  if(!REND[id])id='inventario';
  tab=id;
  TABS.forEach(t=>{const b=$('#t-'+t[0]);b.setAttribute('aria-selected',t[0]===id);const p=$('#tab-'+t[0]);p.hidden=t[0]!==id;});
  REND[id]();
  fitAll();
  if(!noHash)try{history.replaceState(null,'','#'+id);}catch(e){}
}
function icon(n,c){return '<svg aria-hidden="true" class="'+(c||'')+'" width="20" height="20"><use href="#i-'+n+'"/></svg>';}
function opts(map,sel){return Object.entries(map).map(([k,v])=>'<option value="'+k+'"'+(k===sel?' selected':'')+'>'+esc(typeof v==='string'?v:v.nome)+'</option>').join('');}
function download(name,text,type){
  const b=new Blob([text],{type:type||'application/json'}),a=D.createElement('a');
  a.href=URL.createObjectURL(b);a.download=name;D.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
}

/* ---------- escala de prévias ---------- */
function fitAll(){
  $$('.sheetwrap').forEach(w=>{
    const par=w.parentElement,avail=Math.max(120,par.clientWidth-(par.classList.contains('sheetlist')?24:0));
    const s=Math.min(1,avail/(210*PX));
    w.style.width=(210*PX*s)+'px';w.style.height=(297*PX*s)+'px';
    const sh=w.firstElementChild;if(sh)sh.style.transform='scale('+s+')';
  });
  $$('.pvwrap').forEach(w=>{
    if(w.dataset.real)return;
    const box=w.parentElement,wm=+w.dataset.w,hm=+w.dataset.h;
    const avail=Math.max(120,box.clientWidth-24);
    const s=Math.max(.3,Math.min(avail/(wm*PX),(w.dataset.maxh?+w.dataset.maxh:520)/(hm*PX),w.dataset.maxs?+w.dataset.maxs:3.2));
    w.style.width=(wm*PX*s)+'px';w.style.height=(hm*PX*s)+'px';
    w.firstElementChild.style.transform='scale('+s+')';
  });
}
G.addEventListener('resize',()=>{clearTimeout(fitAll.t);fitAll.t=setTimeout(fitAll,80);});

/* ---------- 1 Inventário ---------- */
function statusTag(p){
  if(!p)return '<span class="tag neutro">fora do plano</span>';
  if(p.semQtd)return '<span class="tag neutro">preencher</span>';
  if(p.falta)return '<span class="tag erro">falta</span>';
  if(p.baixo)return '<span class="tag baixo">estoque baixo</span>';
  return '<span class="tag ok">ok</span>';
}
function renderInventario(){
  const pl=AT.calcPlano(st);
  const rows=st.inventario.map(i=>{
    const p=pl.papel[i.id];
    const saldo=p?(p.saldo==null?'—':fmt(p.saldo)):(i.qtd==null?'—':fmt(i.qtd));
    return '<tr><td data-l="Item"><b>'+esc(i.nome)+'</b><br><small>'+(i.tipo==='papel'?'papel':'ferragem')+'</small></td>'+
     '<td data-l="Quantidade"><input type="number" min="0" step="any" inputmode="decimal" data-inv="'+i.id+'" data-f="qtd" placeholder="preencher" value="'+(i.qtd==null?'':i.qtd)+'" aria-label="Quantidade de '+esc(i.nome)+' em '+esc(i.unid)+'"></td>'+
     '<td data-l="Unidade">'+esc(i.unid)+'</td>'+
     '<td data-l="Estoque mínimo"><input type="number" min="0" step="any" inputmode="decimal" data-inv="'+i.id+'" data-f="min" placeholder="sem alerta" value="'+(i.min==null?'':i.min)+'" aria-label="Estoque mínimo de '+esc(i.nome)+'"></td>'+
     '<td data-l="Usa no plano" class="num">'+(p?fmt(p.need):'0')+'</td>'+
     '<td data-l="Saldo depois do plano" class="num"><b>'+saldo+'</b> '+statusTag(p&&p)+'</td></tr>';
  }).join('');
  $('#tab-inventario').innerHTML='<h2>Inventário</h2><p>Edite as quantidades. O saldo mostra o que sobra depois do plano atual. Campo vazio quer dizer "preencher".</p>'+
   '<div class="barra"><button class="btn sec" data-act="inv-export">Exportar inventário (JSON)</button><label class="btn sec" style="cursor:pointer">Importar inventário<input type="file" accept="application/json,.json" data-act-file="inv-import" class="sr"></label><button class="btn sec" data-act="inv-reset">Restaurar inventário padrão</button></div>'+
   '<div class="card res"><table class="tbl resp"><thead><tr><th>Item</th><th>Quantidade</th><th>Unidade</th><th>Estoque mínimo</th><th class="num">Usa no plano</th><th class="num">Saldo depois do plano</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
   '<div class="aviso">Regras de material aplicadas pelo app: kraft só com tinta escura; azul metálico nunca recebe tinta nem NFC (o vergê impresso é colado por cima); manta magnética nunca entra na impressora.</div>';
}

/* ---------- 2 Peças ---------- */
function pecaField(id,k,v){
  st.pecas[id]=st.pecas[id]||{};
  const d=AT.pecaDef(id);
  const same=(k==='linhas')?JSON.stringify(v)===JSON.stringify(d.linhas||[]):(d[k]===v);
  if(v===''&&(k==='endereco'||k==='sub')){st.pecas[id][k]='';}
  else if(same&&k!=='w'&&k!=='h')delete st.pecas[id][k];
  else st.pecas[id][k]=v;
  save();
}
function pvHtml(c,o){
  o=o||{};const w=o.w||c.w,h=o.h||c.h;
  const r=AT.renderPiece(c,{w,h,variant:o.variant});
  const paper=AT.PAPEIS[c.papel==='metal'?'verge':c.papel].cor;
  let inner;
  if(c.papel==='metal'&&!o.noBase){
    const b=st.config.borda;
    inner='<div style="position:relative;width:'+c.w+'mm;height:'+c.h+'mm;background:#20407A"><div style="position:absolute;left:'+b+'mm;top:'+b+'mm;width:'+w+'mm;height:'+h+'mm;background:'+paper+'">'+r.html+'</div></div>';
    return {html:wrapPv(inner,c.w,c.h,''),warn:r.warn,pc:r.html};
  }
  inner='<div style="width:'+w+'mm;height:'+h+'mm;background:'+paper+'">'+r.html+'</div>';
  return {html:wrapPv(inner,w,h,'pvpaper'),warn:r.warn};
}
function wrapPv(inner,w,h,cls){return '<div class="pvwrap '+(cls||'')+'" data-w="'+w+'" data-h="'+h+'"><div class="pvin">'+inner+'</div></div>';}
function pecaOverflow(c){
  /* mede no DOM, num contêiner invisível em escala 1 */
  const host=D.createElement('div');host.style.cssText='position:absolute;left:-9999px;top:0;visibility:hidden';
  const tam=AT.tamanhoImpresso(c,st.config.borda);
  const vars=c.base.variantes||[null];let issues=[],warn=[];
  vars.forEach(v=>{
    const r=AT.renderPiece(c,{w:tam.w,h:tam.h,variant:v});warn=warn.concat(r.warn);
    host.innerHTML=r.html;D.body.appendChild(host);
    issues=issues.concat(AT.checkOverflow(host.firstElementChild,tam.w,tam.h));
  });
  host.remove();
  return issues.concat(warn);
}
function fraseSel(c){
  const g=Object.entries(AT.FAMILIAS_FRASE).map(([k,v])=>'<optgroup label="'+esc(typeof v==='string'?v:v.nome)+'">'+AT.FRASES.filter(f=>f.f===k).map(f=>'<option value="'+esc(f.t)+'"'+(f.t===c.frase?' selected':'')+'>'+esc(f.t)+(f.rev?' (revisar)':'')+'</option>').join('')+'</optgroup>').join('');
  return '<label class="fld"><span>Frases prontas ('+AT.FRASES.length+')</span><select data-fr="1"><option value="">Escolher uma frase pronta…</option>'+g+'</select><small>As marcadas como revisar pedem a sua leitura antes de imprimir.</small></label>';
}
const VERPAPEIS=[['verge','Vergê'],['kraft','Kraft'],['matte','Matte'],['vinil','Vinil'],['metal','Azul metálico com vergê colado']];
function swatch(k){const P=AT.PALETAS[k];return '<span class="sw" aria-hidden="true">'+['ink','onink','acc','acc2','paper'].map(n=>'<i style="background:'+P[n]+'"></i>').join('')+'</span>';}
function pecaOpts(sel){
  return Object.entries(AT.GRUPOS_PECA).map(([g,rot])=>'<optgroup label="'+esc(rot)+'">'+AT.PECAS.filter(p=>p.familia===g).map(p=>'<option value="'+p.id+'"'+(p.id===sel?' selected':'')+'>'+esc(p.nome)+'</option>').join('')+'</optgroup>').join('');
}
function listaPecas(){
  return Object.entries(AT.GRUPOS_PECA).map(([g,rot])=>{
    const ps=AT.PECAS.filter(p=>p.familia===g);if(!ps.length)return '';
    return '<h3 class="grp">'+esc(rot)+(g==='marca'?' <span class="novo">novo</span>':'')+'</h3><div class="pecas-lista" role="group" aria-label="'+esc(rot)+'">'+
     ps.map(p=>'<button data-act="peca-sel" data-id="'+p.id+'" aria-pressed="'+(p.id===selPeca)+'">'+esc(p.nome)+(p.novo?' <span class="novo">novo</span>':'')+'<small>'+fmt(p.w)+' × '+fmt(p.h)+' mm</small></button>').join('')+'</div>';
  }).join('');
}
function marcaGlobal(){
  const g=st.config.marca;
  return '<div class="card marca-glob"><h3>Coleção Marca: paleta e nome</h3><p class="muted">Valem para todas as peças da coleção. Cada peça pode sobrescrever abaixo.</p><div class="row2">'+
   '<label class="fld"><span>Paleta da coleção</span><select data-mg="paleta">'+opts(AT.PALETAS,g.paleta)+'</select></label>'+
   '<label class="fld"><span>Estilo do nome</span><select data-mg="nome">'+opts(AT.ESTILOS_NOME,g.nome)+'</select></label></div>'+
   '<div class="sws" aria-label="Cores da paleta escolhida">'+swatch(g.paleta)+'<small>'+esc(AT.PALETAS[g.paleta].nome)+': fundo escuro, texto claro, dois acentos e papel claro.</small></div></div>';
}
function fichaMarca(c,d){
  const lay=AT.fit(c.w,c.h,st.config.margem,{par:!!d.par});
  const orient=lay.pagina?'página inteira, sem cortes':lay.count?(lay.por||lay.count)+' '+(d.par?'tags':'por folha')+' ('+lay.desc+', margem '+st.config.margem+' mm), '+lay.cuts.total+' cortes por pilha de '+st.config.pilha+' folhas':'não cabe';
  const fer=Object.keys(d.usa||{}).concat(d.manta?['manta']:[]).concat(d.baseMetal?['metal']:[]).map(k=>{const i=AT.INV_PADRAO.find(x=>x.id===k);return i?i.nome:k;});
  return '<div class="card"><h3>Ficha da peça</h3><p>'+esc(d.desc||'')+'</p><dl class="dl"><dt>Tamanho</dt><dd>'+fmt(c.w)+' × '+fmt(c.h)+' mm'+(d.fold?', dobra em '+fmt(d.fold)+' mm':'')+'</dd>'+
   '<dt>Na folha A4</dt><dd>'+esc(orient)+'</dd>'+
   '<dt>Papéis</dt><dd>'+d.papeis.map(p=>AT.PAPEIS[p].nome).join(', ')+'</dd>'+
   '<dt>Ferragens</dt><dd>'+(fer.join(', ')||'nenhuma')+'</dd>'+
   (d.montagem.length?'<dt>Montagem</dt><dd>'+d.montagem.map(esc).join('<br>')+'</dd>':'')+
   (d.notas&&d.notas.length?'<dt>Notas</dt><dd>'+d.notas.map(esc).join('<br>')+'</dd>':'')+
   '<dt>Tinta</dt><dd>'+esc(d.notaTinta)+'</dd></dl>'+
   '<p class="muted">O texto vem do desenho aprovado internamente. Revise tudo antes de imprimir.</p></div>';
}
function formMarca(c,d){
  const g=st.config.marca;
  const selOpt=(map,cur,herda)=>'<option value=""'+(!cur?' selected':'')+'>'+herda+'</option>'+Object.entries(map).map(([k,v])=>'<option value="'+k+'"'+(k===cur?' selected':'')+'>'+esc(typeof v==='string'?v:v.nome)+'</option>').join('');
  const palMap=Object.assign({},AT.PALETAS);
  const palSel=(d.serie?'<option value="serie"'+(c.paleta==='serie'?' selected':'')+'>Da série (uma paleta por '+(d.id==='m_marcador'?'frase':'título')+', como no desenho)</option>':'');
  const permitidos=Object.fromEntries(d.papeis.map(p=>[p,AT.PAPEIS[p].nome]));
  const oc=(d.opcoes||[]).map(o=>'<label class="fld"><span>'+esc(o.rotulo)+'</span><select data-pf="'+o.k+'">'+o.valores.map(v=>'<option value="'+esc(v[0])+'"'+((c[o.k]==null?o.padrao:c[o.k])===v[0]?' selected':'')+'>'+esc(v[1])+'</option>').join('')+'</select></label>').join('');
  return '<div class="card"><h3>'+esc(c.nome)+' <span class="novo">novo</span></h3>'+
   '<p class="muted">Desenho fixo em mm: tamanho e texto vêm do desenho aprovado. O que muda aqui é paleta, nome, papel e opções.</p>'+
   '<div class="row2"><label class="fld"><span>Paleta desta peça</span><select data-pf="paleta">'+selOpt(palMap,c.paleta==='serie'?'serie':c.paleta,'Herdar da coleção ('+esc(AT.PALETAS[g.paleta].nome)+')').replace('</select>','')+palSel+'</select></label>'+
   '<label class="fld"><span>Estilo do nome nesta peça</span><select data-pf="estiloNome">'+selOpt(AT.ESTILOS_NOME,c.estiloNome,'Herdar da coleção ('+esc(AT.ESTILOS_NOME[g.nome].nome.split(' (')[0])+')')+'</select></label></div>'+
   '<div class="sws">'+swatch(c.paleta==='serie'?'longitudinal':c.pal)+'<small>Em uso: '+(c.paleta==='serie'?'série':esc(AT.PALETAS[c.pal].nome))+', nome em '+esc(AT.ESTILOS_NOME[c.estilo].nome.split(' (')[0].toLowerCase())+'.</small></div>'+
   oc+
   '<label class="fld"><span>Papel</span><select data-pf="papel">'+opts(permitidos,c.papel)+'</select></label>'+
   (d.nfcOk?'<label class="chk"><input type="checkbox" data-pf="nfc"'+(c.nfc?' checked':'')+'> Leva etiqueta NFC</label>':'')+
   '<p class="muted">'+(d.qrNao?'Sem QR nesta peça.':'O QR (fundo branco, com legenda) abre o site do consultório e fica sempre ligado.')+'</p>'+
   '<div class="barra"><button class="btn" data-act="peca-plano">'+icon('plano')+' Pôr no plano</button><button class="btn sec" data-act="peca-folha">'+icon('corte')+' Ver a folha</button><button class="btn sec" data-act="peca-reset">Restaurar peça</button></div></div>';
}
function renderPecas(){
  if(!AT.pecaDef(selPeca))selPeca='m_cartao';
  const c=AT.efetiva(st,selPeca),d=c.base;
  const lista=listaPecas();
  const txt=(k,l,rows,hint)=>'<label class="fld"><span>'+l+'</span><textarea rows="'+(rows||2)+'" data-pf="'+k+'">'+esc(Array.isArray(c[k])?c[k].join('\n'):c[k])+'</textarea>'+(hint?'<small>'+hint+'</small>':'')+'</label>';
  const permitidos=Object.fromEntries(d.papeis.map(p=>[p,p==='metal'?'Azul metálico (base) + arte no vergê':AT.PAPEIS[p].nome]));
  const formAntigo='<div class="card"><h3>'+esc(c.nome)+'</h3>'+
   '<label class="fld"><span>Por que a pessoa guarda</span><input type="text" data-pf="porque" value="'+esc(c.porque||'')+'"></label>'+
   (d.variantes?'<p class="muted">Esta peça sai em '+d.variantes.length+' versões: '+d.variantes.join(', ')+'.</p>':txt('frase','Frase ou título',2)+fraseSel(c))+
   txt('sub','Subtítulo',2)+
   (d.linhas&&d.linhas.length?txt('linhas','Linhas (uma por linha)',Math.min(6,d.linhas.length+1),'Itens ou campos da peça.'):'')+
   (d.temEndereco?'<label class="fld"><span>Endereço (opcional)</span><input type="text" data-pf="endereco" value="'+esc(c.endereco||'')+'" placeholder="vazio por padrão"></label>':'')+
   '<div class="row2"><label class="fld"><span>Símbolo</span><select data-pf="simbolo">'+opts(AT.SIMBOLOS,c.simbolo)+'</select></label>'+
   '<label class="fld"><span>Tinta</span><select data-pf="tinta">'+opts(AT.TINTAS,c.tinta)+'</select></label></div>'+
   '<div class="row2"><label class="fld"><span>Fonte</span><select data-pf="fonte">'+opts(AT.FONTES,c.fonte)+'</select><small>Use uma família só em todas as peças.</small></label>'+
   '<label class="fld"><span>Papel</span><select data-pf="papel">'+opts(permitidos,c.papel)+'</select></label></div>'+
   '<div class="row2"><label class="fld"><span>Largura (mm)</span><input type="number" min="20" max="280" step="0.5" data-pf="w" value="'+c.w+'"></label><label class="fld"><span>Altura (mm)</span><input type="number" min="15" max="280" step="0.5" data-pf="h" value="'+c.h+'"></label></div>'+
   '<label class="chk"><input type="checkbox" data-pf="qr"'+(c.qr?' checked':'')+(d.qrNao?' disabled':'')+'> QR ligado (abre o site do consultório)'+(d.qrNao?' (sem espaço nesta peça)':'')+'</label>'+
   (d.nfcOk?'<label class="chk"><input type="checkbox" data-pf="nfc"'+(c.nfc?' checked':'')+(c.papel==='metal'?' disabled':'')+'> Leva etiqueta NFC'+(c.papel==='metal'?' (bloqueado no azul metálico)':'')+'</label>':'')+
   '<label class="chk"><input type="checkbox" data-pf="fundo"'+(c.fundo?' checked':'')+((c.papel==='matte'||c.papel==='vinil')?'':' disabled')+'> Fundo chapado (só vinil e matte; a arte fica 2,5 mm para dentro)</label>'+
   '<label class="chk"><input type="checkbox" data-pf="idLongo"'+(c.idLongo?' checked':'')+'> Nome completo na identificação</label>'+
   '<div class="barra"><button class="btn" data-act="peca-plano">'+icon('plano')+' Pôr no plano</button><button class="btn sec" data-act="peca-folha">'+icon('corte')+' Ver a folha</button><button class="btn sec" data-act="peca-reset">Restaurar peça</button></div></div>';
  const verSel=d.marca?'':'<div class="row2"><label class="fld"><span>Ver no papel</span><select data-vp="1">'+VERPAPEIS.map(p=>'<option value="'+p[0]+'"'+((verPapel||c.papel)===p[0]?' selected':'')+'>'+p[1]+(p[0]===c.papel?' (papel da peça)':'')+'</option>').join('')+'</select></label><label class="chk" style="align-self:end"><input type="checkbox" data-vr="1"'+(pvReal?' checked':'')+'> Tamanho real (1 mm = 1 mm na tela)</label></div>';
  const real=d.marca?'<label class="chk"><input type="checkbox" data-vr="1"'+(pvReal?' checked':'')+'> Tamanho real (1 mm = 1 mm na tela)</label>':'';
  $('#tab-pecas').innerHTML='<h2>Peças</h2><p>Escolha uma peça, ajuste as opções e veja a prévia. A identificação do médico fica sempre na peça e não pode ser removida.</p>'+
   marcaGlobal()+lista+
   '<div class="grid2 e">'+(d.marca?formMarca(c,d):formAntigo)+
   '<div><div class="card"><h3>Prévia</h3>'+verSel+real+'<div class="pvbox" id="pv"></div><div id="pvinfo" aria-live="polite"></div></div>'+
   (d.marca?fichaMarca(c,d):'<div class="card"><h3>Papéis permitidos e ferragens</h3><p>'+d.papeis.map(p=>AT.PAPEIS[p].nome).join(', ')+'.</p><p>Ferragens: '+(Object.keys(d.usa||{}).concat(d.manta?['manta magnética (1 folha por folha impressa)']:[]).map(k=>AT.INV_PADRAO.find(i=>i.id===k)?AT.INV_PADRAO.find(i=>i.id===k).nome:k).join(', ')||'nenhuma')+'.</p></div>')+'</div></div>';
  updatePv();
}
function updatePv(){
  const c0=AT.efetiva(st,selPeca),d=c0.base;
  const vp=d.marca?c0.papel:(verPapel||c0.papel);
  const c=AT.efetivaPapel(st,selPeca,null);
  let aviso='';
  if(vp!==c0.papel){
    c.papel=vp;if(vp==='metal'){c.nfc=false;c.fundo=false;}if(!(vp==='matte'||vp==='vinil'))c.fundo=false;
    if(!d.papeis.includes(vp))aviso='<p class="muted">Este papel não está entre os indicados para a peça. A prévia é só para comparar.</p>';
  }
  const pv=$('#pv');if(!pv)return;
  const tam=AT.tamanhoImpresso(c,st.config.borda);
  let html='';
  if(d.variantes&&d.marca){const wd='calc(50% - 6px)';html=d.variantes.map(v=>'<div style="width:'+wd+'">'+pvHtml(c,{variant:v,w:tam.w,h:tam.h,noBase:false}).html.replace('class="pvwrap','data-maxh="360" class="pvwrap')+'</div>').join('');pv.style.flexDirection='row';pv.style.flexWrap='wrap';pv.style.alignItems='flex-start';pv.style.gap='12px';}
  else if(d.variantes){html=d.variantes.map(v=>'<div style="margin-bottom:8px">'+pvHtml(c,{variant:v,w:tam.w,h:tam.h,noBase:false}).html+'</div>').join('');pv.style.flexDirection='column';pv.style.alignItems='center';}
  else{html=pvHtml(c,{w:tam.w,h:tam.h}).html;pv.style.flexDirection='';pv.style.flexWrap='';pv.style.gap='';}
  pv.innerHTML=html;if(pvReal)$$('.pvwrap',pv).forEach(w=>{w.dataset.maxs='1';});fitAll();
  if(pvReal)$$('.pvwrap',pv).forEach(w=>{const wm=+w.dataset.w,hm=+w.dataset.h;w.style.width=(wm*PX)+'px';w.style.height=(hm*PX)+'px';w.firstElementChild.style.transform='none';w.dataset.real='1';});
  const iss=pecaOverflow(c);
  const lay=AT.fit(tam.w,tam.h,st.config.margem,{par:!!d.par});
  $('#pvinfo').innerHTML=(iss.length?'<div class="alerta erro">'+icon('alerta')+'<div>Atenção: '+esc(iss.slice(0,3).join('; '))+'. Reduza o texto ou o tamanho.</div></div>':'<div class="alerta ok">'+icon('ok')+'<div>'+(d.marca?'Texto dentro da zona segura de 2,5 mm, sem corte e a partir de 6,5 pt.':'Tudo dentro da zona segura de 2,5 mm.')+'</div></div>')+
   '<p class="muted">'+(lay.pagina?'Página inteira, 1 por folha, sem cortes. ':(lay.por!=null?lay.por:lay.count)+(d.par?' tags':' por folha A4')+' (margem '+st.config.margem+' mm), '+lay.cuts.total+' cortes por pilha de '+st.config.pilha+' folhas. ')+(c.base.fold?'Dobra em '+fmt(c.base.fold)+' mm.':'')+'</p>'+aviso;
}

/* ---------- 3 Linhas ---------- */
function pickFrase(fam,k){const l=AT.FRASES.filter(f=>f.f===fam&&!f.rev);return l[k%l.length].t;}
function aplicarEstiloLinha(id){
  const L=AT.LINHAS[id],cfg=st.linhasCfg[id]||{};
  if(L.marca){
    Object.keys(L.pecas).forEach(pid=>{st.pecas[pid]=st.pecas[pid]||{};if(cfg.paleta)st.pecas[pid].paleta=cfg.paleta;if(cfg.estiloNome)st.pecas[pid].estiloNome=cfg.estiloNome;});
    save();return;
  }
  const sim=cfg.simbolo||L.simbolo,tin=cfg.tinta||L.tinta,fam=cfg.frase||L.frase;
  let k=0;
  Object.keys(L.pecas).forEach(pid=>{
    const d=AT.pecaDef(pid);st.pecas[pid]=st.pecas[pid]||{};
    st.pecas[pid].simbolo=sim;st.pecas[pid].tinta=tin;
    if(d.fraseLivre){st.pecas[pid].frase=pickFrase(fam,k*3+1);k++;}
  });
  if(cfg.fonte)st.config.fonte=cfg.fonte;
  save();
}
function renderLinhas(){
  if(!AT.LINHAS[selLinha])selLinha=Object.keys(AT.LINHAS)[0];
  const L=AT.LINHAS[selLinha],cfg=st.linhasCfg[selLinha]||{},marca=!!L.marca,gm=st.config.marca;
  const sim=cfg.simbolo||L.simbolo,tin=cfg.tinta||L.tinta,fam=cfg.frase||L.frase,fon=cfg.fonte||st.config.fonte;
  const cards=Object.entries(AT.GRUPOS_LINHA).map(([g,rot])=>{
    const ls=Object.entries(AT.LINHAS).filter(([k,l])=>l.grupo===g);if(!ls.length)return '';
    return '<h3 class="grp">'+esc(rot)+(g==='marca'?' <span class="novo">novo</span>':'')+'</h3><div class="linhas" role="group" aria-label="'+esc(rot)+'">'+ls.map(([k,l])=>'<button class="linhacard" data-act="linha-sel" data-id="'+k+'" aria-pressed="'+(k===selLinha)+'"><h3>'+esc(l.nome)+'</h3><span>'+esc(l.desc)+'</span></button>').join('')+'</div>';
  }).join('');
  const tmp=clone(st);tmp.pecas=clone(st.pecas);
  let k=0;
  const minis=Object.entries(L.pecas).map(([pid,q])=>{
    const d=AT.pecaDef(pid);
    if(marca){tmp.pecas[pid]=Object.assign({},tmp.pecas[pid],cfg.paleta?{paleta:cfg.paleta}:{},cfg.estiloNome?{estiloNome:cfg.estiloNome}:{});}
    else{
      tmp.pecas[pid]=Object.assign({},tmp.pecas[pid],{simbolo:sim,tinta:tin});
      if(d.fraseLivre){tmp.pecas[pid].frase=pickFrase(fam,k*3+1);k++;}
      tmp.config.fonte=fon;
    }
    const c=AT.efetiva(tmp,pid);
    const tam=AT.tamanhoImpresso(c,st.config.borda);
    return '<div style="width:150px"><div class="pvbox" style="padding:6px">'+pvHtml(c,{w:tam.w,h:tam.h,variant:(c.base.variantes||[])[0]}).html.replace('class="pvwrap','data-maxh="130" data-maxs="1.2" class="pvwrap')+'</div><small><b>'+q+'×</b> '+esc(d.nome)+'</small></div>';
  }).join('');
  const ctl=marca?
   '<div class="row2"><label class="fld"><span>Paleta da linha</span><select data-ln="paleta"><option value=""'+(!cfg.paleta?' selected':'')+'>Usar a da coleção ('+esc(AT.PALETAS[gm.paleta].nome)+')</option>'+Object.entries(AT.PALETAS).map(([kk,v])=>'<option value="'+kk+'"'+(kk===cfg.paleta?' selected':'')+'>'+esc(v.nome)+'</option>').join('')+'</select></label>'+
   '<label class="fld"><span>Estilo do nome da linha</span><select data-ln="estiloNome"><option value=""'+(!cfg.estiloNome?' selected':'')+'>Usar o da coleção</option>'+Object.entries(AT.ESTILOS_NOME).map(([kk,v])=>'<option value="'+kk+'"'+(kk===cfg.estiloNome?' selected':'')+'>'+esc(v.nome)+'</option>').join('')+'</select></label></div>'
   :'<div class="row2"><label class="fld"><span>Símbolo da linha</span><select data-ln="simbolo">'+opts(AT.SIMBOLOS,sim)+'</select></label>'+
   '<label class="fld"><span>Tinta da linha</span><select data-ln="tinta">'+opts(AT.TINTAS,tin)+'</select></label></div>'+
   '<div class="row2"><label class="fld"><span>Fonte (vale para tudo)</span><select data-ln="fonte">'+opts(AT.FONTES,fon)+'</select></label>'+
   '<label class="fld"><span>Família de frase</span><select data-ln="frase">'+opts(AT.FAMILIAS_FRASE,fam)+'</select></label></div>';
  $('#tab-linhas').innerHTML='<h2>Linhas</h2><p>Uma linha é um conjunto de peças que saem juntas num kit. Na Coleção Marca, a paleta e o nome vêm da aba Peças; a linha só sobrescreve se você escolher.</p>'+
   cards+
   '<div class="card" style="margin-top:14px"><h3>'+esc(L.nome)+'</h3>'+
   '<div class="grid2"><div>'+
   '<label class="fld"><span>Número de kits</span><input type="number" min="1" max="500" step="1" data-ln="kits" value="'+st.kits+'"></label>'+
   ctl+
   '<div class="barra"><button class="btn" data-act="linha-aplicar">Usar como plano</button><button class="btn sec" data-act="linha-somar">Somar ao plano</button></div>'+
   '<p class="muted">"Usar como plano" troca o plano atual'+(marca?' e aplica a paleta e o nome escolhidos aqui às peças da linha':' e aplica símbolo, tinta e frases às peças da linha')+'.</p></div>'+
   '<div><h3>Peças por kit</h3><ul class="lista">'+Object.entries(L.pecas).map(([pid,q])=>'<li><b>'+q+'×</b> '+esc(AT.pecaDef(pid).nome)+' <small>(total: '+(q*st.kits)+')</small></li>').join('')+'</ul></div></div>'+
   '<h3>Prévia da linha</h3><div class="minis">'+minis+'</div></div>';
  fitAll();
}

/* ---------- 4 Plano ---------- */
function kitsPara(linha,pessoas){
  if(linha==='balcao'||linha==='m_balcao')return Math.max(1,Math.ceil(pessoas/10));
  return Math.max(1,pessoas);
}
function cabeAuto(itens,base){
  let its=clone(itens);
  for(let i=0;i<14;i++){
    const tmp=clone(base);tmp.plano={itens:its};
    const r=AT.calcPlano(tmp);
    const falta=r.alertas.some(a=>a.tipo==='falta'||a.tipo==='erro');
    if(!falta)return {ok:true,r,itens:its};
    const sg=r.sugestoes.find(s=>!its[s.idx].papel);
    if(!sg)return {ok:false,r,itens:its};
    its[sg.idx].papel=sg.para;
  }
  return {ok:false,itens:its};
}
AT.assistente=function(pub,pessoas,oc){
  const linha=AT.ASSISTENTE_OCASIAO[oc]||AT.ASSISTENTE_LINHA[pub];
  const want=kitsPara(linha,pessoas);
  const mk=n=>AT.itensDaLinha(linha,n);
  let res=cabeAuto(mk(want),st),k=want,lim=false;
  if(!res.ok){
    lim=true;let lo=0,hi=want-1;
    while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(cabeAuto(mk(mid),st).ok)lo=mid;else hi=mid-1;}
    k=lo;res=k>0?cabeAuto(mk(k),st):{ok:true,r:AT.calcPlano(Object.assign(clone(st),{plano:{itens:[]}})),itens:[]};
  }
  return {linha,want,kits:k,limitado:lim,itens:res.itens,r:res.r};
};
let lastAss=null;
function renderPlano(){
  const pl=AT.calcPlano(st);
  const A=lastAss;
  const itensRows=st.plano.itens.map((it,i)=>{
    const d=AT.pecaDef(it.pecaId);const o=pl.itens.find(x=>x.idx===pl.itens.findIndex(y=>false)||false);
    const calc=pl.itens.find(x=>x.idx===i);
    const pap=it.papel||d.papel;
    return '<tr><td data-l="Peça"><select data-pi="pecaId" data-i="'+i+'" aria-label="Peça">'+pecaOpts(it.pecaId)+'</select></td>'+
     '<td data-l="Quantidade"><input type="number" min="1" step="1" data-pi="qtd" data-i="'+i+'" value="'+it.qtd+'" aria-label="Quantidade"></td>'+
     '<td data-l="Papel"><select data-pi="papel" data-i="'+i+'" aria-label="Papel">'+d.papeis.map(p=>'<option value="'+p+'"'+(p===pap?' selected':'')+'>'+AT.PAPEIS[p].curto+'</option>').join('')+'</select></td>'+
     '<td data-l="Por folha" class="num">'+(calc?calc.perSheet:'—')+'</td><td data-l="Folhas" class="num">'+(calc&&calc.sheets!=null?calc.sheets:'—')+'</td>'+
     '<td data-l=""><button class="btn perigo" data-act="item-del" data-i="'+i+'" aria-label="Remover '+esc(d.nome)+'">Remover</button></td></tr>';
  }).join('');
  const alert=pl.alertas.filter(a=>a.tipo!=='info'||true).map(a=>'<div class="alerta '+(a.tipo==='erro'?'erro':a.tipo)+'">'+icon(a.tipo==='falta'||a.tipo==='erro'||a.tipo==='baixo'?'alerta':'info')+'<div>'+esc(a.txt)+'</div></div>').join('')||'<div class="alerta ok">'+icon('ok')+'<div>O inventário cobre o plano.</div></div>';
  const sug=pl.sugestoes.map((s,i)=>'<div class="alerta info">'+icon('info')+'<div>'+esc(s.txt)+' <button class="btn sec" style="margin-left:6px" data-act="sug-aplicar" data-i="'+i+'">Aplicar</button></div></div>').join('');
  const papRows=Object.values(pl.papel).map(p=>'<tr><td data-l="Item">'+esc(p.nome)+'</td><td data-l="Precisa" class="num">'+fmt(p.need)+' '+esc(p.unid)+'</td><td data-l="Tem" class="num">'+(p.have==null?'preencher':fmt(p.have))+'</td><td data-l="Saldo" class="num"><b>'+(p.saldo==null?'—':fmt(p.saldo))+'</b></td><td data-l="Situação">'+statusTag(p)+'</td></tr>').join('');
  const fila=pl.fila.map(g=>'<div class="card"><h3>Coloque '+ART[g.papel]+': folhas 1 a '+g.total+'</h3><ul class="lista">'+g.jobs.map(j=>'<li>'+esc(j.nome)+' <b>folhas '+j.de+' a '+j.ate+'</b></li>').join('')+'</ul></div>').join('')||'<p class="muted">Plano vazio.</p>';
  const blue=pl.itens.filter(o=>o.base&&o.base.sheets).map(o=>'<li>'+esc(o.nome)+': '+o.base.sheets+' folhas de azul metálico, cortadas em '+fmt(o.base.w||o.c.w)+' × '+fmt(o.base.h||o.c.h)+' mm, sem imprimir.</li>').join('');
  const mont=pl.montagem.map(m=>'<div class="card"><h3>'+esc(m.nome)+' <small>('+m.qtd+')</small></h3>'+m.steps.map((s,j)=>{const key=m.pecaId+':'+j;return '<label class="chkitem"><input type="checkbox" data-check="'+key+'"'+(st.check[key]?' checked':'')+'><span>'+esc(s)+'</span></label>';}).join('')+'</div>').join('');
  const ass='<div class="card"><h3>Assistente</h3><p>Diga quem quer alcançar. O app propõe a linha e as quantidades que cabem no inventário.</p><div class="row2">'+
   '<label class="fld"><span>Público</span><select id="as-pub">'+opts(AT.PUBLICOS,'familias')+'</select></label>'+
   '<label class="fld"><span>Quantas pessoas</span><input type="number" id="as-n" min="1" max="2000" value="'+(A?A.pessoas:20)+'"></label></div>'+
   '<label class="fld"><span>Ocasião</span><select id="as-oc">'+opts(AT.OCASIOES,'consultorio')+'</select></label>'+
   '<div class="barra"><button class="btn" data-act="as-propor">Propor plano</button></div><div id="as-out" aria-live="polite">'+(A?assOut(A):'')+'</div></div>';
  $('#tab-plano').innerHTML='<h2>Plano de produção</h2>'+ass+
   (pl.itens.length?(pl.kit.economia>0?'<div class="alerta ok">'+icon('ok')+'<div>Folha-kit: junta as sobras de peças da mesma linha e papel e economiza '+pl.kit.economia+' '+(pl.kit.economia===1?'folha':'folhas')+'.</div></div>':'<div class="alerta info">'+icon('info')+'<div>Folha-kit: não economiza nenhuma folha neste plano. Cada peça sai da sua própria folha.</div></div>'):'')+
   '<div class="kpis"><div class="kpi"><b>'+pl.folhasTotal+'</b><span>folhas a imprimir</span></div><div class="kpi"><b>'+pl.cortes.total+'</b><span>cortes no total</span></div><div class="kpi"><b>'+pl.itens.length+'</b><span>peças no plano</span></div><div class="kpi"><b>'+st.config.pilha+'</b><span>folhas por pilha</span></div></div>'+
   '<div class="card res"><h3>Peças e quantidades</h3><table class="tbl resp"><thead><tr><th>Peça</th><th>Quantidade</th><th>Papel</th><th class="num">Por folha</th><th class="num">Folhas</th><th></th></tr></thead><tbody>'+itensRows+'</tbody></table>'+
   '<div class="barra"><button class="btn sec" data-act="item-add">Adicionar peça</button><button class="btn perigo" data-act="plano-limpar">Limpar plano</button></div></div>'+
   '<h3>Alertas</h3>'+alert+sug+
   '<div class="card res"><h3>Papéis e ferragens: precisa, tem, saldo</h3><table class="tbl resp"><thead><tr><th>Item</th><th class="num">Precisa</th><th class="num">Tem</th><th class="num">Saldo</th><th>Situação</th></tr></thead><tbody>'+papRows+'</tbody></table></div>'+
   '<h3>Fila de impressão</h3>'+fila+(blue?'<div class="card"><h3>Azul metálico (só cortar)</h3><ul class="lista">'+blue+'</ul></div>':'')+
   '<h3>Montagem</h3>'+(mont||'<p class="muted">Sem passos.</p>');
}
function assOut(A){
  const r=A.r,L=AT.LINHAS[A.linha];
  const sal=Object.values(r.papel).map(p=>'<li>'+esc(p.nome)+': usa '+fmt(p.need)+(p.saldo==null?' (preencher estoque)':', saldo '+fmt(p.saldo))+'</li>').join('');
  const trocas=A.itens.filter(i=>i.papel).map(i=>esc(AT.pecaDef(i.pecaId).nome)+' no '+AT.PAPEIS[i.papel].curto).join('; ');
  return '<div class="alerta '+(A.limitado?'baixo':'ok')+'">'+icon(A.limitado?'alerta':'ok')+'<div><b>'+esc(L.nome)+'</b>: '+(A.limitado?'cabe até '+A.kits+' kits no inventário (você pediu '+A.want+').':A.kits+' kits cabem no inventário.')+(trocas?' Troquei papel: '+trocas+'.':'')+'</div></div>'+
   '<ul class="lista">'+Object.entries(L.pecas).map(([pid,q])=>'<li>'+(q*A.kits)+'× '+esc(AT.pecaDef(pid).nome)+'</li>').join('')+'</ul><details><summary>Saldo depois do plano</summary><ul class="lista">'+sal+'</ul></details>'+
   (A.kits>0?'<div class="barra"><button class="btn" data-act="as-usar">Usar este plano</button></div>':'');
}

/* ---------- 5 Folhas e corte ---------- */
function efetivaPapel(pecaId,papel){
  const c=AT.efetiva(st,pecaId);
  if(papel&&c.base.papeis.includes(papel)){c.papel=papel;if(papel==='metal'){c.nfc=false;}if(!(papel==='matte'||papel==='vinil'))c.fundo=false;}
  return c;
}
function roteiroHtml(cuts,pilha){
  return '<ol class="roteiro">'+AT.roteiro(cuts,pilha).map(r=>r.grupo?'<li class="g">'+esc(r.grupo)+'</li>':r.aviso?'<li class="av">'+esc(r.txt)+'</li>':'<li><b class="n">'+r.n+'</b><span>'+esc(r.txt)+'</span></li>').join('')+'</ol>';
}
function kitSel(){
  const L=AT.LINHAS[selKit.linha];
  const ids=Object.keys(L.pecas).filter(id=>{const b=AT.pecaDef(id);return b.papeis.includes(selKit.papel)&&selKit.papel!=='metal'&&!b.manta;});
  const itens=ids.map((id,i)=>({idx:i,c:AT.efetivaPapel(st,id,selKit.papel),n:L.pecas[id]}));
  const units=[];itens.forEach(it=>{for(let i=0;i<it.n;i++)units.push({k:it.c.id,pecaId:it.c.id,idx:it.idx,w:it.c.w,h:it.c.h,variant:(it.c.base.variantes||[null])[i%((it.c.base.variantes||[1]).length)]});});
  let packed=[];
  if(units.length)try{packed=AT.packKit(units,st.config.margem);}catch(e){packed=[];}
  const folhas=packed.map(ps=>{const fill=AT.fillBand(ps.cells,st.config.margem,selKit.papel);return {paper:selKit.papel,cells:ps.cells,fill,cuts:AT.cuts(ps.cells.concat(fill),'h')};});
  return {itens,folhas,plano:{itens,kit:{folhas}}};
}
G.AT.kitDaLinha=kitSel;
function renderFolhaKit(){
  const cfg=st.config,K=kitSel();
  const pl=AT.calcPlano(st);
  const papeisOk=['verge','kraft','matte','vinil'];
  const ecoTxt=pl.kit.economia>0?'<div class="alerta ok">'+icon('ok')+'<div>No plano atual, a folha-kit economiza <b>'+pl.kit.economia+'</b> '+(pl.kit.economia===1?'folha':'folhas')+' ('+pl.kit.detalhe.map(d=>esc(d.pecas.join(' + '))+': '+d.antes+' → '+d.depois).join('; ')+').</div></div>':'<div class="alerta info">'+icon('info')+'<div>O plano atual não tem sobras que caibam juntas numa folha só. Não há economia de folhas por enquanto.</div></div>';
  let sheets='',rot='';
  K.folhas.forEach((f,i)=>{
    const r=AT.sheetKit(st,K.plano,f);
    sheets+='<div class="sheetwrap">'+r.html+'</div>';
    rot+='<h3>Folha-kit '+(i+1)+' de '+K.folhas.length+'</h3>'+roteiroHtml(f.cuts,cfg.pilha);
  });
  $('#tab-folhas').innerHTML='<h2>Folhas e corte</h2>'+modoBar()+'<p>A folha-kit junta peças diferentes da mesma linha e do mesmo papel numa A4 só. Primeiro os cortes horizontais separam as faixas. Depois cada faixa leva os cortes verticais.</p>'+
   '<div class="grid2 e"><div><div class="card"><div class="row2"><label class="fld"><span>Linha</span><select data-fk="linha">'+Object.entries(AT.LINHAS).map(([k,l])=>'<option value="'+k+'"'+(k===selKit.linha?' selected':'')+'>'+esc(l.nome)+'</option>').join('')+'</select></label>'+
   '<label class="fld"><span>Papel</span><select data-fk="papel">'+papeisOk.map(p=>'<option value="'+p+'"'+(p===selKit.papel?' selected':'')+'>'+AT.PAPEIS[p].nome+'</option>').join('')+'</select></label></div>'+
   '<p class="muted">Peças desta linha neste papel: '+(K.itens.map(i=>i.n+'× '+esc(i.c.nome)).join(', ')||'nenhuma')+'.</p></div>'+ecoTxt+
   (K.folhas.length?'<div class="kpis"><div class="kpi"><b>'+K.folhas.length+'</b><span>folha(s) para 1 kit</span></div><div class="kpi"><b>'+K.folhas.reduce((a,f)=>a+f.cuts.total,0)+'</b><span>cortes no total</span></div></div><div class="barra"><button class="btn" data-act="kit-print">'+icon('print')+' Imprimir esta folha-kit</button></div><div class="card"><h3>Roteiro de corte</h3>'+rot+'</div>':'<div class="alerta info">'+icon('info')+'<div>Nenhuma peça desta linha usa este papel. Escolha outro papel.</div></div>')+'</div>'+
   '<div><h3>Folha A4 · '+esc(AT.PAPEIS[selKit.papel].nome)+'</h3><div class="sheetlist">'+(sheets||'<p class="muted">Sem folha.</p>')+'</div></div></div>';
}
function modoBar(){return '<div class="barra" role="group" aria-label="Modo"><button class="btn sec" data-act="fo-modo" data-m="peca" aria-pressed="'+(selFolhaModo==='peca')+'">Uma peça por folha</button><button class="btn sec" data-act="fo-modo" data-m="kit" aria-pressed="'+(selFolhaModo==='kit')+'">Folha-kit</button></div>';}
function renderFolhas(){
  if(selFolhaModo==='kit'){renderFolhaKit();return;}
  const cfg=st.config;
  if(!AT.pecaDef(selFolha.pecaId))selFolha.pecaId='m_cartao';
  const c=efetivaPapel(selFolha.pecaId,selFolha.papel);
  selFolha.papel=c.papel;
  const tam=AT.tamanhoImpresso(c,cfg.borda);
  const r=AT.sheetArte(st,c);
  const lay=r.layout;
  const permit=Object.fromEntries(c.base.papeis.map(p=>[p,p==='metal'?'Azul metálico (arte no vergê)':AT.PAPEIS[p].nome]));
  let extra='';
  if(c.papel==='metal'){
    const g=AT.sheetGabarito(st,c),lb=AT.fit(c.w,c.h,cfg.margem);
    extra='<div class="card"><h3>Azul metálico: base e gabarito de colagem</h3><p>O azul não vai à impressora. Corte as bases de '+fmt(c.w)+' × '+fmt(c.h)+' mm ('+lb.count+' por folha) e cole o vergê impresso por cima, deixando '+fmt(cfg.borda)+' mm de borda azul. Nunca coloque NFC sobre o azul.</p><div class="sheetlist"><div class="sheetwrap">'+g.html+'</div></div><h3>Roteiro de corte da base azul</h3>'+roteiroHtml(lb.cuts,cfg.pilha)+'</div>';
  }
  if(c.base.baseMetal){
    const bm=c.base.baseMetal,lb=AT.fit(bm.w,bm.h,cfg.margem);
    extra+='<div class="card"><h3>Azul metálico: bases de '+fmt(bm.w)+' × '+fmt(bm.h)+' mm</h3><p>O azul não vai à impressora. Corte as bases ('+lb.count+' por folha, '+lb.cuts.total+' cortes). Cada tag leva uma base e as duas faces coladas, uma de cada lado, com '+fmt((bm.w-c.w)/2)+' mm de borda azul.</p><h3>Roteiro de corte das bases</h3>'+roteiroHtml(lb.cuts,cfg.pilha)+'</div>';
  }
  const stacks=Math.ceil(1/cfg.pilha);
  $('#tab-folhas').innerHTML='<h2>Folhas e corte</h2>'+modoBar()+'<p>As peças ficam coladas, sem espaço entre elas. O papel é o fundo. Só cortes retos de ponta a ponta.</p>'+
   '<div class="grid2 e"><div><div class="card"><div class="row2"><label class="fld"><span>Peça</span><select data-fo="pecaId">'+pecaOpts(selFolha.pecaId)+'</select></label>'+
   '<label class="fld"><span>Papel</span><select data-fo="papel">'+opts(permit,c.papel)+'</select></label></div>'+
   '<div class="row2"><label class="fld"><span>Margem (mm)</span><input type="number" min="3" max="20" step="0.5" data-cfg="margem" value="'+cfg.margem+'"></label>'+
   '<label class="fld"><span>Folhas por pilha</span><input type="number" min="5" max="8" step="1" data-cfg="pilha" value="'+cfg.pilha+'"></label></div>'+
   '<div class="row2"><label class="fld"><span>Borda azul (mm)</span><input type="number" min="2" max="6" step="0.5" data-cfg="borda" value="'+cfg.borda+'"></label>'+
   '<label class="chk" style="align-self:end"><input type="checkbox" data-cfg="guias"'+(cfg.guias?' checked':'')+'> Linhas-guia internas</label></div></div>'+
   '<div class="kpis"><div class="kpi"><b>'+(lay?(lay.por!=null?lay.por:lay.count):0)+'</b><span>'+(c.base.par?'tags':'peças')+' por folha ('+(lay?esc(lay.desc):'')+(c.base.par?', '+lay.count+' faces':'')+')</span></div><div class="kpi"><b>'+(lay?lay.cutsAll.total:0)+'</b><span>cortes por pilha</span></div><div class="kpi"><b>'+fmt(tam.w)+'×'+fmt(tam.h)+'</b><span>mm impressos</span></div></div>'+
   (r.warn.length?'<div class="alerta erro">'+icon('alerta')+'<div>'+esc(r.warn.slice(0,3).join('; '))+'</div></div>':'')+
   '<div class="barra"><button class="btn" data-act="folha-print">'+icon('print')+' Imprimir esta folha</button></div>'+
   '<div class="card"><h3>Roteiro de corte</h3>'+(lay&&lay.pagina?'<p>Sem cortes: a peça é a própria folha. Imprima sem bordas, escala 100%.</p>':lay&&lay.count?(lay.fill.length?'<p class="muted">A faixa livre embaixo leva '+lay.fill.length+' '+(c.papel==='vinil'?'etiquetas de caixa de remédio':'mini-cartões com QR')+'.</p>':'')+(c.base.serie?'<p class="muted">Série: cada folha sai com uma variante só, para as peças encostadas terem a mesma cor.</p>':'')+(c.base.par?'<p class="muted">Frente e verso saem lado a lado, em colunas alternadas.</p>':'')+roteiroHtml(lay.cutsAll,cfg.pilha):'<p>Não cabe na A4.</p>')+
   (c.base.fold?'<p><b>Dobra:</b> marcada com traço tracejado curto na margem, em '+fmt(c.base.fold)+' mm a partir da borda da peça.</p>':'')+'</div></div>'+
   '<div><h3>Folha A4 · '+esc(AT.PAPEIS[c.papel==='metal'?'verge':c.papel].nome)+'</h3><div class="sheetlist"><div class="sheetwrap">'+r.html+'</div></div>'+(lay&&lay.pagina?'<p class="muted">Página inteira: sem marcas de corte nem régua. Na primeira impressão, confira se a impressora imprimiu até a borda.</p>':'<p class="muted">Marcas de corte só nas margens, com a medida em mm a partir da borda da folha. A régua de 100 mm no topo serve para conferir a impressão.</p>')+'</div></div>'+extra;
}

/* ---------- 6 Imprimir ---------- */
function printData(){
  if(printSel.kit){
    const K=kitSel(),pl=AT.calcPlano(st),outs=[],infos=[],warns=[];
    K.folhas.forEach(f=>{const r=AT.sheetKit(st,K.plano,f);outs.push(r.html);infos.push(r.info);r.warn.forEach(w=>warns.push(w));});
    return {pl,tmp:st,out:{html:outs.join(''),infos,warns}};
  }
  if(printSel.single){
    const c=efetivaPapel(printSel.single.pecaId,printSel.single.papel);
    const tam=AT.tamanhoImpresso(c,st.config.borda),lay=AT.fit(tam.w,tam.h,st.config.margem,{par:!!c.base.par});
    const tmp=clone(st);tmp.plano={itens:[{pecaId:c.id,qtd:Math.max(1,lay.por!=null?lay.por:lay.count),papel:c.papel}]};
    const pl=AT.calcPlano(tmp);
    return {pl,tmp,out:AT.sheetsDoPlano(tmp,pl,printSel.papel)};
  }
  const pl=AT.calcPlano(st);
  return {pl,tmp:st,out:AT.sheetsDoPlano(st,pl,printSel.papel)};
}
function renderImprimir(){
  const d=printData(),pl=d.pl;
  const grupos=pl.fila.map(g=>'<button class="btn sec" data-act="print-group" data-p="'+g.papel+'" aria-pressed="'+(printSel.papel===g.papel)+'">Só '+ART[g.papel].replace('o ','')+' ('+g.total+' folhas)</button>').join('');
  const notas=pl.fila.map(g=>'<li><b>Coloque '+ART[g.papel]+': folhas 1 a '+g.total+'</b>'+(g.papel==='kraft'?' · só tinta escura':'')+(g.papel==='comum'?' · gabaritos de colagem':'')+'</li>').join('');
  $('#tab-imprimir').innerHTML='<div class="no-print"><h2>Imprimir</h2>'+
   '<div class="alerta info">'+icon('info')+'<div><b>Escala 100%, sem ajustar à página, qualidade alta.</b> Papel A4, margens do sistema em "nenhuma" ou "padrão" sem reduzir. Imprima de 5 a 8 folhas por vez.</div></div>'+
   '<div class="alerta info">'+icon('info')+'<div>Se a HP não aparecer na lista, adicione a impressora nas configurações do sistema antes.</div></div>'+
   '<div class="card"><h3>Ordem de impressão</h3><ul class="lista">'+(notas||'<li>Plano vazio.</li>')+'</ul>'+
   '<p class="muted">Primeiro imprima uma folha e meça a régua de 100 mm no topo. A manta magnética e o azul metálico nunca entram na impressora.</p></div>'+
   '<div class="barra">'+((printSel.single||printSel.kit)?'<button class="btn sec" data-act="print-fila">Voltar para a fila do plano</button>':'')+
   '<button class="btn sec" data-act="print-group" data-p="" aria-pressed="'+(!printSel.papel)+'">Tudo ('+pl.folhasTotal+' folhas)</button>'+grupos+'</div>'+
   '<div class="barra"><button class="btn" data-act="print-go" id="btn-print">'+icon('print')+' Imprimir '+d.out.infos.length+' folhas</button></div>'+
   (d.out.warns.length?'<div class="alerta erro">'+icon('alerta')+'<div>'+esc(d.out.warns.slice(0,3).join('; '))+'</div></div>':'')+'</div>'+
   '<div class="sheetlist" id="printSheets">'+d.out.html.split('</section>').filter(x=>x.trim()).map(s=>'<div class="sheetwrap">'+s+'</section></div>').join('')+'</div>';
  lastPrint=d.out.infos;AT.lastPrint=lastPrint;
}

/* ---------- 7 Distribuição ---------- */
const DIAS=[['dom','Domingo'],['seg','Segunda'],['ter','Terça'],['qua','Quarta'],['qui','Quinta'],['sex','Sexta'],['sab','Sábado']];
const dist={bairro:'',publico:'',dia:''};
function locKey(l){return l.nome+'|'+(l.bairro||'');}
function diaMatch(l,d){
  if(!d)return true;
  const t=(l.melhor_dia||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const nome={dom:'domingo',seg:'segunda',ter:'terca',qua:'quarta',qui:'quinta',sex:'sexta',sab:'sabado'}[d];
  if(/todos os dias|diariamente/.test(t))return true;
  if(t.includes(nome))return true;
  const m=t.match(/(segunda|terca|quarta|quinta|sexta|sabado|domingo)\s+a\s+(segunda|terca|quarta|quinta|sexta|sabado|domingo)/);
  if(m){const ord=['domingo','segunda','terca','quarta','quinta','sexta','sabado'];let a=ord.indexOf(m[1]),b=ord.indexOf(m[2]),x=ord.indexOf(nome);for(let i=a;;i=(i+1)%7){if(i===x)return true;if(i===b)break;}}
  return false;
}
function renderDistrib(){
  const all=Array.isArray(G.LOCAIS)?G.LOCAIS:[];
  const bairros=[...new Set(all.map(l=>l.bairro).filter(Boolean))].sort();
  const list=all.filter(l=>(!dist.bairro||l.bairro===dist.bairro)&&(!dist.publico||AT.locaisDoPublico(dist.publico,'').includes(l))&&diaMatch(l,dist.dia));
  const tot=Object.values(st.distrib).reduce((a,x)=>a+(Number(x.qtd)||0),0);
  const feitos=all.filter(l=>st.distrib[locKey(l)]&&st.distrib[locKey(l)].feito).length;
  const cards=list.map(l=>{
    const k=locKey(l),s=st.distrib[k]||{};
    const pc=AT.pecaDef(l.peca_sugerida);
    return '<div class="loc'+(s.feito?' feito':'')+'"><label class="chk"><input type="checkbox" data-loc="'+esc(k)+'" data-f="feito"'+(s.feito?' checked':'')+'> <b>'+esc(l.nome)+'</b></label>'+
     '<p class="muted" style="margin:0">'+esc(l.tipo||'')+' · '+esc(l.bairro||'')+' · '+esc(l.endereco||'')+'</p>'+
     '<p style="margin:.3rem 0"><b>Quando:</b> '+esc(l.melhor_dia||'não informado')+(pc?'<br><b>Peça sugerida:</b> '+esc(pc.nome):'')+'</p>'+
     (l.observacao?'<p class="muted" style="margin:.2rem 0">'+esc(l.observacao)+'</p>':'')+
     '<div class="barra"><label class="fld" style="margin:0"><span>Peças entregues</span><input type="number" min="0" step="1" data-loc="'+esc(k)+'" data-f="qtd" value="'+(s.qtd||0)+'" style="max-width:120px"></label>'+
     (l.maps?'<a class="btn sec" href="'+esc(l.maps)+'" target="_blank" rel="noopener">Abrir no Google Maps</a>':'')+
     (l.fonte?'<a href="'+esc(l.fonte)+'" target="_blank" rel="noopener">Fonte</a>':'')+'</div></div>';
  }).join('')||'<p class="muted">Nenhum local com esses filtros.</p>';
  $('#tab-distribuicao').innerHTML='<h2>Roteiro de distribuição</h2><p>Lista de marcar com contagem de peças entregues. Confirme horários e regras antes de ir.</p>'+
   '<div class="card"><div class="row2"><label class="fld"><span>Bairro</span><select data-dist="bairro"><option value="">Todos</option>'+bairros.map(b=>'<option'+(b===dist.bairro?' selected':'')+'>'+esc(b)+'</option>').join('')+'</select></label>'+
   '<label class="fld"><span>Público</span><select data-dist="publico"><option value="">Todos</option>'+Object.entries(AT.PUBLICOS).map(([k,v])=>'<option value="'+k+'"'+(k===dist.publico?' selected':'')+'>'+v+'</option>').join('')+'</select></label></div>'+
   '<label class="fld"><span>Dia</span><select data-dist="dia"><option value="">Qualquer</option>'+DIAS.map(d=>'<option value="'+d[0]+'"'+(d[0]===dist.dia?' selected':'')+'>'+d[1]+'</option>').join('')+'</select></label>'+
   '<div class="kpis"><div class="kpi"><b>'+feitos+'/'+all.length+'</b><span>locais visitados</span></div><div class="kpi"><b>'+tot+'</b><span>peças entregues</span></div><div class="kpi"><b>'+list.length+'</b><span>no filtro</span></div></div></div>'+cards;
}

/* ---------- Estratégia ---------- */
function renderEstrategia(){
  st.estrategia=Object.assign({check:{},placar:{},link:'',pub:'',bairro:''},st.estrategia||{});
  $('#tab-estrategia').innerHTML=AT.estrategiaHtml(st,{icon});
}
function copiar(txt){
  const ok=()=>{const m=$('#estr-copiado');if(m)m.textContent='Texto copiado.';};
  const fb=()=>{const t=$('#estr-texto');if(t){t.focus();t.select();try{D.execCommand('copy');ok();}catch(e){const m=$('#estr-copiado');if(m)m.textContent='Selecione e copie o texto.';}}};
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(ok,fb);return;}}catch(e){}
  fb();
}

/* ---------- 8 Projeto ---------- */
function renderProjeto(){
  $('#tab-projeto').innerHTML='<h2>Projeto</h2><p>Salve tudo em um arquivo JSON (inventário, peças, plano, marcas de distribuição) ou abra um arquivo salvo antes. Os dados ficam no navegador deste aparelho.</p>'+
   '<div class="card"><div class="barra"><button class="btn" data-act="proj-save">'+icon('proj')+' Salvar projeto (JSON)</button>'+
   '<label class="btn sec" style="cursor:pointer">Abrir projeto<input type="file" accept="application/json,.json" data-act-file="proj-open" class="sr"></label></div><div id="proj-msg" aria-live="polite"></div></div>'+
   '<div class="card"><h3>Restaurar padrão</h3><p>Volta o inventário, as peças, o plano e as marcas de distribuição ao início.</p><button class="btn perigo" data-act="proj-reset" id="btn-reset">Restaurar padrão</button></div>';
}

/* ---------- eventos ---------- */
function pfValue(el){
  const k=el.dataset.pf;
  if(el.type==='checkbox')return el.checked;
  if(el.type==='number')return Math.max(15,Number(el.value)||0);
  if(k==='linhas')return el.value.split('\n').map(s=>s.trim()).filter(Boolean);
  return el.value;
}
function onClick(e){
  const t=e.target.closest('[data-tab],[data-act]');if(!t)return;
  if(t.dataset.tab){showTab(t.dataset.tab);return;}
  const a=t.dataset.act,i=+t.dataset.i;
  switch(a){
   case 'inv-export':download('inventario-atelie.json',JSON.stringify({inventario:st.inventario},null,1));break;
   case 'inv-reset':st.inventario=clone(AT.INV_PADRAO);save();renderInventario();break;
   case 'peca-sel':selPeca=t.dataset.id;renderPecas();break;
   case 'peca-plano':{st.plano.itens.push({pecaId:selPeca,qtd:10});save();showTab('plano');break;}
   case 'peca-folha':selFolhaModo='peca';selFolha={pecaId:selPeca,papel:null};showTab('folhas');break;
   case 'peca-reset':delete st.pecas[selPeca];save();renderPecas();break;
   case 'linha-sel':selLinha=t.dataset.id;renderLinhas();break;
   case 'linha-aplicar':aplicarEstiloLinha(selLinha);st.linhaAtiva=selLinha;st.plano.itens=AT.itensDaLinha(selLinha,st.kits);save();showTab('plano');break;
   case 'linha-somar':{aplicarEstiloLinha(selLinha);AT.itensDaLinha(selLinha,st.kits).forEach(n=>{const f=st.plano.itens.find(x=>x.pecaId===n.pecaId&&!x.papel);if(f)f.qtd+=n.qtd;else st.plano.itens.push(n);});save();showTab('plano');break;}
   case 'item-add':st.plano.itens.push({pecaId:'m_cartao',qtd:10});save();renderPl();break;
   case 'item-del':st.plano.itens.splice(i,1);save();renderPl();break;
   case 'plano-limpar':st.plano.itens=[];save();renderPl();break;
   case 'sug-aplicar':{const pl=AT.calcPlano(st);const s=pl.sugestoes[i];if(s){st.plano.itens[s.idx].papel=s.para;save();renderPl();}break;}
   case 'as-propor':{
    const A=AT.assistente($('#as-pub').value,Math.max(1,+$('#as-n').value||1),$('#as-oc').value);A.pessoas=Math.max(1,+$('#as-n').value||1);lastAss=A;$('#as-out').innerHTML=assOut(A);break;}
   case 'as-usar':if(lastAss){aplicarEstiloLinha(lastAss.linha);st.linhaAtiva=lastAss.linha;st.kits=lastAss.kits;st.plano.itens=clone(lastAss.itens);save();renderPl();}break;
   case 'folha-print':printSel={papel:null,single:{pecaId:selFolha.pecaId,papel:selFolha.papel}};showTab('imprimir');break;
   case 'fo-modo':selFolhaModo=t.dataset.m;renderFolhas();fitAll();break;
   case 'kit-print':printSel={papel:null,single:null,kit:true};showTab('imprimir');break;
   case 'estr-pub':st.estrategia.pub=t.dataset.p;st.estrategia.confirma='';save();renderEstrategia();break;
   case 'estr-copiar':copiar($('#estr-texto').value);break;
   case 'estr-dist':dist.publico=t.dataset.p;dist.bairro=st.estrategia.bairro||'';dist.dia='';showTab('distribuicao');break;
   case 'estr-linha':
    if(st.estrategia.confirma===t.dataset.p){aplicarEstiloLinha(t.dataset.l);st.linhaAtiva=t.dataset.l;st.plano.itens=AT.itensDaLinha(t.dataset.l,st.kits);st.estrategia.confirma='';save();showTab('plano');}
    else{st.estrategia.confirma=t.dataset.p;renderEstrategia();}
    break;
   case 'estr-puxar':{
    const tot=Object.values(st.distrib||{}).reduce((a,x)=>a+(Number(x.qtd)||0),0),P=st.estrategia.placar;
    let usado=0;for(let i=0;i<8;i++)usado+=Number((P['w'+i]||{}).ent)||0;
    const livre=Math.max(0,tot-usado);
    for(let i=0;i<8;i++){const r=P['w'+i]=P['w'+i]||{};if(!(Number(r.ent)>0)){r.ent=livre;break;}}
    save();renderEstrategia();break;}
   case 'print-go':G.print();break;
   case 'print-group':printSel.papel=t.dataset.p||null;renderImprimir();fitAll();break;
   case 'print-fila':printSel={papel:null,single:null};renderImprimir();fitAll();break;
   case 'proj-save':download('atelie-projeto.json',JSON.stringify(st,null,1));break;
   case 'proj-reset':
    if(t.dataset.ok){setState(defaults());selPeca='m_cartao';t.dataset.ok='';t.textContent='Restaurar padrão';$('#proj-msg').innerHTML='<div class="alerta ok">'+icon('ok')+'<div>Padrão restaurado.</div></div>';}
    else{t.dataset.ok='1';t.textContent='Confirmar: apagar tudo e restaurar';}
    break;
  }
}
function renderPl(){renderPlano();fitAll();}
function onInput(e){
  const el=e.target;
  if(el.dataset.inv){
    const i=st.inventario.find(x=>x.id===el.dataset.inv);if(!i)return;
    const v=el.value===''?null:Math.max(0,Number(el.value));i[el.dataset.f]=v;save();
    if(e.type==='change')renderInventario();
  }else if(el.dataset.pf){
    const k=el.dataset.pf;pecaField(selPeca,k,pfValue(el));
    if(e.type==='change'||el.tagName==='SELECT'||el.type==='checkbox'){renderPecas();}else updatePv();
  }else if(el.dataset.mg){
    st.config.marca[el.dataset.mg]=el.value;save();renderPecas();
  }else if(el.dataset.ln){
    const k=el.dataset.ln;
    if(k==='kits'){st.kits=Math.max(1,Math.min(500,Math.floor(+el.value)||1));save();if(e.type==='change')renderLinhas();return;}
    if(e.type!=='change')return;
    st.linhasCfg[selLinha]=Object.assign(st.linhasCfg[selLinha]||{},{[k]:el.value});save();renderLinhas();
  }else if(el.dataset.pi){
    const it=st.plano.itens[+el.dataset.i];if(!it)return;
    const k=el.dataset.pi;
    if(k==='qtd'){it.qtd=Math.max(1,Math.floor(+el.value)||1);}
    else if(k==='pecaId'){it.pecaId=el.value;delete it.papel;}
    else if(k==='papel'){const d=AT.pecaDef(it.pecaId);if(el.value===d.papel)delete it.papel;else it.papel=el.value;if(el.value===d.papel)it.papel=undefined;}
    save();if(e.type==='change')renderPl();
  }else if(el.dataset.check){st.check[el.dataset.check]=el.checked;save();}
  else if(el.dataset.cfg&&e.type==='change'){
    const k=el.dataset.cfg;st.config[k]=el.type==='checkbox'?el.checked:Number(el.value);
    if(k==='margem')st.config.margem=Math.max(3,Math.min(20,st.config.margem||3.5));
    if(k==='pilha')st.config.pilha=Math.max(5,Math.min(8,Math.round(st.config.pilha)||6));
    if(k==='borda')st.config.borda=Math.max(2,Math.min(6,st.config.borda||3));
    save();renderFolhas();fitAll();
  }else if(el.dataset.estr){
    const k=el.dataset.estr;st.estrategia[k]=el.value;save();
    if(k==='bairro'&&e.type==='change')renderEstrategia();
    if(k==='link'){const t=$('#estr-texto');if(t)t.value=AT.TEXTO_AVALIACAO.replace('[LINK]',el.value||'[LINK]');}
  }else if(el.dataset.estrCk){st.estrategia.check[el.dataset.estrCk]=el.checked;save();
  }else if(el.dataset.pl!==undefined){const P=st.estrategia.placar;const r=P['w'+el.dataset.pl]=P['w'+el.dataset.pl]||{};r[el.dataset.f]=Math.max(0,Math.floor(+el.value)||0);save();AT.atualizaPlacar(st,$('#tab-estrategia'));
  }else if(el.dataset.fr&&e.type==='change'){if(el.value){pecaField(selPeca,'frase',el.value);renderPecas();}
  }else if(el.dataset.vp&&e.type==='change'){verPapel=el.value;updatePv();
  }else if(el.dataset.vr&&e.type==='change'){pvReal=el.checked;updatePv();
  }else if(el.dataset.fk&&e.type==='change'){selKit[el.dataset.fk]=el.value;renderFolhas();fitAll();
  }else if(el.dataset.fo&&e.type==='change'){
    if(el.dataset.fo==='pecaId')selFolha={pecaId:el.value,papel:null};else selFolha.papel=el.value;
    renderFolhas();fitAll();
  }else if(el.dataset.dist&&e.type==='change'){dist[el.dataset.dist]=el.value;renderDistrib();}
  else if(el.dataset.loc){
    const k=el.dataset.loc;st.distrib[k]=st.distrib[k]||{};
    st.distrib[k][el.dataset.f]=el.type==='checkbox'?el.checked:Math.max(0,Math.floor(+el.value)||0);save();
    if(e.type==='change')renderDistrib();
  }
}
function onFile(e){
  const el=e.target,act=el.dataset.actFile;if(!act)return;
  const f=el.files&&el.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{
    try{
      const o=JSON.parse(rd.result);
      if(act==='inv-import'){
        const arr=Array.isArray(o)?o:o.inventario;
        if(!Array.isArray(arr))throw new Error('formato');
        const s=clone(st);s.inventario=clone(AT.INV_PADRAO);
        const m=merge(s,{inventario:arr});setState(m);renderInventario();
      }else{
        if(!o||typeof o!=='object'||!o.inventario)throw new Error('formato');
        setState(merge(defaults(),o));
        if(o.plano&&Array.isArray(o.plano.itens))st.plano.itens=o.plano.itens;
        save();
        $('#proj-msg').innerHTML='<div class="alerta ok">'+icon('ok')+'<div>Projeto aberto.</div></div>';
      }
    }catch(err){const m=$('#proj-msg');if(m)m.innerHTML='<div class="alerta erro">'+icon('alerta')+'<div>Arquivo inválido.</div></div>';}
    el.value='';
  };
  rd.readAsText(f);
}

/* ---------- início ---------- */
function init(){
  setState(load());
  buildNav();
  D.addEventListener('click',onClick);
  D.addEventListener('input',onInput);
  D.addEventListener('change',e=>{onInput(e);onFile(e);});
  G.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(REND[h]&&h!==tab)showTab(h,true);});
  const h=location.hash.slice(1);
  const go=()=>showTab(REND[h]?h:'inventario',true);
  go();
  if(D.fonts&&D.fonts.load){
    const ps=[];Object.values(AT.FONTES).forEach(f=>[400,500,600,700,800].forEach(w=>ps.push(D.fonts.load(w+' 12px '+f.css).catch(()=>0))));
    Promise.all(ps).then(()=>D.fonts.ready).then(()=>{AT.fontsReady=true;REND[tab]();fitAll();});
  }else AT.fontsReady=true;
}
AT.ui={showTab,renderAll:()=>REND[tab](),fitAll,
 setPrint(sel){printSel=sel||{papel:null,single:null};showTab('imprimir');return AT.lastPrint;},
 printPiece(pecaId,papel){return AT.ui.setPrint({papel:null,single:{pecaId,papel:papel||null}});},
 setState(s){setState(merge(defaults(),s));if(s.plano&&Array.isArray(s.plano.itens))st.plano.itens=s.plano.itens;save();REND[tab]();fitAll();},
 get state(){return st;}
};
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',init);else init();
})(window);
