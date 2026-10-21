import { useCampaignContext } from '@contexts';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

/**
 * Estado e ações das criaturas customizadas do dashboard do mestre: abrir o editor (leitura ou edição),
 * salvar na campanha e excluir com confirmação.
 */
export function useCreatureManager() {
    const { campaign, updateCampaign } = useCampaignContext()
    const { enqueueSnackbar } = useSnackbar()

    const [ creatureModalOpen, setCreatureModalOpen ] = useState(false);
    const [ selectedCreature, setSelectedCreature ] = useState<any | null>(null);
    const [ selectedCreatureReadOnly, setSelectedCreatureReadOnly ] = useState(false);
    // Exclusão de criatura: o alvo fica guardado após fechar para o nome não sumir durante a animação do diálogo
    const [ creatureToDelete, setCreatureToDelete ] = useState<{ id: string; name: string } | null>(null);
    const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
    const [ isDeletingCreature, setIsDeletingCreature ] = useState(false);

    // Excluir criatura customizada: primeiro pede confirmação, depois remove
    const handleRequestDeleteCreature = (creatureId: string, creatureName: string) => {
        setCreatureToDelete({ id: creatureId, name: creatureName });
        setDeleteDialogOpen(true);
    };

    const handleConfirmDeleteCreature = async () => {
        if (!creatureToDelete) return;

        setIsDeletingCreature(true);
        try {
            const response = await fetch(`/api/campaign/${campaign.id}/custom/creatures`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatureId: creatureToDelete.id })
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir criatura');
            }

            // A rota DELETE já grava a remoção na campanha; o listener da campanha atualiza a lista.
            // Gravar `custom` de novo aqui sobrescreveria o objeto inteiro com um valor possivelmente velho.
        } catch (error) {
            console.error('Erro ao deletar criatura:', error);
            enqueueSnackbar('Erro ao excluir criatura', { variant: 'error' });
        } finally {
            setIsDeletingCreature(false);
            setDeleteDialogOpen(false);
        }
    };

    const handleViewCreature = (creature: any) => {
        setSelectedCreature(creature);
        setSelectedCreatureReadOnly(true);
        setCreatureModalOpen(true);
    };

    const handleEditCreature = (creature: any) => {
        setSelectedCreature(creature);
        setSelectedCreatureReadOnly(false);
        setCreatureModalOpen(true);
    };

    const handleCreatureSaved = async (creature: any) => {
        const existingCreatures = campaign.custom?.creatures || [];
        const index = existingCreatures.findIndex((c) => c.id === creature.id);

        const updatedCreatures = index === -1
            ? [ ...existingCreatures, creature ]
            : existingCreatures.map((c) => c.id === creature.id ? { ...c, ...creature } : c);

        await updateCampaign({
            custom: {
                ...campaign.custom,
                creatures: updatedCreatures
            }
        });
    };

    /** Fecha o editor de criatura e limpa a seleção */
    const handleCloseCreatureModal = () => {
        setCreatureModalOpen(false);
        setSelectedCreature(null);
    };

    return {
        creatureModalOpen,
        selectedCreature,
        selectedCreatureReadOnly,
        creatureToDelete,
        deleteDialogOpen,
        isDeletingCreature,
        setDeleteDialogOpen,
        handleRequestDeleteCreature,
        handleConfirmDeleteCreature,
        handleViewCreature,
        handleEditCreature,
        handleCreatureSaved,
        handleCloseCreatureModal
    };
}
