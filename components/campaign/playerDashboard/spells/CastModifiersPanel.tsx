'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import { Box, Chip, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { castOptionList, fixationRule, guidedBonusDice, guidedRule, quickCastApplies, readFixedSpell, type PassiveDef } from '@utils/combat/passives';
import { charsheetEntity } from '@utils/firestoreEntities';
import { normalizeToArray } from '@utils/normalizeToArray';
import { useSnackbar } from 'notistack';
import type { ReactElement } from 'react';
import { usePassives } from '../passives/usePassives';
import { useSpellCasting } from './SpellCastingContext';

interface CastModifiersViewProps {
    passives: readonly PassiveDef[];
    selected: readonly string[];
    onToggleOption: (id: string) => void;
    twin: { available: boolean; armed: boolean; waitingSecond: boolean };
    onArmTwin: (armed: boolean) => void;
    onCancelTwin: () => void;
    quickCastReady: boolean;
    /** Em combate, para a Conjuração Rápida dizer se está pronta; fora dele só diz que existe */
    inCombat: boolean;
    guidedLabel: string | null;
    spells: ReadonlyArray<{ key: string; name: string }>;
    fixedKey: string | null;
    onFixSpell: (key: string) => void;
}

/**
 * Metamagia e habilidades de conjuração (`utils/combat/passives/casting.ts`), no topo da seção de Magias e da seção Ações: as opções que o jogador liga para a **próxima** conjuração
 * (Intensificação Mágica, Estágio Quatro), o par da Teia da Realidade, a magia fixada da Fixação Mágica e o estado da Conjuração Rápida e da Magia Guiada. Sem nenhuma dessas
 * habilidades na ficha, não desenha nada.
 */
export function CastModifiersView({ passives, selected, onToggleOption, twin, onArmTwin, onCancelTwin, quickCastReady, inCombat, guidedLabel, spells, fixedKey, onFixSpell }: CastModifiersViewProps): ReactElement | null {
    const options = castOptionList(passives);
    const hasQuick = quickCastApplies(passives, { level: 1, execution: 'Padrão' });
    const hasFixation = fixationRule(passives) !== null;
    if (options.length === 0 && !twin.available && !hasQuick && !hasFixation && guidedRule(passives) === null) return null;

    return (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.raised', px: 1.5, py: 1 }} data-testid="cast-modifiers">
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
                Metamagia: vale para a próxima conjuração
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                {options.map(option => {
                    const on = selected.includes(option.id);
                    return (
                        <Tooltip key={option.id} title={`${option.hint}. Fica ligada só até a próxima conjuração.`}>
                            <Chip
                                size="small"
                                clickable
                                color={on ? 'primary' : 'default'}
                                variant={on ? 'filled' : 'outlined'}
                                label={`${option.label} (+${option.mp}${option.mpLevel4 !== undefined ? `/${option.mpLevel4}` : ''} MP)`}
                                onClick={() => { onToggleOption(option.id); }}
                                aria-pressed={on}
                                data-testid={`cast-option-${option.id}`}
                            />
                        </Tooltip>
                    );
                })}

                {twin.available && (
                    <Tooltip title="Duas magias de nível 2 ou menos com uma ação só; cada uma custa +1 MP e gasta o limite de MP por turno. A primeira abre o par e a segunda não gasta ação.">
                        {twin.waitingSecond ? (
                            <Chip size="small" clickable color="primary" label="Teia da Realidade: falta a 2ª magia (cancelar)" onClick={onCancelTwin} data-testid="cast-twin" />
                        ) : (
                            <Chip
                                size="small"
                                clickable
                                color={twin.armed ? 'primary' : 'default'}
                                variant={twin.armed ? 'filled' : 'outlined'}
                                label="Teia da Realidade (+1 MP cada)"
                                onClick={() => { onArmTwin(!twin.armed); }}
                                aria-pressed={twin.armed}
                                data-testid="cast-twin"
                            />
                        )}
                    </Tooltip>
                )}

                {hasQuick && (
                    <Tooltip title="Magia de nível 1 gasta a ação Bônus, uma vez por turno (só se a Bônus estiver livre)">
                        <Chip
                            size="small"
                            variant="outlined"
                            color={inCombat && quickCastReady ? 'success' : 'default'}
                            label={!inCombat ? 'Conjuração Rápida' : quickCastReady ? 'Conjuração Rápida: pronta' : 'Conjuração Rápida: já usada ou sem Bônus'}
                            data-testid="cast-quick"
                        />
                    </Tooltip>
                )}

                {guidedLabel && <Chip size="small" variant="outlined" color="primary" label={guidedLabel} data-testid="cast-guided" />}
            </Stack>

            {hasFixation && (
                <TextField
                    select
                    size="small"
                    label="Magia fixada (Fixação Mágica)"
                    value={fixedKey ?? ''}
                    onChange={(event) => { onFixSpell(event.target.value); }}
                    helperText="Essa magia vale um estágio à frente do liberado e leva +1d6 no teste; no estágio máximo soma +5 ao dano. Você é invulnerável a ela."
                    sx={{ mt: 1, minWidth: 260, maxWidth: 420 }}
                    data-testid="cast-fixed-spell"
                >
                    <MenuItem value=""><em>Nenhuma</em></MenuItem>
                    {spells.map(spell => <MenuItem key={spell.key} value={spell.key}>{spell.name}</MenuItem>)}
                </TextField>
            )}
        </Box>
    );
}

