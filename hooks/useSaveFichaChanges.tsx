/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { useSavingSpinner } from '@contexts';
import { fichaService } from '@services';
import type { Ficha } from '@types';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSaveFichaChangesProps {
    ficha: Ficha;
    callback?: () => Promise<void>;
    delay?: number;
    deps?: any[];
    enabled?: boolean;
}

export default function useSaveFichaChanges(props?: UseSaveFichaChangesProps): {
    updateFicha: React.Dispatch<React.SetStateAction<Ficha>>;
} {
    const { showSavingSpinner } = useSavingSpinner()
    const debounceRef = useRef<{
        timeout: NodeJS.Timeout | null;
        pending: boolean;
    }>({ timeout: null, pending: false });
    
    const [ ficha, setFicha ] = useState<Ficha>(props?.ficha || {} as Ficha);
    const fichaRef = useRef(ficha);
    const propsRef = useRef(props);

    // Atualiza as refs quando as props ou o estado mudam
    useEffect(() => {
        fichaRef.current = ficha;
    }, [ ficha ]);
    
    useEffect(() => {
        propsRef.current = props;
    }, [ props ]);

    // Função para salvar a ficha
    const saveFicha = useCallback(async () => {
        const currentFicha = fichaRef.current;
        const currentProps = propsRef.current;
        
        if (!currentFicha?._id || currentProps?.enabled === false) {
            debounceRef.current.pending = false;
            return;
        }

        try {
            showSavingSpinner(true);
            console.log('Salvando ficha:', currentFicha._id, currentFicha);
            await currentProps?.callback?.();
            await fichaService.updateById({ 
                id: currentFicha._id, 
                data: currentFicha 
            });
            console.log('Ficha salva com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar ficha:', error);
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

    // Atualiza a ficha e agenda o salvamento
    const updateFicha: React.Dispatch<React.SetStateAction<Ficha>> = useCallback((updater) => {
        // Atualiza o estado da ficha
        setFicha(prevFicha => {
            const newFicha = typeof updater === 'function' 
                ? (updater as (prevState: Ficha) => Ficha)(prevFicha) 
                : updater;
            
            console.log('Atualizando ficha:', { prevFicha, newFicha });
            return newFicha; // Retorna a nova ficha completa, não um merge
        });

        // Cancela o timeout anterior se existir
        if (debounceRef.current.timeout) {
            clearTimeout(debounceRef.current.timeout);
        }

        // Agenda um novo timeout para salvar
        debounceRef.current.pending = true;
        debounceRef.current.timeout = setTimeout(() => {
            if (debounceRef.current.pending) {
                void saveFicha();
            }
        }, props?.delay || 1000); // Aumentei o delay para 1 segundo

        // Retorna undefined para evitar avisos do React
        return undefined;
    }, [ props?.delay, saveFicha ]);

    // Efeito para sincronizar com props quando a ficha externa muda
    useEffect(() => {
        if (props?.ficha && props.ficha._id) {
            setFicha(props.ficha);
            fichaRef.current = props.ficha;
        }
    }, [ props?.ficha?._id, props?.ficha ]); // Dependência mais específica

    return {
        updateFicha
    }
}