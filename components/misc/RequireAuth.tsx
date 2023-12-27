'use client';

import { Backdrop, CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { type ReactElement, useEffect } from 'react'

export default function RequireAuth({ children }: { children: ReactElement | ReactElement[]}): ReactElement {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        console.log(status);
    
        if (status === 'unauthenticated') {
            router.push('/')
        } else if (!localStorage.getItem('user') && session?.user) {
            localStorage.setItem('user', JSON.stringify(session?.user))
        }
        
    }, [ status, router, session?.user ])

    return (
        <>
            {status === 'authenticated' ? children : (
                <Backdrop open={true}>
                    <CircularProgress />
                </Backdrop>
            )}
        </>
    )
}