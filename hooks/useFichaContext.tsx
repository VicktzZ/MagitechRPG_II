import { useState } from 'react'
import type { Ficha } from '@types'

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const useFichaContext = (): { ficha: Ficha, setFicha: (ficha: Ficha) => void } => {
    const [ fichaState, setFichaState ] = useState<Ficha>(JSON.parse(localStorage.getItem('ficha') ?? '{}') as Ficha)

    const setFicha = (ficha: Ficha): void => {
        localStorage.setItem('ficha', JSON.stringify(ficha))
        setFichaState(ficha)
    }

    return { ficha: fichaState, setFicha }
}

export default useFichaContext