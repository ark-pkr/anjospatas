import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
import { supabase, supabaseAdmin } from '../src/config/database.js';
import { manifestarInteresse, obterAnimalPublico, obterResultadosPublicos } from '../src/controllers/publicoController.js';
import { interesseSchema } from '../src/schemas/validationSchemas.js';

const resposta = () => ({ codigo: 200, status(n) { this.codigo = n; return this; }, json(dados) { this.dados = dados; return this; } });
function consulta(resultado) {
    return { select() { return this; }, eq() { return this; }, neq() { return this; }, maybeSingle: async () => resultado, then(resolve, reject) { return Promise.resolve(resultado).then(resolve, reject); } };
}
const pedido = { animal_id: '1', nome: 'Pessoa Teste', email: 'teste@example.com', telefone: '99999999999', cidade: 'Balsas, MA', consentimento: true };

test('interesse exige autorização e limita entrada', () => {
    assert.equal(interesseSchema.safeParse(pedido).success, true);
    assert.equal(interesseSchema.safeParse({ ...pedido, consentimento: false }).success, false);
    assert.equal(interesseSchema.safeParse({ ...pedido, telefone: '123' }).success, false);
    assert.equal(interesseSchema.safeParse({ ...pedido, mensagem: 'a'.repeat(1501) }).success, false);
    assert.equal(interesseSchema.safeParse({ ...pedido, status: 'aprovado' }).success, false);
});

test('interesse revalida disponibilidade, registra triagem e não retorna dados pessoais', async () => {
    const original = supabaseAdmin.from;
    let registro;
    try {
        supabaseAdmin.from = (tabela) => tabela === 'animais'
            ? consulta({ data: { id: 1, nome: 'Mel' }, error: null })
            : { insert: async (dados) => { registro = dados; return { error: null }; } };
        const res = resposta();
        await manifestarInteresse({ body: pedido }, res);
        assert.equal(res.codigo, 201);
        assert.deepEqual(res.dados, { sucesso: true });
        assert.equal(registro.status, 'em triagem');
        assert.equal(registro.interesse.animal_id, '1');
        assert.equal(registro.interesse.animal_nome, 'Mel');
        assert.ok(registro.interesse.consentimento_em);
        registro = null;
        supabaseAdmin.from = () => consulta({ data: null, error: null });
        const indisponivel = resposta();
        await manifestarInteresse({ body: pedido }, indisponivel);
        assert.equal(indisponivel.codigo, 409);
        assert.equal(registro, null);
    } finally { supabaseAdmin.from = original; }
});

test('cadastro duplicado não altera interessado e falha não expõe erro do banco', async () => {
    const original = supabaseAdmin.from;
    try {
        for (const [erro,codigo] of [[{code:'23505'},409],[{message:'segredo interno'},503]]) {
            supabaseAdmin.from = (tabela) => tabela === 'animais' ? consulta({ data: {id:1,nome:'Mel'}, error:null }) : { insert: async () => ({error:erro}) };
            const res = resposta();
            await manifestarInteresse({ body: pedido },res);
            assert.equal(res.codigo,codigo);
            assert.equal(JSON.stringify(res.dados).includes('segredo interno'),false);
        }
    } finally { supabaseAdmin.from = original; }
});

test('perfil rejeita ID inválido e animal ausente', async () => {
    const original = supabase.from;
    try {
        supabase.from = () => { throw new Error('Não deveria consultar'); };
        const invalido = resposta();
        await obterAnimalPublico({ params: { id: '<script>' } }, invalido);
        assert.equal(invalido.codigo, 400);
        supabase.from = () => consulta({ data: null, error: null });
        const ausente = resposta();
        await obterAnimalPublico({ params: { id: '1' } }, ausente);
        assert.equal(ausente.codigo, 404);
    } finally { supabase.from = original; }
});

test('resultados devolvem apenas contagens e preservam zero; falha não inventa indicadores', async () => {
    const original = supabaseAdmin.from;
    try {
        supabaseAdmin.from = () => consulta({ count: 0, error: null });
        const res = resposta();
        await obterResultadosPublicos({},res);
        assert.deepEqual(res.dados.dados,{animais_acolhidos:0,disponiveis:0,adocoes_registradas:0});
        supabaseAdmin.from = () => consulta({ count: null, error: {message:'segredo'} });
        const falha = resposta();
        await obterResultadosPublicos({},falha);
        assert.equal(falha.codigo,503);
        assert.equal(falha.dados.dados,undefined);
    } finally { supabaseAdmin.from = original; }
});

test('perfil renderiza texto seguro e formulário envia preferência sem gravar contato no navegador', async () => {
    const { document, window } = parseHTML(fs.readFileSync('pages/animal.html','utf8'));
    let envio;
    const form = document.querySelector('#form-interesse');
    form.reportValidity = () => true;
    form.reset = () => {};
    document.querySelector('#sucesso-interesse').focus = () => {};
    document.querySelector('#consentimento').checked = true;
    const ctx = vm.createContext({ document, URLSearchParams, FormData: class { *[Symbol.iterator]() { yield* Object.entries({nome:'Pessoa Teste', email:'teste@example.com', telefone:'(99) 99999-9999',cidade:'Balsas',estado:'MA',mensagem:''}); } }, window: {
        location: {search:'?id=1',hash:''}, AnjosAPI: { solicitar: async (url, options) => {
            if(options) { envio=JSON.parse(options.body); return {sucesso:true}; }
            return {sucesso:true,animal:{id:1,nome:'<img src=x>',situacao:'disponivel',especie:'cao'}};
        } }
    } });
    vm.runInContext(fs.readFileSync('js/animal-publico.js','utf8'),ctx);
    await new Promise(setImmediate);
    assert.equal(document.querySelector('#nome-animal').textContent,'<img src=x>');
    assert.equal(document.querySelector('#nome-animal img'),null);
    form.dispatchEvent(new window.Event('submit',{cancelable:true}));
    await new Promise(setImmediate);
    assert.equal(envio.animal_id,'1');
    assert.equal(envio.telefone,'99999999999');
    assert.equal(envio.cidade,'Balsas, MA');
    assert.equal(Object.hasOwn(envio, 'estado'),false);
    assert.equal(envio.consentimento,true);
    assert.equal(document.querySelector('#sucesso-interesse').hidden,false);
    assert.equal(form.hidden,true);
});

test('novas páginas possuem IDs únicos e campos com rótulos', () => {
    for(const path of ['pages/animal.html','pages/transparencia.html']) {
        const {document}=parseHTML(fs.readFileSync(path,'utf8'));
        const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);
        assert.equal(ids.length,new Set(ids).size);
        for(const campo of document.querySelectorAll('input,textarea')) assert.ok(document.querySelector(`label[for="${campo.id}"]`));
    }
});
