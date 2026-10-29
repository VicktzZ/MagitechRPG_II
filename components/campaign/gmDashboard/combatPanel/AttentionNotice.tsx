import { Box, Button, Typography } from '@mui/material';
import { color } from '@themes/tokens';
import { describeAttention, type CombatAttention } from '@utils/combat/combatPanel';
import type { ReactElement } from 'react';

/** O aviso de que há ataques, saídas de alcance ou ofertas de reação esperando o mestre, quando ele está em outra aba do painel */
export default function AttentionNotice({ attention, onSee }: { attention: CombatAttention; onSee: () => void }): ReactElement | null {
    if (attention.total === 0) return null;

    return (
        <Box
            role="status"
            data-testid="combat-attention"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', px: 1.5, py: 0.75, border: '1px solid', borderColor: 'primary.main', borderRadius: 2, bgcolor: color.amberSubtle }}
        >
            <Typography sx={{ fontSize: 14, flex: 1, minWidth: 200 }}>{describeAttention(attention)}</Typography>
            <Button size="small" variant="outlined" onClick={onSee} sx={{ textTransform: 'none' }}>
                Ver na aba Ataques
            </Button>
        </Box>
    );
}
