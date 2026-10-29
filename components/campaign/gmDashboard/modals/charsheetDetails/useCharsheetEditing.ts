import { useState, useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import type { CharsheetDTO } from '@models/dtos';
import { charsheetService } from '@services';
import { buildCancelSnapshot, buildEditSnapshot, collectCharsheetChanges } from './charsheetEdit';

interface UseCharsheetEditingParams {
    open: boolean;
    charsheet: Required<CharsheetDTO>;
}

/** Estado de edição da ficha pelo mestre: dados editados, atualização de campos, salvar e cancelar */
export function useCharsheetEditing({ open, charsheet }: UseCharsheetEditingParams) {
    const { enqueueSnackbar } = useSnackbar();

    // Estados de edição
    const [ isEditing, setIsEditing ] = useState(false);
    const [ isSaving, setIsSaving ] = useState(false);
    const [ editedData, setEditedData ] = useState<Partial<CharsheetDTO>>({});
    // Snapshot da ficha no início da edição: base para salvar só o que o mestre alterou
    const baselineDataRef = useRef<Partial<CharsheetDTO>>({});

    // Inicializa os dados editáveis quando o modal abre e acompanha as atualizações
    // em tempo real da ficha — mas NÃO durante a edição, senão qualquer ação do
    // jogador (ex: gastar MP) apagava as alterações ainda não salvas do mestre
    useEffect(() => {
        if (open && charsheet && !isEditing) {
            const snapshot = buildEditSnapshot(charsheet);
            baselineDataRef.current = snapshot;
            setEditedData(snapshot);
        }
    }, [ open, charsheet, isEditing ]);

    // Helper para atualizar dados aninhados
    const updateNestedField = (path: string, value: unknown) => {
        setEditedData(prev => {
            const newData = { ...prev };
            const keys = path.split('.');
            let current = newData as Record<string, unknown>;

            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) };
                current = current[keys[i]] as Record<string, unknown>;
            }

            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    // Helper para tratar valores de input number de forma adequada
    const handleNumberInputChange = (path: string, inputValue: string) => {
        // Se estiver vazio, permitir temporariamente (vai ser exibido como vazio)
        if (inputValue === '') {
            updateNestedField(path, '');
        } else {
            // Tentar converter para número, fallback para 0 se inválido
            const numValue = parseInt(inputValue, 10);
            updateNestedField(path, isNaN(numValue) ? 0 : numValue);
        }
    };

    // Função para salvar as alterações
    const handleSave = async () => {
        if (!charsheet?.id) return;

        // Grava só os campos que o mestre alterou (por caminho, ex: 'stats.lp'),
        // para não sobrescrever o que o jogador mudou enquanto a edição estava aberta
        const changes = collectCharsheetChanges(editedData, baselineDataRef.current);

        if (Object.keys(changes).length === 0) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            await charsheetService.updateFields(charsheet.id, changes);
            enqueueSnackbar('Ficha atualizada com sucesso!', { variant: 'success' });
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao salvar ficha:', error);
            enqueueSnackbar('Erro ao salvar alterações', { variant: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    // Função para cancelar edição
    const handleCancelEdit = () => {
        setIsEditing(false);
        // Restaura os dados originais
        setEditedData(buildCancelSnapshot(charsheet));
    };

    return {
        isEditing,
        setIsEditing,
        isSaving,
        editedData,
        updateNestedField,
        handleNumberInputChange,
        handleSave,
        handleCancelEdit
    };
}
