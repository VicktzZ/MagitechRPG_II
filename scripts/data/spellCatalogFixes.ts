import type { SpellTypeChange } from '../../utils/spellTypeChanges'

/**
 * Correções do catálogo pedidas pelo dono em 29/10/2026 (segunda rodada da revisão do catálogo), aplicadas por `scripts/applySpellCatalogFixes.ts`
 * e `scripts/removeDuplicateSpells.ts`. Cada troca só vale se o campo ainda tiver o valor `from` (edição à mão no meio vira "conflito").
 */

/**
 * Nove magias gravadas com o elemento `NãO-ELEMENTAL` (o "ã" em minúscula) no lugar de `NÃO-ELEMENTAL`: o filtro de elemento "Não-Elemental" não as achava.
 * `name` é o nome da magia (rótulo da simulação).
 */
export const ELEMENT_CASE_FIXES: SpellTypeChange[] = [
    { id: '68afec438f3889f0ef902328', name: 'Convergência de Impacto', from: 'NãO-ELEMENTAL', to: 'NÃO-ELEMENTAL' },
    { id: '68afec438f3889f0ef90232b', name: 'Campo de Instabilidade Quântica', from: 'NãO-ELEMENTAL', to: 'NÃO-ELEMENTAL' },
    { id: '68afec438f3889f0ef902335', name: 'Infusão de Vitalidade', from: 'NãO-ELEMENTAL', to: 'NÃO-ELEMENTAL' },
    { id: '68afec438f3889f0ef902346', name: 'Retribuição Cinética', from: 'NãO-ELEMENTAL', to: 'NÃO-ELEMENTAL' },
    { id: '68afec438f3889f0ef90234a', name: 'Campo de Ressonância Energética', from: 'NãO-ELEMENTAL', to: 'NÃO-ELEMENTAL' },
    { id: '68afec438f3889f0ef90234d', name: 'Troca de Posição Interplanar', from: 'NãO-ELEMENTAL', to: 'NÃO-ELEMENTAL' },
    { id: '68afec438f3889f0ef902354', name: 'Deformação Temporal Localizada', from: 'NãO-ELEMENTAL', to: 'NÃO-ELEMENTAL' },
    { id: '68afec438f3889f0ef902356', name: 'Campo de Nulificação', from: 'NãO-ELEMENTAL', to: 'NÃO-ELEMENTAL' },
    { id: '68afec438f3889f0ef90235b', name: 'Campo de Reversão Gravitacional', from: 'NãO-ELEMENTAL', to: 'NÃO-ELEMENTAL' }
]

/**
 * Definição do dono (29/10/2026): **imediato** é o mesmo que instantâneo, o que é executado na hora; **tudo que dura é contínuo**.
 * Das 30 magias do lote `utilitySupportMovementSpells.ts`, estas 7 têm algum estágio com duração (minutos, horas ou turnos) e estavam `(imediato)`.
 * Só o lote novo: o resto do catálogo não foi reclassificado (depende de decisão do dono, ver CLAUDE.md).
 */
export const BATCH_DURATION_TYPE_FIXES: SpellTypeChange[] = [
    { id: 'seed-ut-vigia-luminoso', name: 'Vigia Luminoso', from: 'Utilidade (imediato)', to: 'Utilidade (contínuo)' },
    { id: 'seed-ut-interprete-arcano', name: 'Intérprete Arcano', from: 'Utilidade (imediato)', to: 'Utilidade (contínuo)' },
    { id: 'seed-ut-fogueira-eterna', name: 'Fogueira Eterna', from: 'Utilidade (imediato)', to: 'Utilidade (contínuo)' },
    { id: 'seed-ut-passagem-rochosa', name: 'Passagem Rochosa', from: 'Utilidade (imediato)', to: 'Utilidade (contínuo)' },
    { id: 'seed-ut-sonar-voltaico', name: 'Sonar Voltaico', from: 'Utilidade (imediato/Área)', to: 'Utilidade (contínuo/Área)' },
    { id: 'seed-mv-passo-de-chamas', name: 'Passo de Chamas', from: 'Movimento (imediato)', to: 'Movimento (contínuo)' },
    { id: 'seed-mv-cavalgar-a-luz', name: 'Cavalgar a Luz', from: 'Movimento (imediato/Área)', to: 'Movimento (contínuo/Área)' }
]

/**
 * Magias repetidas no catálogo: o documento `remove` é apagado e o `keep` fica. Só apaga se o conteúdo dos dois for idêntico (menos o id) e se nenhuma ficha ou
 * campanha mencionar o id a apagar. Magnetismo existia duas vezes com o texto idêntico e a mesma data de criação (migração de 24/10/2025), então não havia "a mais antiga":
 * o dono mandou apagar a `f3d` nesse caso (a `f4d` é a que a ficha 67a7ab8be4fd35fcf2ca9fa2 usa).
 */
export interface DuplicateSpell {
    name: string
    remove: string
    keep: string
}

export const DUPLICATE_SPELLS: DuplicateSpell[] = [
    { name: 'Magnetismo', remove: '67806103878f9dc617521f3d', keep: '67806103878f9dc617521f4d' }
]
