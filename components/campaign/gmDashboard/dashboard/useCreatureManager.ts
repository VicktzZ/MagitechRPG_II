import type { Creature } from '@models';
import { useState } from 'react';
import type { CreatureData } from '../creatureCreator/types';
import { useCreatureDelete } from './useCreatureDelete';

/**
 * Estado e ações das criaturas personalizadas do dashboard do mestre: abrir o editor e excluir com confirmação.
 * Ver os detalhes é pela janela da criatura (`openWindow('creature', id)`), e o editor grava pela rota da campanha:
 * o listener da campanha atualiza a lista, então não há nada a gravar de novo aqui.
 */
export function useCreatureManager() {
    const [ creatureModalOpen, setCreatureModalOpen ] = useState(false);
    const [ selectedCreature, setSelectedCreature ] = useState<CreatureData | null>(null);
    const deletion = useCreatureDelete();

    const handleEditCreature = (creature: Creature) => {
        // Fixa o objeto do clique: o editor reinicia o formulário quando recebe outro, e a campanha chega de novo a cada mudança
        setSelectedCreature(creature as unknown as CreatureData);
        setCreatureModalOpen(true);
    };

    /** Fecha o editor de criatura e limpa a seleção */
    const handleCloseCreatureModal = () => {
        setCreatureModalOpen(false);
        setSelectedCreature(null);
    };

    return {
        creatureModalOpen,
        selectedCreature,
        creatureToDelete: deletion.target,
        deleteDialogOpen: deletion.open,
        isDeletingCreature: deletion.deleting,
        handleRequestDeleteCreature: deletion.request,
        handleCancelDeleteCreature: deletion.cancel,
        handleConfirmDeleteCreature: deletion.confirm,
        handleEditCreature,
        handleCloseCreatureModal
    };
}
