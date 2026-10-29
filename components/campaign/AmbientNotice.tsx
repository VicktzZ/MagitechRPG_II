import type { AppliedEffect } from '@models';
import { Chip, Stack, Tooltip, Typography } from '@mui/material';
import { joinNames } from '@utils/combat/actionFlags';
import {
    ambientAttackDice, hasTerrainImmunity, isInDifficultTerrain, LIGHT_LABEL, LIGHT_RULE, readEnvironment, type CombatEnvironment
} from '@utils/combat/environment';
import type { ReactElement } from 'react';

interface AmbientNoticeProps {
    environment: CombatEnvironment | null | undefined;
    /** O combatente de quem se fala: a luz pesa conforme a visão dele (pelos efeitos) e o terreno é marcado por combatente */
    combatantId: string;
    effects: readonly AppliedEffect[] | null | undefined;
    heading?: string | null;
}

/**
 * O ambiente da cena para um combatente (Fase 7, `utils/combat/environment.ts`): a iluminação que o mestre marcou e o que ela faz **com a visão dele**
 * ("Penumbra: cobertura parcial, desvantagem, −1d20"), e se está em terreno difícil (deslocamento pela metade) ou imune a ele. Luz clara e terreno normal não
 * desenham nada. É só aviso: o app não valida movimento nem posição, e a desvantagem entra sozinha nas rolagens de acerto.
 */
export default function AmbientNotice({ environment, combatantId, effects, heading = 'Ambiente' }: AmbientNoticeProps): ReactElement | null {
    const { light } = readEnvironment(environment);
    const inTerrain = isInDifficultTerrain(environment, combatantId);
    if (light === 'claro' && !inTerrain) return null;

    const immune = inTerrain && hasTerrainImmunity(effects);
    const notes = light === 'claro' ? [] : ambientAttackDice(light, effects).notes;

    return (
        <Stack spacing={0.75} data-testid="ambient-notice">
            {heading && (
                <Typography component="h3" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                    {heading}
                </Typography>
            )}
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
                {light !== 'claro' && (
                    <Tooltip title={LIGHT_RULE[light]} arrow>
                        <Chip
                            size="small"
                            variant="outlined"
                            color={notes.length > 0 ? 'warning' : 'default'}
                            label={`Iluminação: ${LIGHT_LABEL[light]}`}
                            data-testid="ambient-light"
                        />
                    </Tooltip>
                )}
                {inTerrain && (
                    <Tooltip title={immune ? 'Imune ao terreno difícil: o deslocamento não muda.' : 'Terreno difícil: o deslocamento cai pela metade.'} arrow>
                        <Chip
                            size="small"
                            variant="outlined"
                            color={immune ? 'default' : 'warning'}
                            label={immune ? 'Terreno difícil: imune' : 'Terreno difícil: deslocamento pela metade'}
                            data-testid="ambient-terrain"
                        />
                    </Tooltip>
                )}
            </Stack>
            {notes.length > 0 && (
                <Typography variant="caption" color="text.secondary" data-testid="ambient-notes">
                    No acerto: {joinNames(notes.map(note => note.replace(/, desvantagem/, '')))}.
                </Typography>
            )}
        </Stack>
    );
}
