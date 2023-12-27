import '@public/fonts/fonts.css'
import { type ReactElement } from 'react';
import { RequireAuth } from '@components/misc';

export default function RootLayout({
    children
}: {
  children: ReactElement
}): ReactElement<any, any> {
    return (
        <RequireAuth>
            {children}
        </RequireAuth>
    )
}
