import type { Dispatch, SetStateAction } from 'react';
import { Box, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { BoltOutlined, FavoriteBorder, ShieldOutlined } from '@mui/icons-material';
import { color } from '@themes/tokens';
import type { CreatureData } from './types';

interface StatsSectionProps {
    creatureData: CreatureData;
    setCreatureData: Dispatch<SetStateAction<CreatureData>>;
    isReadOnly: boolean;
}

/** Status da criatura: LP, MP e AP */
export default function StatsSection({ creatureData, setCreatureData, isReadOnly }: StatsSectionProps) {
    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Status</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    label="LP (Vida)"
                    type="number"
                    value={creatureData.stats.lp}
                    onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 0);
                        setCreatureData(prev => ({ ...prev, stats: { ...prev.stats, lp: val, maxLp: val } }));
                    }}
                    inputProps={{ min: 1 }}
                    disabled={isReadOnly}
                    sx={{ width: 130 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><FavoriteBorder sx={{ color: color.lp, fontSize: 18 }} /></InputAdornment> }}
                />
                <TextField
                    label="MP (Mana)"
                    type="number"
                    value={creatureData.stats.mp}
                    onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setCreatureData(prev => ({ ...prev, stats: { ...prev.stats, mp: val, maxMp: val } }));
                    }}
                    inputProps={{ min: 0 }}
                    disabled={isReadOnly}
                    sx={{ width: 130 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><BoltOutlined sx={{ color: color.mp, fontSize: 18 }} /></InputAdornment> }}
                />
                <TextField
                    label="AP (Ações)"
                    type="number"
                    value={creatureData.stats.ap}
                    onChange={(e) => setCreatureData(prev => ({ ...prev, stats: { ...prev.stats, ap: Math.max(0, parseInt(e.target.value) || 0) } }))}
                    inputProps={{ min: 0 }}
                    disabled={isReadOnly}
                    sx={{ width: 130 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><ShieldOutlined sx={{ color: color.ap, fontSize: 18 }} /></InputAdornment> }}
                />
            </Box>
        </Paper>
    );
}
