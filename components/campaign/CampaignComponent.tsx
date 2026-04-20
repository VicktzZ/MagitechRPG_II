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

export default function CampaignComponent(): ReactElement {
    const { isUserGM, campaign: { campaignCode }, charsheets  } = useCampaignContext();
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

    const { data: charsheet, loading } = useCompleteCharsheet({ charsheetId });

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
                    {isUserGM && (
                        <Box sx={{ display: 'flex', mb: 2 }}>
                            <GMActions />
                        </Box>
                    )}
                    <CampaignNotes />
                    {isUserGM ? (
                        <CampaignGMDashboard />
                    ) : (
                        <CampaignPlayerDashboard />
                    )}
                </Box>
            </Box>
            <SessionChat />
        </>
    );

    if (isUserGM) {
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