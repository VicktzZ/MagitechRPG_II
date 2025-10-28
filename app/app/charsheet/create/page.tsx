'use client';

import { FichaComponent } from '@components/ficha';
import { FichaFormProvider } from '@contexts';
import type { ReactElement } from 'react'
export default function FichaPage(): ReactElement {
    return (
        <FichaFormProvider>
            <FichaComponent />
        </FichaFormProvider>
    )
}