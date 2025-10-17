'use client';

import { fichaModel } from '@constants/ficha';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { FormProvider, useForm } from 'react-hook-form';
import { fichaSchema } from '@schemas';
import type { Ficha } from '@types';
import type { ReactElement } from 'react';
import { createContext, useContext, useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useLocalStorage } from '@uidotdev/usehooks';
import { usePathname } from 'next/navigation';

export const FichaFormContext = createContext<UseFormReturn<Ficha> | null>(null);
export const useFichaForm = (): UseFormReturn<Ficha> => {
    const ctx = useContext(FichaFormContext);
    // if (!ctx) throw new Error('useFichaForm deve ser usado dentro de FichaFormProvider');
    return ctx!;
};

export default function FichaFormProvider({ children, formData }: { children: ReactElement, formData?: Ficha }) {
    const { data: session } = useSession()
    const [ createFichaAutosave, setCreateFichaAutosave ] = useLocalStorage<Ficha | null>('create-ficha-autosave')
    const pathname = usePathname();
    
    const form = useForm<Ficha>({
        mode: 'onChange',
        defaultValues: {
            ...fichaModel,
            ...createFichaAutosave,
            playerName: session?.user?.name,
            userId: session?.user?._id,
            ...formData
        },
        resolver: zodResolver(fichaSchema),
        shouldFocusError: true,
        criteriaMode: 'all'
    })
    
    useEffect(() => {
        if (pathname === '/app/ficha/create' && !formData) {
            let timeoutId: NodeJS.Timeout;
            
            const subscription = form.watch((value) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    setCreateFichaAutosave(value as Ficha);
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