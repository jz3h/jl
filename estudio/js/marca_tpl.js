/* GERADO a partir dos desenhos .dc.html aprovados (Cartao, FolhetoA4, ImaCalendario, BlocoCompras, Marcadores, SerieA6). Tamanhos em px do desenho; marca.js converte para mm. */
(function(G){'use strict';
const T=(G.AT=G.AT||{}).TPL={};
T.cartao=(c,t,Q)=>`<div style="width: 100%; height: 100%; position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); overflow: hidden; font-family: 'Source Serif 4', Georgia, serif">

  <div style="background: ${c.ink}; color: ${c.onink}; padding: 40px 32px 30px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start">
    <div style="font-size: 31px; line-height: 1.12; font-style: italic; font-weight: 500; letter-spacing: -0.005em">Um médico.<br>A história toda.</div>
    <div style="align-self: stretch; display: flex; flex-direction: column; align-items: center; gap: 10px">
      <div style="background: #FFFFFF; border-radius: 14px; padding: 8px">
        <img src="${Q}" alt="QR que abre o WhatsApp do consultório" style="display: block; width: 138px; height: 138px">
      </div>
      <div style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 15px; font-weight: 600; text-align: center; line-height: 1.3">Aponte a câmera<br>e marque sua consulta</div>
    </div>
    <div style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${c.acc2}">Consultório · Casa · Vídeo</div>
  </div>

  <div style="background: ${c.paper}; color: ${c.ink}; padding: 40px 30px 30px 34px; display: flex; flex-direction: column; justify-content: space-between">
    <div style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.32em; color: ${c.acc}">DR.</div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <div style="font-family: ${t.nome}; font-size: ${t.tam}; line-height: 0.92; font-weight: ${t.peso}; letter-spacing: ${t.esp}">José<br>Linhares</div>
      <div style="font-size: 19px; line-height: 1.25; font-style: italic; font-weight: 500">Médico de Família<br>e Comunidade</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; font-family: 'Bricolage Grotesque', sans-serif">
      <div style="font-size: 14px; font-weight: 700; letter-spacing: 0.04em">CRM-RS 49835 · RQE 41886</div>
      <div style="font-size: 14px; font-weight: 500; opacity: 0.86">Mestrando em Gerontologia Biomédica<br>PUCRS</div>
      <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 10px">
        <span style="font-size: 26px; font-weight: 800; letter-spacing: -0.01em">(51) 99816-5913</span>
      </div>
      <div style="font-size: 14px; font-weight: 600; color: ${c.acc}">WhatsApp</div>
    </div>
  </div>

  <div aria-hidden="true" style="position: absolute; left: 0; right: 0; top: 124px; height: 2px; background: ${c.acc2}; opacity: 0.9"></div>
  <div aria-hidden="true" style="position: absolute; left: 330px; right: 0; top: 124px; height: 2px; background: ${c.acc}"></div>
  <div aria-hidden="true" style="position: absolute; left: 606px; top: 117px; width: 16px; height: 16px; border-radius: 50%; background: ${c.acc}"></div>
</div>`;
T.folheto=(c,talvez,t,Q)=>`<div style="width: 100%; height: 100%; position: relative; display: flex; flex-direction: column; background: ${c.paper}; color: ${c.ink}; font-family: 'Source Serif 4', Georgia, serif; overflow: hidden">

  <div style="position: relative; background: ${c.ink}; color: ${c.onink}; padding: 52px 64px 46px; display: flex; flex-direction: column; gap: 22px; border-bottom: 3px solid ${c.acc}">
    <div aria-hidden="true" style="position: absolute; right: 82px; bottom: -14px; width: 23px; height: 23px; border-radius: 50%; background: ${c.acc}; box-shadow: 0 0 0 6px ${c.paper}"></div>
    <div style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: ${c.acc2}">Medicina de Família · Porto Alegre</div>
    <h1 style="margin: 0; font-family: 'Bricolage Grotesque', sans-serif; font-size: 62px; line-height: 1; font-weight: 800; letter-spacing: -0.035em">Você tem um médico?<br>Ou só tem consultas?</h1>
    <p style="margin: 0; font-size: 23px; line-height: 1.38; max-width: 640px">Quando cada especialista olha uma parte, alguém precisa olhar você inteiro. É exatamente isso que eu faço.</p>
  </div>


  <div style="flex-grow: 1; padding: 40px 64px 0; display: flex; flex-direction: column; gap: 26px">
    <div>
      <h2 style="margin: 0 0 18px; font-family: 'Bricolage Grotesque', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -0.01em">Talvez seja para você, se…</h2>
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 34px">
        ${(talvez).map(t=>`
          <div style="display: flex; gap: 14px; align-items: flex-start">
            <span style="flex: 0 0 auto; font-size: 30px; line-height: 1; font-style: italic; font-weight: 600; color: ${c.acc}">${t.n}</span>
            <span style="font-size: 17px; line-height: 1.34">${t.txt}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; border-top: 1.5px solid ${c.line}; padding-top: 26px">
      <div><div style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 19px; font-weight: 800; margin-bottom: 6px">Consulta sem pressa</div><div style="font-size: 15px; line-height: 1.38">Primeiro a sua história inteira. Depois o exame, se precisar.</div></div>
      <div><div style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 19px; font-weight: 800; margin-bottom: 6px">Plano a dois</div><div style="font-size: 15px; line-height: 1.38">Você sai sabendo o que fazer, o que não precisa fazer e por quê.</div></div>
      <div><div style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 19px; font-weight: 800; margin-bottom: 6px">O mesmo médico</div><div style="font-size: 15px; line-height: 1.38">No retorno ninguém conta tudo de novo. E eu coordeno os especialistas.</div></div>
    </div>
  </div>

  <div style="margin: 26px 40px 0; background: ${c.soft}; border-radius: 18px; padding: 22px 28px; display: flex; gap: 28px; align-items: center">
    <div style="flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 8px">
      <div style="${t.n(34,1,'-0.02em','-0.01em')}">Dr. José Linhares</div>
      <div style="font-size: 18px; font-style: italic">Médico de Família e Comunidade</div>
      <ul style="margin: 6px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; font-size: 15px; line-height: 1.35">
        <li>Residência em Medicina de Família na rede de Porto Alegre</li>
        <li>Mestrando em Gerontologia Biomédica · PUCRS</li>
        <li>Coorganizador de livro de Atenção Primária · EdiPUCRS</li>
      </ul>
      <div style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: ${c.acc}; margin-top: 6px">Consultório · Em casa · Por vídeo</div>
    </div>
    <div style="flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: 8px">
      <div style="background: #FFFFFF; border-radius: 14px; padding: 8px"><img src="${Q}" alt="QR que abre o WhatsApp do consultório" style="display: block; width: 132px; height: 132px"></div>
      <div style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 16px; font-weight: 700; text-align: center">Aponte a câmera e marque</div>
      <div style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 800">(51) 99816-5913</div>
    </div>
  </div>

  <div style="padding: 16px 64px 24px; display: flex; justify-content: space-between; gap: 20px; font-family: 'Bricolage Grotesque', sans-serif; font-size: 13px; font-weight: 600; line-height: 1.4">
    <span>José Dias Linhares Júnior · MÉDICO · CRM-RS 49835 · MFC · RQE 41886</span>
    <span style="white-space: nowrap; color: ${c.acc}">Emergência: 192</span>
  </div>
</div>`;
T.calendario=(c,meses,sem,t,Q)=>`<div style="width: 100%; height: 100%; box-sizing: border-box; background: ${c.paper}; color: ${c.ink}; font-family: 'Bricolage Grotesque', sans-serif; display: flex; flex-direction: column">
  <div style="position: relative; background: ${c.ink}; color: ${c.onink}; padding: 40px 48px 34px; display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; border-bottom: 4px solid ${c.acc}">
    <div style="font-size: 168px; line-height: 0.78; font-weight: 800; letter-spacing: -0.05em">2027</div>
    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px; text-align: right; padding-bottom: 6px">
      <div style="font-family: 'Source Serif 4', serif; font-size: 30px; line-height: 1.1; font-style: italic">Circule o mês<br>do seu check-up.</div>
      <div style="font-size: 17px; font-weight: 600; color: ${c.acc2}">E marque antes que o ano passe.</div>
    </div>
    <div aria-hidden="true" style="position: absolute; right: 60px; bottom: -16px; width: 28px; height: 28px; border-radius: 50%; background: ${c.acc}; box-shadow: 0 0 0 6px ${c.paper}"></div>
  </div>

  <div style="flex-grow: 1; padding: 34px 40px 18px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px 30px">
    ${(meses).map(m=>`
      <div style="display: flex; flex-direction: column; gap: 6px">
        <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.01em; color: ${m.cor}">${m.nome}</div>
        <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); row-gap: 3px; text-align: center; font-size: 17px; font-weight: 500; font-variant-numeric: tabular-nums">
          ${(sem).map(w=>`
            <div style="font-size: 13px; font-weight: 700; opacity: 0.6">${w}</div>
          `).join('')}
          ${(m.dias).map(d=>`
            <div style="font-weight: ${d.peso}; color: ${d.cor}">${d.n}</div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>

  <div style="margin: 0 40px 34px; padding-top: 20px; border-top: 2px solid ${c.line}; display: flex; align-items: center; gap: 24px">
    <div style="background: #FFFFFF; border-radius: 12px; padding: 6px; flex: 0 0 auto"><img src="${Q}" alt="QR que abre o WhatsApp do consultório" style="display: block; width: 126px; height: 126px"></div>
    <div style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px">
      <div style="${t.n(34,1,'-0.02em','-0.01em')}">Dr. José Linhares</div>
      <div style="font-family: 'Source Serif 4', serif; font-size: 20px; font-style: italic">Médico de Família e Comunidade</div>
      <div style="font-size: 16px; font-weight: 600">MÉDICO · CRM-RS 49835 · RQE 41886</div>
    </div>
    <div style="flex: 0 0 auto; text-align: right; display: flex; flex-direction: column; gap: 4px">
      <div style="font-size: 15px; font-weight: 700; color: ${c.acc}">Agende pelo WhatsApp</div>
      <div style="font-size: 28px; font-weight: 800">(51) 99816-5913</div>
      <div style="font-size: 14px; font-weight: 600; opacity: 0.8">Feriados nacionais e do RS em destaque</div>
    </div>
  </div>
</div>`;
T.bloco=(c,grupos,t,Q)=>`<div style="width: 100%; height: 100%; box-sizing: border-box; background: ${c.paper}; color: ${c.ink}; font-family: 'Bricolage Grotesque', sans-serif; display: flex; flex-direction: column">
  <div style="position: relative; background: ${c.ink}; color: ${c.onink}; padding: 34px 36px 28px; border-bottom: 4px solid ${c.acc}">
    <div style="font-size: 54px; line-height: 0.95; font-weight: 800; letter-spacing: -0.035em">Lista da<br>semana</div>
    <div style="font-family: 'Source Serif 4', serif; font-size: 20px; font-style: italic; margin-top: 10px; color: ${c.acc2}">O que falta em casa. E em você.</div>
    <div aria-hidden="true" style="position: absolute; right: 40px; bottom: -14px; width: 24px; height: 24px; border-radius: 50%; background: ${c.acc}; box-shadow: 0 0 0 6px ${c.paper}"></div>
  </div>
  <div style="flex-grow: 1; padding: 30px 36px 0; display: flex; flex-direction: column; gap: 20px">
    ${(grupos).map(g=>`
      <div style="display: flex; flex-direction: column">
        <div style="font-size: 17px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: ${c.acc}; margin-bottom: 2px">${g.nome}</div>
        ${(g.linhas).map(l=>`
          <div style="display: flex; align-items: center; gap: 12px; height: 40px; border-bottom: 1.5px solid ${c.line}">
            <span aria-hidden="true" style="width: 18px; height: 18px; border: 2px solid ${c.ink}; border-radius: 4px; flex: 0 0 auto; opacity: 0.55"></span>
            <span style="font-family: 'Source Serif 4', serif; font-size: 18px; font-style: italic">${l}</span>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>
  <div style="margin: 22px 36px 30px; padding-top: 16px; border-top: 2px solid ${c.line}; display: flex; align-items: center; gap: 16px">
    <div style="background: #FFFFFF; border-radius: 10px; padding: 5px; flex: 0 0 auto"><img src="${Q}" alt="QR que abre o WhatsApp do consultório" style="display: block; width: 104px; height: 104px"></div>
    <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0">
      <div style="${t.n(26,1,'-0.02em','-0.01em')}">Dr. José Linhares</div>
      <div style="font-family: 'Source Serif 4', serif; font-size: 16px; font-style: italic">Médico de Família e Comunidade</div>
      <div style="font-size: 14px; font-weight: 600">MÉDICO · CRM-RS 49835 · RQE 41886</div>
      <div style="font-size: 20px; font-weight: 800">(51) 99816-5913</div>
    </div>
  </div>
</div>`;
T.marcador=(m,linhas,t,Q)=>`<div style="width: 100%; height: 100%; box-sizing: border-box; background: ${m.paper}; color: ${m.ink}; display: flex; flex-direction: column; font-family: 'Bricolage Grotesque', sans-serif; ">
      <div style="position: relative; background: ${m.ink}; color: ${m.onink}; padding: 36px 24px 30px; border-bottom: 3px solid ${m.acc}; display: flex; flex-direction: column; gap: 14px">
        <div style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${m.acc2}">Leituras sem pressa · ${m.num}</div>
        <div style="font-family: 'Source Serif 4', serif; font-size: 34px; line-height: 1.08; font-style: italic; font-weight: 500">${m.frase}</div>
        <div aria-hidden="true" style="position: absolute; right: 26px; bottom: -12px; width: 20px; height: 20px; border-radius: 50%; background: ${m.acc}; box-shadow: 0 0 0 5px ${m.paper}"></div>
      </div>
      <div style="flex-grow: 1; padding: 30px 24px 0; display: flex; flex-direction: column; gap: 14px">
        <div style="font-size: 17px; font-weight: 800">Livros que li em 2027</div>
        ${(linhas).map(l=>`
          <div style="display: flex; align-items: flex-end; gap: 8px; height: 30px; border-bottom: 1.5px solid ${m.line}; font-family: 'Source Serif 4', serif; font-size: 16px; font-style: italic; color: ${m.acc}">${l}</div>
        `).join('')}
      </div>
      <div style="margin: 24px 24px 0; padding: 14px 0; border-top: 1.5px solid ${m.line}; display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700">
        <span aria-hidden="true" style="width: 18px; height: 18px; border: 2px solid ${m.ink}; border-radius: 4px; flex: 0 0 auto"></span>
        <span>Check-up de 2027 marcado</span>
      </div>
      <div style="padding: 6px 24px 28px; display: flex; align-items: center; gap: 12px">
        <div style="background: #FFFFFF; border-radius: 8px; padding: 4px; flex: 0 0 auto"><img src="${Q}" alt="QR que abre o WhatsApp do consultório" style="display: block; width: 84px; height: 84px"></div>
        <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0">
          <div style="${t.n(18,1.05,0,0)}">Dr. José<br>Linhares</div>
          <div style="font-family: 'Source Serif 4', serif; font-size: 14px; font-style: italic">Médico de Família</div>
          <div style="font-size: 13px; font-weight: 600">CRM-RS 49835<br>RQE 41886</div>
          <div style="font-size: 14px; font-weight: 800; margin-top: 2px">(51) 99816-5913</div>
        </div>
      </div>
    </div>`;
T.serie=(m,t,Q)=>`<div style="width: 100%; height: 100%; box-sizing: border-box; background: ${m.fundo}; color: ${m.txt}; padding: 30px 26px 22px; display: flex; flex-direction: column; justify-content: space-between; ">
        <div style="display: flex; align-items: center"><div style="flex-grow: 1; height: 2px; background: ${m.acc}"></div><div style="width: 14px; height: 14px; border-radius: 50%; background: ${m.acc}"></div><div style="width: 22px; height: 2px; background: ${m.acc}"></div></div>
        <div style="display: flex; flex-direction: column; gap: 14px">
          <div style="font-size: 40px; line-height: 1; font-weight: 800; letter-spacing: -0.03em">${m.titulo}</div>
          <div style="font-family: 'Source Serif 4', serif; font-size: 18px; line-height: 1.35">${m.texto}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px">
          <div style="background: #FFFFFF; border-radius: 8px; padding: 4px; flex: 0 0 auto"><img src="${Q}" alt="QR que abre o WhatsApp do consultório" style="display: block; width: 86px; height: 86px"></div>
          <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0">
            <div style="${t.n(20,1,0,0)}">Dr. José Linhares</div>
            <div style="font-family: 'Source Serif 4', serif; font-size: 14px; font-style: italic">Médico de Família e Comunidade</div>
            <div style="font-size: 13px; font-weight: 600">MÉDICO · CRM-RS 49835 · RQE 41886</div>
            <div style="font-size: 17px; font-weight: 800">(51) 99816-5913</div>
          </div>
        </div>
      </div>`;
})(window);
