import type { Ficha } from '@types';
import { createContext, useContext } from 'react';

const obj = {};

export const campaignCurrentFichaContext = createContext<{ ficha: Ficha, updateFicha: React.Dispatch<React.SetStateAction<Ficha>> }>({ ficha: obj as Ficha, updateFicha: () => {} });
export const useCampaignCurrentFichaContext = () => useContext(campaignCurrentFichaContext);