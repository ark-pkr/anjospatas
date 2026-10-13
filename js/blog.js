(() => {
    const busca=document.querySelector('#busca-blog');
    const categoria=document.querySelector('#categoria-blog');
    const lista=document.querySelector('#artigos-blog');
    const resumo=document.querySelector('#resumo-blog');
    const vazio=document.querySelector('#blog-vazio');
    const limpar=document.querySelector('#limpar-blog');
    const anterior=document.querySelector('#anterior-blog');
    const proximo=document.querySelector('#proximo-blog');
    let pagina=1,total=0,requisicao=0,temporizador;
    const el=(tag,texto,classe)=>{const e=document.createElement(tag);e.textContent=texto;if(classe)e.className=classe;return e;};
    async function carregar(){
        const numero=++requisicao;
        anterior.disabled=true;proximo.disabled=true;vazio.hidden=true;lista.setAttribute('aria-busy','true');
        resumo.textContent='Consultando artigos...';lista.replaceChildren();limpar.disabled=!busca.value&&!categoria.value;
        try{
            const query=new URLSearchParams({pagina,busca:busca.value.trim(),categoria:categoria.value});
            const dados=await window.AnjosAPI.solicitar(`/api/blog?${query}`);
            if(numero!==requisicao)return;
            total=dados.total||0;
            for(const artigo of dados.artigos){
                const card=el('article','','blog-card');card.dataset.categoria=artigo.categoria;
                const corpo=el('div','','blog-card-conteudo');const h3=el('h3','');
                const link=el('a',artigo.titulo);link.href=`artigo.html?id=${encodeURIComponent(artigo.id)}`;h3.append(link);
                const ler=el('a','Ler artigo →','link-editorial');ler.href=link.href;ler.setAttribute('aria-label',`Ler: ${artigo.titulo}`);
                corpo.append(el('span',artigo.categoria,'rotulo-secao'),h3,el('p',artigo.resumo),ler);card.append(corpo);lista.append(card);
            }
            resumo.textContent=`${total} ${total===1?'artigo encontrado':'artigos encontrados'} · Página ${pagina} de ${Math.max(1,Math.ceil(total/12))}`;
            vazio.hidden=total>0;anterior.disabled=pagina===1;proximo.disabled=pagina*12>=total;
        }catch(erro){if(numero===requisicao)resumo.textContent=erro.message+' Use Atualizar artigos para tentar novamente.';}
        finally{if(numero===requisicao)lista.setAttribute('aria-busy','false');}
    }
    function filtrar(){pagina=1;carregar();}
    busca.addEventListener('input',()=>{clearTimeout(temporizador);temporizador=setTimeout(filtrar,300);});
    categoria.addEventListener('change',()=>{clearTimeout(temporizador);filtrar();});
    limpar.addEventListener('click',()=>{clearTimeout(temporizador);busca.value='';categoria.value='';filtrar();busca.focus();});
    anterior.addEventListener('click',()=>{if(pagina>1){pagina--;carregar();}});
    proximo.addEventListener('click',()=>{if(pagina*12<total){pagina++;carregar();}});
    document.querySelector('#atualizar-blog').addEventListener('click',carregar);
    document.querySelector('#filtros-blog').hidden=false;
    carregar();
})();
