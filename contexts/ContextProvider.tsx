'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { type ReactNode, type ReactElement, useState, type Dispatch, type SetStateAction } from 'react';
import { SessionProvider } from 'next-auth/react';
import { fichaContext, userContext, channelContext } from '@contexts';
import { fichaModel } from '@constants/ficha';
import { SnackbarProvider } from 'notistack';
import type { Ficha } from '@types';
import type { Channel, PresenceChannel } from 'pusher-js';
import theme from '@themes/defaultTheme'

export default function ContextProvider({ children }: { children: ReactNode }): ReactElement {
    const [ ficha, setFicha ] = useState<Ficha>(fichaModel as Ficha);
    const [ user, setUser ] = useState(null);

    const [ channel, setChannel ] = useState<Channel | null>(null);

    return (
        <SnackbarProvider maxSnack={3}>
            <channelContext.Provider value={{ channel: channel as PresenceChannel, setChannel: setChannel as Dispatch<SetStateAction<PresenceChannel | null>> }}>
                <userContext.Provider value={{ user, setUser }}>
                    <fichaContext.Provider value={{ ficha, setFicha }}>
                        <ThemeProvider theme={theme}>
                            <SessionProvider>
                                <CssBaseline />
                                {children}
                            </SessionProvider>
                        </ThemeProvider>
                    </fichaContext.Provider>
                </userContext.Provider>
            </channelContext.Provider>
        </SnackbarProvider>
    )
}