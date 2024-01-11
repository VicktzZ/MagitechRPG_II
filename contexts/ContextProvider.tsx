'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { type ReactNode, type ReactElement, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { fichaContext, userContext } from '@contexts';
import theme from '@themes/defaultTheme'
import { fichaModel } from '@constants/ficha';
import type { Ficha } from '@types';

export default function ContextProvider({ children }: { children: ReactNode }): ReactElement {
    const [ ficha, setFicha ] = useState<Ficha>(fichaModel as Ficha);
    const [ user, setUser ] = useState(null);

    return (
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
    )
}