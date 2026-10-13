import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { supabaseAdmin } from '../src/config/database.js';
import { cadastroContaAdotanteSchema } from '../src/schemas/validationSchemas.js';
import { verificarContaAdotante, obterContaAdotante } from '../src/controllers/contaAdotanteController.js';
const resposta = () => ({ codigo: 200, status(n) {this.codigo=n;return this;},json(dados){this.dados=dados;return this;} });

test('cadastro de adotante exige consentimento e senha e rejeita permissões administrativas', () => {
    const valido={nome:'Pessoa Teste',email:'teste@example.com',password:'senha-de-teste',consentimento:true};
    assert.equal(cadastroContaAdotanteSchema.safeParse(valido).success,true);
    assert.equal(cadastroContaAdotanteSchema.safeParse({...valido,password:'123'}).success,false);
    assert.equal(cadastroContaAdotanteSchema.safeParse({...valido,consentimento:false}).success,false);
    assert.equal(cadastroContaAdotanteSchema.safeParse({...valido,perfil:'admin'}).success,false);
});

test('área do adotante rejeita ausência de token e e-mail não confirmado', async () => {
    const original=supabaseAdmin.auth.getUser;
    let next=false;
    try {
        const semToken=resposta();
        await verificarContaAdotante({headers:{}},semToken,()=>{next=true;});
        assert.equal(semToken.codigo,401);
        supabaseAdmin.auth.getUser=async()=>({data:{user:{email:'teste@example.com'}},error:null});
        const semConfirmacao=resposta();
        await verificarContaAdotante({headers:{authorization:'Bearer token'}},semConfirmacao,()=>{next=true;});
        assert.equal(semConfirmacao.codigo,401);
        assert.equal(next,false);
    } finally {supabaseAdmin.auth.getUser=original;}
});

test('consulta usa e-mail validado da sessão e devolve somente o acompanhamento próprio', async () => {
    const originalAuth=supabaseAdmin.auth.getUser;
    const originalFrom=supabaseAdmin.from;
    let emailConsultado;
    try {
        supabaseAdmin.auth.getUser=async()=>({data:{user:{email:'proprio@example.com',email_confirmed_at:'2026-01-01',user_metadata:{nome:'Pessoa'}}},error:null});
        const req={headers:{authorization:'Bearer token'},query:{email:'outra@example.com'}};
        let next=false;
        await verificarContaAdotante(req,resposta(),()=>{next=true;});
        assert.equal(next,true);
        supabaseAdmin.from=()=>({select(){return this;},eq(campo,email){emailConsultado=email;return this;},async maybeSingle(){return {data:{status:'em triagem',interesse:{animal_nome:'Mel',mensagem:'informação privada',cidade:'Balsas'}},error:null};}});
        const res=resposta();await obterContaAdotante(req,res);
        assert.equal(emailConsultado,'proprio@example.com');
        assert.equal(res.dados.interesse.animal_nome,'Mel');
        assert.equal(res.dados.interesse.mensagem,undefined);
        assert.equal(res.dados.conta.email,'proprio@example.com');
    } finally {supabaseAdmin.auth.getUser=originalAuth;supabaseAdmin.from=originalFrom;}
});

test('consulta sem manifestação não cria pedido nem inventa situação', async () => {
    const original=supabaseAdmin.from;
    try {
        supabaseAdmin.from=()=>({select(){return this;},eq(){return this;},async maybeSingle(){return {data:null,error:null};}});
        const res=resposta();await obterContaAdotante({contaAdotante:{email:'teste@example.com'}},res);
        assert.equal(res.dados.interesse,null);
    } finally {supabaseAdmin.from=original;}
});
