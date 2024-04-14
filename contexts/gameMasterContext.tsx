import { createContext, useContext } from 'react';

export const gameMasterContext = createContext<{ allGameMasters: string[], userIsGM: boolean }>({
    allGameMasters: [ '' ],
    userIsGM: false
})

export const useGameMasterContext = (): { allGameMasters: string[], userIsGM: boolean }  => useContext(gameMasterContext)