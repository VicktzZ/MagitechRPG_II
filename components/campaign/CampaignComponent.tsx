'use client';

import { campaignCurrentCharsheetContext, useCampaignContext } from '@contexts';
import { useCompleteCharsheet } from '@hooks/useCompleteCharsheet';
import { Backdrop, CircularProgress, Stack } from '@mui/material';
import { sessionService } from '@services';
import { enqueueSnackbar } from 'notistack';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { CampaignGMDashboard, CampaignHeader, CampaignNotes, CampaignPlayerDashboard, SessionChat } from '.';
import type { CharsheetDTO } from '@models/dtos';
import GMActions from './gmDashboard/GMActions';
import CampaignFinishedBanner from './CampaignFinishedBanner';
import CampaignWidgetPanel from './widget/CampaignWidgetPanel';
import CombatStatus from './CombatStatus';
import DevViewSwitcher from './DevViewSwitcher';
import FloatingDock from './FloatingDock';

const DEV_MODE = process.env.NEXT_PUBLIC_NODE_ENV === 'development';

export default function CampaignComponent(): ReactElement {
    const { isUserGM, campaign, charsheets  } = useCampaignContext();
    const { campaignCode } = campaign;
    const { data: session } = useSession();
    const userId = session?.user?.id ?? '';

    // A ficha de quem está vendo vem da própria campanha (campaign.players); um localStorage global
    // misturava a ficha de campanhas abertas em abas diferentes
    const charsheetId = campaign.players?.find(player => player.userId === userId)?.charsheetId
        ?? charsheets.find(sheet => sheet.userId === userId)?.id
        ?? '';

    // MODO DEV: permite ao mestre pré-visualizar a campanha como jogador,
    // usando uma ficha da própria conta anexada como jogador de teste.
    const [ devPreviewCharsheetId, setDevPreviewCharsheetId ] = useState<string | null>(() => {
        if (!DEV_MODE || !isUserGM || typeof window === 'undefined') return null;
        return sessionStorage.getItem(`devPreview:${campaign.id}`);
    });

    const handleDevPreviewChange = (id: string | null) => {
        setDevPreviewCharsheetId(id);
        if (typeof window === 'undefined') return;
        if (id) sessionStorage.setItem(`devPreview:${campaign.id}`, id);
        else sessionStorage.removeItem(`devPreview:${campaign.id}`);
    };

    const effectiveIsUserGM = isUserGM && !devPreviewCharsheetId;
    const effectiveCharsheetId = devPreviewCharsheetId || charsheetId;

    const { data: charsheet, loading } = useCompleteCharsheet({ charsheetId: effectiveCharsheetId });

    // Presença: entra na sessão ao abrir a campanha e sai ao deixá-la (trocar de tela ou fechar a aba).
    // Os dados mais novos vêm por ref para que mudar de ficha ou o mestre alternar a visão não reconecte.
    const presenceRef = useRef({ isUserGM, charsheetId, alreadyInSession: campaign.session?.users?.includes(userId) ?? false });
    presenceRef.current = { ...presenceRef.current, isUserGM, charsheetId };

    useEffect(() => {
        if (!campaignCode || !userId) return;

        sessionService.connect({
            campaignCode,
            userId,
            isGM: presenceRef.current.isUserGM,
            charsheetId: presenceRef.current.charsheetId
        }).then(() => {
            if (!presenceRef.current.alreadyInSession) enqueueSnackbar('Você entrou na campanha!', { variant: 'success' });
        }).catch(() => {
            enqueueSnackbar('Não foi possível registrar sua entrada na sessão. Os outros podem não ver você online.', { variant: 'warning' });
        });

        // Fechar a aba não roda o cleanup do React: keepalive deixa o aviso de saída terminar mesmo assim
        const leaveOnPageHide = () => {
            void fetch('/api/session/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignCode }),
                keepalive: true
            }).catch(() => undefined);
        };
        window.addEventListener('pagehide', leaveOnPageHide);

        return () => {
            window.removeEventListener('pagehide', leaveOnPageHide);
            sessionService.disconnect({ campaignCode, userId }).catch(() => undefined);
        };
    }, [ campaignCode, userId ]);

    const form = useForm<CharsheetDTO>({
        defaultValues: charsheet!,
        values: charsheet!
    });

    // Objeto memoizado — inline ({{ charsheet }}) criava um valor novo a cada
    // render e re-renderizava todos os consumidores do contexto da ficha atual.
    const currentCharsheetValue = useMemo(() => ({ charsheet: charsheet! }), [ charsheet ]);

    // Uma coluna só: faixa da campanha, avisos, ações do mestre, notas e o painel de quem está vendo.
    // O chat e o dock (combate e widgets) ficam fixos na borda e não entram no fluxo.
    const content = (
        <>
            <Stack spacing={2} sx={{ width: '100%', minWidth: 0 }}>
                <CampaignHeader />
                <CampaignFinishedBanner />
                {DEV_MODE && isUserGM && (
                    <DevViewSwitcher
                        campaignId={campaign.id}
                        userId={userId}
                        activeCharsheetId={devPreviewCharsheetId}
                        onChange={handleDevPreviewChange}
                    />
                )}
                {effectiveIsUserGM && <GMActions />}
                <CampaignNotes />
                {effectiveIsUserGM ? (
                    <CampaignGMDashboard />
                ) : (
                    <CampaignPlayerDashboard />
                )}
            </Stack>
            <SessionChat />
            <FloatingDock>
                <CombatStatus
                    campaignId={campaign.id}
                    combat={campaign.session?.combat ?? null}
                    userCharsheetId={charsheetId || undefined}
                />
                {/* Widgets da campanha: visíveis a todos, empilhados com o combate */}
                <CampaignWidgetPanel />
            </FloatingDock>
        </>
    );

    if (effectiveIsUserGM) {
        return content;
    }

    if (loading) {
        return (
            <Backdrop open={true}>
                <CircularProgress />
            </Backdrop>
        );
    }

    return (
        <FormProvider {...form}>
            <campaignCurrentCharsheetContext.Provider value={currentCharsheetValue}>
                {content}
            </campaignCurrentCharsheetContext.Provider>
        </FormProvider>
    );
}