/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { useSavingSpinner } from '@contexts';
import { charsheetService } from '@services';
import type { Charsheet } from '@models/entities';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSaveCharsheetChangesProps {
    charsheet: Charsheet;
    callback?: () => Promise<void>;
    delay?: number;
    deps?: any[];
    enabled?: boolean;
}

export default function useSaveCharsheetChanges(props?: UseSaveCharsheetChangesProps): {
    updateCharsheet: React.Dispatch<React.SetStateAction<Charsheet>>;
} {
    const object = {};
    const { showSavingSpinner } = useSavingSpinner()
    const debounceRef = useRef<{
        timeout: NodeJS.Timeout | null;
        pending: boolean;
    }>({ timeout: null, pending: false });
    
    const [ charsheet, setCharsheet ] = useState<Charsheet>(props?.charsheet ?? object as Charsheet);
    const charsheetRef = useRef(charsheet);
    const propsRef = useRef(props);

    // Atualiza as refs quando as props ou o estado mudam
    useEffect(() => {
        charsheetRef.current = charsheet;
    }, [ charsheet ]);
    
    useEffect(() => {
        propsRef.current = props;
    }, [ props ]);

    // Função para salvar a charsheet
    const saveCharsheet = useCallback(async () => {
        const currentCharsheet = charsheetRef.current;
        const currentProps = propsRef.current;
        
        if (!currentCharsheet?.id || currentProps?.enabled === false) {
            debounceRef.current.pending = false;
            return;
        }

        try {
            showSavingSpinner(true);
            console.log('Salvando charsheet:', currentCharsheet.id, currentCharsheet);
            await currentProps?.callback?.();
            await charsheetService.updateById({ 
                id: currentCharsheet.id, 
                data: currentCharsheet 
            });
            console.log('Charsheet salva com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar charsheet:', error);
        } finally {
            setTimeout(() => showSavingSpinner(false), currentProps?.delay || 500);
            debounceRef.current.pending = false;
        }
    }, [ showSavingSpinner ]);

    // Efeito para limpar o timeout quando o componente desmontar
    useEffect(() => {
        return () => {
            if (debounceRef.current.timeout) {
                clearTimeout(debounceRef.current.timeout);
            }
        };
    }, []);

    // Atualiza a charsheet e agenda o salvamento
    const updateCharsheet: React.Dispatch<React.SetStateAction<Charsheet>> = useCallback((updater) => {
        // Atualiza o estado da charsheet
        setCharsheet(prevCharsheet => {
            const newCharsheet = typeof updater === 'function' 
                ? (updater as (prevState: Charsheet) => Charsheet)(prevCharsheet) 
                : updater;
            
            console.log('Atualizando charsheet:', { prevCharsheet, newCharsheet });
            return newCharsheet; // Retorna a nova charsheet completa, não um merge
        });

        // Cancela o timeout anterior se existir
        if (debounceRef.current.timeout) {
            clearTimeout(debounceRef.current.timeout);
        }

        // Agenda um novo timeout para salvar
        debounceRef.current.pending = true;
        debounceRef.current.timeout = setTimeout(() => {
            if (debounceRef.current.pending) {
                void saveCharsheet();
            }
        }, props?.delay || 1000); // Aumentei o delay para 1 segundo

        // Retorna undefined para evitar avisos do React
        return undefined;
    }, [ props?.delay, saveCharsheet ]);

    // Efeito para sincronizar com props quando a charsheet externa muda
    useEffect(() => {
        if (props?.charsheet?.id) {
            setCharsheet(props.charsheet);
            charsheetRef.current = props.charsheet;
        }
    }, [ props?.charsheet?.id, props?.charsheet ]); // Dependência mais específica

    return {
        updateCharsheet
    }
}