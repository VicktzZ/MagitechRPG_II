/**
 * Transforma os erros do formulário da ficha (react-hook-form + Zod) em frases que o jogador entende:
 * "Inventário > Armas > Pistola > Munição: campo obrigatório", em vez de só "Required".
 */

export interface FormErrorItem {
    /** Caminho técnico (`inventory.weapons.0.ammo`), para depuração */
    path: string;
    /** Caminho legível, com o nome do item (`Inventário > Armas > Pistola > Munição`) */
    label: string;
    /** Seção da página onde o campo mora */
    section: string;
    /** Âncora (`id`) da seção, quando existe */
    sectionId?: string;
    message: string;
}

export const CHARSHEET_SECTION_IDS = {
    characteristics: 'ficha-caracteristicas',
    attributes: 'ficha-atributos',
    skills: 'ficha-habilidades',
    dices: 'ficha-dados',
    passives: 'ficha-passivas',
    expertises: 'ficha-pericias',
    inventory: 'ficha-inventario',
    spells: 'ficha-magias',
    notes: 'ficha-anotacoes'
} as const;

interface SectionInfo { label: string; id?: string }

const CHARACTERISTICS: SectionInfo = { label: 'Características', id: CHARSHEET_SECTION_IDS.characteristics };
const ATTRIBUTES: SectionInfo = { label: 'Atributos', id: CHARSHEET_SECTION_IDS.attributes };
const SKILLS: SectionInfo = { label: 'Habilidades', id: CHARSHEET_SECTION_IDS.skills };
const EXPERTISES: SectionInfo = { label: 'Perícias', id: CHARSHEET_SECTION_IDS.expertises };
const INVENTORY: SectionInfo = { label: 'Inventário', id: CHARSHEET_SECTION_IDS.inventory };
const SPELLS: SectionInfo = { label: 'Magias', id: CHARSHEET_SECTION_IDS.spells };
const OTHER: SectionInfo = { label: 'Dados da ficha' };

const ROOT_SECTION: Record<string, SectionInfo> = {
    name: CHARACTERISTICS, playerName: CHARACTERISTICS, age: CHARACTERISTICS, class: CHARACTERISTICS, race: CHARACTERISTICS,
    lineage: CHARACTERISTICS, subclass: CHARACTERISTICS, gender: CHARACTERISTICS, financialCondition: CHARACTERISTICS,
    elementalMastery: CHARACTERISTICS, mode: CHARACTERISTICS, systemId: CHARACTERISTICS, occupation: CHARACTERISTICS,
    customFields: CHARACTERISTICS, traits: CHARACTERISTICS,
    attributes: ATTRIBUTES, stats: ATTRIBUTES, level: ATTRIBUTES, mods: ATTRIBUTES, overall: ATTRIBUTES, displacement: ATTRIBUTES,
    customResources: ATTRIBUTES, customResourceMaxes: ATTRIBUTES,
    skills: SKILLS, status: SKILLS,
    passives: { label: 'Passivas', id: CHARSHEET_SECTION_IDS.passives },
    dices: { label: 'Dados Personalizados', id: CHARSHEET_SECTION_IDS.dices },
    expertises: EXPERTISES,
    inventory: INVENTORY, capacity: INVENTORY, ammoCounter: INVENTORY,
    spells: SPELLS, spellStages: SPELLS, spellSpace: SPELLS, ORMLevel: SPELLS, mpLimit: SPELLS,
    anotacoes: { label: 'Anotações', id: CHARSHEET_SECTION_IDS.notes }
};

const POINTS_SECTION: Record<string, SectionInfo> = {
    attributes: ATTRIBUTES, expertises: EXPERTISES, skills: SKILLS, magics: SPELLS
};

