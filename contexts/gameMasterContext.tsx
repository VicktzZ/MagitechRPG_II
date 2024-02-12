import { createContext, useContext } from 'react';

export const gameMasterContext = createContext<{ gameMasterId: string[] }>({
    gameMasterId: [ '' ]
})

export const useGameMasterContext = (): { gameMasterId: string[] }  => useContext(gameMasterContext)