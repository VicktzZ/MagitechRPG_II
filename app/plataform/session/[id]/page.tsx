import { type ReactElement } from 'react'
import SessionComponent from '../SessionComponent'

export default function Session({ params }: { params: { id: string } }): ReactElement {
    return (
        <SessionComponent roomId={params.id} />
    )
}