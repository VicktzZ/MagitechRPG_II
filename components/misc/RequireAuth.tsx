'use client';

import { Backdrop, CircularProgress } from '@mui/material';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { type ReactElement, useEffect, useState } from 'react';

export default function RequireAuth({ children }: { children: ReactElement | ReactElement[] }): any {
    const { data: session, status, update } = useSession();
    const [ isLoading, setIsLoading ] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const handleStorageChange = () => {
            // Atualiza a sessão se o storage mudar
            update();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => { window.removeEventListener('storage', handleStorageChange) };
    }, [ update ]);

    useEffect(() => {
        const checkAndUpdateSession = async () => {
            if (status === 'loading') return;

            if (status === 'unauthenticated') {
                // Tenta recuperar dados do usuário do localStorage
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        // Tenta reautenticar
                        await signIn('credentials', { 
                            redirect: false,
                            user: storedUser 
                        });
                        return;
                    } catch (error) {
                        console.error('Erro ao reautenticar:', error);
                        localStorage.removeItem('user');
                    }
                }
                router.push('/');
            } else if (status === 'authenticated' && session?.user) {
                // Atualiza o localStorage com os dados mais recentes
                localStorage.setItem('user', JSON.stringify(session.user));
            }

            if (isLoading) {
                setIsLoading(false);
            }
        };

        checkAndUpdateSession();
    }, [ status, session, router, isLoading ]);

    if (isLoading || status === 'loading') {
        return (
            <Backdrop open={true}>
                <CircularProgress />
            </Backdrop>
        );
    }

    return status === 'authenticated' ? children : null;
}