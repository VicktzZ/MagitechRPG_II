/**
 * Modelo da NAVE da campanha — um "widget" compartilhado visível a todos
 * os jogadores, totalmente administrado pelo Mestre. Serve para campanhas
 * espaciais (Cosmos RPG), mas é genérico o suficiente para qualquer
 * veículo/base compartilhada (navio, caravana, fortaleza...).
 */

export type ShipComponentStatus = 'operational' | 'damaged' | 'critical' | 'offline';

export interface ShipComponent {
    id: string;
    name: string;             // Ex: "Motor de Dobra", "Suporte de Vida"
    icon?: string;            // Emoji exibido no widget (ex: 🔧, 🛰️)
    hp: number;
    maxHp: number;
    status: ShipComponentStatus;
    description?: string;
}

/** Contador genérico da nave: combustível, energia, oxigênio, munição... */
export interface ShipResource {
    id: string;
    name: string;             // Ex: "Combustível"
    icon?: string;            // Emoji (ex: ⛽)
    value: number;
    max?: number;             // Ausente = contador sem limite
    unit?: string;            // Ex: "L", "%", "células"
    color?: string;           // Cor da barra
}

/** Item do estoque compartilhado (inventário da nave) */
export interface ShipCargoItem {
    id: string;
    name: string;
    quantity: number;
    description?: string;
}

export type ShipAlertSeverity = 'info' | 'warning' | 'danger';

export interface ShipAlert {
    id: string;
    text: string;             // Ex: "Casco comprometido no Deck 3"
    severity: ShipAlertSeverity;
    createdAt: string;
}

/** Entrada do diário de bordo */
export interface ShipLogEntry {
    id: string;
    text: string;
    timestamp: string;
}

export interface CampaignShip {
    /** Widget visível na campanha */
    enabled: boolean;

    // Identidade
    name: string;             // Ex: "ISV Prometheus"
    shipClass?: string;       // Ex: "Fragata de Exploração"
    description?: string;
    icon?: string;            // Emoji do header (ex: 🚀)

    // Integridade
    hull: number;             // Casco atual
    maxHull: number;
    shield: number;           // Escudos atuais
    maxShield: number;

    // Situação
    status: string;           // Ex: "Em órbita", "Atracada", "Em combate"
    location?: string;        // Ex: "Órbita de Kepler-442b"

    // Subsistemas
    components: ShipComponent[];
    resources: ShipResource[];
    cargo: ShipCargoItem[];
    alerts: ShipAlert[];
    log: ShipLogEntry[];

    updatedAt: string;
}

export function createDefaultShip(): CampaignShip {
    return {
        enabled: true,
        name: 'Nave Sem Nome',
        shipClass: '',
        description: '',
        icon: '🚀',
        hull: 100,
        maxHull: 100,
        shield: 50,
        maxShield: 50,
        status: 'Operacional',
        location: '',
        components: [
            { id: crypto.randomUUID(), name: 'Motores', icon: '🔥', hp: 20, maxHp: 20, status: 'operational' },
            { id: crypto.randomUUID(), name: 'Suporte de Vida', icon: '🫁', hp: 20, maxHp: 20, status: 'operational' },
            { id: crypto.randomUUID(), name: 'Sensores', icon: '📡', hp: 15, maxHp: 15, status: 'operational' },
            { id: crypto.randomUUID(), name: 'Computador de Bordo', icon: '🖥️', hp: 15, maxHp: 15, status: 'operational' }
        ],
        resources: [
            { id: crypto.randomUUID(), name: 'Combustível', icon: '⛽', value: 100, max: 100, unit: '%', color: '#f59e0b' },
            { id: crypto.randomUUID(), name: 'Energia', icon: '⚡', value: 100, max: 100, unit: '%', color: '#0ea5e9' }
        ],
        cargo: [],
        alerts: [],
        log: [],
        updatedAt: new Date().toISOString()
    };
}
