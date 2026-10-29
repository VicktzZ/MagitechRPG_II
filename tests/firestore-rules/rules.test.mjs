// Testes das regras do Firestore (../../firestore.rules) contra o emulador.
// Rodar: npm install && npm test   (nesta pasta; precisa de Java para o emulador)
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';

const rulesPath = fileURLToPath(new URL('../../firestore.rules', import.meta.url));

let env;
const db = (uid, claims = {}) => (uid ? env.authenticatedContext(uid, claims) : env.unauthenticatedContext()).firestore();
const anon = () => db(null);
const alice = () => db('alice');
const bob = () => db('bob');
const admin = () => db('admin1', { admin: true });

before(async () => {
    env = await initializeTestEnvironment({
        projectId: 'demo-magitech',
        firestore: { rules: readFileSync(rulesPath, 'utf8') }
    });
});

after(async () => {
    await env?.cleanup();
});

beforeEach(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async ctx => {
        const fs = ctx.firestore();
        await setDoc(doc(fs, 'users/alice'), { id: 'alice', email: 'alice@example.com', subscription: { plan: 'FREEMIUM' } });
        await setDoc(doc(fs, 'users/bob'), { id: 'bob', email: 'bob@example.com' });
        await setDoc(doc(fs, 'charsheets/sheetA'), { id: 'sheetA', userId: 'alice', name: 'Aria', inventory: { money: 10 } });
        await setDoc(doc(fs, 'charsheets/sheetB'), { id: 'sheetB', userId: 'bob', name: 'Borin' });
        await setDoc(doc(fs, 'campaigns/camp1'), { id: 'camp1', campaignCode: 'ABCD1234', admin: [ 'bob' ], players: [ { userId: 'alice', charsheetId: 'sheetA' } ] });
        await setDoc(doc(fs, 'campaigns/camp1/messages/m1'), { id: 'm1', text: 'oi', timestamp: '2026-01-01T10:00:00.000Z', by: { id: 'alice', name: 'Aria', image: '' } });
        await setDoc(doc(fs, 'campaigns/camp1/messages/m2'), { id: 'm2', text: 'olá', timestamp: '2026-01-01T10:01:00.000Z', by: { id: 'bob', name: 'Borin', image: '' } });
        await setDoc(doc(fs, 'campaigns/camp1/gmNotes/sheetA'), { text: 'Aria esconde um segredo', updatedBy: 'bob' });
        await setDoc(doc(fs, 'campaigns/camp1/gmData/creature-defenses:goblin'), { kind: 'creatureDefenses', creatureId: 'goblin', elementalMastery: 'Fogo', weaknesses: [ 'Cortante' ], damageModifiers: [] });
        await setDoc(doc(fs, 'campaigns/camp2'), { id: 'camp2', campaignCode: 'WXYZ9999', admin: [ 'carol' ], players: [ { userId: 'bob', charsheetId: 'sheetB' } ] });
        await setDoc(doc(fs, 'campaigns/campSemMestre'), { id: 'campSemMestre', campaignCode: 'SEMM0001', players: [] });
        await setDoc(doc(fs, 'campaigns/campSemMestre/gmNotes/x'), { text: 'sem mestre' });
        await setDoc(doc(fs, 'campaigns/campSemMestre/gmData/x'), { kind: 'creatureDefenses', creatureId: 'x' });
        await setDoc(doc(fs, 'notifications/n1'), { id: 'n1', userId: 'alice', title: 'oi', timestamp: '2026-01-01' });
        await setDoc(doc(fs, 'notifications/n2'), { id: 'n2', userId: 'bob', title: 'oi', timestamp: '2026-01-01' });
        await setDoc(doc(fs, 'spells/s1'), { id: 's1', name: 'Bola de Fogo' });
        await setDoc(doc(fs, 'powers/p1'), { id: 'p1', name: 'Poder' });
        await setDoc(doc(fs, 'rpg_systems/sys1'), { id: 'sys1', isPublic: false });
        await setDoc(doc(fs, 'campaign_stats/st1'), { campaignId: 'camp1' });
        await setDoc(doc(fs, 'jobs/j1'), { name: 'job' });
    });
});

