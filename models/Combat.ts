import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AppliedEffect } from './AppliedEffect';
import type { UnseenData } from '../utils/combat/awareness';
import type { ActionBudget } from '../utils/combat/engine/actionBudget';
import type { CombatEnvironment } from '../utils/combat/environment';
import type { OpportunityData } from '../utils/combat/opportunities';
import type { PendingAttackData } from '../utils/combat/pendingAttacks';
import type { ReactionOfferData } from '../utils/combat/reactions';

/**
 * Fases do combate
 */
export type CombatPhase = 'INITIATIVE' | 'ACTION' | 'ENDED';

/**
 * Tipo de combatente
 */
export type CombatantType = 'player' | 'creature';

/**
 * Representação de um combatente no combate
 */
export class Combatant {
    @IsString()
        id: string; // charsheetId para jogadores ou creatureId para criaturas

    @IsString()
        name: string;

    @IsString()
        type: CombatantType;

    @IsNumber()
        initiativeRoll: number = 0; // Resultado do dado de iniciativa

    @IsNumber()
        initiativeBonus: number = 0; // Bônus de Agilidade

    @IsNumber()
        initiativeTotal: number = 0; // Roll + Bonus

    @IsBoolean()
        hasActed: boolean = false; // Se já agiu neste round

    @IsOptional()
    @IsString()
        odacId?: string; // ID do usuário (para jogadores)

    @IsOptional()
    @IsString()
        avatar?: string;

    // Stats atuais (para criaturas, cópia local; para jogadores, referência)
    @IsOptional()
    @IsNumber()
        currentLp?: number;

    @IsOptional()
    @IsNumber()
        maxLp?: number;

    @IsOptional()
    @IsNumber()
        currentMp?: number;

    @IsOptional()
    @IsNumber()
        maxMp?: number;

    @IsOptional()
    @IsNumber()
        dexterity?: number; // Destreza (DES) para desempate de iniciativa

    /**
     * MP gasto em magias nesta rodada de combate (reações em turnos alheios contam). Volta a 0 para
     * todos quando a rodada vira. Ver utils/mpLimit.ts e utils/combat/mpLimitWindow.ts.
     */
    @IsOptional()
    @IsNumber()
        mpSpentThisTurn?: number = 0;

    /** Mestre liberou o limite de MP por turno até a rodada virar */
    @IsOptional()
    @IsBoolean()
        mpLimitOverride?: boolean = false;

    /**
     * Ações que ainda restam na rodada (Padrão, Bônus, Movimento, Reação). Sem o campo, tudo disponível. Voltam quando a rodada vira.
     * Ver utils/combat/actionBudgets.ts.
     */
    @IsOptional()
        actions?: ActionBudget;

    /** Usos das habilidades ativadas **neste combate**, por chave de armazenamento (ver `utils/combat/passives/abilities.ts`); recomeça a cada combate */
    @IsOptional()
        abilityUses?: Record<string, number>;

    @ValidateNested({ each: true })
    @Type(() => AppliedEffect)
    @IsArray()
        effects: AppliedEffect[] = [];

    constructor(combatant?: Partial<Combatant>) {
        Object.assign(this, combatant);
        if (!Array.isArray(this.effects)) {
            this.effects = [];
        }
    }
}

/**
 * Log de ação no combate
 */
export class CombatLog {
    @IsString()
        timestamp: string = new Date().toISOString();

    @IsString()
        round: number;

    @IsString()
        type: 'initiative' | 'damage' | 'heal' | 'action' | 'phase_change' | 'turn_pass' | 'effect_applied' | 'effect_tick' | 'effect_expired' | 'effect_removed';

    @IsString()
        actorId: string;

    @IsString()
        actorName: string;

    @IsOptional()
    @IsString()
        targetId?: string;

    @IsOptional()
    @IsString()
        targetName?: string;

    @IsOptional()
    @IsNumber()
        value?: number; // Valor de dano/cura ou resultado de dado

