'use client';

import { CharsheetComponent } from '@components/charsheet';
import { CharsheetFormProvider } from '@contexts';
import type { ReactElement } from 'react'
export default function CharsheetPage(): ReactElement {
    return (
        <CharsheetFormProvider>
            <CharsheetComponent />
        </CharsheetFormProvider>
    )
}