describe('anônimo (sem login no Firebase)', () => {
    it('não lê nada', async () => {
        for (const path of [ 'users/alice', 'charsheets/sheetA', 'campaigns/camp1', 'notifications/n1', 'spells/s1' ]) {
            await assertFails(getDoc(doc(anon(), path)));
        }
        await assertFails(getDocs(collection(anon(), 'users')));
    });

    it('não escreve nada', async () => {
        await assertFails(updateDoc(doc(anon(), 'charsheets/sheetA'), { name: 'x' }));
        await assertFails(deleteDoc(doc(anon(), 'campaigns/camp1')));
        await assertFails(setDoc(doc(anon(), 'users/hacker'), { email: 'x' }));
    });
});

describe('users', () => {
    it('cada um lê só o próprio documento', async () => {
        await assertSucceeds(getDoc(doc(alice(), 'users/alice')));
        await assertFails(getDoc(doc(alice(), 'users/bob')));
    });

    it('ninguém além de admin lista a coleção (e-mails, assinaturas)', async () => {
        await assertFails(getDocs(collection(alice(), 'users')));
        await assertFails(getDocs(query(collection(alice(), 'users'), where('id', 'in', [ 'alice', 'bob' ]))));
        await assertSucceeds(getDocs(collection(admin(), 'users')));
    });

    it('usuário não altera o próprio documento (ex.: se dar plano pago)', async () => {
        await assertFails(updateDoc(doc(alice(), 'users/alice'), { 'subscription.plan': 'PREMIUM_PLUS' }));
        await assertFails(setDoc(doc(alice(), 'users/novo'), { email: 'x' }));
    });
});

describe('charsheets', () => {
    it('qualquer logado abre uma ficha pelo ID (mestre/colegas de campanha)', async () => {
        await assertSucceeds(getDoc(doc(bob(), 'charsheets/sheetA')));
    });

    it('listar só as próprias fichas', async () => {
        await assertSucceeds(getDocs(query(collection(alice(), 'charsheets'), where('userId', '==', 'alice'), orderBy('name'))));
        await assertFails(getDocs(query(collection(bob(), 'charsheets'), where('userId', '==', 'alice'))));
        await assertFails(getDocs(collection(bob(), 'charsheets')));
    });

    it('dono edita a própria ficha', async () => {
        await assertSucceeds(updateDoc(doc(alice(), 'charsheets/sheetA'), { 'inventory.money': 20 }));
    });

    it('dono não troca o dono nem o id', async () => {
        await assertFails(updateDoc(doc(alice(), 'charsheets/sheetA'), { userId: 'bob' }));
        await assertFails(updateDoc(doc(alice(), 'charsheets/sheetA'), { id: 'outra' }));
    });

    it('ninguém edita a ficha de outra pessoa direto (mestre usa a API)', async () => {
        await assertFails(updateDoc(doc(bob(), 'charsheets/sheetA'), { 'inventory.money': 999 }));
    });

    it('criar e apagar fichas só pela API', async () => {
        await assertFails(setDoc(doc(alice(), 'charsheets/nova'), { id: 'nova', userId: 'alice' }));
        await assertFails(deleteDoc(doc(alice(), 'charsheets/sheetA')));
    });
});

describe('campaigns', () => {
    it('logado lê uma campanha pelo ID', async () => {
        await assertSucceeds(getDoc(doc(alice(), 'campaigns/camp1')));
    });

    it('não dá para listar/consultar campanhas (nem pelo código)', async () => {
        await assertFails(getDocs(collection(alice(), 'campaigns')));
        await assertFails(getDocs(query(collection(alice(), 'campaigns'), where('campaignCode', '==', 'ABCD1234'))));
        await assertSucceeds(getDocs(collection(admin(), 'campaigns')));
    });

    it('nem o mestre escreve direto (só pela API)', async () => {
        await assertFails(updateDoc(doc(bob(), 'campaigns/camp1'), { 'session.combat': {} }));
        await assertFails(updateDoc(doc(alice(), 'campaigns/camp1'), { admin: [ 'alice' ] }));
        await assertFails(deleteDoc(doc(bob(), 'campaigns/camp1')));
    });
});