const ROOT_LABEL: Record<string, string> = {
    name: 'Nome do personagem', playerName: 'Nome do jogador', age: 'Idade', class: 'Classe', race: 'Raça', lineage: 'Linhagem',
    subclass: 'Subclasse', gender: 'Gênero', financialCondition: 'Condição financeira', elementalMastery: 'Maestria elemental',
    mode: 'Modo', occupation: 'Ocupação', traits: 'Traços', anotacoes: 'Anotações', level: 'Nível', overall: 'Overall',
    displacement: 'Deslocamento', spellSpace: 'Espaços de magia', mpLimit: 'Limite de MP', ORMLevel: 'Nível de ORM',
    userId: 'Dono da ficha', createdAt: 'Data de criação', id: 'Identificador',
    inventory: 'Inventário', skills: 'Habilidades', expertises: 'Perícias', attributes: 'Atributos', stats: 'Estatísticas',
    mods: 'Modificadores', passives: 'Passivas', dices: 'Dados personalizados', spells: 'Magias', capacity: 'Capacidade',
    points: 'Pontos', session: 'Campanha', status: 'Status', customResources: 'Recursos', customResourceMaxes: 'Máximo dos recursos',
    customFields: 'Campos do sistema', ammoCounter: 'Munição', spellStages: 'Estágios das magias'
};

const FIELD_LABEL: Record<string, string> = {
    name: 'Nome', title: 'Título', description: 'Descrição', type: 'Tipo', kind: 'Categoria', categ: 'Categoria', rarity: 'Raridade',
    weight: 'Peso', quantity: 'Quantidade', value: 'Valor', ammo: 'Munição', bonus: 'Bônus', hit: 'Acerto', range: 'Alcance',
    accessories: 'Acessórios', effect: 'Efeito', effects: 'Efeitos', critValue: 'Dano crítico', critChance: 'Chance de crítico',
    effectType: 'Tipo de efeito', displacementPenalty: 'Penalidade de deslocamento', element: 'Elemento', cost: 'Custo',
    level: 'Nível', execution: 'Execução', stages: 'Estágios', mastery: 'Maestria', occasion: 'Ocasião', color: 'Cor',
    dices: 'Dados', duration: 'Duração', defaultAttribute: 'Atributo base', origin: 'Origem', campaignCode: 'Código da campanha',
    money: 'Dinheiro', items: 'Itens', weapons: 'Armas', armors: 'Armaduras', current: 'Atual', max: 'Máximo', cargo: 'Carga',
    lp: 'LP', mp: 'MP', ap: 'AP', maxLp: 'LP máximo', maxMp: 'MP máximo', maxAp: 'AP máximo',
    vig: 'Vigor', des: 'Destreza', foc: 'Foco', log: 'Lógica', sab: 'Sabedoria', car: 'Carisma', discount: 'Desconto',
    class: 'Habilidades de classe', subclass: 'Habilidades de subclasse', lineage: 'Habilidades de linhagem',
    race: 'Habilidades de raça', occupation: 'Habilidades de ocupação', powers: 'Poderes',
    perks: 'Vantagens', stats: 'Estatísticas', mods: 'Modificadores', attributes: 'Atributos'
};

// Rótulos que dependem do pai: `skills.class` é "Habilidades de classe", mas `class` na raiz é a classe do personagem
const PARENT_LABEL: Record<string, Record<string, string>> = {
    points: { attributes: 'Pontos de atributo', expertises: 'Pontos de perícia', skills: 'Pontos de habilidade', magics: 'Pontos de magia' },
    inventory: { items: 'Itens', weapons: 'Armas', armors: 'Armaduras', money: 'Dinheiro' },
    capacity: { cargo: 'Carga', max: 'Capacidade máxima' },
    attributes: { vig: 'Vigor', des: 'Destreza', foc: 'Foco', log: 'Lógica', sab: 'Sabedoria', car: 'Carisma' }
};

const TYPE_NAME: Record<string, string> = {
    string: 'texto', number: 'número', array: 'lista', object: 'objeto', null: 'vazio', undefined: 'vazio',
    nan: 'número inválido', boolean: 'sim/não', integer: 'inteiro', float: 'decimal'
};

