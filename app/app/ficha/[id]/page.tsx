'use client'

import { FichaComponent } from '@components/ficha';
import { Backdrop, CircularProgress } from '@mui/material';
import { fichaService } from '@services';
import { type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function Ficha({ params }: { params: { id: string } }): ReactElement {
    const { data: ficha, isPending } = useQuery({
        queryKey: [ 'ficha', params.id ],
        queryFn: async () => await fichaService.getById(params.id)
    })

    return (
        <>
            { isPending ? (
                <Backdrop open>
                    <CircularProgress />
                </Backdrop>
            ) : (
                <FichaComponent disabled ficha={ficha!} />
            )}
        </>
    )
}