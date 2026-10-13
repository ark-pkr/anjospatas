import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import app from '../src/app.js';

test('site e API compartilham o servidor sem expor arquivos internos', async (t) => {
    const servidor = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => servidor.once('listening', resolve));
    t.after(() => new Promise((resolve) => servidor.close(resolve)));
    const base = `http://127.0.0.1:${servidor.address().port}`;
    for (const caminho of ['/', '/index.html', '/pages/login.html', '/js/api.js', '/css/style.css']) {
        const resposta = await fetch(base + caminho);
        assert.equal(resposta.status, 200, caminho);
        await resposta.text();
    }
    for (const caminho of ['/.env', '/src/config/database.js', '/package.json', '/docs/TED2-complemento.md']) {
        const resposta = await fetch(base + caminho);
        assert.equal(resposta.status, 404, caminho);
        await resposta.text();
    }
    const health = await fetch(base + '/health');
    assert.equal((await health.json()).status, 'ativo');
});

test('interface usa a origem publicada e mantém Live Server local', () => {
    const codigo = fs.readFileSync('js/api.js', 'utf8');
    for (const [location, esperado] of [
        [{ hostname: 'teste.onrender.com', port: '', origin: 'https://teste.onrender.com' }, 'https://teste.onrender.com'],
        [{ hostname: '127.0.0.1', port: '5500', origin: 'http://127.0.0.1:5500' }, 'http://localhost:3000'],
        [{ hostname: 'localhost', port: '3000', origin: 'http://localhost:3000' }, 'http://localhost:3000']
    ]) {
        const window = { location };
        vm.runInNewContext(codigo, { window });
        assert.equal(window.AnjosAPI.base, esperado);
    }
});
