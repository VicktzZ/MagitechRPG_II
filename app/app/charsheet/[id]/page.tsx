'use client'

import { CharsheetComponent } from '@components/charsheet';
import { CharsheetFormProvider } from '@contexts';
import { Backdrop, CircularProgress } from '@mui/material';
import { useCompleteCharsheet } from '@hooks/useCompleteCharsheet';
import type { ReactElement } from 'react';

export default function Page({ params }: { params: { id: string } }): ReactElement {
    const { data: completeCharsheet, loading } = useCompleteCharsheet({
        charsheetId: params.id
    });

    return (
        <>
            {loading && !completeCharsheet ? (
                <Backdrop open>
                    <CircularProgress />
                </Backdrop>
            ) : (
                <CharsheetFormProvider formData={completeCharsheet}>
                    <CharsheetComponent />
                </CharsheetFormProvider>
            )}
        </>
    )
}