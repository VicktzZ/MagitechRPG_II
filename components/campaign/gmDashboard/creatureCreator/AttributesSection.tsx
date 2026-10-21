import { Box, Chip, IconButton, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import type { RPGSystem } from '@models/entities';
import { attributeModifier } from './creatureStats';
import type { AttributeDef, CreatureData } from './types';

interface AttributesSectionProps {
    creatureData: CreatureData;
    attrDefs: AttributeDef[];
    rpgSystem: RPGSystem | null;
    isReadOnly: boolean;
    setAttribute: (key: string, value: number) => void;
}

/** Atributos da criatura, com o modificador (em dados) de cada um */
export default function AttributesSection({
    creatureData,
    attrDefs,
    rpgSystem,
    isReadOnly,
    setAttribute
}: AttributesSectionProps) {
    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Atributos
                {rpgSystem?.attributes?.length ? (
                    <Chip label={rpgSystem.name || 'Sistema customizado'} size="small" sx={{ ml: 1, height: 18, fontSize: '0.75rem' }} />
                ) : null}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {attrDefs.map(def => {
                    const value = creatureData.attributes[def.key] ?? 0;
                    const mod = attributeModifier(value);
                    return (
                        <Paper
                            key={def.key}
                            variant="outlined"
                            sx={{ p: 1, textAlign: 'center', width: 104, borderRadius: 2 }}
                        >
                            <Tooltip title={def.name} arrow>
                                <Typography variant="caption" fontWeight={700} color="text.secondary">
                                    {def.label}
                                </Typography>
                            </Tooltip>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25, mt: 0.5 }}>
                                <IconButton size="small" sx={{ p: 0.25 }} disabled={isReadOnly || value <= 0} onClick={() => setAttribute(def.key, value - 1)}>
                                    <Remove sx={{ fontSize: 14 }} />
                                </IconButton>
                                <TextField
                                    type="number"
                                    value={value}
                                    onChange={(e) => setAttribute(def.key, Number(e.target.value))}
                                    inputProps={{ min: 0, max: 30, style: { textAlign: 'center', padding: '4px 0' } }}
                                    variant="standard"
                                    disabled={isReadOnly}
                                    sx={{ width: 34 }}
                                    InputProps={{ disableUnderline: true }}
                                />
                                <IconButton size="small" sx={{ p: 0.25 }} disabled={isReadOnly || value >= 30} onClick={() => setAttribute(def.key, value + 1)}>
                                    <Add sx={{ fontSize: 14 }} />
                                </IconButton>
                            </Box>
                            <Typography variant="caption" sx={{ color: mod >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                                {mod >= 0 ? `+${mod}` : mod} dado(s)
                            </Typography>
                        </Paper>
                    );
                })}
            </Box>
        </Paper>
    );
}
