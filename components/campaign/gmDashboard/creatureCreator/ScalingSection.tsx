import { Box, Button, Collapse, Paper, TextField, Typography } from '@mui/material';
import { ExpandMore, TuneRounded } from '@mui/icons-material';
import { clamp } from './creatureStats';
import type { CreatureData } from './types';

interface ScalingSectionProps {
    baseCreature: CreatureData | null;
    scalingOpen: boolean;
    setScalingOpen: (update: (open: boolean) => boolean) => void;
    scalingLevel: number;
    setScalingLevel: (level: number) => void;
    scalingPlayers: number;
    setScalingPlayers: (players: number) => void;
    onApply: () => void;
}

/** Escalonamento (avançado) por nível e tamanho do grupo */
export default function ScalingSection({
    baseCreature,
    scalingOpen,
    setScalingOpen,
    scalingLevel,
    setScalingLevel,
    scalingPlayers,
    setScalingPlayers,
    onApply
}: ScalingSectionProps) {
    return (
        <Box>
            <Button
                size="small"
                startIcon={<TuneRounded />}
                endIcon={<ExpandMore sx={{ transform: scalingOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
                onClick={() => setScalingOpen(o => !o)}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
                Escalonamento por nível e jogadores
            </Button>
            <Collapse in={scalingOpen}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mt: 1, borderStyle: 'dashed' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        Ajusta atributos, status e perícias {baseCreature ? 'da versão salva' : 'atuais'} para um nível alvo e tamanho de grupo.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            label="Nível alvo"
                            type="number"
                            value={scalingLevel}
                            onChange={(e) => setScalingLevel(clamp(Number(e.target.value) || 1, 1, 30))}
                            inputProps={{ min: 1, max: 30 }}
                            sx={{ width: 120 }}
                        />
                        <TextField
                            label="Qtd. jogadores"
                            type="number"
                            value={scalingPlayers}
                            onChange={(e) => setScalingPlayers(clamp(Number(e.target.value) || 4, 1, 8))}
                            inputProps={{ min: 1, max: 8 }}
                            sx={{ width: 140 }}
                        />
                        <Button
                            variant="outlined"
                            onClick={onApply}
                            disabled={!baseCreature}
                        >
                            Aplicar ajuste
                        </Button>
                        {!baseCreature && (
                            <Typography variant="caption" color="text.secondary">
                                Salve a criatura primeiro para usar o escalonamento.
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Collapse>
        </Box>
    );
}
