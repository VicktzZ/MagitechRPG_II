import { Box, Button, Tooltip, Typography } from '@mui/material';
import { ROLE_PRESETS, type RolePreset } from './constants';

interface RolePresetsProps {
    onApply: (preset: RolePreset) => void;
}

/** Presets rápidos: preenchem um bloco de estatísticas pelo papel da criatura */
export default function RolePresets({ onApply }: RolePresetsProps) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Preencha rapidamente um bloco de estatísticas pelo papel da criatura (escalado pelo nível atual):
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {ROLE_PRESETS.map(preset => (
                    <Tooltip key={preset.id} title={preset.desc} arrow>
                        <Button
                            variant="outlined"
                            onClick={() => onApply(preset)}
                            sx={{
                                borderColor: preset.color,
                                color: preset.color,
                                textTransform: 'none',
                                '&:hover': { borderColor: preset.color, bgcolor: 'action.hover' }
                            }}
                        >
                            {preset.label}
                        </Button>
                    </Tooltip>
                ))}
            </Box>
        </Box>
    );
}
