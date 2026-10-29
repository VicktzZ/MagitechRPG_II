import type { ReactElement } from 'react';
import { Box, useTheme } from '@mui/material';
import type { CampaignWidget } from '@models';
import ResourceBar from './ResourceBar';
import AdjustRow from './AdjustRow';

interface MainBarsSectionProps {
    widget: CampaignWidget;
    isFinished: boolean;
    onAdjustBar: (bar: 'integrity' | 'secondary', value: number) => Promise<void>;
}

/** Barras principais: integridade e reserva secundária */
export default function MainBarsSection({ widget, isFinished, onAdjustBar }: MainBarsSectionProps): ReactElement | null {
    const theme = useTheme();
    const labels = widget.labels;
    const integrityPct = widget.maxIntegrity > 0 ? (widget.integrity / widget.maxIntegrity) * 100 : 0;
    const secondaryPct = widget.maxSecondary > 0 ? (widget.secondary / widget.maxSecondary) * 100 : 0;

    if (!widget.showIntegrity && !widget.showSecondary) return null;

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            {widget.showIntegrity && (
                <Box>
                    <ResourceBar
                        label={labels.integrity}
                        value={widget.integrity}
                        max={widget.maxIntegrity}
                        color={integrityPct < 25 ? theme.palette.error.main : integrityPct < 60 ? theme.palette.warning.main : theme.palette.success.main}
                    />
                    <AdjustRow
                        value={widget.integrity}
                        max={widget.maxIntegrity}
                        disabled={isFinished}
                        onChange={async (v) => await onAdjustBar('integrity', v)}
                    />
                </Box>
            )}
            {widget.showSecondary && (
                <Box>
                    <ResourceBar
                        label={labels.secondary}
                        icon="◆"
                        value={widget.secondary}
                        max={widget.maxSecondary}
                        color={secondaryPct < 30 ? theme.palette.warning.main : theme.palette.info.main}
                    />
                    <AdjustRow
                        value={widget.secondary}
                        max={widget.maxSecondary}
                        disabled={isFinished}
                        onChange={async (v) => await onAdjustBar('secondary', v)}
                    />
                </Box>
            )}
        </Box>
    );
}
