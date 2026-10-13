-- Aplicar após a migração de gestão. Mantém os artigos existentes editáveis.
begin;
insert into public.blog_artigos(slug,titulo,resumo,categoria,conteudo,publicado) values('blog-planejar-adocao','Antes de adotar: organize a rotina e o novo lar','Uma decisão responsável começa com tempo, planejamento e alinhamento entre as pessoas da casa.','Planejamento','## Converse com quem divide a casa

Antes de iniciar o processo, converse sobre a decisão com as pessoas que vivem com você. Definam quem acompanhará a alimentação, a higiene, os passeios quando necessários e os atendimentos veterinários. A responsabilidade precisa continuar também nos períodos de trabalho, viagens e mudanças de rotina.

## Avalie tempo, espaço e recursos

Considere as condições do imóvel, a segurança dos acessos e a disponibilidade para acompanhar a adaptação. Organize um orçamento para as necessidades recorrentes e para imprevistos. Evite escolher apenas pela aparência: porte, faixa etária, temperamento e necessidades individuais também devem entrar na conversa.

## Conheça o animal e peça orientação

Leia o perfil no catálogo e conte à equipe como é sua rotina. Confirme as informações que não estiverem disponíveis e combine uma visita conforme as orientações da ONG. O primeiro contato é uma oportunidade de esclarecer dúvidas antes de assumir um compromisso de longo prazo.',true) on conflict(slug) do nothing;
insert into public.blog_artigos(slug,titulo,resumo,categoria,conteudo,publicado) values('blog-processo-adocao','Da manifestação de interesse ao contato com a equipe','Entenda o que acontece ao enviar o formulário e como se preparar para as próximas etapas.','Adoção responsável','## Escolha um perfil no catálogo

Consulte os animais disponíveis e abra o perfil completo. Ali você encontra as características cadastradas e as orientações para manifestar interesse. Se alguma informação não estiver preenchida, confirme com a equipe em vez de presumir a condição do animal.

## Envie os dados de contato

No formulário, informe nome, e-mail, telefone com DDD e cidade. O campo de mensagem pode ser usado para contar sobre sua rotina e o lar que pode oferecer. Não envie documentos ou informações sensíveis nesse campo. Confira os contatos antes de enviar, pois eles serão utilizados durante a triagem.

## Aguarde a avaliação e as orientações

O cadastro fica aguardando a análise da equipe. O envio não reserva o animal, não garante aprovação e não agenda uma visita automaticamente. O portal também não estabelece prazo de resposta. A equipe orientará os próximos passos e a disponibilidade deve ser confirmada durante o atendimento.',true) on conflict(slug) do nothing;
insert into public.blog_artigos(slug,titulo,resumo,categoria,conteudo,publicado) values('blog-apoiar-protecao-animal','Como conversar com a ONG para oferecer apoio','Tempo, habilidades e materiais podem contribuir com a proteção animal quando combinados com as necessidades da organização.','Participação','## Apresente sua disponibilidade

Se você deseja ajudar, informe quais atividades pode realizar e em quais dias ou horários tem disponibilidade. Transporte, organização de eventos, comunicação e apoio às rotinas são exemplos de habilidades que podem ser apresentados à equipe, sem pressupor que existam vagas abertas.

## Confirme as necessidades antes de contribuir

Antes de entregar materiais ou oferecer um serviço, confirme se a organização precisa daquele apoio e como deseja recebê-lo. Consulte os canais oficiais divulgados no portal. Não utilize dados de pagamento recebidos de terceiros sem confirmar a origem com a ONG.

## Compartilhe informações com responsabilidade

Uma forma de colaborar é divulgar os links dos perfis dos animais disponíveis. Consulte o catálogo atualizado para evitar circular informações antigas. Para publicar imagens de pessoas, relatos ou registros de adoção, combine previamente a autorização e a confirmação das informações.',true) on conflict(slug) do nothing;
commit;
