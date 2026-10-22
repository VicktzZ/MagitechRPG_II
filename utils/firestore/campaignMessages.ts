import { createHash } from 'crypto';
import admin from 'firebase-admin';
import type { Message } from '@models';
import { notFound } from '@utils/api/errors';
import { isValidId } from '@utils/api/input';
import { parseChatPageSize } from '@utils/chatMessages';
import { initFirebaseAdmin } from '@utils/initializeFireOrm';
import { stripUndefined } from './stripUndefined';

/**
 * Mensagens do chat: campaigns/{campaignId}/messages/{messageId}, uma por documento.
 *
 * Antes ficavam numa lista dentro do documento da campanha, e cada mensagem regravava a
 * campanha inteira: perdia alterações simultâneas (combate, notas, entrada de jogador),
 * esbarrava no limite de 1 MiB do documento e fazia todo cliente baixar o histórico
 * inteiro a cada mensagem. Aqui o servidor só cria um documento novo.
 */

const ALREADY_EXISTS = 6; // código gRPC

/** A parte do documento da campanha que a migração lê */
interface CampaignWithLegacyMessages {
    session?: { messages?: Message[] };
}

function campaignRef(campaignId: string) {
    initFirebaseAdmin();
    return admin.firestore().collection('campaigns').doc(campaignId);
}

const messagesOf = (campaignId: string) => campaignRef(campaignId).collection('messages');

const isAlreadyExists = (error: unknown): boolean => (error as { code?: unknown })?.code === ALREADY_EXISTS;

/**
 * Grava uma mensagem. O ID da mensagem é o ID do documento, então repetir o envio (retry,
 * clique duplo) não duplica nem sobrescreve. Devolve false se o ID já existia.
 */
export async function appendCampaignMessage(campaignId: string, message: Message): Promise<boolean> {
    try {
        await messagesOf(campaignId).doc(message.id).create(stripUndefined({ ...message }));
        return true;
    } catch (error) {
        if (isAlreadyExists(error)) return false;
        throw error;
    }
}

export interface MessagesPage {
    /** Da mais antiga para a mais nova */
    messages: Message[];
    /** Há mensagens ainda mais antigas que as desta página */
    hasMore: boolean;
}

/**
 * Uma página de mensagens, das mais recentes para trás. Com `beforeId`, só as mensagens
 * anteriores à dela (o ID é o cursor: o empate de horário fica resolvido pelo próprio documento).
 */
export async function listCampaignMessages(
    campaignId: string,
    { beforeId, limit }: { beforeId?: string; limit?: number | string | null } = {}
): Promise<MessagesPage> {
    const size = typeof limit === 'number' ? Math.max(1, Math.floor(limit)) : parseChatPageSize(limit ?? undefined);
    const collection = messagesOf(campaignId);

    let query = collection.orderBy('timestamp', 'desc').limit(size + 1);
    if (beforeId) {
        const cursor = await collection.doc(beforeId).get();
        if (!cursor.exists) throw notFound('Mensagem de referência não encontrada');
        query = query.startAfter(cursor);
    }

    const { docs } = await query.get();
    return {
        messages: docs.slice(0, size).map(doc => doc.data() as Message).reverse(),
        hasMore: docs.length > size
    };
}

/** Apaga todas as mensagens da campanha (o Firestore não apaga subcoleções junto com o documento) */
export async function deleteCampaignMessages(campaignId: string): Promise<void> {
    await admin.firestore().recursiveDelete(messagesOf(campaignId));
}

// ─────────────────────────────────────────────
// Migração das mensagens antigas (lista dentro da campanha)
// ─────────────────────────────────────────────

export interface MigrationReport {
    campaignId: string;
    /** Mensagens na lista antiga da campanha */
    legacy: number;
    /** Copiadas agora para a subcoleção */
    copied: number;
    /** Já estavam na subcoleção */
    alreadyThere: number;
    /** A lista antiga foi esvaziada */
    cleared: boolean;
    /** Por que a lista antiga não foi esvaziada, se foi pedido */
    note?: string;
}

/** ID estável para mensagem antiga sem `id` válido: rodar de novo não duplica */
function legacyMessageId(message: Message): string {
    if (isValidId(message.id)) return message.id;
    const digest = createHash('sha1').update(`${message.timestamp}|${message.by?.id}|${message.text}`).digest('hex');
    return `legacy-${digest}`;
}

/**
 * Copia `session.messages` de UMA campanha para a subcoleção. Sem `apply` só conta (simulação).
 * Com `clear`, esvazia a lista antiga depois de conferir que todas as cópias existem e que a
 * lista não mudou desde a leitura (uma versão antiga do app pode ter acrescentado mensagens).
 */
export async function migrateLegacyMessages(
    campaignId: string,
    { apply = false, clear = false }: { apply?: boolean; clear?: boolean } = {}
): Promise<MigrationReport> {
    const ref = campaignRef(campaignId);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw notFound('Campanha não encontrada');

    const legacy: Message[] = (snapshot.data() as CampaignWithLegacyMessages | undefined)?.session?.messages ?? [];
    const report: MigrationReport = { campaignId, legacy: legacy.length, copied: 0, alreadyThere: 0, cleared: false };
    if (!apply || legacy.length === 0) return report;

    const collection = messagesOf(campaignId);
    const entries = legacy.map(message => ({ id: legacyMessageId(message), message }));

    // Só copia o que ainda não está lá: rodar de novo é barato e não depende de erros de "já existe"
    const missing: typeof entries = [];
    for (let start = 0; start < entries.length; start += 300) {
        const chunk = entries.slice(start, start + 300);
        const found = await admin.firestore().getAll(...chunk.map(({ id }) => collection.doc(id)));
        chunk.forEach((entry, index) => {
            if (found[index].exists) report.alreadyThere++;
            else missing.push(entry);
        });
    }

    // As operações do BulkWriter só se resolvem quando ele envia o lote: fecha primeiro, lê os resultados depois
    const writer = admin.firestore().bulkWriter();
    const outcomes = missing.map(async ({ id, message }) =>
        await writer.create(collection.doc(id), stripUndefined({ ...message, id })).then(
            () => undefined,
            (error: unknown) => error
        )
    );
    await writer.close();

    const failures: unknown[] = [];
    for (const outcome of await Promise.all(outcomes)) {
        if (outcome === undefined) report.copied++;
        // Outra execução criou entre a conferência e a escrita: conta como já copiada
        else if (isAlreadyExists(outcome)) report.alreadyThere++;
        else failures.push(outcome);
    }

    if (failures.length > 0) {
        report.note = `${failures.length} mensagem(ns) não foram copiadas; a lista antiga foi mantida`;
        return report;
    }

    if (!clear) return report;

    // Confere as cópias antes de esvaziar a lista antiga
    const refs = entries.map(({ id }) => collection.doc(id));
    for (let start = 0; start < refs.length; start += 300) {
        const found = await admin.firestore().getAll(...refs.slice(start, start + 300));
        if (found.some(doc => !doc.exists)) {
            report.note = 'Faltam cópias na subcoleção; a lista antiga foi mantida';
            return report;
        }
    }

    report.cleared = await admin.firestore().runTransaction(async (transaction) => {
        const current = await transaction.get(ref);
        const currentLength = ((current.data() as CampaignWithLegacyMessages | undefined)?.session?.messages ?? []).length;
        if (currentLength !== legacy.length) {
            report.note = 'A lista antiga mudou durante a migração; rode de novo';
            return false;
        }
        transaction.update(ref, { 'session.messages': [] });
        return true;
    });

    return report;
}