describe('chat da campanha (campaigns/{id}/messages)', () => {
    it('anônimo não lê', async () => {
        await assertFails(getDoc(doc(anon(), 'campaigns/camp1/messages/m1')));
        await assertFails(getDocs(collection(anon(), 'campaigns/camp1/messages')));
    });

    it('logado lê o histórico, na consulta que o app faz (mais recentes primeiro, com limite)', async () => {
        const recent = query(collection(alice(), 'campaigns/camp1/messages'), orderBy('timestamp', 'desc'), limit(100));
        const snapshot = await assertSucceeds(getDocs(recent));
        assert.deepEqual(snapshot.docs.map(d => d.id), [ 'm2', 'm1' ]);
        await assertSucceeds(getDoc(doc(bob(), 'campaigns/camp1/messages/m1')));
    });

    it('ninguém escreve direto — nem jogador, nem mestre; mensagem só pela API', async () => {
        for (const user of [ alice(), bob() ]) {
            await assertFails(setDoc(doc(user, 'campaigns/camp1/messages/novo'), { id: 'novo', text: 'x', timestamp: '2026-01-01T11:00:00.000Z' }));
            await assertFails(updateDoc(doc(user, 'campaigns/camp1/messages/m1'), { text: 'editado' }));
            await assertFails(deleteDoc(doc(user, 'campaigns/camp1/messages/m1')));
        }
        await assertFails(setDoc(doc(admin(), 'campaigns/camp1/messages/novo'), { id: 'novo', text: 'x' }));
    });

    it('a subcoleção não abre a listagem das campanhas', async () => {
        await assertFails(getDocs(collection(alice(), 'campaigns')));
    });
});

describe('anotações privadas do mestre (campaigns/{id}/gmNotes)', () => {
    const note = (user, path = 'campaigns/camp1/gmNotes/sheetA') => getDoc(doc(user, path));

    it('o mestre da campanha lê', async () => {
        await assertSucceeds(note(bob()));
    });

    it('o mestre lê também uma ficha que ainda não tem anotação (o listener abre antes da primeira nota)', async () => {
        const snapshot = await assertSucceeds(note(bob(), 'campaigns/camp1/gmNotes/ficha-nova'));
        assert.equal(snapshot.exists(), false);
    });

    it('o jogador da campanha não lê, nem a anotação da própria ficha', async () => {
        await assertFails(note(alice()));
        await assertFails(getDocs(collection(alice(), 'campaigns/camp1/gmNotes')));
    });

    it('quem não faz parte da campanha não lê', async () => {
        await assertFails(note(db('carol')));
        await assertFails(note(db('intruso')));
    });

    it('o mestre de OUTRA campanha não lê as anotações desta (nem entra pelo ID da campanha)', async () => {
        await assertFails(note(db('carol')));
        await assertFails(note(bob(), 'campaigns/camp2/gmNotes/sheetB'));
    });

    it('anônimo não lê', async () => {
        await assertFails(note(anon()));
    });

    it('administrador do site lê', async () => {
        await assertSucceeds(note(admin()));
    });

    it('campanha sem lista de mestres nega a todos (o get() falha) menos ao administrador do site', async () => {
        await assertFails(note(alice(), 'campaigns/campSemMestre/gmNotes/x'));
        await assertFails(note(bob(), 'campaigns/campSemMestre/gmNotes/x'));
        await assertSucceeds(note(admin(), 'campaigns/campSemMestre/gmNotes/x'));
    });

    it('ninguém escreve direto (só a API, com o Admin SDK): nem o mestre, nem o administrador', async () => {
        for (const user of [ alice(), bob(), admin(), anon() ]) {
            await assertFails(setDoc(doc(user, 'campaigns/camp1/gmNotes/novo'), { text: 'x' }));
            await assertFails(updateDoc(doc(user, 'campaigns/camp1/gmNotes/sheetA'), { text: 'editado' }));
            await assertFails(deleteDoc(doc(user, 'campaigns/camp1/gmNotes/sheetA')));
        }
    });

    it('a regra não abre o resto da campanha nem o chat: continua como antes', async () => {
        await assertSucceeds(getDoc(doc(alice(), 'campaigns/camp1')));
        await assertSucceeds(getDoc(doc(alice(), 'campaigns/camp1/messages/m1')));
        await assertFails(setDoc(doc(bob(), 'campaigns/camp1'), { title: 'x' }));
    });
});

