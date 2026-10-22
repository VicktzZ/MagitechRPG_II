import { Avatar, Box, DialogTitle, Typography, alpha } from '@mui/material';
import { Pets as PetsIcon } from '@mui/icons-material';
import CreatureSummaryChips from './CreatureSummaryChips';
import type { CreatureData } from './types';

interface CreatureHeaderProps {
    creatureData: CreatureData;
    isReadOnly: boolean;
    /** `true` ao editar uma criatura existente */
    isEditingExisting: boolean;
    attributeSum: number;
    expertiseCount: number;
}

/** Título do diálogo: retrato, nome, tipo e resumo da criatura */
export default function CreatureHeader({
    creatureData,
    isReadOnly,
    isEditingExisting,
    attributeSum,
    expertiseCount
}: CreatureHeaderProps) {
    return (
        <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                    src={creatureData.imageUrl || undefined}
                    sx={{ bgcolor: (theme) => alpha(theme.palette.warning.main, 0.14), color: 'warning.main', width: 44, height: 44 }}
                >
                    <PetsIcon />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={700} noWrap>
                        {isReadOnly ? 'Detalhes da Criatura' : (isEditingExisting ? 'Editar Criatura' : 'Criar Criatura')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                        {creatureData.name || 'Sem nome'}
                        {creatureData.type ? ` · ${creatureData.type}` : ''}
                    </Typography>
                </Box>
            </Box>
            <CreatureSummaryChips
                creatureData={creatureData}
                attributeSum={attributeSum}
                expertiseCount={expertiseCount}
            />
        </DialogTitle>
    );
}
