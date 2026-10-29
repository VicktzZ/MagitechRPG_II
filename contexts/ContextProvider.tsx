'use client';

import { SavingSpinner } from '@components/misc';
import { FirebaseAuthBridge } from '@components/misc/FirebaseAuthBridge';
import { charsheetModel } from '@constants/charsheet';
import { channelContext, charsheetContext, savingSpinnerContext, userContext } from '@contexts';
import type { Charsheet } from '@models/entities';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { MotionConfig } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from '@themes/theme';
import { SessionProvider } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import type { Channel, PresenceChannel } from 'pusher-js';
import { type Dispatch, type ReactElement, type ReactNode, type SetStateAction, useState } from 'react';
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
    return (
        <channelContext.Provider value={{ channel: channel as PresenceChannel, setChannel: setChannel as Dispatch<SetStateAction<PresenceChannel | null>> }}>
            <userContext.Provider value={{ user, setUser }}>
                <charsheetContext.Provider value={{ charsheet, setCharsheet }}>
                    <savingSpinnerContext.Provider value={{ isSaving, showSavingSpinner: setIsSaving }}>
                        <MuiThemeProvider theme={theme}>
                            <MotionConfig reducedMotion="user">
                                <SessionProvider>
                                    <FirebaseAuthBridge />
                                    <CssBaseline />
                                    <SavingSpinner />
                                    {children}
                                </SessionProvider>
                            </MotionConfig>
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
            </SnackbarProvider>
        </QueryClientProvider>
    )
}