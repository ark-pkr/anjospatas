// Renderizacao por texto: o editor nunca injeta HTML no portal.
window.AnjosArtigo = {
    renderizar(destino, conteudo) {
        destino.replaceChildren();
        for (const bloco of String(conteudo).split(/\n\s*\n/)) {
            const texto = bloco.trim();
            if (!texto) continue;
            const titulo = /^##\s+/.test(texto);
            const el = document.createElement(titulo ? 'h2' : 'p');
            el.textContent = titulo ? texto.replace(/^##\s+/,'') : texto;
            destino.append(el);
        }
    }
};
