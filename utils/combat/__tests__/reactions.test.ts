import type { AppliedEffect } from '@models';
import { REACTION_SPELLS } from '../../../scripts/data/reactionSpells';
import {
    addReactions, closeReactionsOf, dropReactionsFor, isReactionSpell, planOpenReaction, reactionEntriesFor, reactionSentence, reactionTriggersOf, reactionsAfterAttack,
    reactionsForReactor, removeReaction, sanitizeReactionReactorIds, sanitizeReactionText, sanitizeTrigger, suggestReactionSpells, type ReactionOfferData
} from '../reactions';

const offer = (overrides: Partial<ReactionOfferData> = {}): ReactionOfferData => ({
    id: 'r1', trigger: 'damaged', text: 'Aria Valen sofreu dano', subjectId: 'cs-ana', subjectName: 'Aria Valen', reactorId: 'cs-bia', reactorName: 'Borin', createdAt: 't', ...overrides
});

const paralisia = { id: 'p', effectId: 'p', level: 1, remaining: 2, snapshot: { name: 'Paralisia', levels: [ { level: 1, modifiers: [ { kind: 'no_actions' } ] } ] } } as unknown as AppliedEffect;

describe('o que vem do cliente', () => {
    it('só os gatilhos conhecidos', () => {
        expect(sanitizeTrigger('miss')).toBe('miss');
        expect(sanitizeTrigger('other')).toBe('other');
        expect(sanitizeTrigger('Miss')).toBeNull();
        expect(sanitizeTrigger(undefined)).toBeNull();
    });

    it('o texto livre perde espaço sobrando e fica em 140 caracteres', () => {
        expect(sanitizeReactionText('  o   orc  caiu ')).toBe('o orc caiu');
        expect(sanitizeReactionText('x'.repeat(200))).toHaveLength(140);
        expect(sanitizeReactionText(5)).toBe('');
        expect(sanitizeReactionText(undefined)).toBe('');
    });

    it('quem pode reagir: ids de texto curto, sem repetir, até 20', () => {
        expect(sanitizeReactionReactorIds([ 'a', 'a', '', 3, 'x'.repeat(81), 'b' ])).toEqual([ 'a', 'b' ]);
        expect(sanitizeReactionReactorIds('a')).toEqual([]);
        expect(sanitizeReactionReactorIds(Array.from({ length: 30 }, (_, index) => `c${index}`))).toHaveLength(20);
    });
});

describe('a frase da oferta', () => {
    it('diz o que aconteceu com quem, com o detalhe do mestre entre parênteses', () => {
        expect(reactionSentence('damaged', 'Aria Valen')).toBe('Aria Valen sofreu dano');
        expect(reactionSentence('miss', 'Aria Valen')).toBe('Um ataque contra Aria Valen errou');
        expect(reactionSentence('downed', 'Aria Valen', 'pelo orc')).toBe('Aria Valen caiu a 0 LP (pelo orc)');
        expect(reactionSentence('damaged', undefined)).toBe('Alguém sofreu dano');
    });

    it('no "outro" é o próprio texto do mestre', () => {
        expect(reactionSentence('other', 'Aria Valen', 'o chão cedeu')).toBe('o chão cedeu');
        expect(reactionSentence('other', undefined)).toBe('Algo aconteceu');
    });
});

describe('quem ganha a oferta', () => {
    const combatants = [
        { id: 'cs-ana', name: 'Aria Valen' },
        { id: 'cs-bia', name: 'Borin', actions: { padrao: 1, bonus: 1, movimento: 1, reacao: 1 } },
        { id: 'goblin-1', name: 'Goblin', actions: { padrao: 1, bonus: 1, movimento: 1, reacao: 0 } },
        { id: 'cs-caio', name: 'Caio', effects: [ paralisia ] }
    ];

    it('cada reator com a Reação disponível ganha uma oferta, com a frase e o sujeito', () => {
        const plan = planOpenReaction(combatants, { trigger: 'damaged', subjectId: 'cs-ana', reactorIds: [ 'cs-ana', 'cs-bia' ] });

        expect(plan.warnings).toEqual([]);
        expect(plan.offers).toEqual([
            { trigger: 'damaged', text: 'Aria Valen sofreu dano', subjectId: 'cs-ana', subjectName: 'Aria Valen', reactorId: 'cs-ana', reactorName: 'Aria Valen' },
            { trigger: 'damaged', text: 'Aria Valen sofreu dano', subjectId: 'cs-ana', subjectName: 'Aria Valen', reactorId: 'cs-bia', reactorName: 'Borin' }
        ]);
    });

    it('sem Reação (gasta, ou Paralisia que tira as ações) não ganha, e o aviso diz quem', () => {
        const plan = planOpenReaction(combatants, { trigger: 'miss', subjectId: 'cs-ana', reactorIds: [ 'goblin-1', 'cs-caio', 'cs-bia' ] });

        expect(plan.offers.map(entry => entry.reactorId)).toEqual([ 'cs-bia' ]);
        expect(plan.warnings).toEqual([ 'Goblin não tem a Reação disponível: sem reação.', 'Caio não tem a Reação disponível: sem reação.' ]);
    });

    it('reator que não está mais no combate vira aviso', () => {
        const plan = planOpenReaction(combatants, { trigger: 'other', reactorIds: [ 'fantasma', 'cs-bia' ], text: 'o chão cedeu' });

        expect(plan.warnings).toEqual([ 'Um dos combatentes escolhidos não está mais no combate.' ]);
        expect(plan.offers).toHaveLength(1);
        expect(plan.offers[0]).toMatchObject({ trigger: 'other', text: 'o chão cedeu', reactorId: 'cs-bia' });
        expect(plan.offers[0]).not.toHaveProperty('subjectId');
    });
});

