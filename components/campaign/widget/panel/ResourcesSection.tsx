import type { ReactElement } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import type { CampaignWidget } from '@models';
import ResourceBar from './ResourceBar';
import AdjustRow from './AdjustRow';

interface ResourcesSectionProps {
    widget: CampaignWidget;
    isFinished: boolean;
    /** Jogadores podem ajustar os recursos diretamente (sempre verdadeiro para o mestre) */
    canManageResources: boolean;
    onAdjustResource: (resourceId: string, value: number) => Promise<void>;
}

/** Recursos (contadores com barra) do widget */
export default function ResourcesSection({ widget, isFinished, canManageResources, onAdjustResource }: ResourcesSectionProps): ReactElement | null {
    const theme = useTheme();

    if ((widget.resources?.length ?? 0) === 0) return null;

    return (
        <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                {widget.labels.resources}
            </Typography>
            <Box display="flex" flexDirection="column" gap={1} mt={0.5}>
                {widget.resources.map(resource => (
                    <Box key={resource.id}>
                        <ResourceBar
                            label={resource.name}
                            icon={resource.icon}
                            value={resource.value}
                            max={resource.max}
                            unit={resource.unit}
                            color={resource.color || theme.palette.info.main}
                        />
                        {canManageResources && (
                            <AdjustRow
                                value={resource.value}
                                max={resource.max}
                                disabled={isFinished}
                                onChange={async (v) => await onAdjustResource(resource.id, v)}
                            />
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
