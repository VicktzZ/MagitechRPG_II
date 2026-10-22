import { Box, Chip, alpha } from '@mui/material';
import { FavoriteBorder, BoltOutlined, ShieldOutlined } from '@mui/icons-material';
import { color } from '@themes/tokens';
import type { CreatureData } from './types';

interface CreatureSummaryChipsProps {
    creatureData: CreatureData;
    attributeSum: number;
    expertiseCount: number;
}

const iconSx = (tone: string) => ({ fontSize: '0.9rem !important', color: `${tone} !important` });

/** Cabeçalho de resumo (feedback ao vivo) da criatura */
export default function CreatureSummaryChips({ creatureData, attributeSum, expertiseCount }: CreatureSummaryChipsProps) {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
            <Chip size="small" label={`Nível ${creatureData.level}`} sx={{ bgcolor: (theme) => alpha(theme.palette.success.main, 0.14), color: 'success.main', fontWeight: 700 }} />
            <Chip size="small" icon={<FavoriteBorder sx={iconSx(color.lp)} />} label={creatureData.stats.lp} sx={{ bgcolor: alpha(color.lp, 0.14), color: 'error.light' }} />
            <Chip size="small" icon={<BoltOutlined sx={iconSx(color.mp)} />} label={creatureData.stats.mp} sx={{ bgcolor: alpha(color.mp, 0.14), color: color.mp }} />
            <Chip size="small" icon={<ShieldOutlined sx={iconSx(color.ap)} />} label={`${creatureData.stats.ap} AP`} sx={{ bgcolor: alpha(color.ap, 0.14), color: 'text.secondary' }} />
            <Chip size="small" label={`Σ Atrib. ${attributeSum}`} variant="outlined" />
            {creatureData.skills.length > 0 && (
                <Chip
                    size="small"
                    label={`${creatureData.skills.length} habilidade(s)`}
                    sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14), color: 'primary.main' }}
                />
            )}
            {creatureData.spells.length > 0 && (
                <Chip
                    size="small"
                    label={`${creatureData.spells.length} magia(s)`}
                    sx={{ bgcolor: (theme) => alpha(theme.palette.info.main, 0.14), color: 'info.main' }}
                />
            )}
            {expertiseCount > 0 && <Chip size="small" label={`${expertiseCount} perícia(s)`} variant="outlined" />}
        </Box>
    );
}
