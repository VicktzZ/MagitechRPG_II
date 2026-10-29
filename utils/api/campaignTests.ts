import type { ActiveTest, TestResponse } from '@models/types/session';
import {
    canRespondToTest,
    evaluateTest,
    isTestRequestFresh,
    MAX_TEST_BONUS,
    MAX_TEST_DICE,
    MAX_TEST_DT,
    MIN_TEST_DT
} from '@utils/campaignTest';
import { badRequest, conflict, forbidden } from './errors';
import { assertMaxLength, isValidId, TEXT_LIMITS } from './input';

/** Validação dos corpos das rotas de teste: devolve os dados já limpos ou lança um erro HTTP */

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

function assertBoolean(value: unknown, field: string): boolean {
    if (typeof value !== 'boolean') throw badRequest(`"${field}" deve ser verdadeiro ou falso`);
    return value;
}

function assertInteger(value: unknown, min: number, max: number, field: string): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
        throw badRequest(`"${field}" deve ser um número inteiro de ${min} a ${max}`);
    }
    return value;
}

interface BuildTestRequestContext {
    campaign: { players: Array<{ userId: string }> };
    requestedBy: { id: string; name: string };
    id: string;
    now: Date;
}

/** Pedido do mestre (corpo = TestData do cliente) → teste a gravar em `session.testRequest` */
export function buildTestRequest(body: unknown, { campaign, requestedBy, id, now }: BuildTestRequestContext): ActiveTest {
    if (!isRecord(body)) throw badRequest('Corpo inválido');

    const dt = assertInteger(body['dt'], MIN_TEST_DT, MAX_TEST_DT, 'dt');
    const isGroupTest = assertBoolean(body['isGroupTest'], 'isGroupTest');
    const isVisible = assertBoolean(body['isVisible'], 'isVisible');
    const showResult = assertBoolean(body['showResult'], 'showResult');

    const expertise = typeof body['expertise'] === 'string' && body['expertise'].trim() ? body['expertise'].trim() : undefined;
    if (body['expertise'] !== undefined && body['expertise'] !== null && typeof body['expertise'] !== 'string') {
        throw badRequest('"expertise" deve ser um texto');
    }
    assertMaxLength(expertise, TEXT_LIMITS.name, 'expertise');

    const rawSelected = body['selectedPlayers'] ?? [];
    if (!Array.isArray(rawSelected) || rawSelected.length > 100) {
        throw badRequest('"selectedPlayers" deve ser uma lista de até 100 jogadores');
    }
    const playerIds = new Set(campaign.players.map(player => player.userId));
    const selectedPlayers = [ ...new Set(rawSelected) ].map(userId => {
        if (!isValidId(userId) || !playerIds.has(userId)) {
            throw forbidden('Só é possível chamar jogadores desta campanha');
        }
        return userId;
    });
    if (!isGroupTest && selectedPlayers.length === 0) {
        throw badRequest('Selecione ao menos um jogador para o teste');
    }

    return {
        id,
        dt,
        ...(expertise ? { expertise } : {}),
        isGroupTest,
        isVisible,
        showResult,
        selectedPlayers,
        requestedBy,
        createdAt: now.toISOString()
    };
}

interface BuildTestResponseContext {
    /** Teste em andamento, lido do documento dentro da transação */
    request: ActiveTest | undefined;
    user: { id: string; name: string };
    now: Date;
}

/**
 * Rolagem do jogador (`requestId`, `rolls`, `bonus`) → resposta a gravar. O servidor
 * confere o pedido e refaz a conta (o d20 que vale + bônus contra a DT): o veredito nunca
 * vem do navegador.
 */
export function buildTestResponse(body: unknown, { request, user, now }: BuildTestResponseContext): TestResponse {
    if (!isRecord(body)) throw badRequest('Corpo inválido');

    if (!request) throw conflict('Não há teste em andamento');
    if (body['requestId'] !== request.id) throw conflict('Este teste foi substituído por outro');
    if (!isTestRequestFresh(request, now.getTime())) throw conflict('Este teste expirou');
    if (!canRespondToTest(request, user.id)) throw forbidden('Você não foi chamado para este teste');
    if (request.responses?.[user.id]) throw conflict('Você já respondeu a este teste');

    const bonus = assertInteger(body['bonus'], -MAX_TEST_BONUS, MAX_TEST_BONUS, 'bonus');
    if (!Array.isArray(body['rolls']) || body['rolls'].length < 1 || body['rolls'].length > MAX_TEST_DICE) {
        throw badRequest(`"rolls" deve ter de 1 a ${MAX_TEST_DICE} dados`);
    }
    const rolls = body['rolls'].map((roll, index) => assertInteger(roll, 1, 20, `rolls[${index}]`));
    // Modificador de atributo negativo: o menor d20 vale (regra única de d20); qualquer outro valor é o maior
    const keep = body['keep'] === 'lowest' ? 'lowest' : 'highest';

    return {
        userName: user.name,
        rolls,
        dice: rolls.length,
        bonus,
        ...(keep === 'lowest' ? { keep } : {}),
        ...evaluateTest({ rolls, bonus, dt: request.dt, keep }),
        respondedAt: now.toISOString()
    };
}
