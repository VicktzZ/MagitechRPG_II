import { type Ficha } from '@types';
import { type Dispatch, type SetStateAction, createContext } from 'react';

export const fichaContext = createContext<{ ficha: Partial<Ficha> | null, setFicha: Dispatch<SetStateAction<Ficha>> | Dispatch<SetStateAction<null>> }>({
    ficha: null,
    setFicha: () => {}
})