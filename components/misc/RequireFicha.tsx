'use client';

import { fichaContext } from '@contexts';
import React, { useContext, type ReactElement, useEffect } from 'react';

export default function RequireFicha({ children }: { children: ReactElement }): ReactElement {
    const { ficha } = useContext(fichaContext);

    useEffect(() => {
        if (!ficha) {
            window.location.href = '/fichas';
        }
    }, [ ficha ]);

    return (
        <>
            {ficha && children}
        </>
    );
}