describe('a lista de ofertas', () => {
    it('abrir de novo o mesmo gatilho para o mesmo reator troca a anterior; guarda as 20 mais novas', () => {
        const first = [ offer({ id: 'a' }), offer({ id: 'b', reactorId: 'cs-caio' }) ];
        const next = addReactions(first, [ offer({ id: 'c' }) ]);

        expect(next.map(entry => entry.id)).toEqual([ 'b', 'c' ]);
        const many = addReactions([], Array.from({ length: 25 }, (_, index) => offer({ id: `o${index}`, reactorId: `r${index}` })));
        expect(many).toHaveLength(20);
        expect(many[0]?.id).toBe('o5');
    });

    it('remove uma, fecha as de quem gastou a Reação e tira as de quem saiu do combate', () => {
        const list = [ offer({ id: 'a' }), offer({ id: 'b', reactorId: 'cs-caio' }), offer({ id: 'c', reactorId: 'cs-caio', subjectId: 'cs-bia' }) ];

        expect(removeReaction(list, 'a').map(entry => entry.id)).toEqual([ 'b', 'c' ]);
        expect(closeReactionsOf(list, 'cs-caio').map(entry => entry.id)).toEqual([ 'a' ]);
        expect(dropReactionsFor(list, 'cs-bia').map(entry => entry.id)).toEqual([ 'b' ]);
        expect(dropReactionsFor(list, 'cs-ana').map(entry => entry.id)).toEqual([ 'c' ]);
        expect(reactionsForReactor(list, 'cs-caio').map(entry => entry.id)).toEqual([ 'b', 'c' ]);
        expect(reactionsForReactor(undefined, 'x')).toEqual([]);
        expect(reactionsForReactor(list, undefined)).toEqual([]);
    });
});

describe('reação aberta sozinha ao resolver um ataque', () => {
    const combatants = [
        { id: 'cs-ana', type: 'player' }, { id: 'cs-bia', type: 'player' }, { id: 'cs-caio', type: 'player' }, { id: 'goblin-1', type: 'creature' }, { id: 'goblin-2', type: 'creature' }
    ];

    it('errou: o alvo jogador pode reagir', () => {
        expect(reactionsAfterAttack(combatants, { targetId: 'cs-ana', hit: false, dealt: 0, downed: false })).toEqual([ { trigger: 'miss', subjectId: 'cs-ana', reactorIds: [ 'cs-ana' ] } ]);
    });

    it('dano: o alvo e os aliados jogadores podem reagir; caiu a 0 LP: só os aliados', () => {
        expect(reactionsAfterAttack(combatants, { targetId: 'cs-ana', hit: true, dealt: 5, downed: false }))
            .toEqual([ { trigger: 'damaged', subjectId: 'cs-ana', reactorIds: [ 'cs-ana', 'cs-bia', 'cs-caio' ] } ]);
        expect(reactionsAfterAttack(combatants, { targetId: 'cs-ana', hit: true, dealt: 5, downed: true })).toEqual([
            { trigger: 'damaged', subjectId: 'cs-ana', reactorIds: [ 'cs-ana', 'cs-bia', 'cs-caio' ] },
            { trigger: 'downed', subjectId: 'cs-ana', reactorIds: [ 'cs-bia', 'cs-caio' ] }
        ]);
    });

    it('criatura é alvo: não há jogador do lado dela para reagir, então nada abre', () => {
        expect(reactionsAfterAttack(combatants, { targetId: 'goblin-1', hit: false, dealt: 0, downed: false })).toEqual([]);
        expect(reactionsAfterAttack(combatants, { targetId: 'goblin-1', hit: true, dealt: 5, downed: true })).toEqual([]);
    });

    it('acertou sem dano ou alvo que saiu do combate não abre nada', () => {
        expect(reactionsAfterAttack(combatants, { targetId: 'cs-ana', hit: true, dealt: 0, downed: false })).toEqual([]);
        expect(reactionsAfterAttack(combatants, { targetId: 'fantasma', hit: false, dealt: 0, downed: false })).toEqual([]);
    });
});

