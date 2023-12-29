import '@public/fonts/fonts.css'
import { type ReactElement } from 'react';
import { RequireAuth } from '@components/misc';

export default function RootLayout({
    children
}: {
  children: ReactElement
}): ReactElement<any, any> {
    const NODE_ENV = process.env.NODE_ENV
    
    return NODE_ENV === 'production' ? (
        <RequireAuth>
            {children}
        </RequireAuth>
    ) : (
        <>{children}</>
    )
}
