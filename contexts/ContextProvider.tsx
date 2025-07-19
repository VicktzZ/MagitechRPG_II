'use client';

import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { type ReactNode, type ReactElement, useState, type Dispatch, type SetStateAction } from 'react';
import { SessionProvider } from 'next-auth/react';
import { fichaContext, userContext, channelContext, savingSpinnerContext, ThemeProvider } from '@contexts';
import { fichaModel } from '@constants/ficha';
import { SnackbarProvider } from 'notistack';
import type { Ficha } from '@types';
import type { Channel, PresenceChannel } from 'pusher-js';
import darkTheme from '@themes/defaultTheme'
import lightTheme from '@themes/lightTheme'
import { SavingSpinner } from '@components/misc';
import { useThemeContext } from '@contexts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5
        }
    }
});   

const localStoragePersister = createSyncStoragePersister({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    key: 'react-query-persist-client'
});

if (typeof window !== 'undefined') { // Garante que só rode no lado do cliente
    persistQueryClient({
        queryClient: queryClient as any,
        persister: localStoragePersister,
        maxAge: 1000 * 60 * 60 * 24,
        dehydrateOptions: {
            shouldDehydrateQuery: (query) =>
                query.gcTime !== Infinity &&
                query.queryKey[0] !== 'some-key-to-exclude'
        },
        hydrateOptions: {
            defaultOptions: {
                queries: {
                    retry: false
                }
            }
        }
    });
}

interface ThemedAppProps {
    ficha: Ficha;
    setFicha: Dispatch<SetStateAction<Ficha>>;
    user: any;
    setUser: Dispatch<SetStateAction<any>>;
    isSaving: boolean;
    setIsSaving: Dispatch<SetStateAction<boolean>>;
    channel: Channel | null;
    setChannel: Dispatch<SetStateAction<Channel | null>>;
    children: ReactNode;
}

function ThemedApp({ 
    ficha, setFicha, user, setUser, isSaving, setIsSaving, channel, setChannel, children 
}: ThemedAppProps): ReactElement {
    const { themeMode } = useThemeContext();
    const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

    return (
        <channelContext.Provider value={{ channel: channel as PresenceChannel, setChannel: setChannel as Dispatch<SetStateAction<PresenceChannel | null>> }}>
            <userContext.Provider value={{ user, setUser }}>
                <fichaContext.Provider value={{ ficha, setFicha }}>
                    <savingSpinnerContext.Provider value={{ isSaving, showSavingSpinner: setIsSaving }}>
                        <MuiThemeProvider theme={currentTheme}>
                            <SessionProvider>
                                <CssBaseline />
                                <SavingSpinner />
                                {children}
                            </SessionProvider>
                        </MuiThemeProvider>
                    </savingSpinnerContext.Provider>
                </fichaContext.Provider>
            </userContext.Provider>
        </channelContext.Provider>
    );
}
  
export default function ContextProvider({ children }: { children: ReactNode }): ReactElement {
    const [ ficha, setFicha ] = useState<Ficha>(fichaModel);
    const [ user, setUser ] = useState(null);
    const [ isSaving, setIsSaving ] = useState<boolean>(false);
    const [ channel, setChannel ] = useState<Channel | null>(null);

    return (
        <QueryClientProvider client={queryClient}>
            <SnackbarProvider maxSnack={3}>
                <ThemeProvider>
                    <ThemedApp 
                        ficha={ficha}
                        setFicha={setFicha}
                        user={user}
                        setUser={setUser}
                        isSaving={isSaving}
                        setIsSaving={setIsSaving}
                        channel={channel}
                        setChannel={setChannel}
                    >
                        {children}
                    </ThemedApp>
                </ThemeProvider>
            </SnackbarProvider>
        </QueryClientProvider>
    )
}