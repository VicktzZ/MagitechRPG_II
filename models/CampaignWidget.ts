/**
 * WIDGET genérico da campanha — um painel compartilhado, flutuante,
 * visível a todos os jogadores e totalmente administrado pelo Mestre.
 *
 * É agnóstico de sistema: pode representar uma NAVE (Cosmos RPG), um
 * LOCAL (taverna, base), um OBJETIVO a defender (fortaleza, cristal),
 * uma caravana... Os rótulos de cada seção são personalizáveis.
 */

export type WidgetPartStatus = 'operational' | 'damaged' | 'critical' | 'offline';

/** Parte/subsistema com vida própria (ex: Motores, Cozinha, Portão Norte) */
export interface WidgetPart {
    id: string;
    name: string;
    icon?: string;            // Emoji (ex: 🔧, 🍳, 🛡️)
    hp: number;
    maxHp: number;
    status: WidgetPartStatus;
    description?: string;
}

/** Contador genérico (ex: Combustível, Provisões, Munição, Moral) */
export interface WidgetResource {
    id: string;
    name: string;
    icon?: string;
    value: number;
    max?: number;             // Ausente = contador sem limite
    unit?: string;            // Ex: "L", "%", "unid."
    color?: string;
}

/** Item do estoque compartilhado */
export interface WidgetStockItem {
    id: string;
    name: string;
    quantity: number;
    description?: string;
    /** Peso unitário — usado para calcular capacidade do estoque e transferências */
    weight?: number;
}

export type WidgetAlertSeverity = 'info' | 'warning' | 'danger';

export interface WidgetAlert {
    id: string;
    text: string;
    severity: WidgetAlertSeverity;
    createdAt: string;
}

export interface WidgetLogEntry {
    id: string;
    text: string;
    timestamp: string;
}

/** Ingrediente necessário — casado por nome contra o estoque compartilhado */
export interface WidgetRecipeInput {
    id: string;
    stockName: string;
    quantity: number;
}

/** Custo em recurso do widget (ex: energia, combustível) */
export interface WidgetRecipeResourceCost {
    id: string;
    resourceId: string;
    amount: number;
}

export interface WidgetRecipeOutput {
    name: string;
    description?: string;
    weight?: number;
    quantity: number;
    /**
     * Tipo do item produzido. 'item' (padrão) vai para o estoque compartilhado
     * (ou para a ficha de quem fabricou, se o widget não tiver estoque próprio).
     * 'weapon'/'armor' vão SEMPRE para o inventário pessoal de quem fabricou —
     * o estoque compartilhado só suporta itens genéricos.
     */
    kind?: 'item' | 'weapon' | 'armor';
    /** Dados completos da arma/armadura (obrigatório quando kind !== 'item'), escolhidos de um catálogo */
    itemData?: Record<string, any>;
}

/** Receita de crafting (beta) — consome estoque/recursos e produz um item, arma ou armadura */
export interface WidgetRecipe {
    id: string;
    name: string;
    description?: string;
    inputs: WidgetRecipeInput[];
    resourceCosts: WidgetRecipeResourceCost[];
    output: WidgetRecipeOutput;
}

/** Lançamento no histórico de um fundo comum */
export interface WidgetPoolEntry {
    id: string;
    userName: string;
    amount: number;       // positivo = depósito, negativo = retirada
    timestamp: string;
}

/** Fundo comum (beta) — recurso alimentado por contribuições rastreadas de jogadores */
export interface WidgetPool {
    id: string;
    name: string;
    icon?: string;
    value: number;
    max?: number;          // Ausente = sem limite
    unit?: string;
    color?: string;
    history: WidgetPoolEntry[];
}

export type WidgetBountyStatus = 'open' | 'pending' | 'done';

/** Tarefa/contrato (beta) — jogadores reivindicam, mestre aprova e libera a recompensa */
export interface WidgetBounty {
    id: string;
    title: string;
    description?: string;
    rewardText?: string;         // Descrição livre da recompensa (narrativa)
    rewardResourceId?: string;   // Recurso do widget concedido automaticamente ao aprovar
    rewardAmount?: number;
    status: WidgetBountyStatus;
    claimedByCharsheetId?: string;
    claimedByName?: string;
    createdAt: string;
}

