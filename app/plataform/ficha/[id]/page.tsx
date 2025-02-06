/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, type ReactElement, useState } from 'react';
import type { Ficha as FichaType } from '@types';
import { Backdrop, CircularProgress } from '@mui/material';
import { FichaComponent } from '@components/ficha';
import { fichaService } from '@services';

export default function Ficha({ params }: { params: { id: string } }): ReactElement {
    const [ ficha, setFicha ] = useState<FichaType>()
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    
    useEffect(() => {
        const fetchFicha = async (): Promise<void> => {
            setIsLoading(true)

            const response = await fichaService.getById(params.id)
            
            setFicha(response)
            setIsLoading(false)
        }

        fetchFicha()
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