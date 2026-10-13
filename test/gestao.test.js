import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { supabaseAdmin } from '../src/config/database.js';
import { listarArtigos, obterArtigo, salvarArtigo, atualizarAcompanhamento } from '../src/controllers/gestaoController.js';
import { obterContaAdotante } from '../src/controllers/contaAdotanteController.js';
import { recuperarSenha, redefinirSenha, recuperacaoAuth } from '../src/controllers/recuperacaoController.js';
import { artigoSchema, acompanhamentoSchema, redefinirSchema } from '../src/schemas/gestaoSchemas.js';
const resposta=()=>({codigo:200,status(n){this.codigo=n;return this;},json(d){this.dados=d;return this;}});

test('rotas administrativas novas rejeitam visitantes sem sessão',async t=>{
    const servidor=app.listen(0,'127.0.0.1');await new Promise(r=>servidor.once('listening',r));
    t.after(()=>new Promise(r=>servidor.close(r)));
    const base=`http://127.0.0.1:${servidor.address().port}`;
    for(const [method,url] of [['GET','/api/admin/interessados'],['GET','/api/admin/interessados/1/historico'],['POST','/api/admin/interessados/1/acompanhamento'],['GET','/api/admin/blog'],['POST','/api/admin/blog'],['PUT','/api/admin/blog/1'],['POST','/api/adotantes']]){
        const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json'},...(method!=='GET'?{body:'{}'}:{})});
        assert.equal(r.status,401,url);await r.text();
    }
});
test('schemas limitam conteúdo, notas, código e rejeitam campos privilegiados',()=>{
    const artigo={titulo:'Novo artigo',resumo:'Um resumo informativo',categoria:'Planejamento',conteudo:'Este é um artigo com conteúdo suficiente para publicar.',publicado:false};
    assert.equal(artigoSchema.safeParse(artigo).success,true);
    assert.equal(artigoSchema.safeParse({...artigo,autor_id:'outro'}).success,false);
    assert.equal(artigoSchema.safeParse({...artigo,conteudo:'x'.repeat(40001)}).success,false);
    assert.equal(acompanhamentoSchema.safeParse({versao:1,nota:'Contato registrado',tipo:'contato'}).success,true);
    assert.equal(acompanhamentoSchema.safeParse({versao:1,nota:''}).success,false);
    assert.equal(acompanhamentoSchema.safeParse({versao:1,etapa:'inexistente'}).success,false);
    assert.equal(redefinirSchema.safeParse({email:'pessoa@example.com',codigo:'123456',password:'nova-senha'}).success,true);
    assert.equal(redefinirSchema.safeParse({email:'pessoa@example.com',codigo:'abc123',password:'nova-senha'}).success,false);
});
test('blog público filtra publicação, normaliza busca e pagina sem expor conteúdo de rascunho',async()=>{
    const original=supabaseAdmin.from;const chamadas=[];
    try{
        supabaseAdmin.from=()=>{const q={};for(const metodo of ['select','eq','ilike','order'])q[metodo]=(...args)=>{chamadas.push([metodo,...args]);return q;};q.range=async(...args)=>{chamadas.push(['range',...args]);return {data:[],count:0,error:null};};return q;};
        const res=resposta();await listarArtigos({query:{pagina:'2',busca:'Adoção'}},res);
        assert.ok(chamadas.some(c=>c[0]==='eq'&&c[1]==='publicado'&&c[2]===true));
        assert.ok(chamadas.some(c=>c[0]==='ilike'&&c[1]==='busca'&&c[2]==='%adocao%'));
        assert.deepEqual(chamadas.find(c=>c[0]==='range'),['range',12,23]);
        assert.equal(chamadas.find(c=>c[0]==='select')[1].includes('conteudo'),false);
        assert.equal(res.dados.total,0);
    }finally{supabaseAdmin.from=original;}
});
test('artigo retirado do ar não abre por ID nem endereço antigo',async()=>{
    const original=supabaseAdmin.from;const filtros=[];
    try{
        supabaseAdmin.from=()=>({select(){return this;},eq(...args){filtros.push(args);return this;},async maybeSingle(){return {data:null,error:null};}});
        for(const id of ['17','blog-planejar-adocao']){const res=resposta();await obterArtigo({params:{id}},res);assert.equal(res.codigo,404);}
        assert.equal(filtros.filter(f=>f[0]==='publicado'&&f[1]===true).length,2);
        assert.ok(filtros.some(f=>f[0]==='slug'&&f[1]==='blog-planejar-adocao'));
    }finally{supabaseAdmin.from=original;}
});
test('edição de artigo usa versão e comunica conflito sem sobrescrever',async()=>{
    const original=supabaseAdmin.from;const filtros=[];let atualizacao;
    try{
        supabaseAdmin.from=()=>({update(d){atualizacao=d;return this;},eq(...args){filtros.push(args);return this;},select(){return this;},async maybeSingle(){return {data:null,error:null};}});
        const res=resposta();await salvarArtigo({params:{id:'1'},body:{titulo:'Artigo editado',versao:4,publicado:false}},res);
        assert.deepEqual(filtros,[['id','1'],['versao',4]]);assert.equal(atualizacao.versao,5);assert.equal(res.codigo,409);
    }finally{supabaseAdmin.from=original;}
});
test('acompanhamento envia autor validado e versão à transação; conflito exige recarga',async()=>{
    const original=supabaseAdmin.rpc;let chamada;
    try{
        supabaseAdmin.rpc=async(nome,args)=>{chamada={nome,args};return {error:{code:'40001'}};};
        const res=resposta();await atualizarAcompanhamento({params:{id:'3'},user:{id:'operador-validado'},body:{etapa:'entrevista',tipo:'contato',nota:'Contato realizado',versao:2}},res);
        assert.equal(chamada.nome,'registrar_acompanhamento');assert.equal(chamada.args.p_autor,'operador-validado');assert.equal(chamada.args.p_versao,2);assert.equal(res.codigo,409);
    }finally{supabaseAdmin.rpc=original;}
});
test('área do adotante consulta somente eventos de etapa e não devolve notas',async()=>{
    const original=supabaseAdmin.from;const consultas=[];
    try{
        supabaseAdmin.from=tabela=>({select(campos){consultas.push([tabela,campos]);return this;},eq(c,v){consultas.push([c,v]);return this;},async maybeSingle(){return {data:{id:8,status:'aprovado',etapa:'entrevista',interesse:{animal_nome:'Mel'}},error:null};},order(){return this;},async limit(){return {data:[{etapa:'entrevista',criado_em:'2026-10-09'}],error:null};}});
        const res=resposta();await obterContaAdotante({contaAdotante:{email:'proprio@example.com'}},res);
        assert.ok(consultas.some(c=>c[0]==='email'&&c[1]==='proprio@example.com'));
        assert.ok(consultas.some(c=>c[0]==='tipo'&&c[1]==='etapa'));
        assert.deepEqual(consultas.find(c=>c[0]==='acompanhamento_eventos'),['acompanhamento_eventos','etapa,criado_em']);
        assert.equal(res.dados.interesse.etapa,'entrevista');assert.equal(res.dados.interesse.eventos.length,1);
    }finally{supabaseAdmin.from=original;}
});
test('recuperação usa resposta genérica para e-mail inexistente',async()=>{
    const original=recuperacaoAuth.criarCliente;
    try{
        recuperacaoAuth.criarCliente=()=>({auth:{resetPasswordForEmail:async()=>({error:{code:'user_not_found'}})}});
        const res=resposta();await recuperarSenha({body:{email:'inexistente@example.com'}},res);assert.equal(res.codigo,200);assert.match(res.dados.mensagem,/Se houver uma conta/);
    }finally{recuperacaoAuth.criarCliente=original;}
});

