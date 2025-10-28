'use client';

import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { type ReactNode, type ReactElement, useState, type Dispatch, type SetStateAction } from 'react';
import { SessionProvider } from 'next-auth/react';
import { charsheetContext, userContext, channelContext, savingSpinnerContext, ThemeProvider } from '@contexts';
import { charsheetModel } from '@constants/charsheet';
import { SnackbarProvider } from 'notistack';
import type { Channel, PresenceChannel } from 'pusher-js';
import darkTheme from '@themes/defaultTheme'
import lightTheme from '@themes/lightTheme'
import { SavingSpinner } from '@components/misc';
import { useThemeContext } from '@contexts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Charsheet } from '@models/entities';
// import { persistQueryClient } from '@tanstack/react-query-persist-client';
// import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchInterval: false,
            staleTime: 30_000
        }
    }
});   

// const localStoragePersister = createSyncStoragePersister({
//     storage: typeof window !== 'undefined' ? window.localStorage : undefined,
//     key: 'react-query-persist-client'
// });

// if (typeof window !== 'undefined') {
//     persistQueryClient({
//         queryClient: queryClient as any,
//         persister: localStoragePersister,
//         maxAge: 1000 * 60 * 60 * 24,
//         dehydrateOptions: {
//             shouldDehydrateQuery: (query) =>
//                 query.gcTime !== Infinity &&
//                 query.queryKey[0] !== 'some-key-to-exclude'
//         },
//         hydrateOptions: {
//             defaultOptions: {
//                 queries: {
//                     retry: false
//                 }
//             }
//         }
//     });
// }

interface ThemedAppProps {
    charsheet: Charsheet;
    setCharsheet: Dispatch<SetStateAction<Charsheet>>;
    user: any;
    setUser: Dispatch<SetStateAction<any>>;
    isSaving: boolean;
    setIsSaving: Dispatch<SetStateAction<boolean>>;
    channel: Channel | null;
    setChannel: Dispatch<SetStateAction<Channel | null>>;
    children: ReactNode;
}

function ThemedApp({ 
    charsheet, setCharsheet, user, setUser, isSaving, setIsSaving, channel, setChannel, children 
}: ThemedAppProps): ReactElement {
    const { themeMode } = useThemeContext();
    const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

    return (
        <channelContext.Provider value={{ channel: channel as PresenceChannel, setChannel: setChannel as Dispatch<SetStateAction<PresenceChannel | null>> }}>
            <userContext.Provider value={{ user, setUser }}>
                <charsheetContext.Provider value={{ charsheet: charsheet, setCharsheet: setCharsheet }}>
                    <savingSpinnerContext.Provider value={{ isSaving, showSavingSpinner: setIsSaving }}>
                        <MuiThemeProvider theme={currentTheme}>
                            <SessionProvider>
                                <CssBaseline />
                                <SavingSpinner />
                                {children}
                            </SessionProvider>
                        </MuiThemeProvider>
                    </savingSpinnerContext.Provider>
                </charsheetContext.Provider>
            </userContext.Provider>
        </channelContext.Provider>
    );
}
  
export default function ContextProvider({ children }: { children: ReactNode }): ReactElement {
    const [ charsheet, setCharsheet ] = useState<Charsheet>(charsheetModel);
    const [ user, setUser ] = useState(null);
    const [ isSaving, setIsSaving ] = useState<boolean>(false);
    const [ channel, setChannel ] = useState<Channel | null>(null);

    return (
        <QueryClientProvider client={queryClient}>
            <SnackbarProvider maxSnack={3}>
                <ThemeProvider>
                    <ThemedApp 
                        charsheet={charsheet}
                        setCharsheet={setCharsheet}
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