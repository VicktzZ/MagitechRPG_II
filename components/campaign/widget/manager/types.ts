import type { CampaignWidget } from '@models';

/** Aplica alterações ao widget que está sendo editado (o ativo no diálogo) */
export type WidgetPatch = (changes: Partial<CampaignWidget>) => void;

/** Altera o rótulo de uma seção do widget que está sendo editado */
export type WidgetPatchLabel = (key: keyof CampaignWidget['labels'], value: string) => void;
