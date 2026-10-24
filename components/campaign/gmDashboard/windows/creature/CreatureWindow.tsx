'use client';

import { useCampaignContext } from '@contexts';
import { Typography } from '@mui/material';
import { useMemo, useState, type ReactElement } from 'react';
import CreatureCreator from '../../CreatureCreator';
import type { CreatureData } from '../../creatureCreator/types';
import DeleteCreatureDialog from '../../DeleteCreatureDialog';
import { useCreatureDelete } from '../../dashboard/useCreatureDelete';
import { toCreatureCard } from './creatureCard';
import { CreatureView } from './CreatureView';

/** Conteúdo da janela de uma criatura personalizada: ficha em tempo real, com editar (editor de criatura) e excluir */
export default function CreatureWindow({ creatureId }: { creatureId: string }): ReactElement {
    const { campaign } = useCampaignContext();
    const creature = campaign.custom?.creatures?.find(candidate => candidate.id === creatureId);
    const card = useMemo(() => (creature ? toCreatureCard(creature) : null), [ creature ]);

    // A criatura em edição é uma cópia fixada no clique: o editor reinicia o formulário quando recebe outro objeto,
    // e a campanha chega de novo do Firestore a cada mudança (o que apagaria o que o mestre estava digitando)
    const [ editing, setEditing ] = useState<CreatureData | null>(null);
    const deletion = useCreatureDelete();

    if (!creature || !card) {
        return <Typography color="text.secondary">Esta criatura não está mais na campanha.</Typography>;
    }

    return (
        <>
            <CreatureView
                creature={card}
                onEdit={() => setEditing(creature as unknown as CreatureData)}
                onDelete={() => deletion.request(creature.id, creature.name)}
            />
            <CreatureCreator open={editing !== null} onClose={() => setEditing(null)} editingCreature={editing} />
            <DeleteCreatureDialog
                open={deletion.open}
                creatureName={deletion.target?.name ?? ''}
                deleting={deletion.deleting}
                onConfirm={() => { void deletion.confirm(); }}
                onCancel={deletion.cancel}
            />
        </>
    );
}
