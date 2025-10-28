'use client';

import { charsheetModel } from '@constants/charsheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { FormProvider, useForm } from 'react-hook-form';
import { charsheetSchema } from '@schemas';
import { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CharsheetDTO } from '@models/dtos';

export const CharsheetFormContext = createContext<UseFormReturn<CharsheetDTO> | null>(null);
export const useCharsheetForm = (): UseFormReturn<CharsheetDTO> => {
    const ctx = useContext(CharsheetFormContext);
    // if (!ctx) throw new Error('useCharsheetForm deve ser usado dentro de CharsheetFormProvider');
    return ctx!;
};

export default function CharsheetFormProvider({ children, formData }: { children: ReactElement, formData?: CharsheetDTO }) {
    const { data: session } = useSession()
    const [ createCharsheetAutosave, setCreateCharsheetAutosave ] = useLocalStorage<CharsheetDTO | null>('create-charsheet-autosave')
    const pathname = usePathname();
    
    const form = useForm<CharsheetDTO>({
        mode: 'onChange',
        defaultValues: {
            ...charsheetModel,
            ...createCharsheetAutosave,
            playerName: session?.user?.name,
            userId: session?.user?.id,
            ...formData
        },
        resolver: zodResolver(charsheetSchema),
        shouldFocusError: true,
        criteriaMode: 'all'
    })
    
    useEffect(() => {
        if (pathname === '/app/charsheet/create' && !formData) {
            let timeoutId: NodeJS.Timeout;
            
            const subscription = form.watch((value) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    setCreateCharsheetAutosave(value as CharsheetDTO);
                }, 300);
            });
            
            return () => {
                subscription.unsubscribe();
                clearTimeout(timeoutId);
            };
        }
    }, [ pathname, form, setCreateCharsheetAutosave, formData ]);
    
    return (
        <FormProvider {...form}>
            <CharsheetFormContext.Provider value={form}>
                {children}
            </CharsheetFormContext.Provider>
        </FormProvider>
    )
}