import { Add, Delete, Edit } from '@mui/icons-material';
import { Box, Button, Chip, IconButton, List, ListItem, ListItemText, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import { describeCreatureDice, MAX_CREATURE_DICES, MAX_DICE_BONUS, MAX_DICE_DESCRIPTION, MAX_DICE_NAME, type CreatureDice } from '@utils/combat/creatureDice';
import { useState } from 'react';
import {
    addConfig, addModifier, diceFromDraft, draftFromDice, emptyDraft, removeConfig, removeModifier, updateConfig, updateModifier, upsertDice, type DiceDraft, type ModifierKind
} from './diceDraft';
import type { AttributeDef, CreatureData, ExpertiseDef } from './types';

interface DicesTabProps {
    creatureData: CreatureData;
    isReadOnly: boolean;
    attrDefs: AttributeDef[];
    expertiseDefs: ExpertiseDef[];
    /** Troca a lista de dados da criatura */
    setDices: (dices: CreatureDice[]) => void;
}

const KIND_LABEL: Record<ModifierKind, string> = { bonus: 'Bônus fixo', attribute: 'Valor de atributo', expertise: 'Valor de perícia' };

/** Prévia do rascunho em texto: o que o mestre vê enquanto monta o dado */
function previewOf(draft: DiceDraft): string {
    return describeCreatureDice({
        dices: draft.dices,
        modifiers: draft.modifiers.map(modifier => modifier.kind === 'attribute'
            ? { attribute: modifier.attribute }
            : modifier.kind === 'expertise' ? { expertise: modifier.expertise } : { bonus: modifier.bonus })
    });
}

/**
 * Aba "Dados": os dados customizáveis da criatura. O mestre monta a rolagem (nome, um ou mais grupos de dados e termos somados: bônus fixo, valor de atributo ou de perícia da
 * criatura) e depois rola em um clique na ficha da criatura ou na janela dela em combate; o resultado vai ao chat como cartão de dados.
 */
export default function DicesTab({ creatureData, isReadOnly, attrDefs, expertiseDefs, setDices }: DicesTabProps) {
    const dices = creatureData.dices ?? [];
    const attributeKeys = attrDefs.map(definition => definition.key);
    const [ draft, setDraft ] = useState<DiceDraft>(emptyDraft);

    const candidate = diceFromDraft(draft, crypto.randomUUID());
    const atLimit = !draft.id && dices.length >= MAX_CREATURE_DICES;

    const commit = (): void => {
        if (!candidate) return;
        setDices(upsertDice(dices, candidate));
        setDraft(emptyDraft());
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
                Dados ({dices.length}/{MAX_CREATURE_DICES})
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Rolagens que a criatura usa, como o dano de uma mordida. O mestre rola pela ficha da criatura ou pela janela dela em combate, e o resultado vai ao chat.
            </Typography>

            {!isReadOnly && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }} data-testid="dice-form">
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <TextField
                            label="Nome do dado"
                            value={draft.name}
                            onChange={event => { setDraft({ ...draft, name: event.target.value }); }}
                            size="small"
                            sx={{ flex: 1, minWidth: 180 }}
                            inputProps={{ maxLength: MAX_DICE_NAME }}
                        />
                        <TextField
                            label="Descrição (opcional)"
                            value={draft.description}
                            onChange={event => { setDraft({ ...draft, description: event.target.value }); }}
                            size="small"
                            sx={{ flex: 2, minWidth: 200 }}
                            inputProps={{ maxLength: MAX_DICE_DESCRIPTION }}
                        />
                    </Box>

                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Dados rolados</Typography>
                    {draft.dices.map((config, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }} data-testid={`dice-config-${index}`}>
                            <TextField
                                label="Quantidade"
                                type="number"
                                size="small"
                                value={config.quantity}
                                onChange={event => { setDraft(updateConfig(draft, index, 'quantity', Number(event.target.value))); }}
                                sx={{ width: 110 }}
                                inputProps={{ min: 1, max: 99, 'aria-label': `Quantidade de dados do grupo ${index + 1}` }}
                            />
                            <Typography sx={{ fontFamily: font.mono }}>d</Typography>
                            <TextField
                                label="Faces"
                                type="number"
                                size="small"
                                value={config.faces}
                                onChange={event => { setDraft(updateConfig(draft, index, 'faces', Number(event.target.value))); }}
                                sx={{ width: 100 }}
                                inputProps={{ min: 2, max: 1000, 'aria-label': `Faces do dado do grupo ${index + 1}` }}
                            />
                            <Tooltip title="Tirar este grupo de dados">
                                <span>
                                    <IconButton
                                        size="small"
                                        aria-label={`Tirar o grupo de dados ${index + 1}`}
                                        disabled={draft.dices.length <= 1}
                                        onClick={() => { setDraft(removeConfig(draft, index)); }}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    ))}
                    <Box>
                        <Button size="small" startIcon={<Add />} onClick={() => { setDraft(addConfig(draft)); }} sx={{ textTransform: 'none' }}>Mais um grupo de dados</Button>
                    </Box>

                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Somar ao total</Typography>
                    {draft.modifiers.map((modifier, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }} data-testid={`dice-modifier-${index}`}>
                            <TextField
                                select
                                size="small"
                                label="Tipo"
                                value={modifier.kind}
                                SelectProps={{ native: true }}
                                onChange={event => { setDraft(updateModifier(draft, index, { kind: event.target.value as ModifierKind })); }}
                                sx={{ width: 170 }}
                            >
                                {(Object.keys(KIND_LABEL) as ModifierKind[]).map(kind => (<option key={kind} value={kind}>{KIND_LABEL[kind]}</option>))}
                            </TextField>
                            {modifier.kind === 'bonus' && (
                                <TextField
                                    label="Valor"
                                    type="number"
                                    size="small"
                                    value={modifier.bonus}
                                    onChange={event => { setDraft(updateModifier(draft, index, { bonus: Number(event.target.value) })); }}
                                    sx={{ width: 110 }}
                                    inputProps={{ min: -MAX_DICE_BONUS, max: MAX_DICE_BONUS, 'aria-label': `Valor do bônus ${index + 1}` }}
                                />
                            )}
                            {modifier.kind === 'attribute' && (
                                <TextField
                                    select
                                    size="small"
                                    label="Atributo"
                                    value={modifier.attribute}
                                    SelectProps={{ native: true }}
                                    onChange={event => { setDraft(updateModifier(draft, index, { attribute: event.target.value })); }}
                                    sx={{ width: 170 }}
                                >
                                    {attrDefs.map(definition => (<option key={definition.key} value={definition.key}>{definition.label}</option>))}
                                </TextField>
                            )}
                            {modifier.kind === 'expertise' && (
                                <TextField
                                    select
                                    size="small"
                                    label="Perícia"
                                    value={modifier.expertise}
                                    SelectProps={{ native: true }}
                                    onChange={event => { setDraft(updateModifier(draft, index, { expertise: event.target.value })); }}
                                    sx={{ width: 220 }}
                                >
                                    <option value="">Escolha uma perícia</option>
                                    {expertiseDefs.map(definition => (<option key={definition.key} value={definition.key}>{definition.name}</option>))}
                                </TextField>
                            )}
                            <IconButton size="small" aria-label={`Tirar o termo ${index + 1}`} onClick={() => { setDraft(removeModifier(draft, index)); }}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                    <Box>
                        <Button size="small" startIcon={<Add />} onClick={() => { setDraft(addModifier(draft, attributeKeys)); }} sx={{ textTransform: 'none' }}>
                            Somar bônus, atributo ou perícia
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 160 }} data-testid="dice-preview">
                            Fica: <Box component="span" sx={{ fontFamily: font.mono, color: 'text.primary' }}>{previewOf(draft)}</Box>
                        </Typography>
                        {draft.id && <Button onClick={() => { setDraft(emptyDraft()); }} color="secondary" sx={{ textTransform: 'none' }}>Cancelar edição</Button>}
                        <Button variant="contained" onClick={commit} disabled={!candidate || atLimit} startIcon={draft.id ? <Edit /> : <Add />}>
                            {draft.id ? 'Salvar dado' : 'Adicionar dado'}
                        </Button>
                    </Box>
                    {atLimit && <Typography variant="caption" color="warning.light">A criatura já tem {MAX_CREATURE_DICES} dados: tire um para acrescentar outro.</Typography>}
                </Paper>
            )}

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, maxHeight: 260, overflow: 'auto' }}>
                {dices.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>Nenhum dado adicionado</Typography>
                ) : (
                    <List dense>
                        {dices.map(dice => (
                            <ListItem
                                key={dice.id}
                                secondaryAction={!isReadOnly && (
                                    <Box>
                                        <Tooltip title="Editar dado">
                                            <IconButton edge="end" aria-label={`Editar o dado ${dice.name}`} onClick={() => { setDraft(draftFromDice(dice, attributeKeys)); }}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir dado">
                                            <IconButton edge="end" aria-label={`Excluir o dado ${dice.name}`} color="error" onClick={() => {
                                                setDices(dices.filter(candidateDice => candidateDice.id !== dice.id));
                                                if (draft.id === dice.id) setDraft(emptyDraft());
                                            }}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                            >
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                            <Typography variant="body2" fontWeight={600}>{dice.name}</Typography>
                                            <Chip label={describeCreatureDice(dice)} size="small" sx={{ height: 20, fontSize: 12, fontFamily: font.mono }} />
                                        </Box>
                                    }
                                    secondary={dice.description}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
}
