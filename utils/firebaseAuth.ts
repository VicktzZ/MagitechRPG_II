/**
 * Estado do FirebaseAuthBridge, compartilhado entre o bridge, os hooks de
 * tempo real e o FirestoreEntity.
 *
 * "Pronto" significa que o bridge terminou de decidir a autenticação: entrou
 * no Firebase, confirmou que não há sessão ou falhou. Listeners e leituras do
 * Firestore esperam esse momento — abertos antes, seriam recusados pelas
 * regras (que exigem login) e encerrados.
 */
let ready = false;
const readyListeners = new Set<() => void>();

export function isFirebaseAuthReady(): boolean {
    return ready;
}

export function markFirebaseAuthReady(): void {
    if (ready) return;
    ready = true;
    readyListeners.forEach(listener => { listener(); });
}

export function subscribeFirebaseAuthReady(listener: () => void): () => void {
    readyListeners.add(listener);
    return () => { readyListeners.delete(listener); };
}

/**
 * Espera o bridge ficar pronto (ou o timeout). No servidor resolve na hora —
 * lá o acesso ao banco é pelo Admin SDK, não pelo SDK do navegador.
 */
export async function waitForFirebaseAuth(timeoutMs = 10_000): Promise<void> {
    if (typeof window === 'undefined' || ready) return;

    await new Promise<void>(resolve => {
        let unsubscribe = () => {};
        const timer = setTimeout(() => {
            unsubscribe();
            resolve();
        }, timeoutMs);
        unsubscribe = subscribeFirebaseAuthReady(() => {
            clearTimeout(timer);
            unsubscribe();
            resolve();
        });
    });
}