/** Mensagens padrão do Zod em português. As que o schema já escreve em português passam direto. */
export function translateMessage(message: string): string {
    if (message === 'Required') return 'campo obrigatório';
    if (message === 'Invalid input') return 'valor inválido';
    if (/^String must contain at least 1 character/.test(message)) return 'campo obrigatório';
    if (message === 'Expected integer, received float') return 'use um número inteiro';

    const expected = /^Expected (\w+), received (\w+)$/.exec(message);
    if (expected) {
        const [ , want, got ] = expected;
        if (got === 'nan') return 'digite um número';
        if (got === 'null' || got === 'undefined') return 'campo obrigatório';
        return `valor inválido (esperado ${TYPE_NAME[want] ?? want}, recebido ${TYPE_NAME[got] ?? got})`;
    }

    const min = /^Number must be greater than or equal to (-?[\d.]+)$/.exec(message);
    if (min) return `o mínimo é ${min[1]}`;
    const max = /^Number must be less than or equal to (-?[\d.]+)$/.exec(message);
    if (max) return `o máximo é ${max[1]}`;
    if (/^Invalid enum value/.test(message)) return 'escolha uma das opções';

    return message;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

function valueAt(values: unknown, path: ReadonlyArray<string | number>): unknown {
    let current: unknown = values;
    for (const segment of path) {
        if (current === null || current === undefined) return undefined;
        current = (current as Record<string | number, unknown>)[segment];
    }
    return current;
}

const isIndex = (segment: string): boolean => /^\d+$/.test(segment);

export function sectionFor(path: ReadonlyArray<string | number>): SectionInfo {
    const [ root, second ] = path.map(String);
    if (root === undefined) return OTHER;
    if (root === 'points') return (second && POINTS_SECTION[second]) || OTHER;
    return ROOT_SECTION[root] ?? OTHER;
}

/** Caminho legível: "Inventário > Armas > Pistola > Munição". */
export function labelPath(path: ReadonlyArray<string | number>, values?: unknown): string {
    const parts: string[] = [];
    path.forEach((raw, index) => {
        const segment = String(raw);
        const parent = index > 0 ? String(path[index - 1]) : '';
        if (isIndex(segment)) {
            const item = valueAt(values, path.slice(0, index + 1));
            const named = isRecord(item) ? (item['name'] ?? item['title']) : undefined;
            parts.push(typeof named === 'string' && named.trim() !== '' ? named : `item ${Number(segment) + 1}`);
            return;
        }
        if (index === 0) {
            parts.push(ROOT_LABEL[segment] ?? FIELD_LABEL[segment] ?? segment);
            return;
        }
        // perícia e recursos customizados usam o próprio nome como chave
        if (path[0] === 'expertises' && index === 1) {
            parts.push(segment);
            return;
        }
        parts.push(PARENT_LABEL[parent]?.[segment] ?? (isIndex(parent) ? FIELD_LABEL[segment] : undefined) ?? FIELD_LABEL[segment] ?? segment);
    });

    // pontos: o primeiro segmento é "points" e o rótulo já diz tudo
    if (path[0] === 'points' && parts.length === 2) return parts[1]!;
    return parts.join(' > ');
}

/** Percorre `formState.errors` e devolve uma linha por erro, sem repetir. */
export function listFormErrors(errors: unknown, values?: unknown): FormErrorItem[] {
    const items: FormErrorItem[] = [];
    const seen = new Set<string>();

    const visit = (node: unknown, path: Array<string | number>): void => {
        if (!isRecord(node) && !Array.isArray(node)) return;

        const message = (node as { message?: unknown }).message;
        if (typeof message === 'string' && path.length > 0) {
            const key = `${path.join('.')}|${message}`;
            if (!seen.has(key)) {
                seen.add(key);
                const section = sectionFor(path);
                items.push({
                    path: path.join('.'),
                    label: labelPath(path, values),
                    section: section.label,
                    sectionId: section.id,
                    message: translateMessage(message)
                });
            }
        }

        // `ref` guarda o elemento do DOM e `types` as mensagens por critério: não são campos
        for (const [ key, child ] of Object.entries(node as Record<string, unknown>)) {
            if (key === 'ref' || key === 'types' || key === 'message' || key === 'type') continue;
            visit(child, [ ...path, /^\d+$/.test(key) && Array.isArray(node) ? Number(key) : key ]);
        }
    };

    visit(errors, []);
    return items;
}

/** "Faltam: 5 pontos de atributo, 2 de perícia" — pontos para gastar são aviso, não erro, em ficha já criada. */
export function describePendingPoints(points: { attributes?: unknown; expertises?: unknown } | undefined): string[] {
    const parts: string[] = [];
    const attributes = Number(points?.attributes ?? 0);
    const expertises = Number(points?.expertises ?? 0);
    if (attributes > 0) parts.push(`${attributes} ${attributes === 1 ? 'ponto' : 'pontos'} de atributo`);
    if (expertises > 0) parts.push(`${expertises} ${expertises === 1 ? 'ponto' : 'pontos'} de perícia`);
    return parts;
}
