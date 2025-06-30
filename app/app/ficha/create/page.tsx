'use client';

import { FichaComponent } from '@components/ficha';
import { fichaModel } from '@constants/ficha';
import type { ReactElement } from 'react'
export default function FichaPage(): ReactElement {
    return (
        <FichaComponent
            ficha={fichaModel}
        />
    )
}