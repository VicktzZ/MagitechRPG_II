import { randomUUID } from 'crypto';
import admin from 'firebase-admin';
import { ApiError } from '@utils/api/errors';
import { initFirebaseAdmin } from '@utils/initializeFireOrm';

/**
 * Uma ação de combate por vez em cada campanha.
 *
 * A rota `combat` lê o combate no começo, muda tudo na memória e grava `session.combat` inteiro no fim, sem conferir se mudou nesse meio
 * tempo: duas ações quase juntas (um jogador gasta MP enquanto o mestre aplica um efeito) se sobrescreviam e a primeira se perdia. As ações
 * também têm efeitos fora do combate (vida da ficha, MP da manutenção), então repetir a ação numa nova tentativa duplicaria esses efeitos.
 * Em vez de tentar de novo, as ações entram numa fila: quem chega pega uma trava curta (um documento em `campaigns/{id}/locks/combat`,
 * só o servidor acessa), lê o combate já com a trava na mão, grava e solta. Se a trava estiver com outra ação, espera a vez.
 *
 * A trava tem prazo (`leaseMs`): se a função que a pegou cair no meio, ela vale de novo sozinha depois dele.
 */

/** Quanto a trava vale se quem a pegou não a soltar (função que caiu) */
export const COMBAT_LOCK_LEASE_MS = 20_000;
/** Quanto uma ação espera a vez antes de desistir */
export const COMBAT_LOCK_WAIT_MS = 8_000;

export interface CombatLockOptions {
    leaseMs?: number;
    waitMs?: number;
    /** Relógio e espera, trocáveis nos testes */
    now?: () => number;
    sleep?: (ms: number) => Promise<void>;
}

export interface CombatLock {
    /** Solta a trava; se ela já passou do prazo e foi pega por outra ação, não mexe */
    release: () => Promise<void>;
}

const lockRef = (campaignId: string) => {
    initFirebaseAdmin();
    return admin.firestore().collection('campaigns').doc(campaignId).collection('locks').doc('combat');
};

const defaultSleep = async (ms: number): Promise<void> => await new Promise(resolve => setTimeout(resolve, ms));

export const combatBusy = (): ApiError =>
    new ApiError(409, 'COMBAT_BUSY', 'O combate está ocupado com outra ação. Tente de novo em instantes.');

/** Pega a trava do combate da campanha, esperando a vez por até `waitMs`; sem conseguir, lança 409 `COMBAT_BUSY` */
export async function acquireCombatLock(campaignId: string, options: CombatLockOptions = {}): Promise<CombatLock> {
    const { leaseMs = COMBAT_LOCK_LEASE_MS, waitMs = COMBAT_LOCK_WAIT_MS, now = Date.now, sleep = defaultSleep } = options;
    const ref = lockRef(campaignId);
    const owner = randomUUID();
    const deadline = now() + waitMs;

    for (;;) {
        const taken = await admin.firestore().runTransaction(async (transaction) => {
            const snapshot = await transaction.get(ref);
            const until = Number(snapshot.data()?.['until'] ?? 0);
            if (until > now()) return false;
            transaction.set(ref, { owner, until: now() + leaseMs });
            return true;
        });
        if (taken) break;

        if (now() >= deadline) throw combatBusy();
        // Espera um pouco, com variação para as ações que chegaram juntas não voltarem juntas
        await sleep(25 + Math.floor(Math.random() * 75));
    }

    return {
        release: async () => {
            try {
                await admin.firestore().runTransaction(async (transaction) => {
                    const snapshot = await transaction.get(ref);
                    if (snapshot.data()?.['owner'] === owner) transaction.delete(ref);
                });
            } catch (error) {
                // A trava vence sozinha no prazo; falhar em soltar não pode derrubar uma ação que já foi gravada
                console.error('[Combate] Não consegui soltar a trava do combate:', error);
            }
        }
    };
}

/** Roda `run` com a trava do combate na mão e a solta no fim, com sucesso ou erro */
export async function withCombatLock<T>(campaignId: string, run: () => Promise<T>, options?: CombatLockOptions): Promise<T> {
    const lock = await acquireCombatLock(campaignId, options);
    try {
        return await run();
    } finally {
        await lock.release();
    }
}
