import admin from 'firebase-admin';
import { initFirebaseAdmin } from '@utils/initializeFireOrm';
import { badRequest, forbidden } from '@utils/api/errors';

type CollectionName = 'campaigns' | 'charsheets';

function collection(name: CollectionName) {
    initFirebaseAdmin();
    return admin.firestore().collection(name);
}

/**
 * Lê um documento pelo Admin SDK no mesmo formato do FirestoreEntity do
 * navegador (dados crus, com `id`). Usado pelas rotas que antes acessavam o
 * banco pelo SDK do navegador no servidor — sem usuário autenticado, isso
 * deixaria de funcionar com as regras do Firestore fechadas.
 */
export async function adminGetDoc<T = any>(name: CollectionName, id: string): Promise<T | null> {
    const snapshot = await collection(name).doc(id).get();
    return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } as T : null;
}

/**
 * update() parcial pelo Admin SDK, com a mesma semântica do updateDoc do
 * navegador: chaves com ponto são caminhos de campo ("inventory.money") e
 * `updatedAt` recebe o horário do servidor.
 */
export async function adminUpdateDoc(name: CollectionName, id: string, data: Record<string, unknown>): Promise<void> {
    await collection(name).doc(id).update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
}

// Até 8 segmentos separados por ponto; sem os caracteres que o Firestore proíbe em caminhos
// (~ * / [ ] `) nem caracteres de controle. Nomes de perícias como "RES Física" são válidos.
// eslint-disable-next-line no-control-regex
const FIELD_PATH = /^(?=.{1,300}$)[^.~*/[\]`\u0000-\u001f]+(\.[^.~*/[\]`\u0000-\u001f]+){0,7}$/;

/**
 * Valida um mapa { caminho: valor } vindo do cliente para adminUpdateDoc.
 * `protectedPaths` não podem ser alterados nem diretamente nem por subcampos
 * (ex.: "userId", "admin", "session.messages"); `protectedExact` bloqueia só
 * a substituição do objeto inteiro (ex.: "session", mas "session.combat" pode).
 */
export function assertFieldUpdates(
    fields: unknown,
    { protectedPaths, protectedExact = [] }: { protectedPaths: string[], protectedExact?: string[] }
): Record<string, unknown> {
    if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
        throw badRequest('"fields" deve ser um objeto { caminho: valor }');
    }

    const entries = Object.entries(fields as Record<string, unknown>);
    if (entries.length === 0) throw badRequest('Nenhum campo para atualizar');
    if (entries.length > 200) throw badRequest('Campos demais em uma única atualização');

    for (const [ path, value ] of entries) {
        if (!FIELD_PATH.test(path)) {
            throw badRequest(`Caminho de campo inválido: "${path}"`);
        }
        const isProtected = protectedExact.includes(path) ||
            protectedPaths.some(p => path === p || path.startsWith(`${p}.`) || p.startsWith(`${path}.`));
        if (isProtected) {
            throw forbidden(`O campo "${path}" não pode ser alterado por aqui`);
        }
        if (value === undefined) {
            throw badRequest(`Valor ausente para "${path}"`);
        }
    }

    return fields as Record<string, unknown>;
}
