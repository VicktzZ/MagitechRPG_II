import { type Dispatch, type SetStateAction, createContext } from 'react';

export const drawerContext = createContext<{drawerOpen: boolean, setDrawerOpen: Dispatch<Dispatch<SetStateAction<boolean>>>}>({
    drawerOpen: false,
    setDrawerOpen: () => {}
})