(() => {
    const form=document.querySelector('#form-artigo');
    const lista=document.querySelector('#lista-artigos');
    const mensagem=document.querySelector('#mensagem-admin');
    let atual=null, alterado=false, salvando=false, pagina=1, total=0, carregando=false;
    const el=(tag,texto,classe)=>{const e=document.createElement(tag);e.textContent=texto;if(classe)e.className=classe;return e;};
    const informar=texto=>{mensagem.textContent=texto;mensagem.hidden=false;};
    function limpar(){form.reset();atual=null;alterado=false;document.querySelector('#titulo-editor').textContent='Novo artigo';document.querySelector('#previa-artigo').hidden=true;}
    form.addEventListener('input',()=>{alterado=true;});
    window.addEventListener('beforeunload',evento=>{if(alterado){evento.preventDefault();evento.returnValue='';}});
    async function carregar(){
        if(carregando)return;
        carregando=true;
        const anterior=document.querySelector('#anterior-artigos'),proximo=document.querySelector('#proximo-artigos');
        anterior.disabled=true;proximo.disabled=true;
        const botao=document.querySelector('#atualizar-artigos');botao.disabled=true;lista.setAttribute('aria-busy','true');
        try {
            const {artigos,total:contagem}=await window.AnjosAPI.solicitar(`/api/admin/blog?pagina=${pagina}`,{autenticado:true});
            total=contagem||0;
            lista.replaceChildren();
            if(!artigos.length)lista.append(el('p','Nenhum artigo cadastrado.'));
            for(const artigo of artigos){
                const card=el('article','','linha-registro');
                card.append(el('h3',artigo.titulo),el('p',`${artigo.publicado?'Publicado':'Rascunho'} · ${artigo.categoria}`));
                const editar=el('button','Editar','botao-admin secundario');editar.type='button';editar.setAttribute('aria-label',`Editar ${artigo.titulo}`);
                editar.addEventListener('click',()=>{
                    if(salvando)return;
                    if(alterado&&!window.confirm('Descartar alterações não salvas?'))return;
                    atual=artigo;
                    for(const nome of ['titulo','resumo','categoria','conteudo']) form.elements[nome].value=artigo[nome];
                    form.elements.publicado.checked=artigo.publicado;
                    alterado=false;document.querySelector('#titulo-editor').textContent='Editar artigo';document.querySelector('#previa-artigo').hidden=true;
                    document.querySelector('#titulo-artigo').focus();form.scrollIntoView({behavior:'smooth',block:'start'});
                });
                card.append(editar);
                if(artigo.publicado){const link=el('a','Ver no site','portal-link');link.href=`artigo.html?id=${encodeURIComponent(artigo.id)}`;card.append(link);}
                lista.append(card);
            }
            document.querySelector('#pagina-artigos').textContent=`Página ${pagina} de ${Math.max(1,Math.ceil(total/12))}`;
            anterior.disabled=pagina===1;proximo.disabled=pagina*12>=total;
        }catch(erro){informar(erro.message);}finally{carregando=false;botao.disabled=false;lista.setAttribute('aria-busy','false');}
    }
    document.querySelector('#novo-artigo').addEventListener('click',()=>{if(!salvando&&(!alterado||window.confirm('Descartar alterações não salvas?')))limpar();});
    document.querySelector('#prever-artigo').addEventListener('click',()=>{
        const previa=document.querySelector('#previa-artigo');previa.replaceChildren();
        previa.append(el('h2',form.elements.titulo.value),el('p',form.elements.resumo.value));
        const corpo=el('div','','artigo-corpo');window.AnjosArtigo.renderizar(corpo,form.elements.conteudo.value);previa.append(corpo);previa.hidden=false;
    });
    form.addEventListener('submit',async evento=>{
        evento.preventDefault();if(salvando||!form.reportValidity())return;
        const dados={};for(const nome of ['titulo','resumo','categoria','conteudo'])dados[nome]=form.elements[nome].value.trim();
        dados.publicado=form.elements.publicado.checked;
        if(atual)dados.versao=atual.versao;
        const botoes=[...form.querySelectorAll('button')];botoes.forEach(b=>b.disabled=true);salvando=true;
        // Evita alterar o texto enquanto a versão enviada está sendo salva.
        const campos=[...form.querySelectorAll('input,textarea,select')];campos.forEach(c=>c.disabled=true);
        try{
            const resultado=await window.AnjosAPI.solicitar(`/api/admin/blog${atual?'/'+encodeURIComponent(atual.id):''}`,{autenticado:true,method:atual?'PUT':'POST',body:JSON.stringify(dados)});
            atual=resultado.artigo;alterado=false;document.querySelector('#titulo-editor').textContent='Editar artigo';informar(dados.publicado?'Artigo salvo e publicado no blog.':'Rascunho salvo. O artigo não está disponível no site.');await carregar();
        }catch(erro){informar(erro.message);}finally{salvando=false;botoes.forEach(b=>b.disabled=false);campos.forEach(c=>c.disabled=false);}
    });
    document.querySelector('#atualizar-artigos').addEventListener('click',carregar);
    document.querySelector('#anterior-artigos').addEventListener('click',()=>{if(pagina>1&&!carregando){pagina--;carregar();}});
    document.querySelector('#proximo-artigos').addEventListener('click',()=>{if(pagina*12<total&&!carregando){pagina++;carregar();}});
    carregar();
})();
