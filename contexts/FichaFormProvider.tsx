'use client';

import { fichaModel } from '@constants/ficha';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { FormProvider, useForm } from 'react-hook-form';
import { fichaSchema } from '@schemas';
import type { Ficha } from '@types';
import type { ReactElement } from 'react';

export default function FichaFormProvider({ children, formData }: { children: ReactElement, formData?: Ficha }) {
    const { data: session } = useSession()

    const form = useForm<Ficha>({
        mode: 'onChange',
        defaultValues: {
            ...fichaModel,
            playerName: session?.user?.name,
            userId: session?.user?._id,
            ...formData
        },
        resolver: zodResolver(fichaSchema),
        shouldFocusError: true,
        criteriaMode: 'all'
    })
    
    return (
        <FormProvider {...form}>
            {children}
        </FormProvider>
    )
}