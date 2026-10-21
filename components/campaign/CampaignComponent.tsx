'use client';

import { campaignCurrentCharsheetContext, useCampaignContext } from '@contexts';
import { useCompleteCharsheet } from '@hooks/useCompleteCharsheet';
import { Backdrop, CircularProgress, Stack } from '@mui/material';
import { sessionService } from '@services';
import { enqueueSnackbar } from 'notistack';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState, type ReactElement } from 'react';
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
    const [ charsheetId, setCharsheetId ] = useState<string>(typeof window !== 'undefined' ? (localStorage.getItem('currentCharsheet') ?? '') : '');
    const userId = typeof window !== 'undefined' ? (localStorage.getItem('userId') ?? '') : '';

    // Se não-GM e não há charsheetId, tentar derivar do contexto e persistir
    useEffect(() => {
        if (isUserGM) return;
        if (!charsheetId) {
            const owned = userId ? (charsheets.find(c => c.userId === userId)?.id ?? '') : '';
            const fallback = owned || (charsheets[0]?.id ?? '');
            if (fallback) {
                localStorage.setItem('currentCharsheet', fallback);
                setCharsheetId(fallback);
            }
        }
    }, [ isUserGM, charsheets, userId, charsheetId ]);

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

    useEffect(() => {
        enqueueSnackbar('Você entrou na campanha!', { variant: 'success' }) 
        sessionService.connect({ 
            campaignCode,
            userId,
            isGM: isUserGM,
            charsheetId
        });
         
        return () => {
            sessionService.disconnect({ 
                campaignCode,
                userId  
            }); 
        }; 
    }, [])

    const form = useForm<CharsheetDTO>({
        defaultValues: charsheet!,
        values: charsheet!
    });

    // Objeto memoizado — inline ({{ charsheet }}) criava um valor novo a cada
    // render e re-renderizava todos os consumidores do contexto da ficha atual.
    const currentCharsheetValue = useMemo(() => ({ charsheet: charsheet! }), [ charsheet ]);
    
    // O card de combate precisa saber qual é a ficha de quem está vendo (para a iniciativa)
    const { data: session } = useSession();
    const ownCharsheetId = campaign.players?.find(player => player.userId === session?.user?.id)?.charsheetId;

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
                    userCharsheetId={ownCharsheetId}
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