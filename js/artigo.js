(() => {
    const artigo=document.querySelector('#artigo-publicado');
    const estado=document.querySelector('#estado-artigo');
    const id=artigo.dataset.slug||new URLSearchParams(window.location.search).get('id');
    async function carregar(){
        try{
            if(!id)throw new Error('Escolha um artigo no blog.');
            const {artigo:dados}=await window.AnjosAPI.solicitar(`/api/blog/${encodeURIComponent(id)}`);
            document.querySelector('#titulo-artigo').textContent=dados.titulo;
            document.querySelector('#resumo-artigo').textContent=dados.resumo;
            document.querySelector('#assunto-artigo').textContent=dados.categoria;
            document.querySelector('#data-artigo').textContent=`Publicado em ${new Date(dados.publicado_em).toLocaleDateString('pt-BR')} · ${Math.max(1,Math.ceil(dados.conteudo.split(/\s+/).length/200))} min de leitura`;
            window.AnjosArtigo.renderizar(document.querySelector('#corpo-artigo'),dados.conteudo);
            document.title=`${dados.titulo} | Anjos de Patas`;
            document.querySelector('meta[name=description]').content=dados.resumo;
            artigo.hidden=false;estado.hidden=true;
        }catch(erro){estado.textContent=erro.message;const botao=document.createElement('button');botao.type='button';botao.className='blog-limpar';botao.textContent='Tentar novamente';botao.addEventListener('click',()=>{estado.textContent='Carregando...';carregar();});estado.append(botao);}
    }
    carregar();
})();
