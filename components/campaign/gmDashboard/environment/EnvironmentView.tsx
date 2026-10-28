import type { Combatant } from '@models';
import { Button, Chip, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import {
    AMBIENT_LIGHTS, isInDifficultTerrain, LIGHT_LABEL, LIGHT_RULE, readEnvironment, type AmbientLight, type CombatEnvironment
} from '@utils/combat/environment';
import type { ReactElement } from 'react';

interface EnvironmentViewProps {
    environment: CombatEnvironment | null | undefined;
    combatants: ReadonlyArray<Pick<Combatant, 'id' | 'name'>>;
    busy: boolean;
    onLight: (light: AmbientLight) => void;
    /** Marca (`true`) ou desmarca (`false`) terreno difícil para estes combatentes */
    onTerrain: (combatantIds: string[], difficult: boolean) => void;
}

function Heading({ children }: { children: string }): ReactElement {
    return (
        <Typography component="h3" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.75 }}>
            {children}
        </Typography>
    );
}

/**
 * O controle do ambiente manual (Fase 7): a iluminação da cena e quem está em terreno difícil. O mapa é de terceiros, então é o mestre quem diz. Os jogadores veem a
 * luz e o próprio terreno no cabeçalho; a desvantagem de acerto da luz entra sozinha nas rolagens, conforme a visão de cada um.
 */
export default function EnvironmentView({ environment, combatants, busy, onLight, onTerrain }: EnvironmentViewProps): ReactElement {
    const { light } = readEnvironment(environment);
    const inTerrain = combatants.filter(combatant => isInDifficultTerrain(environment, combatant.id));
    const outside = combatants.filter(combatant => !isInDifficultTerrain(environment, combatant.id));

    return (
        <Stack spacing={2} data-testid="environment-panel">
            <div>
                <Heading>Iluminação da cena</Heading>
                <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={light}
                    disabled={busy}
                    aria-label="Iluminação da cena"
                    onChange={(_event, value: AmbientLight | null) => { if (value && value !== light) onLight(value); }}
                >
                    {AMBIENT_LIGHTS.map(option => (
                        <ToggleButton key={option} value={option} data-testid={`light-${option}`} sx={{ textTransform: 'none', px: 2 }}>
                            {LIGHT_LABEL[option]}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }} data-testid="light-rule">
                    {LIGHT_RULE[light]}
                </Typography>
            </div>

            <div>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} flexWrap="wrap" useFlexGap>
                    <Heading>Terreno difícil</Heading>
                    <Stack direction="row" spacing={1}>
                        <Button size="small" disabled={busy || outside.length === 0} onClick={() => { onTerrain(outside.map(combatant => combatant.id), true); }} sx={{ textTransform: 'none' }}>
                            Todos
                        </Button>
                        <Button size="small" disabled={busy || inTerrain.length === 0} onClick={() => { onTerrain(inTerrain.map(combatant => combatant.id), false); }} sx={{ textTransform: 'none' }}>
                            Ninguém
                        </Button>
                    </Stack>
                </Stack>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
                    {combatants.map(combatant => {
                        const active = isInDifficultTerrain(environment, combatant.id);
                        return (
                            <Tooltip key={combatant.id} title={active ? 'Em terreno difícil: deslocamento pela metade. Clique para tirar.' : 'Clique para marcar em terreno difícil.'} arrow>
                                <span>
                                    <Chip
                                        size="small"
                                        clickable
                                        disabled={busy}
                                        color={active ? 'warning' : 'default'}
                                        variant={active ? 'filled' : 'outlined'}
                                        label={combatant.name}
                                        aria-pressed={active}
                                        data-testid={`terrain-${combatant.id}`}
                                        onClick={() => { onTerrain([ combatant.id ], !active); }}
                                    />
                                </span>
                            </Tooltip>
                        );
                    })}
                    {combatants.length === 0 && <Typography variant="body2" color="text.secondary">Ninguém no combate.</Typography>}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    Quem está marcado anda a metade do deslocamento, salvo quem tem imunidade (efeito com a marca de imunidade ao terreno).
                </Typography>
            </div>
        </Stack>
    );
}
