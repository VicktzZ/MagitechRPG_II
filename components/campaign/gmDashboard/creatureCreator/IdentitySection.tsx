import type { Dispatch, SetStateAction } from 'react';
import { Autocomplete, Avatar, Box, InputAdornment, TextField, alpha } from '@mui/material';
import { ImageOutlined } from '@mui/icons-material';
import { CREATURE_TYPE_SUGGESTIONS } from './constants';
import { clamp } from './creatureStats';
import type { CreatureData } from './types';

interface IdentitySectionProps {
    creatureData: CreatureData;
    setCreatureData: Dispatch<SetStateAction<CreatureData>>;
    isReadOnly: boolean;
}

/** Retrato, nome, nível, tipo, imagem e descrição da criatura */
export default function IdentitySection({ creatureData, setCreatureData, isReadOnly }: IdentitySectionProps) {
    return (
        <>
            {/* Identidade */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                <Avatar
                    variant="rounded"
                    src={creatureData.imageUrl || undefined}
                    sx={{ width: 96, height: 96, bgcolor: (theme) => alpha(theme.palette.warning.main, 0.14), color: 'warning.main', border: '1px solid', borderColor: 'divider' }}
                >
                    <ImageOutlined sx={{ fontSize: 40 }} />
                </Avatar>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 240 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            label="Nome da Criatura"
                            value={creatureData.name}
                            onChange={(e) => setCreatureData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            disabled={isReadOnly}
                            sx={{ flex: 1, minWidth: 180 }}
                        />
                        <TextField
                            label="Nível"
                            type="number"
                            value={creatureData.level}
                            onChange={(e) => setCreatureData(prev => ({ ...prev, level: clamp(Number(e.target.value) || 1, 1, 30) }))}
                            inputProps={{ min: 1, max: 30 }}
                            sx={{ width: 96 }}
                            disabled={isReadOnly}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Autocomplete
                            freeSolo
                            options={CREATURE_TYPE_SUGGESTIONS}
                            value={creatureData.type || ''}
                            onChange={(_, v) => setCreatureData(prev => ({ ...prev, type: v || '' }))}
                            onInputChange={(_, v) => setCreatureData(prev => ({ ...prev, type: v }))}
                            disabled={isReadOnly}
                            sx={{ width: 200 }}
                            renderInput={(params) => <TextField {...params} label="Tipo / Categoria" placeholder="Ex: Fera" />}
                        />
                        <TextField
                            label="URL da Imagem"
                            value={creatureData.imageUrl || ''}
                            onChange={(e) => setCreatureData(prev => ({ ...prev, imageUrl: e.target.value }))}
                            placeholder="https://..."
                            disabled={isReadOnly}
                            sx={{ flex: 1, minWidth: 200 }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><ImageOutlined fontSize="small" /></InputAdornment> }}
                        />
                    </Box>
                </Box>
            </Box>

            <TextField
                label="Descrição"
                value={creatureData.description}
                onChange={(e) => setCreatureData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={2}
                fullWidth
                disabled={isReadOnly}
            />
        </>
    );
}
