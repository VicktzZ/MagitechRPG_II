import { Box, Button, InputAdornment, TextField, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import type { CreatureData, ExpertiseDef } from './types';

interface ExpertisesTabProps {
    creatureData: CreatureData;
    isReadOnly: boolean;
    expertiseSearch: string;
    setExpertiseSearch: (search: string) => void;
    expertiseCount: number;
    filteredExpertiseDefs: ExpertiseDef[];
    clearExpertises: () => void;
    updateExpertise: (key: string, value: number, attrKey: string | null) => void;
}

/** Aba "Perícias": busca e valores (0–20) de cada perícia da criatura */
export default function ExpertisesTab({
    creatureData,
    isReadOnly,
    expertiseSearch,
    setExpertiseSearch,
    expertiseCount,
    filteredExpertiseDefs,
    clearExpertises,
    updateExpertise
}: ExpertisesTabProps) {
    return (
        <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    placeholder="Buscar perícia..."
                    value={expertiseSearch}
                    onChange={(e) => setExpertiseSearch(e.target.value)}
                    sx={{ flex: 1, minWidth: 200 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                />
                <Typography variant="caption" color="text.secondary">
                    {expertiseCount} definida(s) · valores 0–20
                </Typography>
                {!isReadOnly && expertiseCount > 0 && (
                    <Button size="small" color="inherit" onClick={clearExpertises}>Limpar</Button>
                )}
            </Box>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 1,
                maxHeight: 380,
                overflow: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2
            }}>
                {filteredExpertiseDefs.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 2 }}>
                        Nenhuma perícia encontrada
                    </Typography>
                ) : filteredExpertiseDefs.map(exp => {
                    const current = creatureData.expertises[exp.key]?.value || 0;
                    return (
                        <Box
                            key={exp.key}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 0.5,
                                borderRadius: 1,
                                bgcolor: current !== 0 ? 'background.raised' : 'transparent',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <Typography variant="body2" sx={{ flex: 1, fontSize: '0.85rem' }}>
                                {exp.name}
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                    ({exp.attrLabel})
                                </Typography>
                            </Typography>
                            <TextField
                                type="number"
                                value={current}
                                onChange={(e) => updateExpertise(exp.key, parseInt(e.target.value) || 0, exp.attrKey)}
                                inputProps={{ min: 0, max: 20, style: { textAlign: 'center' } }}
                                size="small"
                                sx={{ width: 64 }}
                                disabled={isReadOnly}
                            />
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
