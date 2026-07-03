import { Collection } from 'fireorm';

// ============================================
// Estatísticas por jogador
// ============================================

export interface PlayerCombatStats {
    damageDealt: number;        // Dano causado a inimigos
    damageTaken: number;        // Dano recebido
    healingDone: number;        // Cura realizada em aliados
    healingReceived: number;    // Cura recebida
    knockouts: number;          // Vezes que caiu a 0 LP
    kills: number;              // Criaturas abatidas (golpe final)
}

export interface PlayerDiceStats {
    totalRolls: number;         // Total de testes rolados
    testsPassed: number;
    testsFailed: number;
    criticalHits: number;       // Rolagens no valor de crítico do sistema
    criticalFailures: number;   // Rolagens no valor de falha crítica
    highestRoll: number;        // Maior resultado total obtido
    expertiseUsage: Record<string, number>; // Perícia → quantidade de usos
}

export interface PlayerResourceStats {
    mpSpent: number;            // MP gasto em magias
    spellsCast: number;         // Magias conjuradas
    moneySpent: number;         // Dinheiro gasto (loja)
    moneyEarned: number;        // Dinheiro recebido (mestre/level-up)
    itemsPurchased: number;     // Itens comprados na loja
    itemsDonated: number;       // Itens doados a outros jogadores
    itemsReceived: number;      // Itens recebidos por doação
}

export interface PlayerProgressionStats {
    levelsGained: number;       // Níveis ganhos durante a campanha
    highestLevel: number;       // Maior nível atingido
    spellsLearned: number;      // Magias adquiridas
    skillsGained: number;       // Habilidades/poderes adquiridos
    perksGained: number;        // Vantagens (perks) adquiridas
}

export interface PlayerCampaignStats {
    userId: string;
    charsheetId: string;
    charsheetName: string;
    combat: PlayerCombatStats;
    dice: PlayerDiceStats;
    resources: PlayerResourceStats;
    progression: PlayerProgressionStats;
}

// ============================================
// Estatísticas do mestre (agregadas para todos os admins)
// ============================================

export interface GMCampaignStats {
    damageDealt: number;        // Dano causado por criaturas/mestre
    healingDone: number;        // Cura aplicada pelo mestre
    testsRequested: number;     // Testes solicitados aos jogadores
    combatsStarted: number;     // Combates iniciados
    combatRoundsRun: number;    // Rodadas de combate conduzidas
    effectsApplied: number;     // Efeitos de combate aplicados
    creaturesAdded: number;     // Criaturas adicionadas a combates
    itemsGiven: number;         // Itens entregues (doações do mestre)
    moneyGiven: number;         // Dinheiro distribuído (ações em massa)
}

export function emptyPlayerStats(
    userId: string,
    charsheetId: string,
    charsheetName: string
): PlayerCampaignStats {
    return {
        userId,
        charsheetId,
        charsheetName,
        combat: {
            damageDealt: 0,
            damageTaken: 0,
            healingDone: 0,
            healingReceived: 0,
            knockouts: 0,
            kills: 0
        },
        dice: {
            totalRolls: 0,
            testsPassed: 0,
            testsFailed: 0,
            criticalHits: 0,
            criticalFailures: 0,
            highestRoll: 0,
            expertiseUsage: {}
        },
        resources: {
            mpSpent: 0,
            spellsCast: 0,
            moneySpent: 0,
            moneyEarned: 0,
            itemsPurchased: 0,
            itemsDonated: 0,
            itemsReceived: 0
        },
        progression: {
            levelsGained: 0,
            highestLevel: 0,
            spellsLearned: 0,
            skillsGained: 0,
            perksGained: 0
        }
    };
}

export function emptyGMStats(): GMCampaignStats {
    return {
        damageDealt: 0,
        healingDone: 0,
        testsRequested: 0,
        combatsStarted: 0,
        combatRoundsRun: 0,
        effectsApplied: 0,
        creaturesAdded: 0,
        itemsGiven: 0,
        moneyGiven: 0
    };
}

// ============================================
// Entidade principal — um documento por campanha
// ============================================

@Collection('campaign_stats')
export class CampaignStats {
    id: string;
    campaignId: string;
    createdAt: string = new Date().toISOString();
    updatedAt: string = new Date().toISOString();

    /** Estatísticas por jogador. Chave = charsheetId. */
    players: Record<string, PlayerCampaignStats> = {};

    /** Estatísticas agregadas do(s) mestre(s). */
    gm: GMCampaignStats = emptyGMStats();

    constructor(stats?: Partial<CampaignStats>) {
        Object.assign(this, stats);
    }
}
