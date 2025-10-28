import { charsheetModel } from '@constants/charsheet';
import { type Dispatch, type SetStateAction, createContext } from 'react';
import { type Charsheet } from '@models/entities';

export const charsheetContext = createContext<{ charsheet: Charsheet, setCharsheet: Dispatch<SetStateAction<Charsheet>> }>({
    charsheet: charsheetModel ,
    setCharsheet: () => {}
})