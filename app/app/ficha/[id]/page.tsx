'use client'

import { FichaComponent } from '@components/ficha';
import { FichaFormProvider } from '@contexts';
import { Backdrop, CircularProgress } from '@mui/material';
import { fichaService } from '@services';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';

export default function Page({ params }: { params: { id: string } }): ReactElement {
    const { isPending, data } = useQuery({
        queryKey: [ 'ficha', params.id ],
        queryFn: async () => await fichaService.getById(params.id),
        staleTime: 60000
    })

    console.log(data)

    return (
        <>
            { isPending ? (
                <Backdrop open>
                    <CircularProgress />
                </Backdrop>
            ) : (
                <FichaFormProvider formData={data}>
                    <FichaComponent />
                </FichaFormProvider>
            )}
        </>
    )
}