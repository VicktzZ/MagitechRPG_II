import { useCampaignContext } from '@contexts';
import { AddItemModal, WarningModal } from '@layout';
import type { Armor, Item, Weapon } from '@models';
import type { CharsheetDTO } from '@models/dtos';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { campaignService, charsheetService, notificationService } from '@services';
import { errorMessage } from '@utils/errors';
import { charsheetEntity } from '@utils/firestoreEntities';
import { normalizeToArray } from '@utils/normalizeToArray';
import { getEvolutionPoints, usesStageUnlock } from '@utils/spellStages';
import { enqueueSnackbar } from 'notistack';
import { useState, type ReactElement } from 'react';

export interface PlayerActions {
    /** O ponto de evolução vale para esta ficha (sistema padrão, fora do Roguelite e de "Sem Classe") */
    canGrantEvolution: boolean;
    openAddItem: () => void;
    grantEvolutionPoint: () => Promise<void>;
    openNotification: () => void;
    openRemove: () => void;
    /** Os diálogos das ações (adicionar item, notificação e remover); quem usa o hook precisa renderizá-los */
    dialogs: ReactElement;
}

/**
 * O que o mestre faz com um jogador: adicionar item, conceder ponto de evolução, enviar notificação e remover
 * da campanha. Usado pelo menu do cartão do jogador e pela janela de resumo, com os mesmos avisos e diálogos.
 */
export function usePlayerActions(charsheet: Required<CharsheetDTO>): PlayerActions {
    const { campaign } = useCampaignContext();

    const [ addItemOpen, setAddItemOpen ] = useState(false);
    const [ removeOpen, setRemoveOpen ] = useState(false);
    const [ notificationOpen, setNotificationOpen ] = useState(false);
    const [ notificationTitle, setNotificationTitle ] = useState('');
    const [ notificationContent, setNotificationContent ] = useState('');

    const handleAddItem = async (item: Weapon | Item | Armor): Promise<void> => {
        try {
            // Lê a ficha mais recente do servidor em vez da prop (que pode estar velha): evita sobrescrever itens
            // adicionados por outra ação (outro "adicionar item", depósito de widget) enquanto a tela estava aberta
            const fresh = await charsheetEntity.findById(charsheet.id);
            const inventory = fresh?.inventory ?? charsheet.inventory;

            if ('hit' in item) {
                await charsheetService.updateFields(charsheet.id, { 'inventory.weapons': [ ...normalizeToArray(inventory?.weapons), item ] });
            } else if ('displacementPenalty' in item) {
                await charsheetService.updateFields(charsheet.id, { 'inventory.armors': [ ...normalizeToArray(inventory?.armors), item ] });
            } else {
                await charsheetService.updateFields(charsheet.id, { 'inventory.items': [ ...normalizeToArray(inventory?.items), item ] });
            }

            enqueueSnackbar(`Item ${item.name} adicionado com sucesso!`, { variant: 'success' });
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
            enqueueSnackbar('Erro ao adicionar item!', { variant: 'error' });
        }
    };

    const handleSendNotification = async (): Promise<void> => {
        try {
            // A rota é POST /api/notification/[userId] (o mestre só pode notificar quem joga nas campanhas dele);
            // sem o userId na URL o servidor responde 405, e o envio nunca funcionou desde que as rotas foram protegidas
            await notificationService.create(
                { title: notificationTitle, content: notificationContent, type: 'other' },
                { param: charsheet.userId }
            );

            enqueueSnackbar('Notificação enviada com sucesso!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(`Erro ao enviar notificação: ${errorMessage(error, 'tente novamente')}`, { variant: 'error' });
        }

        setNotificationOpen(false);
    };

    // Ponto de evolução: cada um libera o próximo estágio de uma magia do jogador (ver utils/spellStages.ts)
    const grantEvolutionPoint = async (): Promise<void> => {
        try {
            // Lê a ficha mais recente: o jogador pode ter gasto ponto enquanto esta tela estava aberta
            const fresh = await charsheetEntity.findById(charsheet.id);
            const total = getEvolutionPoints(fresh?.points ?? charsheet.points) + 1;
            await charsheetService.updateFields(charsheet.id, { 'points.evolution': total });
            enqueueSnackbar(`${charsheet.name} recebeu 1 ponto de evolução (agora tem ${total}).`, { variant: 'success' });
        } catch (error) {
            console.error('Erro ao conceder ponto de evolução:', error);
            enqueueSnackbar(`Erro ao conceder ponto de evolução: ${errorMessage(error, 'tente novamente')}`, { variant: 'error' });
        }
    };

    const handleRemoveUser = async (): Promise<void> => {
        try {
            if (!charsheet.id) return;

            await campaignService.removeUser(campaign.id, charsheet.userId);

            enqueueSnackbar('Usuário removido com sucesso!', { variant: 'success' });
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
            enqueueSnackbar(`Erro ao remover usuário: ${errorMessage(error, 'tente novamente')}`, { variant: 'error' });
        }

        setRemoveOpen(false);
    };

    const dialogs = (
        <>
            <AddItemModal
                subtitle={`Adicionar item para ${charsheet.name} (${charsheet.id})`}
                modalOpen={addItemOpen}
                setModalOpen={setAddItemOpen}
                disableDefaultCreate={true}
                onConfirm={handleAddItem}
            />

            <Dialog open={notificationOpen} onClose={() => setNotificationOpen(false)}>
                <DialogTitle>Enviar Notificação</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id={`notification-title-${charsheet.id}`}
                        label="Título"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={notificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id={`notification-content-${charsheet.id}`}
                        label="Conteúdo"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        value={notificationContent}
                        onChange={(e) => setNotificationContent(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNotificationOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSendNotification}>Enviar</Button>
                </DialogActions>
            </Dialog>

            <WarningModal
                text={`Você tem certeza que deseja banir usuário ${charsheet.name} da campanha?`}
                open={removeOpen}
                onClose={() => setRemoveOpen(false)}
                onConfirm={handleRemoveUser}
            />
        </>
    );

    return {
        canGrantEvolution: usesStageUnlock(charsheet, campaign.mode),
        openAddItem: () => setAddItemOpen(true),
        grantEvolutionPoint,
        openNotification: () => setNotificationOpen(true),
        openRemove: () => setRemoveOpen(true),
        dialogs
    };
}
