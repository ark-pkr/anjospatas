const estadoHistorias = document.querySelector('#estado-historias');
const listaHistorias = document.querySelector('#lista-historias');
const tentarHistorias = document.querySelector('#recarregar-historias');
function textoHistoria(tag, texto, classe) {
    const el = document.createElement(tag);
    el.textContent = texto;
    if (classe) el.className = classe;
    return el;
}
async function carregarHistorias() {
    estadoHistorias.hidden = false;
    estadoHistorias.textContent = 'Carregando histórias...';
    tentarHistorias.hidden = true;
    listaHistorias.replaceChildren();
    try {
        const resposta = await fetch('../assets/data/historias.json');
        if (!resposta.ok) throw new Error('Falha na consulta');
        const dados = await resposta.json();
        if (!Array.isArray(dados.historias)) throw new Error('Formato inválido');
        const historias = dados.historias.filter(h => h.publicada === true && h.autorizada === true && typeof h.titulo === 'string' && typeof h.relato === 'string');
        for (const historia of historias) {
            const artigo = document.createElement('article');
            artigo.className = 'historia-card';
            if (typeof historia.foto === 'string' && /^(https:\/\/|\.\.\/assets\/images\/)/i.test(historia.foto)) {
                const foto = document.createElement('img');
                foto.src = historia.foto;
                foto.alt = historia.foto_alt || `Registro da adoção de ${historia.animal || 'um animal'}`;
                foto.loading = 'lazy';
                foto.addEventListener('error', () => foto.remove());
                artigo.append(foto);
            }
            const conteudo = document.createElement('div');
            conteudo.className = 'historia-conteudo';
            if (historia.animal) conteudo.append(textoHistoria('span', historia.animal, 'rotulo-secao'));
            conteudo.append(textoHistoria('h2', historia.titulo), textoHistoria('p', historia.relato));
            if (historia.depoimento) {
                const citacao = textoHistoria('blockquote', historia.depoimento);
                if (historia.autoria) citacao.append(textoHistoria('cite', historia.autoria));
                conteudo.append(citacao);
            }
            artigo.append(conteudo);
            listaHistorias.append(artigo);
        }
        estadoHistorias.hidden = historias.length > 0;
        estadoHistorias.textContent = 'Ainda não há histórias publicadas. Os relatos serão disponibilizados após confirmação das informações e autorização de uso das imagens e depoimentos.';
    } catch {
        estadoHistorias.textContent = 'Não foi possível carregar as histórias. Tente novamente.';
        tentarHistorias.hidden = false;
    }
}
tentarHistorias.addEventListener('click', carregarHistorias);
carregarHistorias();
