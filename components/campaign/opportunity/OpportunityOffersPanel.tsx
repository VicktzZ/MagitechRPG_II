'use client';

import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import type { OpportunityData } from '@utils/combat/opportunities';
import type { ReactElement } from 'react';

interface OpportunityOffersPanelProps {
    /** Saídas de alcance em que o personagem pode reagir com um ataque de oportunidade */
    offers: readonly OpportunityData[];
    /** Saídas que o próprio personagem declarou e ainda estão abertas */
    provoked: readonly OpportunityData[];
    onDismiss: (opportunityId: string) => void;
}

/**
 * Ataque de oportunidade, do lado do jogador. **Oferta:** "X está saindo do seu alcance". O ataque é opcional e gasta a Reação; para atacar basta escolher X como alvo
 * (já vem escolhido na seção de Inventário e na de Magias) e usar uma arma branca ou uma magia de Reação de alcance Curto. **Provocadas:** as saídas que o personagem
 * declarou, com a opção de cancelar (declarou sem querer, ou ninguém vai reagir).
 */
export default function OpportunityOffersPanel({ offers, provoked, onDismiss }: OpportunityOffersPanelProps): ReactElement | null {
    if (offers.length === 0 && provoked.length === 0) return null;

    return (
        <Stack spacing={1} sx={{ mb: 1.5 }} data-testid="opportunity-offers">
            {offers.map(offer => (
                <Alert key={offer.id} severity="info" icon={false} sx={{ py: 0.5 }} data-testid={`opportunity-offer-${offer.id}`}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {offer.moverName} está saindo do seu alcance
                    </Typography>
                    <Typography variant="caption" component="div" sx={{ color: 'text.secondary', mb: 1 }}>
                        Ataque de oportunidade, antes de ele andar (gasta a Reação): escolha {offer.moverName} como alvo e use uma arma branca ou uma magia de Reação de alcance Curto.
                    </Typography>
                    <Box>
                        <Button size="small" color="inherit" onClick={() => { onDismiss(offer.id); }} sx={{ textTransform: 'none' }}>
                            Deixar passar
                        </Button>
                    </Box>
                </Alert>
            ))}

            {provoked.map(entry => (
                <Box key={entry.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }} data-testid={`opportunity-provoked-${entry.id}`}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', flex: 1 }}>
                        Você saiu do alcance de {entry.reactorName}: ele pode fazer um ataque de oportunidade.
                    </Typography>
                    <Button size="small" color="inherit" onClick={() => { onDismiss(entry.id); }} sx={{ textTransform: 'none' }}>
                        Cancelar
                    </Button>
                </Box>
            ))}
        </Stack>
    );
}
