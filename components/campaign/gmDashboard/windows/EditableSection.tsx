'use client';

import type { CharsheetDTO } from '@models/dtos';
import { Cancel, Edit, Save } from '@mui/icons-material';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import type { ReactElement, ReactNode } from 'react';
import type { CharsheetTabProps, HandleNumberInputChange } from '../modals/charsheetDetails/types';
import { useCharsheetEditing } from '../modals/charsheetDetails/useCharsheetEditing';
import { useCharsheetPointsView } from '../useCharsheetPointsView';

type Sheet = Required<CharsheetDTO>;

/** O que cada seção recebe: as props das abas do antigo modal de detalhes, já ligadas à edição desta janela */
export interface SectionRenderProps extends CharsheetTabProps {
    handleNumberInputChange: HandleNumberInputChange;
    weightUnit: string;
}

interface EditableSectionProps {
    charsheet: Sheet;
    children: (props: SectionRenderProps) => ReactNode;
}

/**
 * Casca de uma seção editável da ficha: botão Editar, Cancelar e Salvar e o estado de edição da janela.
 * Cada janela tem o seu: salvar grava só os campos que o mestre mexeu ali (por caminho), então duas seções da
 * mesma ficha podem estar em edição ao mesmo tempo sem uma desfazer a outra, nem o que o jogador mudou.
 *
 * O corpo da janela é um container: as grades de duas colunas das abas viram uma coluna quando a janela é
 * estreita (as grades do MUI olham a largura da tela, não a da janela).
 */
export default function EditableSection({ charsheet, children }: EditableSectionProps): ReactElement {
    const { weightUnit } = useCharsheetPointsView(charsheet);
    const editing = useCharsheetEditing({ open: true, charsheet });

    return (
        <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ minHeight: 32 }}>
                <Typography variant="body2" color="text.secondary">
                    {editing.isEditing ? 'Modo de edição: altere os campos e salve.' : ''}
                </Typography>
                {editing.isEditing ? (
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            disabled={editing.isSaving}
                            onClick={editing.handleCancelEdit}
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={editing.isSaving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                            disabled={editing.isSaving}
                            onClick={editing.handleSave}
                        >
                            Salvar
                        </Button>
                    </Stack>
                ) : (
                    <Button size="small" variant="outlined" startIcon={<Edit />} onClick={() => editing.setIsEditing(true)}>
                        Editar
                    </Button>
                )}
            </Stack>

            <Box
                sx={{
                    '@container (max-width: 599px)': {
                        '& .MuiGrid-grid-md-6': { flexBasis: '100%', maxWidth: '100%' }
                    }
                }}
            >
                {children({
                    charsheet,
                    editedData: editing.editedData,
                    isEditing: editing.isEditing,
                    updateNestedField: editing.updateNestedField,
                    handleNumberInputChange: editing.handleNumberInputChange,
                    weightUnit
                })}
            </Box>
        </Stack>
    );
}
