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

    labels: CampaignWidgetLabels;

    updatedAt: string;
}

export type WidgetPreset = 'ship' | 'place' | 'objective' | 'blank';

export const widgetPresetInfo: Record<WidgetPreset, { icon: string; title: string; description: string }> = {
    ship: { icon: '🚀', title: 'Nave / Veículo', description: 'Casco, escudos, sistemas, combustível e estoque — para campanhas espaciais ou veículos compartilhados.' },
    place: { icon: '🍺', title: 'Local / Base', description: 'Estrutura, segurança, cômodos e despensa — tavernas, guildas, esconderijos e bases de operação.' },
    objective: { icon: '🏰', title: 'Objetivo a Defender', description: 'Vida do objetivo, barreira, defesas e suprimentos — cercos, escoltas e missões de proteção.' },
    blank: { icon: '📋', title: 'Em Branco', description: 'Estrutura vazia com rótulos genéricos para personalizar do zero.' }
};

function base(): Omit<CampaignWidget, 'labels'> {
    return {
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