/** Relógio/contagem (beta) — marcador segmentado ao estilo "clock" para tensão narrativa */
export interface WidgetClock {
    id: string;
    name: string;
    icon?: string;
    current: number;
    max: number;
    unit?: string;
    color?: string;
    triggeredMessage?: string;   // Exibido quando current atinge max
}

/** Rótulos personalizáveis de cada seção do widget */
export interface CampaignWidgetLabels {
    integrity: string;        // Ex: "Casco", "Estrutura", "Vida do Objetivo"
    secondary: string;        // Ex: "Escudos", "Segurança", "Barreira"
    parts: string;            // Ex: "Sistemas", "Cômodos", "Defesas"
    resources: string;        // Ex: "Recursos", "Suprimentos"
    stock: string;            // Ex: "Estoque", "Despensa"
    log: string;              // Ex: "Diário de Bordo", "Registro"
}

export interface CampaignWidget {
    /** Identificador único — permite múltiplas instâncias por campanha (até 4) */
    id: string;

    /** Painel visível na campanha */
    enabled: boolean;

    // Identidade
    name: string;             // Ex: "ISV Prometheus", "Taverna do Javali"
    subtitle?: string;        // Ex: "Fragata de Exploração", "Hospedaria"
    description?: string;
    icon?: string;            // Emoji do header (ex: 🚀, 🍺, 🏰)

    // Barras principais (opcionais e renomeáveis)
    showIntegrity: boolean;
    integrity: number;
    maxIntegrity: number;
    showSecondary: boolean;
    secondary: number;
    maxSecondary: number;

    // Situação
    status: string;           // Ex: "Em órbita", "Aberta ao público", "Sob cerco"
    location?: string;

    // Seções
    parts: WidgetPart[];
    resources: WidgetResource[];
    stock: WidgetStockItem[];
    alerts: WidgetAlert[];
    log: WidgetLogEntry[];

    /** Estoque compartilhado habilitado — ausente = true (compatibilidade) */
    showStock?: boolean;
    /** Capacidade de peso do estoque compartilhado — ausente/0 = ilimitado */
    stockMaxWeight?: number;
    /** Unidade exibida junto à capacidade do estoque (ex: "kg", "un.") */
    stockWeightUnit?: string;

    /** Receitas de crafting (beta) — "outras funcionalidades" */
    recipes: WidgetRecipe[];

    /** Fundos comuns (beta) — pools genéricos com histórico de contribuições */
    pools: WidgetPool[];

    /** Tarefas/contratos (beta) */
    bounties: WidgetBounty[];

    /** Relógios/contagens (beta) */
    clocks: WidgetClock[];

    labels: CampaignWidgetLabels;

    updatedAt: string;
}

export type WidgetPreset = 'ship' | 'place' | 'objective' | 'blank';

/** Máximo de instâncias de widget suportadas por campanha */
export const MAX_CAMPAIGN_WIDGETS = 4;

export const widgetPresetInfo: Record<WidgetPreset, { icon: string; title: string; description: string }> = {
    ship: { icon: '🚀', title: 'Nave / Veículo', description: 'Casco, escudos, sistemas, combustível e estoque — para campanhas espaciais ou veículos compartilhados.' },
    place: { icon: '🍺', title: 'Local / Base', description: 'Estrutura, segurança, cômodos e despensa — tavernas, guildas, esconderijos e bases de operação.' },
    objective: { icon: '🏰', title: 'Objetivo a Defender', description: 'Vida do objetivo, barreira, defesas e suprimentos — cercos, escoltas e missões de proteção.' },
    blank: { icon: '📋', title: 'Em Branco', description: 'Estrutura vazia com rótulos genéricos para personalizar do zero.' }
};

function base(): Omit<CampaignWidget, 'labels'> {
    return {
        id: crypto.randomUUID(),
        enabled: true,
        name: '',
        subtitle: '',
        description: '',
        icon: '📋',
        showIntegrity: true,
        integrity: 100,
        maxIntegrity: 100,
        showSecondary: false,
        secondary: 0,
        maxSecondary: 0,
        status: '',
        location: '',
        parts: [],
        resources: [],
        stock: [],
        alerts: [],
        log: [],
        showStock: true,
        stockMaxWeight: undefined,
        stockWeightUnit: 'kg',
        recipes: [],
        pools: [],
        bounties: [],
        clocks: [],
        updatedAt: new Date().toISOString()
    };
}

