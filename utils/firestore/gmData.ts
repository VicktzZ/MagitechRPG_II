import admin from 'firebase-admin';
import { initFirebaseAdmin } from '@utils/initializeFireOrm';
import { sanitizeCreatureDefenses, type CreatureDefenses } from '@utils/combat/creatureSecrets';

/**
 * Dados que só o mestre pode ver: campaigns/{campaignId}/gmData/{docId}. Moram numa subcoleção porque qualquer usuário logado
 * lê a campanha e a ficha pelo ID; a regra do Firestore só deixa ler esta subcoleção quem está em `campaign.admin` (e o
 * administrador do site), e só o servidor escreve (Admin SDK). Cada documento tem um `kind` e um id que começa por ele:
 *
 *  - `creature-defenses:<id da criatura>`: elemento, fraquezas e resistências/vulnerabilidades da criatura (`kind: 'creatureDefenses'`).
 */

const CREATURE_DEFENSES_PREFIX = 'creature-defenses:';

function gmDataOf(campaignId: string) {
    initFirebaseAdmin();
    return admin.firestore().collection('campaigns').doc(campaignId).collection('gmData');
}

/** O id do documento das defesas de uma criatura (o id da criatura pode ter "/", que não cabe num id de documento) */
export const creatureDefensesDocId = (creatureId: string): string => `${CREATURE_DEFENSES_PREFIX}${encodeURIComponent(creatureId)}`;

/** Grava as defesas de uma criatura (sobrescreve o documento inteiro: o chamador já juntou o que valia) */
export async function saveCreatureDefenses(campaignId: string, creatureId: string, defenses: CreatureDefenses, userId: string): Promise<void> {
    await gmDataOf(campaignId).doc(creatureDefensesDocId(creatureId)).set({
        kind: 'creatureDefenses',
        creatureId,
        ...sanitizeCreatureDefenses(defenses),
        updatedBy: userId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
}

/** As defesas gravadas de uma criatura, ou `null` se ela não tem documento privado (criatura antiga: valem os campos dela) */
export async function getCreatureDefenses(campaignId: string, creatureId: string): Promise<CreatureDefenses | null> {
    const snapshot = await gmDataOf(campaignId).doc(creatureDefensesDocId(creatureId)).get();
    return snapshot.exists ? sanitizeCreatureDefenses(snapshot.data()) : null;
}

/** As defesas de todas as criaturas da campanha que têm documento privado, por id da criatura */
export async function readCreatureDefenses(campaignId: string): Promise<Record<string, CreatureDefenses>> {
    const snapshot = await gmDataOf(campaignId).where('kind', '==', 'creatureDefenses').get();
    const result: Record<string, CreatureDefenses> = {};
    for (const doc of snapshot.docs) {
        const data = doc.data() as { creatureId?: unknown };
        if (typeof data.creatureId === 'string' && data.creatureId) result[data.creatureId] = sanitizeCreatureDefenses(data);
    }
    return result;
}

/** Apaga o documento privado das defesas de uma criatura (criatura excluída) */
export async function deleteCreatureDefenses(campaignId: string, creatureId: string): Promise<void> {
    await gmDataOf(campaignId).doc(creatureDefensesDocId(creatureId)).delete();
}

/** Apaga todos os dados do mestre da campanha (o Firestore não apaga subcoleções junto com o documento) */
export async function deleteGmData(campaignId: string): Promise<void> {
    await admin.firestore().recursiveDelete(gmDataOf(campaignId));
}
