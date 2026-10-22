import type { ReactElement } from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReportIcon from '@mui/icons-material/Report';
import { color as tokenColor } from '@themes/tokens';
import type { CampaignWidget, WidgetAlertSeverity, WidgetBountyStatus, WidgetPartStatus } from '@models';

export const bountyStatusConfig: Record<WidgetBountyStatus, { label: string; color: string }> = {
    open: { label: 'Aberta', color: tokenColor.cyan },
    pending: { label: 'Pendente', color: tokenColor.amber },
    done: { label: 'Concluída', color: tokenColor.success }
};

export const partStatusConfig: Record<WidgetPartStatus, { label: string; color: string }> = {
    operational: { label: 'Operacional', color: tokenColor.success },
    damaged: { label: 'Avariado', color: tokenColor.warning },
    critical: { label: 'Crítico', color: tokenColor.danger },
    offline: { label: 'Offline', color: tokenColor.inkMuted }
};

export const alertSeverityConfig: Record<WidgetAlertSeverity, { color: string; icon: ReactElement }> = {
    info: { color: tokenColor.cyan, icon: <InfoOutlinedIcon fontSize="small" /> },
    warning: { color: tokenColor.warning, icon: <WarningAmberIcon fontSize="small" /> },
    danger: { color: tokenColor.danger, icon: <ReportIcon fontSize="small" /> }
};

/** Condição geral derivada da barra de integridade */
export function integrityCondition(widget: CampaignWidget): { label: string; color: string } {
    const pct = widget.maxIntegrity > 0 ? (widget.integrity / widget.maxIntegrity) * 100 : 0;
    if (pct <= 0) return { label: 'DESTRUÍDO', color: tokenColor.inkMuted };
    if (pct < 25) return { label: 'CRÍTICO', color: tokenColor.danger };
    if (pct < 60) return { label: 'AVARIADO', color: tokenColor.warning };
    return { label: 'ESTÁVEL', color: tokenColor.success };
}