describe('magias de Reação que combinam com o gatilho', () => {
    const byName = (name: string) => REACTION_SPELLS.find(spell => spell.name === name)!;
    const triggersOf = (name: string) => reactionTriggersOf(byName(name));

    it('lê o gatilho de cada magia do lote de reações', () => {
        expect(triggersOf('Sombra Vingativa')).toEqual([ 'miss' ]);
        expect(triggersOf('Couraça Adaptativa')).toEqual([ 'critical' ]);
        expect(triggersOf('Último Suspiro')).toEqual([ 'downed' ]);
        expect(triggersOf('Recusa Derradeira')).toEqual([ 'downed' ]);
        expect(triggersOf('Meia-Vida')).toEqual([ 'damaged' ]);
        expect(triggersOf('Maré Retornante')).toEqual([ 'damaged' ]);
        expect(triggersOf('Cauterização Instantânea')).toEqual([ 'damaged' ]);
        expect(triggersOf('Eco do Golpe')).toEqual([ 'hit' ]);
        expect(triggersOf('Estaca Súbita')).toEqual([ 'moved' ]);
        expect(triggersOf('Laço Gravitacional')).toEqual([ 'moved' ]);
        expect(triggersOf('Orvalho Purificador')).toEqual([ 'status' ]);
        expect(triggersOf('Decodificação Reativa')).toEqual([ 'cast' ]);
        expect(triggersOf('Onda de Interrupção')).toEqual([ 'cast' ]);
        expect(triggersOf('Passo Guardião')).toEqual([ 'attacked' ]);
        expect(triggersOf('Condutor Magnético')).toEqual([ 'attacked' ]);
        expect(triggersOf('Frequência Dissonante')).toEqual([ 'attacked' ]);
        expect(triggersOf('Tremor Disruptivo').sort()).toEqual([ 'attacked', 'cast' ]);
    });

    it('as que o texto não encaixa em nenhum gatilho só combinam com "outro"', () => {
        [ 'Casca Escorregadia', 'Colchão de Ar', 'Fio da Sorte', 'Inversão Necrótica' ].forEach(name => expect(triggersOf(name)).toEqual([]));
    });

    it('só as magias de Reação entram; "outro" mostra todas elas, os outros gatilhos só as que combinam', () => {
        const sheet = [ ...REACTION_SPELLS, { name: 'Bola de Fogo', execution: 'Padrão', stages: [ 'Quando você sofrer dano, explode.' ] } ];

        expect(isReactionSpell(byName('Meia-Vida'))).toBe(true);
        expect(isReactionSpell({ name: 'Bola de Fogo', execution: 'Padrão' })).toBe(false);
        expect(isReactionSpell({ execution: 'reacao' })).toBe(true);
        expect(suggestReactionSpells(sheet, 'damaged').map(spell => spell.name)).toEqual([ 'Cauterização Instantânea', 'Maré Retornante', 'Meia-Vida' ]);
        expect(suggestReactionSpells(sheet, 'other')).toHaveLength(REACTION_SPELLS.length);
        expect(suggestReactionSpells(sheet, 'critical').map(spell => spell.name)).toEqual([ 'Couraça Adaptativa' ]);
        expect(suggestReactionSpells(undefined, 'damaged')).toEqual([]);
    });

    it('o jogador só vê a oferta em que há o que fazer (magia que combina, ou gatilho livre do mestre)', () => {
        const spells = [ byName('Sombra Vingativa'), byName('Meia-Vida') ];
        const list = [
            offer({ id: 'm', trigger: 'miss', reactorId: 'cs-bia' }),
            offer({ id: 'c', trigger: 'critical', reactorId: 'cs-bia' }),
            offer({ id: 'o', trigger: 'other', reactorId: 'cs-bia', text: 'o chão cedeu' }),
            offer({ id: 'x', trigger: 'miss', reactorId: 'cs-caio' })
        ];

        const entries = reactionEntriesFor(list, 'cs-bia', spells);
        expect(entries.map(entry => entry.offer.id)).toEqual([ 'm', 'o' ]);
        expect(entries[0]?.spells.map(spell => spell.name)).toEqual([ 'Sombra Vingativa' ]);
        expect(entries[1]?.spells).toHaveLength(2);
        expect(reactionEntriesFor(list, 'cs-bia', [])).toHaveLength(1);
    });
});
