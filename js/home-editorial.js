// Um relato só substitui a apresentação editorial quando foi autorizado e publicado.
(() => {
    const titulo = document.querySelector('#titulo-por-tras');
    if (!titulo) return;
    async function carregarDestaque() {
        try {
            const resposta = await fetch('assets/data/historias.json');
            if (!resposta.ok) return;
            const dados = await resposta.json();
            const historia = dados.historias?.find(h => h.publicada === true && h.autorizada === true && typeof h.titulo === 'string' && h.titulo.trim() && typeof h.relato === 'string' && h.relato.trim());
            if (!historia) return;
            titulo.textContent = historia.titulo;
            document.querySelector('#rotulo-por-tras').textContent = 'Por trás de cada adoção';
            document.querySelector('#abertura-por-tras').textContent = historia.animal ? `A história de ${historia.animal}` : 'Uma história de adoção';
            const relato = document.querySelector('#relato-por-tras');
            const p = document.createElement('p');
            const texto = historia.relato.trim();
            p.textContent = texto.length > 420 ? texto.slice(0,420).replace(/\s+\S*$/, '') + '…' : texto;
            relato.replaceChildren(p);
            const link = document.querySelector('#link-por-tras');
            link.href = 'pages/historias.html'; link.textContent = 'Ler a história completa →';
            if (typeof historia.foto === 'string' && /^(https:\/\/|\.\.\/assets\/images\/)/i.test(historia.foto)) {
                const foto = document.querySelector('#foto-por-tras');
                foto.addEventListener('error', () => {
                    foto.src = 'assets/images/adotante-acesso.jpg';
                    foto.alt = 'Cachorro golden retriever ao ar livre, segurando uma flor';
                    document.querySelector('#legenda-por-tras').textContent = 'Imagem ilustrativa';
                }, { once: true });
                foto.src = historia.foto.replace(/^\.\.\//, '');
                foto.alt = historia.foto_alt || `Registro da adoção de ${historia.animal || 'um animal'}`;
                document.querySelector('#legenda-por-tras').textContent = 'Registro de adoção · Anjos de Patas';
            }
        } catch { /* A apresentação editorial permanece acessível sem dados ou conexão. */ }
    }
    carregarDestaque();
})();
