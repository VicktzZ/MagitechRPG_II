import { useCampaignContext } from '@contexts';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

/** Exclusão de criatura personalizada com confirmação: primeiro `request`, depois `confirm` (ou `cancel`) */
export function useCreatureDelete() {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();

    // O alvo fica guardado após fechar para o nome não sumir durante a animação do diálogo
    const [ target, setTarget ] = useState<{ id: string; name: string } | null>(null);
    const [ open, setOpen ] = useState(false);
    const [ deleting, setDeleting ] = useState(false);

    const request = (creatureId: string, creatureName: string) => {
        setTarget({ id: creatureId, name: creatureName });
        setOpen(true);
    };

    const cancel = () => setOpen(false);

    const confirm = async () => {
        if (!target) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/campaign/${campaign.id}/custom/creatures`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatureId: target.id })
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir criatura');
            }

            // A rota DELETE já grava a remoção na campanha; o listener da campanha atualiza a lista (e fecha as janelas da criatura).
            // Gravar `custom` de novo aqui sobrescreveria o objeto inteiro com um valor possivelmente velho.
        } catch (error) {
            console.error('Erro ao deletar criatura:', error);
            enqueueSnackbar('Erro ao excluir criatura', { variant: 'error' });
        } finally {
            setDeleting(false);
            setOpen(false);
        }
    };

    return { target, open, deleting, request, cancel, confirm };
}
