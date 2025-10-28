'use client';

import { charsheetContext } from '@contexts';
import React, { useContext, type ReactElement, useEffect } from 'react'

export default function RequireCharsheet({ children }: { children: ReactElement }): ReactElement {
    const { charsheet: charsheet } = useContext(charsheetContext)

    useEffect(() => {
        if (!charsheet) {
            window.location.href = '/charsheet'
        }
    }, [ charsheet ])

    return (
        <>
            {charsheet && children}
        </>
    )
}