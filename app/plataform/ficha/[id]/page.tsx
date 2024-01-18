/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, type ReactElement, useState } from 'react';
import FichaComponent from '../create/page';
import type { Ficha as FichaType } from '@types';
import { Backdrop, CircularProgress } from '@mui/material';

export default function Ficha({ params }: { params: { id: string } }): ReactElement {
    const [ ficha, setFicha ] = useState<FichaType>()
    const [ isLoading, setIsLoading ] = useState<boolean>(false)

    const fetchFicha = async (): Promise<FichaType> => {
        const response = await fetch(`/api/ficha/${params.id}`).then(async r => await r.json())
        return response
    }
    
    useEffect(() => {
        (async () => {
            setIsLoading(true)
            setFicha(await fetchFicha())
            setIsLoading(false)
        })()
    }, [])

    return (
        <>
            { isLoading ? (
                <Backdrop open>
                    <CircularProgress />
                </Backdrop>
            ) : (
                <FichaComponent disabled ficha={ficha} />
            )}
        </>
    )
}