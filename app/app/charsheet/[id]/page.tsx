'use client'

import { CharsheetComponent } from '@components/charsheet';
import { CharsheetFormProvider } from '@contexts';
import { Alert, Backdrop, Box, Button, CircularProgress } from '@mui/material';
import { useCompleteCharsheet } from '@hooks/useCompleteCharsheet';
import Link from 'next/link';
import type { ReactElement } from 'react';

export default function Page({ params }: { params: { id: string } }): ReactElement {
    const { data: completeCharsheet, loading, error, dropped } = useCompleteCharsheet({ charsheetId: params.id });

    if (loading) {
        return (
            <Backdrop open>
                <CircularProgress />
            </Backdrop>
        )
    }

    // Id que não existe, ficha apagada ou sem permissão de leitura: antes ficava um spinner para sempre
    if (!completeCharsheet) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <Alert
                    severity="error"
                    action={<Button color="inherit" size="small" component={Link} href="/app">Voltar</Button>}
                >
                    {error ? 'Não foi possível abrir esta ficha. Verifique sua conexão e se você tem acesso a ela.' : 'Esta ficha não existe ou foi excluída.'}
                </Alert>
            </Box>
        )
    }

    return (
        <CharsheetFormProvider formData={completeCharsheet} dropped={dropped}>
            <CharsheetComponent />
        </CharsheetFormProvider>
    )
}