test('conclusão mostra o animal efetivamente adotado, sem usar apenas a preferência original',async()=>{
    const original=supabaseAdmin.from;
    try{
        supabaseAdmin.from=tabela=>({select(){return this;},eq(){return this;},order(){return this;},limit(){return tabela==='acompanhamento_eventos'?Promise.resolve({data:[],error:null}):this;},async maybeSingle(){return {data:tabela==='adotantes'?{id:8,etapa:'concluida',interesse:{animal_nome:'Preferência anterior'}}:tabela==='adocoes'?{animal_id:9,data_adocao:'2026-10-09'}:{nome:'Animal adotado'},error:null};}});
        const res=resposta();await obterContaAdotante({contaAdotante:{email:'proprio@example.com'}},res);
        assert.deepEqual(res.dados.interesse.adocao,{animal_nome:'Animal adotado',data_adocao:'2026-10-09'});
        assert.equal(res.dados.interesse.adocao.animal_id,undefined);
    }finally{supabaseAdmin.from=original;}
});
test('código inválido não altera senha; código válido encerra sessões e não retorna token',async()=>{
    const original=recuperacaoAuth.criarCliente;let verificar,atualizacoes=0,encerrou=false,invalido=true;
    try{
        recuperacaoAuth.criarCliente=()=>({auth:{verifyOtp:async d=>{verificar=d;return invalido?{error:{message:'inválido'}}:{data:{session:{access_token:'privado'}}};},updateUser:async()=>{atualizacoes++;return {};},signOut:async d=>{encerrou=d.scope==='global';return {};}}});
        const req={body:{email:'pessoa@example.com',codigo:'123456',password:'nova-senha'}};
        let res=resposta();await redefinirSenha(req,res);assert.equal(res.codigo,400);assert.equal(atualizacoes,0);
        invalido=false;res=resposta();await redefinirSenha(req,res);assert.equal(res.codigo,200);assert.equal(atualizacoes,1);assert.equal(encerrou,true);assert.equal(verificar.type,'recovery');assert.equal(res.dados.token,undefined);
    }finally{recuperacaoAuth.criarCliente=original;}
});
