'use client';

import { Backdrop, CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { type ReactElement, useEffect, useState } from 'react'

export default function RequireAuth({ children }: { children: ReactElement | ReactElement[]}): any {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [ isLoading, setIsLoading ] = useState(false)

    useEffect(() => {
        if (status === 'loading') setIsLoading(true)
        
        if (status !== 'loading') {
            if (!localStorage.getItem('user') && session?.user) {
                localStorage.setItem('user', JSON.stringify(session?.user))
            }
        }
            
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [ status, router, isLoading, session?.user ])

    return status === 'authenticated' ? children : (
        <Backdrop open={true}>
            <CircularProgress />
        </Backdrop>
    )
}