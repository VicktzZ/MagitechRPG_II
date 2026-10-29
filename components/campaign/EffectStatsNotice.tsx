import type { AppliedEffect } from '@models';
import { Chip, Stack, Tooltip, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import { statChanges, type StatBases, type StatChange, type StatChangeOptions } from '@utils/combat/effectStats';
import { joinNames } from '@utils/combat/actionFlags';
import type { ReactElement } from 'react';

interface EffectStatsNoticeProps {
    effects: readonly AppliedEffect[] | null | undefined;
    /** Os valores de origem (ficha ou criatura) que o texto compara: "AP 8 → 6"; sem eles o texto diz só o que o efeito dá */
    bases?: StatBases;
    /** Já tem um título perto? Então só os marcadores */
    heading?: string | null;
    /** Em terreno difícil (ambiente da cena): o deslocamento cai pela metade, salvo imunidade */
    options?: StatChangeOptions;
}

const chipLabel = (change: StatChange): string => `${change.label}: ${change.text}`;

/**
 * As estatísticas que os efeitos aplicados mudam agora (Fase 6.3, `utils/combat/effectStats.ts`): deslocamento, iniciativa, AP, LP/MP máximo e a margem de Sobrecura e
 * Sobremana; o terreno difícil da cena (Fase 7) também corta o deslocamento. Um marcador por estatística, verde quando aumenta e vermelho quando diminui, com a dica
 * dizendo a origem. O valor não é gravado em lugar nenhum (é base + efeitos): tirar o efeito devolve o número de antes. Não desenha nada quando nada mexe nelas.
 */
export default function EffectStatsNotice({ effects, bases, heading = 'Efeitos nas estatísticas', options }: EffectStatsNoticeProps): ReactElement | null {
    const changes = statChanges(effects, bases, options);
    if (changes.length === 0) return null;

    return (
        <Stack spacing={0.75} data-testid="effect-stats">
            {heading && (
                <Typography component="h3" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                    {heading}
                </Typography>
            )}
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
                {changes.map(change => (
                    <Tooltip key={change.key} title={change.sources.length > 0 ? `Por ${joinNames(change.sources)}` : ''} arrow>
                        <Chip
                            size="small"
                            variant="outlined"
                            color={change.direction === 'up' ? 'success' : 'error'}
                            label={chipLabel(change)}
                            data-testid={`effect-stat-${change.key}`}
                            sx={{ fontFamily: font.mono }}
                        />
                    </Tooltip>
                ))}
            </Stack>
        </Stack>
    );
}
