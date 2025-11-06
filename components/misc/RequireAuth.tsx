'use client';

import { Backdrop, CircularProgress } from '@mui/material';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { type ReactElement, useEffect, useState } from 'react';

interface RequireAuthProps {
    children: ReactElement | ReactElement[]
}

export default function RequireAuth({ children }: RequireAuthProps): ReactElement | null {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [ authChecked, setAuthChecked ] = useState(false);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        // Timeout para evitar loading infinito
        const timeoutId = setTimeout(() => {
            if (status === 'loading') {
                console.warn('Tempo limite de autenticação excedido');
                setLoading(false);
            }
        }, 10000); // 10 segundos de timeout

        if (status !== 'loading') {
            clearTimeout(timeoutId);
            setLoading(false);
            
            // Se não autenticado, redireciona para a página inicial
            if (status === 'unauthenticated') {
                router.push('/');
            }
            
            // Se autenticado, marca como verificado
            if (status === 'authenticated') {
                localStorage.setItem('userId', session?.user?.id ?? '');
                setAuthChecked(true);
            }
        }

        return () => clearTimeout(timeoutId);
    }, [ status, router ]);

    // Efeito para lidar com mudanças na sessão
    useEffect(() => {
        if (status === 'authenticated' && session?.error === 'RefreshAccessTokenError') {
            // Se houver erro de token, força logout
            signOut({ callbackUrl: '/' });
        }
    }, [ session, status ]);

    // Se ainda está carregando
    if (loading || status === 'loading') {
        return (
            <Backdrop 
                open 
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)'
                }}
            >
                <CircularProgress color="primary" />
            </Backdrop>
        );
    }

    // Se não está autenticado ou a verificação não foi concluída
    if (status !== 'authenticated' || !authChecked) {
        return null;
    }

    // Renderiza os children apenas se autenticado e verificado
    return <>{children}</>;
}