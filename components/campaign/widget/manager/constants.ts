import { color } from '@themes/tokens';
import type { WidgetAlertSeverity, WidgetBountyStatus, WidgetPartStatus } from '@models';

/** Cor inicial de um recurso novo (o seletor de cor exige hex): o ciano de mana e informação */
export const DEFAULT_RESOURCE_COLOR = color.cyan;

export const partStatusOptions: Array<{ value: WidgetPartStatus; label: string }> = [
    { value: 'operational', label: 'Operacional' },
    { value: 'damaged', label: 'Avariado' },
    { value: 'critical', label: 'Crítico' },
    { value: 'offline', label: 'Offline' }
];

export const alertSeverityOptions: Array<{ value: WidgetAlertSeverity; label: string }> = [
    { value: 'info', label: 'Informação' },
    { value: 'warning', label: 'Aviso' },
    { value: 'danger', label: 'Perigo' }
];

export const bountyStatusOptions: Array<{ value: WidgetBountyStatus; label: string }> = [
    { value: 'open', label: 'Aberta' },
    { value: 'pending', label: 'Pendente' },
    { value: 'done', label: 'Concluída' }
];
