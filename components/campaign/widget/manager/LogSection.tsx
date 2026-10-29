import type { ReactElement } from 'react';
import {
    Box,
    Divider,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { CampaignWidget } from '@models';
import SectionAccordion from './SectionAccordion';
import type { WidgetPatch, WidgetPatchLabel } from './types';

interface LogSectionProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
    patchLabel: WidgetPatchLabel;
    newLogText: string;
    onNewLogTextChange: (text: string) => void;
}

/** Seção de registro/diário do widget */
export default function LogSection({ widget, patch, patchLabel, newLogText, onNewLogTextChange }: LogSectionProps): ReactElement {
    return (
        <SectionAccordion summary={<Typography fontWeight={700}>{widget.labels.log} ({widget.log.length})</Typography>}>
            <Box display="flex" flexDirection="column" gap={1.5}>
                <TextField
                    size="small" label="Rótulo da seção" sx={{ maxWidth: 260 }}
                    value={widget.labels.log}
                    onChange={(e) => patchLabel('log', e.target.value)}
                    helperText='Ex: "Diário de Bordo", "Registro"'
                />
                <TextField
                    fullWidth size="small" multiline rows={2}
                    label="Nova entrada (registrada ao salvar)"
                    value={newLogText}
                    onChange={(e) => onNewLogTextChange(e.target.value)}
                    placeholder="Ex: Dia 47 — atracamos na estação Hyperion para reabastecer."
                />
                {widget.log.length > 0 && (
                    <>
                        <Divider />
                        <Box display="flex" flexDirection="column" gap={1} maxHeight={200} overflow="auto">
                            {[ ...widget.log ]
                                .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                                .map(entry => (
                                    <Box key={entry.id} display="flex" alignItems="flex-start" gap={1}>
                                        <Box flex={1}>
                                            <Typography variant="caption" color="text.disabled">
                                                {new Date(entry.timestamp).toLocaleString('pt-BR')}
                                            </Typography>
                                            <Typography variant="body2">{entry.text}</Typography>
                                        </Box>
                                        <IconButton size="small" color="error"
                                            onClick={() => patch({ log: widget.log.filter(l => l.id !== entry.id) })}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                        </Box>
                    </>
                )}
            </Box>
        </SectionAccordion>
    );
}
