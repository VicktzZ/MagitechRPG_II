/**
 * Mensagem de chat de uma ação de combate rolada: o dano de um ataque com arma, ou os dois tempos de uma magia (a conjuração e o efeito).
 *
 * O texto é legível e tem uma primeira linha que o `DiceMessage` reconhece (`[AÇÃO] conjuração`, `[AÇÃO] efeito` ou `[AÇÃO] arma`): em vez
 * de uma linha "por extenso", o chat mostra o cartão dos testes e dos dados personalizados, com o total à vista e as rolagens num dropdown.
 *
 *   [AÇÃO] conjuração                     (o teste de magia; gasta o MP, que aparece em "Custo")
 *   **Arco de Luz**
 *   Detalhe: LUZ · Estágio 3
 *   Jogador: TESTE da SILVA
 *   Total: **17**
 *   DT: **18**                            (a dificuldade do nível e estágio: o teste só passa com Total ≥ DT)
 *   Custo: **4 MP**
 *   - 2d20+5: [12, 7] + 5 Magia = 17
 *
 *   [AÇÃO] efeito                         (os dados de dano, cura, duração... do estágio, depois de efetuar a magia)
 *   **Arco de Luz**
 *   Detalhe: LUZ · Estágio 3
 *   Jogador: TESTE da SILVA
 *   Total: **31**
 *   - 3d12+6: [1, 8, 4] + 6 = 19
 *   - 2d12+4: [4, 4] + 4 = 12
 *
 * `[AÇÃO] arma crítico` marca o dano crítico e `[AÇÃO] arma furtivo` (ou `arma crítico furtivo`) o dano dado por quem estava com o efeito Furtivo: o
 * `Total` já é o dobro da soma das rolagens (cada `-` mostra o valor rolado, sem dobrar). Sem `Total` e sem rolagens não há dado a mostrar (só o custo, se houver).
 */

export type ActionRollKind = 'conjuração' | 'efeito' | 'arma';

export interface ActionRollSegment {
    /** Expressão rolada, como "3d12+6" */
    notation: string;
    /** O resultado detalhado do `rollDice`, como "[1, 8, 4] + 6" (ou só o número, no dano fixo) */
    display: string;
    total: number;
}

export interface ActionRoll {
    kind: ActionRollKind;
    player: string;
    /** Nome da magia ou da arma */
    title: string;
    /** Linha de apoio sob o título: "LUZ · Estágio 3" na magia, "Dano · Perfurante" na arma */
    detail: string;
    /** Dano crítico (só na arma) */
    critical: boolean;
    /** Dano de quem atacava furtivo (só na arma): o `total` é o dobro da soma das rolagens */
    stealth?: boolean;
    /** Soma do dano, ou o resultado do teste na conjuração; `null` quando não há dado a mostrar */
    total: number | null;
    /** MP gasto (só na conjuração) */
    cost: number | null;
    /** DT do teste de magia (só na conjuração; `null` quando a tabela não cobre o nível/estágio) */
    dt: number | null;
    segments: ActionRollSegment[];
}

const MARKER = '[AÇÃO]';

/** Tira o que quebraria o formato: negrito, quebra de linha e espaços repetidos */
const clean = (value: string): string => value.replace(/\*\*/g, '').replace(/\s*[\r\n]+\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();

/** Os números dos dados em um resultado detalhado: "[1, 8, 4] + 6" → [1, 8, 4]; "[3] + [5]" → [3, 5] */
export function rollNumbers(display: string): number[] {
    return Array.from(display.matchAll(/\[([^\]]*)\]/g))
        .flatMap(group => (group[1] ?? '').split(','))
        .map(part => Number.parseInt(part.trim(), 10))
        .filter(value => !Number.isNaN(value));
}

/** O que sobra depois dos dados em um resultado detalhado: "[1, 8, 4] + 6" → "+ 6"; sem dados ("5") → "" */
export function rollModifier(display: string): string {
    const lastBracket = display.lastIndexOf(']');
    return lastBracket === -1 ? '' : display.slice(lastBracket + 1).trim();
}

export function buildActionRollText(action: ActionRoll): string {
    const lines = [
        `${MARKER} ${action.kind}${action.critical ? ' crítico' : ''}${action.stealth ? ' furtivo' : ''}`,
        `**${clean(action.title)}**`
    ];
    const detail = clean(action.detail);
    if (detail) lines.push(`Detalhe: ${detail}`);
    lines.push(`Jogador: ${clean(action.player)}`);
    if (action.total !== null) lines.push(`Total: **${action.total}**`);
    if (action.dt !== null) lines.push(`DT: **${action.dt}**`);
    if (action.cost !== null) lines.push(`Custo: **${action.cost} MP**`);
    for (const segment of action.segments) lines.push(`- ${clean(segment.notation)}: ${clean(segment.display)} = ${segment.total}`);
    return lines.join('\n');
}

const SEGMENT = /^-\s+(.+?):\s+(.*)\s+=\s+(-?\d+)$/;

/** Lê o texto de `buildActionRollText`; `null` quando o texto é outra coisa (mensagem comum, log de combate, dado avulso) */
export function parseActionRoll(text: string): ActionRoll | null {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const head = /^\[AÇÃO\]\s+(conjuração|efeito|arma)(\s+crítico)?(\s+furtivo)?$/i.exec(lines[0] ?? '');
    if (!head) return null;

    const title = /^\*\*(.+)\*\*$/.exec(lines[1] ?? '')?.[1];
    if (!title) return null;

    const action: ActionRoll = {
        kind: head[1]!.toLowerCase() as ActionRollKind,
        player: '',
        title,
        detail: '',
        critical: Boolean(head[2]),
        ...(head[3] ? { stealth: true } : {}),
        total: null,
        cost: null,
        dt: null,
        segments: []
    };

    for (const line of lines.slice(2)) {
        if (line.startsWith('Detalhe:')) action.detail = line.slice('Detalhe:'.length).trim();
        else if (line.startsWith('Jogador:')) action.player = line.slice('Jogador:'.length).trim();
        else if (line.startsWith('Total:')) action.total = Number(/-?\d+/.exec(line)?.[0] ?? NaN);
        else if (line.startsWith('DT:')) action.dt = Number(/\d+/.exec(line)?.[0] ?? NaN);
        else if (line.startsWith('Custo:')) action.cost = Number(/\d+/.exec(line)?.[0] ?? NaN);
        else {
            const segment = SEGMENT.exec(line);
            if (segment) action.segments.push({ notation: segment[1]!, display: segment[2]!, total: Number(segment[3]) });
        }
    }

    if (Number.isNaN(action.total) || Number.isNaN(action.cost) || Number.isNaN(action.dt)) return null;
    return action;
}
