import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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

    constructor(combatant?: Partial<Combatant>) {
        Object.assign(this, combatant);
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
        type: 'initiative' | 'damage' | 'heal' | 'action' | 'phase_change' | 'turn_pass';

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