    @IsOptional()
    @IsString()
        message?: string;

    constructor(log?: Partial<CombatLog>) {
        Object.assign(this, log);
    }
}

/**
 * Estado do combate na sessão
 */
export class Combat {
    @IsBoolean()
        isActive: boolean = false;

    @IsString()
        phase: CombatPhase = 'INITIATIVE';

    @IsNumber()
        round: number = 1;

    @IsNumber()
        currentTurnIndex: number = 0; // Índice do combatente atual na ordem

    @ValidateNested({ each: true })
    @Type(() => Combatant)
    @IsArray()
        combatants: Combatant[] = [];

    @ValidateNested({ each: true })
    @Type(() => CombatLog)
    @IsArray()
        logs: CombatLog[] = [];

    @IsOptional()
    @IsString()
        startedAt?: string;

    @IsOptional()
    @IsString()
        endedAt?: string;

    @IsOptional()
    @IsBoolean()
        showEnemyLp?: boolean = false; // Se mostra LP dos inimigos para jogadores

    /** Ataques declarados que o mestre ainda não resolveu (ataque assistido; ver utils/combat/pendingAttacks.ts) */
    @IsOptional()
    @IsArray()
        pendingAttacks?: PendingAttackData[];

    /** Saídas de alcance declaradas: cada uma abre a um inimigo a chance de um ataque de oportunidade (ver utils/combat/opportunities.ts) */
    @IsOptional()
    @IsArray()
        opportunities?: OpportunityData[];

    /**
     * Quem não vê quem (furtivo, invisível...): cada par é "o observador não vê o escondido". Sem o campo, todos se veem. Ver utils/combat/awareness.ts. **É segredo do mestre e não é
     * gravado em `session.combat`**: vive em `campaigns/{id}/gmData/awareness` (utils/combat/awarenessSecrets.ts); o servidor o põe aqui só na memória da ação, e o navegador do mestre o
     * junta de volta. Um combate antigo ainda pode carregá-lo no documento da campanha até a primeira ação depois da mudança.
     */
    @IsOptional()
    @IsArray()
        unseen?: UnseenData[];

    /** Ofertas de reação abertas (o que aconteceu e quem pode reagir com a Reação); duram o turno em andamento. Ver utils/combat/reactions.ts */
    @IsOptional()
    @IsArray()
        reactions?: ReactionOfferData[];

    /** Ambiente manual da cena: a iluminação e quem está em terreno difícil, marcados pelo mestre. Sem o campo, luz clara e sem terreno difícil. Ver utils/combat/environment.ts */
    @IsOptional()
        environment?: CombatEnvironment;

    constructor(combat?: Partial<Combat>) {
        Object.assign(this, combat);
    }

    /**
     * Retorna o combatente atual (cujo turno é agora)
     */
    getCurrentCombatant(): Combatant | null {
        if (!this.isActive || this.combatants.length === 0) return null;
        return this.combatants[this.currentTurnIndex] || null;
    }

    /**
     * Retorna combatentes ordenados por iniciativa (maior primeiro)
     * Em caso de empate, desempata por DEX (maior primeiro)
     */
    getInitiativeOrder(): Combatant[] {
        return [ ...this.combatants ].sort((a, b) => {
            if (b.initiativeTotal !== a.initiativeTotal) {
                return b.initiativeTotal - a.initiativeTotal;
            }
            // Desempate por DEX
            return (b.dexterity || 0) - (a.dexterity || 0);
        });
    }

    /**
     * Verifica se todos já agiram neste round
     */
    allHaveActed(): boolean {
        return this.combatants.every(c => c.hasActed);
    }

    /**
     * Reseta as ações para um novo round
     */
    resetRound(): void {
        this.combatants.forEach(c => {
            c.hasActed = false;
            c.initiativeRoll = 0;
            c.initiativeTotal = 0;
        });
        this.round++;
        this.phase = 'INITIATIVE';
        this.currentTurnIndex = 0;
    }
}
