import { z } from 'zod';
export const etapas = ['recebido', 'triagem', 'entrevista', 'aprovado', 'concluida', 'encerrado'];
export const acompanhamentoSchema = z.object({
    etapa: z.enum(etapas).optional(),
    tipo: z.enum(['nota', 'contato']).default('nota'),
    nota: z.string().trim().max(3000).default(''),
    versao: z.number().int().nonnegative()
}).strict().refine(d => d.etapa || d.nota.length, 'Informe uma etapa ou anotação.');
export const artigoSchema = z.object({
    titulo: z.string().trim().min(5).max(180),
    resumo: z.string().trim().min(10).max(400),
    categoria: z.enum(['Planejamento', 'Adoção responsável', 'Participação']),
    conteudo: z.string().trim().min(30).max(40000),
    publicado: z.boolean(),
    versao: z.number().int().nonnegative().optional()
}).strict();
export const recuperarSchema = z.object({ email: z.string().trim().email().max(254).transform(s => s.toLowerCase()) }).strict();
export const redefinirSchema = z.object({
    email: z.string().trim().email().max(254),
    codigo: z.string().regex(/^\d{6,10}$/),
    password: z.string().min(8).max(128)
}).strict();
