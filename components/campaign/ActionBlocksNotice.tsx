import { Alert, Stack } from '@mui/material';
import { ACTION_FLAGS, blockReason, type ActionBlocks } from '@utils/combat/actionFlags';
import type { ReactElement } from 'react';

/**
 * O que os efeitos aplicados impedem o combatente de fazer (flags de ação, `utils/combat/actionFlags.ts`): perder o turno, não agir, não conjurar, não receber cura.
 * Um aviso por flag, dizendo qual efeito a dá. É só aviso: o mestre remove o efeito para liberar. Não desenha nada quando nada impede.
 */
export default function ActionBlocksNotice({ blocks, who }: { blocks: ActionBlocks; who: string }): ReactElement | null {
    const reasons = ACTION_FLAGS.map(flag => ({ flag, text: blockReason(blocks, flag, who) })).filter(entry => entry.text !== '');
    if (reasons.length === 0) return null;

    return (
        <Stack spacing={0.75} data-testid="action-blocks">
            {reasons.map(({ flag, text }) => (
                <Alert key={flag} severity="warning" icon={false} sx={{ py: 0 }} data-testid={`action-block-${flag}`}>
                    {text}.
                </Alert>
            ))}
        </Stack>
    );
}