describe('dados privados do mestre (campaigns/{id}/gmData)', () => {
    const secret = (user, path = 'campaigns/camp1/gmData/creature-defenses:goblin') => getDoc(doc(user, path));

    it('o mestre da campanha lê o documento e lista a subcoleção (é assim que o navegador dele escuta)', async () => {
        const snapshot = await assertSucceeds(secret(bob()));
        assert.equal(snapshot.data().elementalMastery, 'Fogo');
        const all = await assertSucceeds(getDocs(collection(bob(), 'campaigns/camp1/gmData')));
        assert.equal(all.size, 1);
    });

    it('o mestre lê também um documento que ainda não existe (o listener abre antes da primeira defesa)', async () => {
        const snapshot = await assertSucceeds(secret(bob(), 'campaigns/camp1/gmData/creature-defenses:orc'));
        assert.equal(snapshot.exists(), false);
    });

    it('o jogador da campanha não lê nem lista: fraquezas e resistências são do mestre', async () => {
        await assertFails(secret(alice()));
        await assertFails(getDocs(collection(alice(), 'campaigns/camp1/gmData')));
        await assertFails(getDocs(query(collection(alice(), 'campaigns/camp1/gmData'), where('kind', '==', 'creatureDefenses'))));
    });

    it('quem não faz parte da campanha e o mestre de OUTRA campanha não leem', async () => {
        await assertFails(secret(db('carol')));
        await assertFails(secret(db('intruso')));
        await assertFails(secret(bob(), 'campaigns/camp2/gmData/creature-defenses:x'));
    });

    it('anônimo não lê', async () => {
        await assertFails(secret(anon()));
    });

    it('administrador do site lê', async () => {
        await assertSucceeds(secret(admin()));
    });

    it('campanha sem lista de mestres nega a todos (o get() falha) menos ao administrador do site', async () => {
        await assertFails(secret(alice(), 'campaigns/campSemMestre/gmData/x'));
        await assertFails(secret(bob(), 'campaigns/campSemMestre/gmData/x'));
        await assertSucceeds(secret(admin(), 'campaigns/campSemMestre/gmData/x'));
    });

    it('ninguém escreve direto (só a API, com o Admin SDK): nem o mestre, nem o administrador', async () => {
        for (const user of [ alice(), bob(), admin(), anon() ]) {
            await assertFails(setDoc(doc(user, 'campaigns/camp1/gmData/novo'), { kind: 'creatureDefenses' }));
            await assertFails(updateDoc(doc(user, 'campaigns/camp1/gmData/creature-defenses:goblin'), { weaknesses: [] }));
            await assertFails(deleteDoc(doc(user, 'campaigns/camp1/gmData/creature-defenses:goblin')));
        }
    });
});

describe('notifications', () => {
    it('lê só as próprias', async () => {
        await assertSucceeds(getDocs(query(collection(alice(), 'notifications'), where('userId', '==', 'alice'), orderBy('timestamp', 'desc'))));
        await assertSucceeds(getDoc(doc(alice(), 'notifications/n1')));
        await assertFails(getDoc(doc(alice(), 'notifications/n2')));
        await assertFails(getDocs(query(collection(alice(), 'notifications'), where('userId', '==', 'bob'))));
        await assertFails(getDocs(collection(alice(), 'notifications')));
    });

    it('não escreve direto', async () => {
        await assertFails(updateDoc(doc(alice(), 'notifications/n1'), { read: true }));
        await assertFails(setDoc(doc(alice(), 'notifications/n3'), { userId: 'bob', title: 'spam' }));
    });
});

describe('catálogos e coleções internas', () => {
    it('magias e poderes: leitura para logados, sem escrita', async () => {
        await assertSucceeds(getDocs(collection(alice(), 'spells')));
        await assertSucceeds(getDoc(doc(alice(), 'powers/p1')));
        await assertFails(updateDoc(doc(alice(), 'spells/s1'), { name: 'x' }));
        await assertFails(setDoc(doc(admin(), 'powers/p2'), { name: 'x' }));
    });

    it('coleções sem regra ficam só para o servidor', async () => {
        for (const path of [ 'rpg_systems/sys1', 'campaign_stats/st1', 'jobs/j1' ]) {
            await assertFails(getDoc(doc(alice(), path)));
            await assertFails(getDoc(doc(admin(), path)));
        }
    });
});
