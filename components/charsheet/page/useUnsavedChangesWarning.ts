'use client';

import { useCharsheetBaseline } from '@contexts';
import type { CharsheetDTO } from '@models/dtos';
import { collectChanges } from '@utils/charsheetDiff';
import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

/**
 * Avisa ao fechar a aba ou recarregar a página de uma ficha criada quando há alterações que não foram salvas.
 * A conta é feita só na hora de sair (comparar o formulário com a ficha carregada), não a cada tecla.
 */
export function useUnsavedChangesWarning(form: UseFormReturn<CharsheetDTO>): void {
    const baseline = useCharsheetBaseline();

    useEffect(() => {
        const onBeforeUnload = (event: BeforeUnloadEvent): void => {
            const base = baseline.get();
            if (!base) return;
            if (Object.keys(collectChanges(base, form.getValues(), { preserved: baseline.preserved })).length === 0) return;
            event.preventDefault();
            // Alguns navegadores só mostram o aviso se o returnValue for definido
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [ baseline, form ]);
}
