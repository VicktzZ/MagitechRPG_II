import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getSpellProgress } from '../../../utils/spellStages';
import theme from '../../../themes/theme';
import StageLadder from '../StageLadder';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>);
const noop = (): void => undefined;

const stages = [
    'Causa 2d6 de dano de fogo em um alvo a 9m.',
    'Causa 3d6 de dano de fogo em um alvo a 9m e o deixa em chamas por 2 turnos.',
    'Causa 4d6 de dano de fogo em todos os alvos a 9m e os deixa em chamas por 2 turnos.'
];
const water3 = { id: 'w3', name: 'Maré Alta', level: 3, element: 'ÁGUA', mpCost: 7, stages };
const fire4 = { id: 'f4', name: 'Inferno', level: 4, element: 'FOGO', mpCost: 12, stages };

const ladder = (spell: typeof water3, sheet: Parameters<typeof getSpellProgress>[1], extra: Partial<Parameters<typeof StageLadder>[0]> = {}): string =>
    render(<StageLadder spell={spell} progress={getSpellProgress(spell, sheet, { enabled: true })} {...extra} />);

describe('StageLadder', () => {
    it('mostra os estágios liberados abertos e o texto de cada um, sem "estágio ativo"', () => {
        const html = ladder(water3, { spellUnlocked: { w3: 2 } });
        expect(html).toContain('data-testid="stage-row-1"');
        expect(html).toContain('data-testid="stage-row-2"');
        expect(html).toContain('Causa 2d6 de dano de fogo');
        expect(html).toContain('em chamas por 2 turnos');
        expect(html).not.toContain('stage-active-chip');
        expect(html).not.toContain('>Ativo<');
        // o estágio 3 ainda está bloqueado (é o próximo a liberar) e não mostra o texto
        expect(html).toContain('data-status="next"');
        expect(html).not.toContain('4d6');
        expect(ladder(water3, {})).toContain('data-status="locked"');
    });

    it('destaca o que é novo em relação ao estágio anterior', () => {
        const html = ladder(water3, { spellUnlocked: { w3: 2 } });
        expect(html).toContain('data-testid="stage-diff-mark"');
        expect(html).toMatch(/<mark[^>]*>3d6<\/mark>/);
        expect(html).toContain('O destaque mostra o que é novo');
    });

    it('o estágio 1 não tem destaque', () => {
        const html = ladder(water3, {});
        expect(html).not.toContain('data-testid="stage-diff-mark"');
    });

    it('mostra o custo em MP de cada estágio com a diferença para o anterior', () => {
        const html = ladder(water3, { spellUnlocked: { w3: 3 } });
        // nível 3: base 7, estágio 2 +2, estágio 3 +5
        expect(html).toContain('7 MP');
        expect(html).toContain('9 MP (+2)');
        expect(html).toContain('12 MP (+3)');
    });

    it('o custo do estágio 3 do nível 4 usa o extra da Maestria (sem NaN)', () => {
        // A Maestria só está liberada para quem tem a maestria no elemento
        const html = ladder(fire4, { elementalMastery: 'FOGO', spellUnlocked: { f4: 3 } });
        expect(html).toContain('21 MP');
        expect(html).not.toContain('NaN');
        expect(html).toContain('Maestria');
    });

    it('bloqueados mostram o custo em pontos de evolução, explícito', () => {
        const html = ladder(water3, {});
        expect(html).toContain('Custa 2 pontos de evolução');
        expect(html).toContain('Custa 2 pontos de evolução, depois do Estágio 2');
        const fire = ladder(fire4, { spellUnlocked: { f4: 1 } });
        expect(fire).toContain('Custa 3 pontos de evolução');
        expect(fire).toContain('Abre sozinho com maestria em fogo, depois do Estágio 2');
    });

    it('o jogador com pontos suficientes vê o botão Evoluir com o preço', () => {
        const html = ladder(water3, {}, { evolution: { points: 2, onEvolve: noop } });
        expect(html).toContain('data-testid="stage-evolve"');
        expect(html).toContain('Evoluir (2 pontos)');
        expect(html).not.toMatch(/data-testid="stage-evolve"[^>]*disabled/);
        expect(html).not.toContain('data-testid="stage-evolve-reason"');
    });

    it('sem pontos suficientes o botão fica desabilitado e diz o que falta', () => {
        const html = ladder(water3, {}, { evolution: { points: 1, onEvolve: noop } });
        expect(html).toMatch(/<button[^>]*disabled[^>]*data-testid="stage-evolve"|<button[^>]*data-testid="stage-evolve"[^>]*disabled/);
        expect(html).toContain('Faltam 1 ponto de evolução (você tem 1). Peça ao mestre.');
    });

    it('a Maestria que não se compra não tem botão e explica', () => {
        const html = ladder(fire4, { spellUnlocked: { f4: 2 } }, { evolution: { points: 9, onEvolve: noop } });
        expect(html).not.toContain('data-testid="stage-evolve"');
        expect(html).not.toContain('data-testid="stage-evolve-reason"');
        expect(html).toContain('Abre sozinho com maestria em fogo; não se compra com pontos');
    });

    it('com maestria no elemento a Maestria aparece aberta pela maestria', () => {
        const html = ladder(fire4, { spellUnlocked: { f4: 2 }, elementalMastery: 'FOGO' });
        expect(html).toContain('Aberta pela maestria');
        expect(html).toContain('data-testid="stage-row-3"');
        expect(html).not.toContain('data-status="locked"');
    });

    it('na visão do mestre (sem evoluir) o custo aparece mas não há botão', () => {
        const html = ladder(water3, {});
        expect(html).toContain('Custa 2 pontos de evolução');
        expect(html).not.toContain('data-testid="stage-evolve"');
    });

    it('cada estágio liberado tem o próprio botão de conjurar, e o bloqueado não tem', () => {
        const html = ladder(water3, { spellUnlocked: { w3: 2 } }, { cast: { onCast: noop, currentMp: 20 } });
        expect(html).toContain('data-testid="stage-cast-1"');
        expect(html).toContain('data-testid="stage-cast-2"');
        expect(html).not.toContain('data-testid="stage-cast-3"');
        expect(html).toContain('aria-label="Conjurar Maré Alta no Estágio 1"');
        expect(html).not.toContain('stage-activate');
        expect(html).not.toContain('>Usar<');
    });

    it('o MP é conferido por estágio: dá para o estágio 1 e não para o 3 (custos 7, 9 e 12)', () => {
        const html = ladder(water3, { spellUnlocked: { w3: 3 } }, { cast: { onCast: noop, currentMp: 10 } });
        const button = (stage: number) => html.match(new RegExp(`<button[^>]*data-testid="stage-cast-${stage}"[^>]*>`))?.[0] ?? '';
        expect(button(1)).not.toContain('disabled');
        expect(button(2)).not.toContain('disabled');
        expect(button(3)).toContain('disabled');
    });

    it('o limite de MP por turno é perguntado com o custo de cada estágio', () => {
        const asked: Array<[number, number]> = [];
        ladder(water3, { spellUnlocked: { w3: 2 } }, { cast: { onCast: noop, currentMp: 20, blockedReason: (stage, cost) => { asked.push([ stage, cost ]); return stage === 2 ? 'Limite' : undefined } } });
        expect(asked).toEqual([ [ 1, 7 ], [ 2, 9 ] ]);
    });

    it('sem MP o botão de conjurar fica desabilitado', () => {
        const html = ladder(water3, {}, { cast: { onCast: noop, currentMp: 3 } });
        expect(html).toMatch(/<button[^>]*disabled[^>]*data-testid="stage-cast-1"|<button[^>]*data-testid="stage-cast-1"[^>]*disabled/);
    });

    it('conjuração com sucesso deixa "Efetuar" só no estágio conjurado, com como descartar', () => {
        const effect = { pendingStage: 2 as const, onEffect: noop, onDismiss: noop };
        const html = ladder(water3, { spellUnlocked: { w3: 3 } }, { cast: { onCast: noop, currentMp: 30, effect } });

        expect(html).toContain('data-testid="stage-effect-2"');
        expect(html).toContain('aria-label="Efetuar Maré Alta no Estágio 2"');
        expect(html).toContain('data-testid="stage-effect-dismiss-2"');
        expect(html).not.toContain('data-testid="stage-effect-1"');
        expect(html).not.toContain('data-testid="stage-effect-3"');
        // o Conjurar de cada estágio continua ali
        expect(html).toContain('data-testid="stage-cast-2"');
    });

    it('sem conjuração com sucesso à espera não há "Efetuar"', () => {
        const none = ladder(water3, { spellUnlocked: { w3: 3 } }, { cast: { onCast: noop, currentMp: 30, effect: { onEffect: noop, onDismiss: noop } } });
        const withoutEffect = ladder(water3, { spellUnlocked: { w3: 3 } }, { cast: { onCast: noop, currentMp: 30 } });

        expect(none).not.toContain('stage-effect-');
        expect(withoutEffect).not.toContain('stage-effect-');
    });

    it('enquanto efetua, o botão fica desabilitado', () => {
        const html = ladder(water3, {}, { cast: { onCast: noop, currentMp: 30, effect: { pendingStage: 1, onEffect: noop, onDismiss: noop, busy: true } } });

        expect(html).toMatch(/<button[^>]*disabled[^>]*data-testid="stage-effect-1"|<button[^>]*data-testid="stage-effect-1"[^>]*disabled/);
    });

    it('recolher/expandir só aparece quando há mais de um estágio liberado', () => {
        expect(ladder(water3, {})).not.toContain('data-testid="stage-toggle-all"');
        expect(ladder(water3, { spellUnlocked: { w3: 2 } })).toContain('data-testid="stage-toggle-all"');
    });

    it('sem a regra de desbloqueio (customizado/Roguelite) todos os estágios aparecem abertos e sem custo', () => {
        const progress = getSpellProgress(water3, {}, { enabled: false });
        const html = render(<StageLadder spell={water3} progress={progress} />);
        expect(html).toContain('4d6');
        expect(html).not.toContain('Custa');
        expect(html).not.toContain('Bloqueado');
    });

    it('Fixação Mágica: o estágio ainda bloqueado da magia fixada ganha texto e botão de conjurar, sem liberar o Evoluir', () => {
        const html = ladder(water3, { spellUnlocked: { w3: 1 } }, { cast: { onCast: noop, currentMp: 30, fixation: { stage: 2 } }, evolution: { points: 2, onEvolve: noop } });
        expect(html).toContain('data-testid="stage-fixation-2"');
        expect(html).toContain('Fixação Mágica: dá para conjurar');
        // o texto do estágio 2 aparece (3d6) e ele tem o próprio botão de conjurar, com o custo do estágio (9 MP)
        expect(html).toContain('3d6');
        expect(html).toContain('data-testid="stage-cast-2"');
        expect(html).toContain('aria-label="Conjurar Maré Alta no Estágio 2"');
        // o estágio seguinte continua bloqueado e o Evoluir segue comprando o mesmo estágio com pontos
        expect(html).not.toContain('data-testid="stage-fixation-3"');
        expect(html).toContain('data-testid="stage-evolve"');
        expect(html).toContain('Evoluir (2 pontos)');
    });

    it('sem a fixação o estágio bloqueado não tem botão de conjurar', () => {
        const html = ladder(water3, { spellUnlocked: { w3: 1 } }, { cast: { onCast: noop, currentMp: 30 } });
        expect(html).not.toContain('data-testid="stage-fixation-2"');
        expect(html).not.toContain('data-testid="stage-cast-2"');
        expect(html).not.toContain('3d6');
    });

    it('a fixação confere o MP do estágio à frente', () => {
        const html = ladder(water3, { spellUnlocked: { w3: 1 } }, { cast: { onCast: noop, currentMp: 8, fixation: { stage: 2 } } });
        expect(html).toMatch(/<button[^>]*disabled[^>]*data-testid="stage-cast-2"|<button[^>]*data-testid="stage-cast-2"[^>]*disabled/);
    });
});
