import admin from 'firebase-admin';
import { initFirebaseAdmin } from '@utils/initializeFireOrm';
import type { HiddenNotice } from '@utils/combat/awarenessSecrets';

/**
 * Dados que só **um jogador** pode ver: campaigns/{campaignId}/playerData/{userId} (o id do documento é o id do usuário). A regra do Firestore só deixa ler quem é aquele usuário (e o
 * mestre e o administrador do site), e só o servidor escreve (Admin SDK). Hoje guarda o que o jogador escondido pode saber da matriz de percepção, que é do mestre: de quem ele está fora
 * da vista (`kind: 'awareness'`, `hiddenFrom`). O documento só existe enquanto o jogador está escondido de alguém.
 */

function playerDataOf(campaignId: string) {
    initFirebaseAdmin();
    return admin.firestore().collection('campaigns').doc(campaignId).collection('playerData');
}

/**
 * Deixa os documentos como `notices` manda (um por usuário escondido): grava os avisos de quem tem e apaga o documento de quem já não está escondido de ninguém. O servidor só
 * chama isto quando a matriz mudou, não a cada ação do combate.
 */
export async function syncHiddenNotices(campaignId: string, notices: ReadonlyMap<string, readonly HiddenNotice[]>): Promise<void> {
    const collection = playerDataOf(campaignId);
    const existing = await collection.listDocuments();

    const stale = existing.filter(ref => !notices.has(ref.id));
    await Promise.all(stale.map(async ref => { await ref.delete(); }));

    await Promise.all([ ...notices.entries() ].map(async ([ userId, hiddenFrom ]) => {
        await collection.doc(userId).set({
            kind: 'awareness',
            hiddenFrom: hiddenFrom.map(({ hiderId, observerName, cause }) => ({ hiderId, observerName, cause })),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }));
}

/** Apaga os dados de todos os jogadores da campanha (o Firestore não apaga subcoleções junto com o documento) */
export async function deletePlayerData(campaignId: string): Promise<void> {
    await admin.firestore().recursiveDelete(playerDataOf(campaignId));
}
