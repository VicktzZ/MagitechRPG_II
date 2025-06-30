import { fichaModel } from '@constants/ficha';
import { type Ficha } from '@types';
import { type Dispatch, type SetStateAction, createContext } from 'react';

export const fichaContext = createContext<{ ficha: Ficha, setFicha: Dispatch<SetStateAction<Ficha>> }>({
    ficha: fichaModel ,
    setFicha: () => {}
})