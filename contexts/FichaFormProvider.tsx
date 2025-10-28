'use client';

import { fichaModel } from '@constants/ficha';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { FormProvider, useForm } from 'react-hook-form';
import { fichaSchema } from '@schemas';
import { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CharsheetDTO } from '@models/dtos';

export const FichaFormContext = createContext<UseFormReturn<CharsheetDTO> | null>(null);
export const useFichaForm = (): UseFormReturn<CharsheetDTO> => {
    const ctx = useContext(FichaFormContext);
    // if (!ctx) throw new Error('useFichaForm deve ser usado dentro de FichaFormProvider');
    return ctx!;
};

export default function FichaFormProvider({ children, formData }: { children: ReactElement, formData?: CharsheetDTO }) {
    const { data: session } = useSession()
    const [ createFichaAutosave, setCreateFichaAutosave ] = useLocalStorage<CharsheetDTO | null>('create-ficha-autosave')
    const pathname = usePathname();
    
    const form = useForm<CharsheetDTO>({
        mode: 'onChange',
        defaultValues: {
            ...fichaModel,
            ...createFichaAutosave,
            playerName: session?.user?.name,
            userId: session?.user?.id,
            ...formData
        },
        resolver: zodResolver(fichaSchema),
        shouldFocusError: true,
        criteriaMode: 'all'
    })
    
    useEffect(() => {
        if (pathname === '/app/charsheet/create' && !formData) {
            let timeoutId: NodeJS.Timeout;
            
            const subscription = form.watch((value) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    setCreateFichaAutosave(value as CharsheetDTO);
                }, 300);
            });
            
            return () => {
                subscription.unsubscribe();
                clearTimeout(timeoutId);
            };
        }
    }, [ pathname, form, setCreateFichaAutosave, formData ]);
    
    return (
        <FormProvider {...form}>
            <FichaFormContext.Provider value={form}>
                {children}
            </FichaFormContext.Provider>
        </FormProvider>
    )
}