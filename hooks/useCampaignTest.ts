'use client';

import { useCampaignContext } from '@contexts';
import { MessageType } from '@enums';
import type { Message } from '@models';
import type { ActiveTest, TestData } from '@models/types/session';
import { campaignService, charsheetService } from '@services';
import { postCampaignStats } from '@utils/campaignStatsClient';
import {
    collectNewResponses,
    formatResponseNotice,
    formatTestRollText,
    formatTestVerdict,
    getPendingTest,
    resolveTestModifiers,
    rollDice,
    type TestCharsheet
} from '@utils/campaignTest';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type TestNoticeSeverity = 'success' | 'error' | 'info';

interface UseCampaignTestOptions {
    /** Aviso na tela (o chat usa um Snackbar) */
    notify: (message: string, severity: TestNoticeSeverity) => void;
    /** Envia uma mensagem ao chat da campanha */
    sendMessage: (message: Message) => Promise<unknown>;
}

const DICE_BOT = {
    id: 'dice-roller-bot',
    image: '/assets/dice-roller-bot.jpg',
    name: 'Dice Roller',
    isBot: true
};

const apiStatus = (error: unknown): number | undefined =>
    (error as { response?: { status?: number } })?.response?.status;

function apiErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
    return typeof message === 'string' && message ? message : fallback;
}

/**
 * Testes pedidos pelo mestre. O pedido fica em `campaign.session.testRequest` e chega
 * aos jogadores pelo listener da campanha (nada de Pusher). O mestre pede com
 * `requestTest`; o jogador chamado vê `pendingTest`, rola uma vez (`rollPending`) e o
 * servidor grava o resultado, que o mestre recebe pelo mesmo caminho.
 */
export function useCampaignTest({ notify, sendMessage }: UseCampaignTestOptions) {
    const { campaign, isUserGM, charsheets, rpgSystem } = useCampaignContext();
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const testRequest = campaign.session?.testRequest;

    const [ pendingTest, setPendingTest ] = useState<ActiveTest | null>(null);
    const [ rolling, setRolling ] = useState(false);
    const rollingRef = useRef(false);
    const dismissedRef = useRef<Set<string>>(new Set());
    // Respostas que o mestre já recebeu; começa com as que já estavam ali ao abrir a página
    const seenRef = useRef<Set<string> | null>(null);

    const userCharsheetId = campaign.players?.find(player => player.userId === userId)?.charsheetId;

    // Jogador: abre o diálogo quando há um teste a responder e o fecha quando deixa de haver
    useEffect(() => {
        const next = getPendingTest(testRequest, { userId, isGM: isUserGM, now: Date.now(), dismissedIds: dismissedRef.current });
        setPendingTest(current => (current?.id === next?.id ? current : next));
    }, [ testRequest, userId, isUserGM ]);

    // Mestre: avisa quando um jogador responde a um teste fechado (nos públicos o resultado vai ao chat)
    useEffect(() => {
        if (!isUserGM) return;

        if (seenRef.current === null) {
            seenRef.current = new Set(collectNewResponses(testRequest, new Set()).map(entry => entry.key));
            return;
        }

        for (const entry of collectNewResponses(testRequest, seenRef.current)) {
            seenRef.current.add(entry.key);
            if (testRequest && !testRequest.isVisible) {
                const { message, severity } = formatResponseNotice(testRequest, entry.response);
                notify(message, severity);
            }
        }
    }, [ testRequest, isUserGM, notify ]);

    const requestTest = useCallback(async (data: TestData) => {
        try {
            await campaignService.requestTest(campaign.id, data);
        } catch (error) {
            console.error('Erro ao pedir o teste:', error);
            notify(apiErrorMessage(error, 'Não foi possível pedir o teste.'), 'error');
            return;
        }

        postCampaignStats(campaign.id, [ { gm: true, inc: { testsRequested: 1 } } ]);
        notify(data.isVisible ? 'Teste solicitado.' : 'Teste solicitado. Aguardando respostas...', 'success');
    }, [ campaign.id, notify ]);

    const dismissPending = useCallback(() => {
        if (pendingTest) dismissedRef.current.add(pendingTest.id);
        setPendingTest(null);
    }, [ pendingTest ]);

    const rollPending = useCallback(async () => {
        const request = pendingTest;
        const user = session?.user;
        if (!request || !user || !userId || rollingRef.current) return;

        rollingRef.current = true;
        setRolling(true);

        try {
            // A ficha já vem em tempo real pelo contexto da campanha; a API só entra se faltar
            let charsheet: TestCharsheet | null | undefined = charsheets.find(c => c.id === userCharsheetId);
            if (!charsheet && userCharsheetId && request.expertise) {
                charsheet = await charsheetService.getById(userCharsheetId) as unknown as TestCharsheet | null;
            }

            // Uma rolagem só: o servidor confere, refaz a conta e devolve o resultado que todos veem
            const { dice, keep, bonus } = resolveTestModifiers(charsheet, request.expertise, rpgSystem);
            const { response } = await campaignService.respondTest(campaign.id, {
                requestId: request.id,
                rolls: rollDice(dice),
                bonus,
                ...(keep === 'lowest' ? { keep } : {})
            });

            const text = formatTestRollText(response, request.expertise);

            if (request.isVisible) {
                await sendMessage({
                    id: crypto.randomUUID(),
                    text,
                    by: { id: userId, name: user.name ?? '', image: user.image ?? '/assets/default-avatar.png' },
                    timestamp: new Date().toISOString(),
                    type: request.expertise ? MessageType.EXPERTISE : MessageType.ROLL
                });

                if (request.showResult) {
                    await sendMessage({
                        id: crypto.randomUUID(),
                        text: formatTestVerdict(response.userName, response.success),
                        type: MessageType.ROLL,
                        by: DICE_BOT,
                        timestamp: new Date().toISOString()
                    });
                }
            } else {
                notify(text, 'info');
            }

            if (userCharsheetId) {
                const inc: Record<string, number> = {
                    'dice.totalRolls': 1,
                    [response.success ? 'dice.testsPassed' : 'dice.testsFailed']: 1
                };
                if (response.usedRoll === 20) inc['dice.criticalHits'] = 1;
                if (response.usedRoll === 1) inc['dice.criticalFailures'] = 1;

                postCampaignStats(campaign.id, [ {
                    charsheetId: userCharsheetId,
                    userId,
                    inc,
                    max: { 'dice.highestRoll': response.total },
                    expertiseUsed: request.expertise || undefined
                } ]);
            }

            setPendingTest(null);
        } catch (error) {
            console.error('Erro ao responder o teste:', error);
            notify(apiErrorMessage(error, 'Não foi possível registrar o teste. Tente de novo.'), 'error');

            // Teste substituído, expirado ou que não é mais seu: não adianta tentar de novo.
            // Falha de rede deixa o diálogo aberto para repetir.
            const status = apiStatus(error);
            if (status === 409 || status === 403) {
                dismissedRef.current.add(request.id);
                setPendingTest(null);
            }
        } finally {
            rollingRef.current = false;
            setRolling(false);
        }
    }, [ pendingTest, session?.user, userId, userCharsheetId, charsheets, rpgSystem, campaign.id, sendMessage, notify ]);

    return { requestTest, pendingTest, rolling, rollPending, dismissPending };
}