export function createWidgetFromPreset(preset: WidgetPreset): CampaignWidget {
    switch (preset) {
    case 'ship':
        return {
            ...base(),
            name: 'Nave Sem Nome',
            icon: '🚀',
            status: 'Operacional',
            showSecondary: true,
            secondary: 50,
            maxSecondary: 50,
            parts: [
                { id: crypto.randomUUID(), name: 'Motores', icon: '🔥', hp: 20, maxHp: 20, status: 'operational' },
                { id: crypto.randomUUID(), name: 'Suporte de Vida', icon: '🫁', hp: 20, maxHp: 20, status: 'operational' },
                { id: crypto.randomUUID(), name: 'Sensores', icon: '📡', hp: 15, maxHp: 15, status: 'operational' },
                { id: crypto.randomUUID(), name: 'Computador de Bordo', icon: '🖥️', hp: 15, maxHp: 15, status: 'operational' }
            ],
            resources: [
                { id: crypto.randomUUID(), name: 'Combustível', icon: '⛽', value: 100, max: 100, unit: '%', color: '#f59e0b' },
                { id: crypto.randomUUID(), name: 'Energia', icon: '⚡', value: 100, max: 100, unit: '%', color: '#0ea5e9' }
            ],
            labels: {
                integrity: 'Casco',
                secondary: 'Escudos',
                parts: 'Sistemas',
                resources: 'Recursos',
                stock: 'Estoque da Nave',
                log: 'Diário de Bordo'
            }
        };
    case 'place':
        return {
            ...base(),
            name: 'Local Sem Nome',
            icon: '🍺',
            status: 'Aberto',
            showSecondary: true,
            secondary: 10,
            maxSecondary: 10,
            parts: [
                { id: crypto.randomUUID(), name: 'Salão Principal', icon: '🪑', hp: 20, maxHp: 20, status: 'operational' },
                { id: crypto.randomUUID(), name: 'Cozinha', icon: '🍳', hp: 10, maxHp: 10, status: 'operational' },
                { id: crypto.randomUUID(), name: 'Quartos', icon: '🛏️', hp: 15, maxHp: 15, status: 'operational' }
            ],
            resources: [
                { id: crypto.randomUUID(), name: 'Provisões', icon: '🍞', value: 50, max: 100, unit: 'unid.', color: '#84cc16' },
                { id: crypto.randomUUID(), name: 'Caixa', icon: '💰', value: 200, color: '#f59e0b' }
            ],
            labels: {
                integrity: 'Estrutura',
                secondary: 'Segurança',
                parts: 'Cômodos',
                resources: 'Suprimentos',
                stock: 'Despensa',
                log: 'Registro'
            }
        };
    case 'objective':
        return {
            ...base(),
            name: 'Objetivo Sem Nome',
            icon: '🏰',
            status: 'Sob ameaça',
            showSecondary: true,
            secondary: 30,
            maxSecondary: 30,
            parts: [
                { id: crypto.randomUUID(), name: 'Portão Principal', icon: '🚪', hp: 30, maxHp: 30, status: 'operational' },
                { id: crypto.randomUUID(), name: 'Muralha Leste', icon: '🧱', hp: 25, maxHp: 25, status: 'operational' },
                { id: crypto.randomUUID(), name: 'Muralha Oeste', icon: '🧱', hp: 25, maxHp: 25, status: 'operational' },
                { id: crypto.randomUUID(), name: 'Torre de Vigia', icon: '🗼', hp: 15, maxHp: 15, status: 'operational' }
            ],
            resources: [
                { id: crypto.randomUUID(), name: 'Munição', icon: '🏹', value: 100, max: 100, unit: 'unid.', color: '#ef4444' },
                { id: crypto.randomUUID(), name: 'Moral das Tropas', icon: '🎖️', value: 80, max: 100, unit: '%', color: '#8b5cf6' }
            ],
            labels: {
                integrity: 'Vida do Objetivo',
                secondary: 'Barreira',
                parts: 'Defesas',
                resources: 'Recursos',
                stock: 'Suprimentos',
                log: 'Registro'
            }
        };
    default:
        return {
            ...base(),
            name: 'Novo Widget',
            labels: {
                integrity: 'Integridade',
                secondary: 'Reserva',
                parts: 'Partes',
                resources: 'Recursos',
                stock: 'Estoque',
                log: 'Registro'
            }
        };
    }
}
