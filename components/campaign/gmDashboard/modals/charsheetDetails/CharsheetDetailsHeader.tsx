import { Alert, Box, Chip, CircularProgress, DialogTitle, IconButton, TextField, Tooltip, Typography, alpha } from '@mui/material';
import { Cancel, Edit, Save } from '@mui/icons-material';
import { getInputValue } from './charsheetEdit';
import type { CharsheetTabProps, HandleNumberInputChange } from './types';

interface CharsheetDetailsHeaderProps extends CharsheetTabProps {
    isSaving: boolean;
    handleNumberInputChange: HandleNumberInputChange;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSave: () => void;
}

/** Título do modal: nome, nível, jogador, classe e botões de edição */
export default function CharsheetDetailsHeader({
    charsheet,
    editedData,
    isEditing,
    isSaving,
    updateNestedField,
    handleNumberInputChange,
    onStartEdit,
    onCancelEdit,
    onSave
}: CharsheetDetailsHeaderProps) {
    return (
        <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        {isEditing ? (
                            <TextField
                                size="small"
                                value={editedData.name || ''}
                                onChange={(e) => updateNestedField('name', e.target.value)}
                                label="Nome"
                                sx={{ mr: 1 }}
                            />
                        ) : (
                            <Typography variant="h6">
                                {charsheet.name} - Nível {charsheet.level}
                            </Typography>
                        )}
                        {isEditing && (
                            <TextField
                                size="small"
                                type="number"
                                value={getInputValue(editedData.level, 0)}
                                onChange={(e) => handleNumberInputChange('level', e.target.value)}
                                label="Nível"
                                sx={{ width: 80 }}
                            />
                        )}
                        <Typography color="textSecondary" variant="subtitle1">({charsheet.id})</Typography>
                    </Box>
                    {isEditing ? (
                        <TextField
                            size="small"
                            value={editedData.playerName || ''}
                            onChange={(e) => updateNestedField('playerName', e.target.value)}
                            label="Jogador"
                            sx={{ mt: 1 }}
                            fullWidth
                        />
                    ) : (
                        <Typography variant="subtitle1">
                            {charsheet.playerName}
                        </Typography>
                    )}
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                        label={`${charsheet.class as string} ${charsheet.subclass ? `/ ${charsheet.subclass as string}` : ''}`}
                        color="primary"
                    />
                    {!isEditing ? (
                        <Tooltip title="Editar ficha">
                            <IconButton
                                onClick={onStartEdit}
                                sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14), color: 'primary.main' }}
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Box display="flex" gap={0.5}>
                            <Tooltip title="Cancelar">
                                <IconButton
                                    onClick={onCancelEdit}
                                    disabled={isSaving}
                                    sx={{ bgcolor: (theme) => alpha(theme.palette.error.main, 0.14), color: 'error.main' }}
                                >
                                    <Cancel />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Salvar alterações">
                                <IconButton
                                    onClick={onSave}
                                    disabled={isSaving}
                                    sx={{ bgcolor: (theme) => alpha(theme.palette.success.main, 0.14), color: 'success.main' }}
                                >
                                    {isSaving ? <CircularProgress size={24} /> : <Save />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </Box>
            </Box>
            {isEditing && (
                <Alert severity="info" sx={{ mt: 1 }}>
                    Modo de edição ativo. Faça suas alterações e clique em Salvar.
                </Alert>
            )}
        </DialogTitle>
    );
}
