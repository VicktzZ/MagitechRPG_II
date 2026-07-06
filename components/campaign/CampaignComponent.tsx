'use client';

import { campaignCurrentCharsheetContext, useCampaignContext } from '@contexts';
import { useCompleteCharsheet } from '@hooks/useCompleteCharsheet';
import { Backdrop, Box, CircularProgress } from '@mui/material';
import { sessionService } from '@services';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState, type ReactElement } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { CampaignGMDashboard, CampaignHeader, CampaignNotes, CampaignPlayerDashboard, SessionChat } from '.';
import type { CharsheetDTO } from '@models/dtos';
import GMActions from './gmDashboard/GMActions';
import CampaignFinishedBanner from './CampaignFinishedBanner';
import CampaignWidgetPanel from './widget/CampaignWidgetPanel';
import DevViewSwitcher from './DevViewSwitcher';

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
    
    const content = (
        <>
            <CampaignHeader />
            <CampaignFinishedBanner />
            <Box sx={{
                display: 'flex',
                position: 'relative',
                gap: 2,
                width: '100%',
                height: '100%'
            }}>
                <Box sx={{
                    width: '100%'
                }}>
                    {DEV_MODE && isUserGM && (
                        <DevViewSwitcher
                            campaignId={campaign.id}
                            userId={userId}
                            activeCharsheetId={devPreviewCharsheetId}
                            onChange={handleDevPreviewChange}
                        />
                    )}
                    {effectiveIsUserGM && (
                        <Box sx={{ display: 'flex', mb: 2 }}>
                            <GMActions />
                        </Box>
                    )}
                    <CampaignNotes />
                    {effectiveIsUserGM ? (
                        <CampaignGMDashboard />
                    ) : (
                        <CampaignPlayerDashboard />
                    )}
                </Box>
            </Box>
            <SessionChat />
            {/* Widget da campanha — painel flutuante visível a todos (estilo pop-up de combate) */}
            <CampaignWidgetPanel />
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
            <campaignCurrentCharsheetContext.Provider value={{ charsheet: charsheet! }}>
                {content}
            </campaignCurrentCharsheetContext.Provider>
        </FormProvider>
    );
}