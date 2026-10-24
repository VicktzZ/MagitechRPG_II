import admin from 'firebase-admin';
import { initFirebaseAdmin } from '@utils/initializeFireOrm';

/**
 * Anotações privadas do mestre sobre cada ficha: campaigns/{campaignId}/gmNotes/{charsheetId}, um documento por
 * ficha com `{ text, updatedAt, updatedBy }`. Vivem numa subcoleção (e não na ficha nem na campanha) porque qualquer
 * usuário logado lê esses dois documentos pelo ID; as regras do Firestore só deixam o mestre da campanha ler esta
 * subcoleção, e só o servidor escreve (Admin SDK).
 */

function gmNotesOf(campaignId: string) {
    initFirebaseAdmin();
    return admin.firestore().collection('campaigns').doc(campaignId).collection('gmNotes');
}

/**
 * Grava a anotação da ficha. Texto vazio apaga o documento: sem anotação, sem documento.
 * Devolve `true` se gravou e `false` se apagou.
 */
export async function saveGmNote(campaignId: string, charsheetId: string, text: string, userId: string): Promise<boolean> {
    const ref = gmNotesOf(campaignId).doc(charsheetId);

    if (text.trim() === '') {
        await ref.delete();
        return false;
    }

    await ref.set({ text, updatedBy: userId, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return true;
}

/** Lê a anotação (usado pelos testes e pela conferência; o navegador do mestre lê direto, em tempo real) */
export async function getGmNote(campaignId: string, charsheetId: string): Promise<{ text: string; updatedBy: string } | null> {
    const snapshot = await gmNotesOf(campaignId).doc(charsheetId).get();
    if (!snapshot.exists) return null;

    const data = snapshot.data() as { text?: unknown; updatedBy?: unknown } | undefined;
    return { text: typeof data?.text === 'string' ? data.text : '', updatedBy: typeof data?.updatedBy === 'string' ? data.updatedBy : '' };
}

/** Apaga todas as anotações da campanha (o Firestore não apaga subcoleções junto com o documento) */
export async function deleteGmNotes(campaignId: string): Promise<void> {
    await admin.firestore().recursiveDelete(gmNotesOf(campaignId));
}
