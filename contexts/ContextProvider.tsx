'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { type ReactNode, type ReactElement, useState, type Dispatch, type SetStateAction } from 'react';
import { SessionProvider } from 'next-auth/react';
import { fichaContext, userContext, channelContext, savingSpinnerContext } from '@contexts';
import { fichaModel } from '@constants/ficha';
import { SnackbarProvider } from 'notistack';
import type { Ficha } from '@types';
import type { Channel, PresenceChannel } from 'pusher-js';
import theme from '@themes/defaultTheme'
import { SavingSpinner } from '@components/misc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function ContextProvider({ children }: { children: ReactNode }): ReactElement {
    const [ ficha, setFicha ] = useState<Ficha>(fichaModel);
    const [ user, setUser ] = useState(null);
    const [ isSaving, setIsSaving ] = useState<boolean>(false);
    const [ channel, setChannel ] = useState<Channel | null>(null);

    const queryClient = new QueryClient()

    return (
        <QueryClientProvider client={queryClient}>
            <SnackbarProvider maxSnack={3}>
                <channelContext.Provider value={{ channel: channel as PresenceChannel, setChannel: setChannel as Dispatch<SetStateAction<PresenceChannel | null>> }}>
                    <userContext.Provider value={{ user, setUser }}>
                        <fichaContext.Provider value={{ ficha, setFicha }}>
                            <savingSpinnerContext.Provider value={{ isSaving, showSavingSpinner: setIsSaving }}>
                                <ThemeProvider theme={theme}>
                                    <SessionProvider>
                                        <CssBaseline />
                                        <SavingSpinner />
                                        {children}
                                    </SessionProvider>
                                </ThemeProvider>
                            </savingSpinnerContext.Provider>
                        </fichaContext.Provider>
                    </userContext.Provider>
                </channelContext.Provider>
            </SnackbarProvider>
        </QueryClientProvider>
    )
}