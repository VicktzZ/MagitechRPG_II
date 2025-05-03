import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';

export const savingSpinnerContext = createContext<{
    isSaving: boolean;
    showSavingSpinner: Dispatch<SetStateAction<boolean>>;
}>({
    isSaving: false,
    showSavingSpinner: () => {}
});

export const useSavingSpinner = () => useContext(savingSpinnerContext);
