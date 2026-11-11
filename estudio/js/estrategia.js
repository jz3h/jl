/* Aba Estratégia: ensina a USAR os materiais. Conteúdo só do que está na pesquisa do projeto. */
(function(G){'use strict';
const AT=G.AT=G.AT||{};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

/* públicos do Assistente -> rótulos usados em data/locais.js */
AT.PUB_LOCAIS={familias:['familias'],idosos:['idosos'],jovens:['jovens'],sobrecarregados:['trabalho'],polimedicados:['remedios'],colegas:['colegas'],parceiros:['parceiros']};
AT.PUB_TIPOS={colegas:['coworking','universidade']};
AT.locaisDoPublico=function(pub,bairro){
  const all=Array.isArray(G.LOCAIS)?G.LOCAIS:[];
  const rot=AT.PUB_LOCAIS[pub]||[pub],tip=AT.PUB_TIPOS[pub]||[];
  return all.filter(l=>(!bairro||l.bairro===bairro)&&(((l.publico||[]).some(x=>rot.includes(x)))||tip.includes(l.tipo)));
};
/* escolhe 3 a 5, no máximo 2 do mesmo tipo */
function escolhe(list){
  const out=[],cont={};
  list.forEach(l=>{if(out.length>=5)return;const t=l.tipo||'';if((cont[t]||0)>=2)return;cont[t]=(cont[t]||0)+1;out.push(l);});
  list.forEach(l=>{if(out.length>=3||out.includes(l))return;out.push(l);});
  return out;
}

/* a jogada de cada público (texto de apoio vem da pesquisa; frases são sugestões para revisar) */
AT.JOGADAS={
 familias:{quem:'Famílias que moram perto e querem um médico que conheça a casa toda.',busca:'Termos de busca na cidade: "médico de família porto alegre", "clínico geral particular", "médico que atende em casa".',linha:'m_casa',
  gesto:'Entregar em mãos com uma frase, ou incluir no kit Casa.',frase:'Deixei aqui os telefones de emergência para a sua casa. Pode ficar na geladeira.',
  base:'O ímã e o cartão de emergência dão um motivo para guardar a peça. Pesquisa, seção 1.9 (ICE).'},
 idosos:{quem:'Idosos e quem cuida deles.',busca:'Termos de busca: "médico idoso atendimento domiciliar porto alegre". No mapa só aparecem agências de cuidadores e home care, nenhum consultório médico.',linha:'primeiro_contato',
  gesto:'Entregar em mãos com uma frase e incluir o cartão do cuidador no kit.',frase:'Este cartão guarda os contatos e a rotina de quem você cuida. Pode levar à consulta.',
  base:'Cartão de lista de remédios na carteira: estudo piloto pequeno, sem prova de efeito. Pesquisa, seção 1.6.'},
 jovens:{quem:'Adultos jovens, no notebook, no café e na fila.',busca:'Termos de busca ligados: "médico saúde mental porto alegre particular", "médico lgbt porto alegre".',linha:'chaveiro',
  gesto:'Deixar no balcão com autorização (café, livraria) e entregar o adesivo em mãos.',frase:'Uma frase para a mesa e um QR para falar comigo no WhatsApp, se um dia precisar.',
  base:'Adesivo de vinil com frase curta. Adaptação do caso da escada, que mediu escolha da escada, não saúde. Pesquisa, seção 1.1.'},
 sobrecarregados:{quem:'Quem trabalha demais e não tem tempo de procurar médico.',busca:'Termos de busca ligados: "médico dor lombar porto alegre", "médico dor crônica porto alegre", "médico saúde mental porto alegre particular".',linha:'primeiro_contato',
  gesto:'Deixar no balcão com autorização (coworking, café) e incluir o marcador na mesa.',frase:'Pausa curta: o QR leva ao meu contato, sem compromisso.',
  base:'Horários fora do expediente e agendamento online: evidência fraca, mas é o que o QR resolve. Pesquisa, tática 10.'},
 polimedicados:{quem:'Quem toma muitos remédios e tem vários médicos.',busca:'Termo de busca: "desprescrição médico porto alegre". Nenhum médico da cidade ocupa o termo.',linha:'primeiro_contato',
  gesto:'Entregar em mãos com uma frase e incluir a lista de remédios no kit.',frase:'Este é um modelo de cartão para reunir seus remédios num lugar só. Traga na consulta.',
  base:'Cuidado com porta-comprimidos em idosos: ensaio pequeno achou eventos adversos. As etiquetas só marcam o horário da caixa. Pesquisa, seção 1.8.'},
 colegas:{quem:'Colegas médicos e clínicas que podem encaminhar.',busca:'Sem termo de busca: o canal é a visita e a devolutiva rápida ao colega que encaminhou (tática 7, evidência fraca a moderada).',linha:'m_balcao',
  gesto:'Entregar em mãos numa visita e incluir o kit de colegas com os cartões de encaminhamento.',frase:'Sou médico de família. Se aparecer um caso que peça alguém para juntar as pontas, fale direto comigo.',
  base:'Nada de pagamento ou vantagem por paciente encaminhado (CEM, art. 59). Veja a tabela de Parcerias.'},
 parceiros:{quem:'Balcões de parceiros: farmácias, pilates, cafés, livrarias.',busca:'Sem termo de busca: a pessoa já está esperando no local.',linha:'m_balcao',
  gesto:'Deixar no balcão com autorização do responsável, sempre pedindo antes.',frase:'Posso deixar este display no balcão, se vocês autorizarem?',
  base:'Farmácia é zona cinzenta (deixar material) e tem itens vedados. Leia a tabela de Parcerias antes de ir.'}
};

/* parcerias: status = leitura do texto da pesquisa (seção 5), não parecer jurídico */
AT.PARCERIAS=[
 {t:'Farmácias',s:'cinza',txt:'Receber paciente encaminhado, sem contrapartida: permitido. Deixar folheto, cartão ou cartaz: zona cinzenta. Consultório em farmácia e qualquer vantagem por indicação: vedado.',peca:'display_a5'},
 {t:'Psicólogos',s:'permitido',txt:'Encaminhamento recíproco sem pagamento: permitido. Divulgação conjunta: zona cinzenta. Pagamento ou desconto cruzado por indicar: vedado.',peca:'encaminhamento'},
 {t:'Fisioterapia e pilates',s:'permitido',txt:'Encaminhamento recíproco sem pagamento: permitido. Desconto cruzado entre você e o estúdio: zona cinzenta. Vantagem por paciente: vedado.',peca:'encaminhamento'},
 {t:'Nutricionistas',s:'permitido',txt:'Igual a psicólogos. Evite indicar marcas ou produtos.',peca:'encaminhamento'},
 {t:'Academias',s:'cinza',txt:'Palestra educativa para leigos: permitido. Preço especial combinado com a academia: zona cinzenta. Remuneração por indicação e propaganda de suplementos: vedado.',peca:'display_a5'},
 {t:'Condomínios',s:'cinza',txt:'Palestra educativa: permitido. Cartaz ou mural com seu contato: zona cinzenta. Gratuidade como captação e sorteio: vedado. Norma específica: não encontrada.',peca:'display_a5'},
 {t:'Residenciais de idosos e home care',s:'cinza',txt:'Atender e ser indicado: permitido. Contrato com taxa fixa: zona cinzenta. Percentual ou taxa por paciente: vedado.',peca:'cartao_cuidador'},
 {t:'Colegas médicos',s:'permitido',txt:'O texto vedado é a vantagem por paciente encaminhado (CEM, art. 59). Devolutiva rápida a quem encaminhou é prática sugerida na pesquisa.',peca:'cartao_kit_colega'},
 {t:'Plataformas de agendamento',s:'cinza',txt:'Perfil com informações e agendamento: permitido. Comissão por consulta captada: sem posição do CFM ou do CRM-RS nos textos lidos; confirme com a Codame. Depoimento com superlativo: vedado.',peca:null}
];
AT.STATUS_PARC={permitido:'Permitido',cinza:'Zona cinzenta',vedado:'Vedado'};

AT.TEXTO_AVALIACAO='Olá! Foi um prazer cuidar de você. Se puder, deixe uma avaliação sincera sobre o atendimento no Google, neste link: [LINK]. Leva um minuto e ajuda outras pessoas a encontrarem um médico de família. Obrigado.';

/* semana tipo: quantidades calculadas do inventário atual */
AT.semanaTipo=function(st){
  const mk=(linha,want,extra)=>{try{return AT.maxKits(st,linha,want,extra);}catch(e){return {kits:0,limitado:true};}};
  const colegas=mk('primeiro_contato',5),familia=mk('m_casa',5),balcao=mk('m_balcao',3);
  const rua=mk('chaveiro',10),fim=mk('fim_de_ano',5);
  const pe=(l,k,m)=>{const L=AT.LINHAS[l];return Object.entries(L.pecas).map(([id,q])=>({id,nome:AT.pecaDef(id).nome,qtd:q*k}));};
  const sem=[
   {id:'s1',titulo:'Semana 1: colegas, família e avaliações',itens:[
     {id:'s1a',txt:'Kits para colegas',pecas:pe('primeiro_contato',colegas.kits),kits:colegas.kits,lim:colegas.limitado,pedido:5},
     {id:'s1b',txt:'Kits para a família e amigos próximos',pecas:pe('m_casa',familia.kits),kits:familia.kits,lim:familia.limitado,pedido:5},
     {id:'s1c',txt:'Enviar o pedido de avaliação no Google a quem você atendeu (texto no topo da aba)',pecas:[]}]},
   {id:'s2',titulo:'Semana 2: parceiros de balcão',itens:[
     {id:'s2a',txt:'Display com folheto, série A6 e cartões em farmácias, pilates e cafés. Peça autorização antes e leia a tabela de Parcerias.',pecas:pe('m_balcao',balcao.kits),kits:balcao.kits,lim:balcao.limitado,pedido:3}]},
   {id:'s3',titulo:'Semana 3: feira e parque',itens:[
     {id:'s3a',txt:'Chaveiro-tag e cartão em mãos, com uma frase',pecas:pe('chaveiro',rua.kits),kits:rua.kits,lim:rua.limitado,pedido:20},
     {id:'s3b',txt:'Tag, marcador e ímã calendário de fim de ano para quem aceitar conversar',pecas:pe('fim_de_ano',fim.kits),kits:fim.kits,lim:fim.limitado,pedido:5}]},
   {id:'s4',titulo:'Semana 4: revisão e reposição',itens:[
     {id:'s4a',txt:'Abrir o Placar, somar as mensagens e as consultas e ver o que repetir',pecas:[]},
     {id:'s4b',txt:'Repor o que ficou abaixo do estoque mínimo',pecas:[]}]}
  ];
  /* estoque do plano das semanas 1 a 3 */
  const itens=[];
  [colegas&&['primeiro_contato',colegas.kits],['m_casa',familia.kits],['m_balcao',balcao.kits],['chaveiro',rua.kits],['fim_de_ano',fim.kits]].forEach(a=>{if(a&&a[1]>0)AT.itensDaLinha(a[0],a[1]).forEach(i=>itens.push(i));});
  const tmp=JSON.parse(JSON.stringify(st));tmp.plano={itens};
  let repor=[];
  try{const r=AT.calcPlano(tmp);repor=Object.values(r.papel).filter(p=>p.falta||p.baixo).map(p=>({nome:p.nome,saldo:p.saldo,min:p.min,falta:p.falta}));}catch(e){}
  sem[3].itens[1].repor=repor;
  return sem;
};

/* placar: taxa simples e gráfico em SVG */
AT.taxa100=function(ent,cons){ent=+ent||0;cons=+cons||0;return ent>0?Math.round(cons/ent*10000)/100:null;};
AT.graficoPlacar=function(rows){
  const W=640,H=230,pl=44,pr=12,pt=26,pb=34;
  const vals=rows.map(r=>AT.taxa100(r.ent,r.cons));
  const max=Math.max(1,...vals.map(v=>v||0));
  const top=Math.ceil(max*1.15*10)/10;
  const bw=(W-pl-pr)/rows.length;
  let g='';
  for(let i=0;i<=4;i++){const y=pt+(H-pt-pb)*i/4;const v=top*(4-i)/4;g+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y+'" y2="'+y+'" stroke="#CDBF99" stroke-width="1"/><text x="'+(pl-6)+'" y="'+(y+4)+'" text-anchor="end" font-size="11" fill="#4A5565">'+String(Math.round(v*10)/10).replace('.',',')+'</text>';}
  rows.forEach((r,i)=>{
    const v=vals[i],x=pl+i*bw+bw*0.2,w=bw*0.6;
    const h=v==null?0:(H-pt-pb)*v/top;
    g+='<rect x="'+x.toFixed(1)+'" y="'+(H-pb-h).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="3" fill="#0A3E66"/>';
    g+='<text x="'+(x+w/2).toFixed(1)+'" y="'+(H-pb-h-5).toFixed(1)+'" text-anchor="middle" font-size="12" font-weight="700" fill="#14263B">'+(v==null?'–':String(v).replace('.',','))+'</text>';
    g+='<text x="'+(x+w/2).toFixed(1)+'" y="'+(H-pb+17)+'" text-anchor="middle" font-size="12" fill="#14263B">Sem '+(i+1)+'</text>';
  });
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Consultas por 100 peças entregues, por semana" style="width:100%;height:auto;max-width:640px;display:block"><title>Consultas por 100 peças entregues, por semana</title>'+g+'</svg>';
};

AT.placarRows=function(st){
  const P=st.estrategia.placar,N=8,rows=[];
  for(let i=0;i<N;i++){const r=P['w'+i]||{};rows.push({ent:+r.ent||0,msg:+r.msg||0,cons:+r.cons||0,av:+r.av||0});}
  const tot=rows.reduce((a,r)=>({ent:a.ent+r.ent,msg:a.msg+r.msg,cons:a.cons+r.cons,av:a.av+r.av}),{ent:0,msg:0,cons:0,av:0});
  let last=-1;rows.forEach((r,i)=>{if(r.ent>0||r.cons>0||r.msg>0)last=i;});
  return {rows,tot,nShow:Math.max(4,last+1)};
};
const fx=v=>v==null?'–':String(v).replace('.',',');
/* atualiza taxas, total e gráfico sem recriar os campos (não tira o foco de quem digita) */
AT.atualizaPlacar=function(st,root){
  const d=AT.placarRows(st);
  [...root.querySelectorAll('.tabela-r.placar .tr[data-row]')].forEach(tr=>{const r=d.rows[+tr.dataset.row];tr.querySelector('.taxa').textContent=fx(AT.taxa100(r.ent,r.cons));});
  const t=root.querySelector('.tabela-r.placar .tot');
  if(t){const sp=t.querySelectorAll('span');sp[0].textContent=d.tot.ent;sp[1].textContent=d.tot.msg;sp[2].textContent=d.tot.cons;sp[3].textContent=d.tot.av;sp[4].textContent=fx(AT.taxa100(d.tot.ent,d.tot.cons));}
  const g=root.querySelector('#estr-graf');if(g)g.innerHTML=AT.graficoPlacar(d.rows.slice(0,d.nShow));
};
AT.estrategiaHtml=function(st,ctx){
  const E=st.estrategia,icon=ctx.icon;
  const pubSel=E.pub||'',bairros=[...new Set((G.LOCAIS||[]).map(l=>l.bairro).filter(Boolean))].sort();
  /* 5. cartão fixo */
  const link=E.link||'';
  const texto=AT.TEXTO_AVALIACAO.replace('[LINK]',link||'[LINK]');
  const topo='<div class="card estr-topo"><h3>A ação mais barata hoje: levar avaliações para o Google</h3>'+
   '<p><b>Zero</b> avaliações no Google, <b>23</b> no Doctoralia. O Google é onde a busca começa. Pedir não custa nada.</p>'+
   '<label class="fld"><span>Link de avaliação do Google (copie do painel do Perfil da Empresa, em "Solicitar avaliações")</span><input type="url" inputmode="url" data-estr="link" value="'+esc(link)+'" placeholder="cole o link aqui"></label>'+
   '<label class="fld"><span>Texto pronto do pedido</span><textarea id="estr-texto" rows="4" readonly>'+esc(texto)+'</textarea></label>'+
   '<div class="barra"><button class="btn" data-act="estr-copiar">'+icon('ok')+' Copiar o texto</button><span id="estr-copiado" class="muted" role="status"></span></div>'+
   '<ul class="lista small"><li>Não ofereça nada em troca e não peça só a quem está satisfeito. Revise com a sua leitura do CFM.</li><li>Ao responder uma avaliação, não confirme que a pessoa foi sua paciente nem revele dados (sigilo, CEM art. 73 e 74).</li><li>Se você repostar uma avaliação em material seu, ela vira publicação sua (Res. CFM 2.336, art. 8º, §3º).</li></ul></div>';
  /* 1. jogadas */
  const chips='<div class="barra" role="group" aria-label="Filtrar por público"><button class="btn sec" data-act="estr-pub" data-p="" aria-pressed="'+(!pubSel)+'">Todos</button>'+Object.entries(AT.PUBLICOS).map(([k,v])=>'<button class="btn sec" data-act="estr-pub" data-p="'+k+'" aria-pressed="'+(pubSel===k)+'">'+esc(v)+'</button>').join('')+'</div>'+
   '<label class="fld" style="max-width:320px"><span>Bairro para os locais</span><select data-estr="bairro"><option value="">Todos</option>'+bairros.map(b=>'<option'+(b===E.bairro?' selected':'')+'>'+esc(b)+'</option>').join('')+'</select></label>';
  const jog=Object.entries(AT.JOGADAS).filter(([k])=>!pubSel||k===pubSel).map(([k,j])=>{
    const loc=escolhe(AT.locaisDoPublico(k,E.bairro));
    const L=AT.LINHAS[j.linha];
    const confirma=E.confirma===k;
    return '<article class="card jogada"><h3>'+esc(AT.PUBLICOS[k])+'</h3>'+
     '<dl class="dl"><dt>Quem é</dt><dd>'+esc(j.quem)+'</dd><dt>O que busca</dt><dd>'+esc(j.busca)+'</dd>'+
     '<dt>Linha indicada</dt><dd><b>'+esc(L.nome)+'</b>. '+esc(L.desc)+'</dd>'+
     '<dt>Onde encontrar</dt><dd>'+(loc.length?'<ul class="lista small">'+loc.map(l=>'<li><b>'+esc(l.nome)+'</b> · '+esc(l.bairro||'')+' · '+esc(l.tipo||'')+(l.melhor_dia?' · '+esc(l.melhor_dia):'')+'</li>').join('')+'</ul>':'<span class="muted">Nenhum local com este bairro. Escolha "Todos".</span>')+'</dd>'+
     '<dt>Como entregar</dt><dd>'+esc(j.gesto)+'</dd>'+
     '<dt>Frase de abertura</dt><dd>“'+esc(j.frase)+'” <small>(sugestão, revise)</small></dd>'+
     '<dt>O que medir</dt><dd>Mensagens no WhatsApp depois da entrega. Pergunte como chegou até você e anote no Placar.</dd></dl>'+
     '<p class="muted small">'+esc(j.base)+'</p>'+
     '<div class="barra"><button class="btn" data-act="estr-linha" data-l="'+j.linha+'" data-p="'+k+'">'+icon('plano')+' '+(confirma?'Confirmar: troca o plano atual':'Usar esta linha')+'</button>'+
     '<button class="btn sec" data-act="estr-dist" data-p="'+k+'">'+icon('mapa')+' Ver na Distribuição</button></div></article>';
  }).join('');
  /* 2. semana tipo */
  const sem=AT.semanaTipo(st);
  const semHtml=sem.map(w=>'<div class="card"><h3>'+esc(w.titulo)+'</h3>'+w.itens.map(it=>{
    const ck=!!E.check[it.id];
    let det='';
    if(it.pecas&&it.pecas.length)det='<small class="muted">'+it.pecas.map(p=>p.qtd+'× '+esc(p.nome)).join(' · ')+(it.lim?' · limitado pelo estoque atual ('+it.kits+' de '+it.pedido+' kits)':'')+(it.kits===0&&it.pedido?' · sem estoque para este kit':'')+'</small>';
    if(it.repor)det='<small class="muted">'+(it.repor.length?'Repor: '+it.repor.map(r=>esc(r.nome)+(r.falta?' (falta)':' (abaixo do mínimo)')).join(', '):'Nada abaixo do mínimo depois das semanas 1 a 3.')+'</small>';
    return '<label class="chk estr-it"><input type="checkbox" data-estr-ck="'+it.id+'"'+(ck?' checked':'')+'><span>'+esc(it.txt)+(det?'<br>'+det:'')+'</span></label>';
  }).join('')+'</div>').join('');
  /* 3. parcerias */
  const parc='<div class="tabela-r" role="table" aria-label="Tipos de parceiro"><div class="tr th" role="row"><span role="columnheader">Parceiro</span><span role="columnheader">Status</span><span role="columnheader">O que o texto diz</span><span role="columnheader">Peça</span></div>'+
   AT.PARCERIAS.map(p=>'<div class="tr" role="row"><b role="cell">'+esc(p.t)+'</b><span role="cell"><span class="st st-'+p.s+'">'+AT.STATUS_PARC[p.s]+'</span></span><span role="cell">'+esc(p.txt)+'</span><span role="cell">'+(p.peca?esc(AT.pecaDef(p.peca).nome):'<span class="muted">sem peça</span>')+'</span></div>').join('')+'</div>'+
   '<p class="muted small">Status é leitura do texto da Res. CFM 2.336/2023 e do Código de Ética Médica feita na pesquisa, não parecer jurídico. Em dúvida, consulte a Codame do CRM-RS (art. 13, V).</p>';
  /* 4. placar */
  const PD=AT.placarRows(st),rows=PD.rows,tot=PD.tot;
  const distTot=Object.values(st.distrib||{}).reduce((a,x)=>a+(Number(x.qtd)||0),0);
  const graf=AT.graficoPlacar(rows.slice(0,PD.nShow));
  const placar='<div class="card"><p>Anote uma linha por semana. A taxa é simples: consultas marcadas por 100 peças entregues. Poucas semanas variam muito, use como direção e não como prova.</p>'+
   '<div class="barra"><button class="btn sec" data-act="estr-puxar">Puxar peças entregues da Distribuição ('+distTot+')</button><small class="muted">Preenche a primeira semana vazia com o total ainda não alocado.</small></div>'+
   '<div class="tabela-r placar" role="table"><div class="tr th" role="row"><span>Semana</span><span>Peças entregues</span><span>Mensagens</span><span>Consultas marcadas</span><span>Avaliações no Google</span><span>Consultas por 100 peças</span></div>'+
   rows.map((r,i)=>{const t=AT.taxa100(r.ent,r.cons);return '<div class="tr" role="row" data-row="'+i+'"><b>Sem '+(i+1)+'</b>'+['ent','msg','cons','av'].map(f=>'<label data-l="'+({ent:'Peças entregues',msg:'Mensagens',cons:'Consultas marcadas',av:'Avaliações no Google'}[f])+'"><input type="number" min="0" step="1" inputmode="numeric" data-pl="'+i+'" data-f="'+f+'" value="'+(r[f]||'')+'" aria-label="Semana '+(i+1)+' '+({ent:'peças entregues',msg:'mensagens',cons:'consultas marcadas',av:'avaliações no Google'}[f])+'"></label>').join('')+'<span class="taxa">'+(t==null?'–':String(t).replace('.',','))+'</span></div>';}).join('')+
   '<div class="tr tot" role="row"><b>Total</b><span>'+tot.ent+'</span><span>'+tot.msg+'</span><span>'+tot.cons+'</span><span>'+tot.av+'</span><span class="taxa">'+(AT.taxa100(tot.ent,tot.cons)==null?'–':String(AT.taxa100(tot.ent,tot.cons)).replace('.',','))+'</span></div></div>'+
   '<h3 style="margin-top:12px">Consultas por 100 peças, por semana</h3><div id="estr-graf">'+graf+'</div></div>';
  return '<h2>Estratégia</h2><p>Como usar o que você imprime. Cartões curtos, uma jogada por público. O conteúdo vem da pesquisa do projeto e nenhum texto foi aprovado por IA. Revise antes de usar.</p>'+
   topo+'<h3>Jogada por público</h3>'+chips+'<div class="jogadas">'+jog+'</div>'+
   '<h3>Semana tipo</h3><p class="muted">Lista de marcar, salva neste aparelho. As quantidades saem do inventário de agora.</p><div class="semanas">'+semHtml+'</div>'+
   '<h3>Parcerias</h3>'+parc+'<h3>Placar</h3>'+placar;
};
})(window);
