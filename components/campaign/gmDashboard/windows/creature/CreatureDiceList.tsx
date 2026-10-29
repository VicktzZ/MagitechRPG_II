'use client';

import { Casino } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import { describeCreatureDice, type CreatureDice } from '@utils/combat/creatureDice';
import type { ReactElement } from 'react';

interface CreatureDiceListProps {
    dices: CreatureDice[];
    /** Rola o dado (o resultado vai ao chat); sem isso a lista é só de leitura */
    onRoll?: (dice: CreatureDice) => void;
}

/** Os dados customizáveis da criatura: nome, a expressão e a descrição de cada um, com o botão de rolar. Some quando a criatura não tem nenhum (quem usa decide o título) */
export default function CreatureDiceList({ dices, onRoll }: CreatureDiceListProps): ReactElement {
    return (
        <Stack spacing={1} data-testid="creature-dice">
            {dices.map(dice => (
                <Box
                    key={dice.id}
                    data-testid={`creature-dice-${dice.id}`}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1.5, py: 1 }}
                >
                    <Box sx={{ flex: 1, minWidth: 140 }}>
                        <Typography sx={{ fontWeight: 600 }}>{dice.name}</Typography>
                        <Typography variant="caption" sx={{ fontFamily: font.mono, color: 'text.secondary' }}>{describeCreatureDice(dice)}</Typography>
                        {dice.description && <Typography variant="body2" color="text.secondary">{dice.description}</Typography>}
                    </Box>
                    {onRoll && (
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<Casino fontSize="small" />}
                            onClick={() => { onRoll(dice); }}
                            aria-label={`Rolar ${dice.name}`}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                            Rolar
                        </Button>
                    )}
                </Box>
            ))}
        </Stack>
    );
}
