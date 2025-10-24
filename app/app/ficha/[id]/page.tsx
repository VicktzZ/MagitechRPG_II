'use client'

import { FichaComponent } from '@components/ficha';
import { FichaFormProvider } from '@contexts';
import { Backdrop, CircularProgress } from '@mui/material';
import { useCompleteFicha } from '@hooks/useCompleteFicha';
import type { ReactElement } from 'react';

export default function Page({ params }: { params: { id: string } }): ReactElement {
    const { data: completeFicha, loading } = useCompleteFicha({
        fichaId: params.id
    });

    return (
        <>
            {loading && !completeFicha ? (
                <Backdrop open>
                    <CircularProgress />
                </Backdrop>
            ) : (
                <FichaFormProvider formData={completeFicha!}>
                    <FichaComponent />
                </FichaFormProvider>
            )}
        </>
    )
}