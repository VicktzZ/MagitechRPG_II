import type { ReactElement } from 'react';
import { alpha, Box, Typography } from '@mui/material';
import type { CampaignWidget } from '@models';
import { alertSeverityConfig } from './panelConfig';

/** Alertas do widget (info, aviso, perigo) */
export default function AlertsSection({ widget }: { widget: CampaignWidget }): ReactElement | null {
    if ((widget.alerts?.length ?? 0) === 0) return null;

    return (
        <Box display="flex" flexDirection="column" gap={0.5}>
            {widget.alerts.map(alert => {
                const cfg = alertSeverityConfig[alert.severity] ?? alertSeverityConfig.info;
                return (
                    <Box
                        key={alert.id}
                        display="flex"
                        alignItems="center"
                        gap={0.75}
                        px={1}
                        py={0.5}
                        borderRadius={1.5}
                        sx={{
                            bgcolor: alpha(cfg.color, 0.1),
                            border: `1px solid ${alpha(cfg.color, 0.35)}`,
                            color: cfg.color
                        }}
                    >
                        {cfg.icon}
                        <Typography variant="caption" fontWeight={600} color="inherit">
                            {alert.text}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
}