/** A versão ligada ao painel do jogador: lê as habilidades da ficha e o estado de conjuração do painel */
export default function CastModifiersPanel(): ReactElement | null {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const { campaign } = useCampaignContext();
    const { passives } = usePassives();
    const { cast } = useSpellCasting();
    const { enqueueSnackbar } = useSnackbar();

    const combat = campaign?.session?.combat;
    const me = combat?.isActive ? combat.combatants?.find(candidate => candidate.id === charsheet?.id) : undefined;
    const guided = me?.guided;
    const dice = guided ? guidedBonusDice(passives, guided, guided.targetId, guided.spellKey) : 0;
    const targetName = guided ? combat?.combatants?.find(candidate => candidate.id === guided.targetId)?.name ?? 'o alvo' : '';
    const guidedLabel = guided && dice > 0 ? `Magia Guiada: ${dice} acerto${dice > 1 ? 's' : ''} de ${guided.spellKey} em ${targetName} (+${dice}d4)` : null;

    const spells = normalizeToArray<{ id?: string; name?: string } | null>(charsheet?.spells)
        .filter((spell): spell is { id?: string; name: string } => Boolean(spell?.name))
        .map(spell => ({ key: spell.id || spell.name, name: spell.name }));

    const fixSpell = async (key: string): Promise<void> => {
        if (!charsheet?.id) return;
        const chosen = spells.find(spell => spell.key === key);
        try {
            // Sem escolha apaga o campo: o `null` do Firestore some com a fixação
            await charsheetEntity.update(charsheet.id, { fixedSpell: chosen ? { key: chosen.key, name: chosen.name } : null } as never);
            enqueueSnackbar(chosen ? `${chosen.name} é a magia fixada.` : 'Nenhuma magia fixada.', { variant: 'success' });
        } catch (error) {
            console.error('Erro ao fixar a magia:', error);
            enqueueSnackbar('Não consegui fixar a magia', { variant: 'error' });
        }
    };

    return (
        <CastModifiersView
            passives={passives}
            selected={cast.selected}
            onToggleOption={cast.toggleOption}
            twin={cast.twin}
            onArmTwin={cast.armTwin}
            onCancelTwin={cast.cancelTwin}
            quickCastReady={cast.quickCastReady}
            inCombat={Boolean(me)}
            guidedLabel={guidedLabel}
            spells={spells}
            fixedKey={readFixedSpell(charsheet)?.key ?? null}
            onFixSpell={(key) => { void fixSpell(key); }}
        />
    );
}
