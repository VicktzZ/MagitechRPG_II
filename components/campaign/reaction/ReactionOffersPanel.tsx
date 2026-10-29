'use client';

import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import type { ReactionEntry, ReactionSpellLike } from '@utils/combat/reactions';
import type { ReactElement } from 'react';

interface ReactionOffersPanelProps {
    /** As ofertas que o personagem vê, cada uma com as magias de Reação dele que combinam */
    entries: ReadonlyArray<ReactionEntry<ReactionSpellLike>>;
    /** "Reagir": leva o jogador às magias de Reação (a ação é gasta ao usar a magia) */
    onReact: () => void;
    onDismiss: (reactionId: string) => void;
}

/**
 * Reação aberta, do lado do jogador: **"Aconteceu X"** e as magias de Reação dele que combinam com o gatilho. É só oferta: reagir gasta a Reação (uma por rodada) ao usar a
 * magia pelo caminho de sempre, e quem não quer reagir deixa passar. A oferta some ao gastar a Reação ou quando o turno passa.
 */
export default function ReactionOffersPanel({ entries, onReact, onDismiss }: ReactionOffersPanelProps): ReactElement | null {
    if (entries.length === 0) return null;

    return (
        <Stack spacing={1} sx={{ mb: 1.5 }} data-testid="reaction-offers">
            {entries.map(({ offer, spells }) => (
                <Alert key={offer.id} severity="info" icon={false} sx={{ py: 0.5 }} data-testid={`reaction-offer-${offer.id}`}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {offer.text}
                    </Typography>
                    <Typography variant="caption" component="div" sx={{ color: 'text.secondary', mb: 1 }} data-testid="reaction-offer-spells">
                        {spells.length > 0
                            ? `Você pode reagir (gasta a Reação). Magias de Reação que combinam: ${spells.map(spell => spell.name).join(', ')}.`
                            : 'Você pode reagir (gasta a Reação), como o mestre disser.'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {spells.length > 0 && (
                            <Button size="small" variant="outlined" onClick={onReact} sx={{ textTransform: 'none' }}>
                                Ver magias de Reação
                            </Button>
                        )}
                        <Button size="small" color="inherit" onClick={() => { onDismiss(offer.id); }} sx={{ textTransform: 'none' }}>
                            Deixar passar
                        </Button>
                    </Box>
                </Alert>
            ))}
        </Stack>
    );
}
