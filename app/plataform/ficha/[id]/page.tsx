/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, type ReactElement, useState } from 'react';
import type { Ficha as FichaType } from '@types';
import { Backdrop, CircularProgress } from '@mui/material';
import { FichaComponent } from '@components/ficha';

export default function Ficha({ params }: { params: { id: string } }): ReactElement {
    const [ ficha, setFicha ] = useState<FichaType>()
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    
    useEffect(() => {
        const fetchFicha = async (): Promise<void> => {
            setIsLoading(true)

            const response: FichaType = await fetch(`/api/ficha/${params.id}`).then(async r => await r.json())
            
            setFicha(response)
            setIsLoading(false)
        }

        (async () => {
            await fetchFicha()
        })()
    }, [])

    return (
        <>
            { isLoading ? (
                <Backdrop open>
                    <CircularProgress />
                </Backdrop>
            ) : (
                <FichaComponent disabled ficha={ficha!} />
            )}
        </>
    )
}