'use client';

import { useCampaignContext } from '@contexts';
import type { Creature } from '@models';
import { summonTemplateBody, type SummonTemplate } from '@utils/combat/summonTemplates';
import { duplicateCreatureBody } from '@utils/creatureList';
import { errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { useGmCombat } from '../../combatPanel/useGmCombat';

interface CreatureActions {
    /** Cria uma cópia da criatura ("Goblin (cópia)") com tudo dela: atributos, perícias, habilidades, magias, dados e defesas */
    duplicate: (creature: Creature) => Promise<void>;
    /** Id da criatura sendo copiada (o botão fica desligado enquanto a rota responde) */
    duplicatingId: string | null;
    /** Cria na campanha a criatura de um modelo de invocação (golem, lacaios, espíritos, duplicata) */
    createSummon: (template: SummonTemplate) => Promise<void>;
    /** Id do modelo sendo criado (os botões esperam) */
    creatingSummonId: string | null;
    /** Põe uma cópia da criatura no combate em andamento (o servidor escolhe o id e o nome da cópia) */
    addToCombat: (creature: Creature) => Promise<void>;
    /** Esperando o servidor ao adicionar ao combate */
    addingToCombat: boolean;
    /** Há combate ativo: só então dá para adicionar */
    combatActive: boolean;
}

/** As ações rápidas do mestre sobre as criaturas da lista: duplicar e adicionar ao combate (ver, editar e excluir já têm os seus hooks) */
export function useCreatureActions(): CreatureActions {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const combat = useGmCombat(campaign.id);
    const [ duplicatingId, setDuplicatingId ] = useState<string | null>(null);
    const [ creatingSummonId, setCreatingSummonId ] = useState<string | null>(null);

    const duplicate = useCallback(async (creature: Creature): Promise<void> => {
        setDuplicatingId(creature.id);
        try {
            const body = duplicateCreatureBody(creature, (campaign.custom?.creatures ?? []).map(candidate => candidate.name));
            const response = await fetch(`/api/campaign/${campaign.id}/custom/creatures`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const result = await response.json() as { error?: string };
            if (!response.ok) throw new Error(result.error ?? 'Erro ao duplicar a criatura');

            // A criatura nova chega à lista sozinha, pelo listener da campanha
            enqueueSnackbar(`"${String(body['name'])}" criada`, { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao duplicar a criatura'), { variant: 'error' });
        } finally {
            setDuplicatingId(null);
        }
    }, [ campaign.custom?.creatures, campaign.id, enqueueSnackbar ]);

    const createSummon = useCallback(async (template: SummonTemplate): Promise<void> => {
        setCreatingSummonId(template.id);
        try {
            const body = summonTemplateBody(template, (campaign.custom?.creatures ?? []).map(candidate => candidate.name));
            const response = await fetch(`/api/campaign/${campaign.id}/custom/creatures`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const result = await response.json() as { error?: string };
            if (!response.ok) throw new Error(result.error ?? 'Erro ao criar o invocado');

            // A criatura nova chega à lista sozinha, pelo listener da campanha
            enqueueSnackbar(`"${String(body['name'])}" criado: use "Adicionar ao combate" e escolha quem o invocou`, { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao criar o invocado'), { variant: 'error' });
        } finally {
            setCreatingSummonId(null);
        }
    }, [ campaign.custom?.creatures, campaign.id, enqueueSnackbar ]);

    const addToCombat = useCallback(async (creature: Creature): Promise<void> => {
        await combat.addCombatants({ players: [], creatures: [ { id: creature.id, quantity: 1 } ] });
    }, [ combat ]);

    return { duplicate, duplicatingId, createSummon, creatingSummonId, addToCombat, addingToCombat: combat.busy, combatActive: Boolean(campaign.session?.combat?.isActive) };
}
