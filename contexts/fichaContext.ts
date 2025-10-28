import { fichaModel } from '@constants/ficha';
import { type Dispatch, type SetStateAction, createContext } from 'react';
import { type Charsheet } from '@models/entities';

export const fichaContext = createContext<{ charsheet: Charsheet, setCharsheet: Dispatch<SetStateAction<Charsheet>> }>({
    charsheet: fichaModel ,
    setCharsheet: () => {}
})