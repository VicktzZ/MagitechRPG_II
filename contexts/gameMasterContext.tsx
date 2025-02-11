import { createContext, useContext } from 'react';

export const gameMasterContext = createContext<{ allGameMastersId: string[], isUserGM: boolean }>({
    allGameMastersId: [ '' ],
    isUserGM: false
})

export const useGameMasterContext = (): { allGameMastersId: string[], isUserGM: boolean }  => useContext(gameMasterContext)