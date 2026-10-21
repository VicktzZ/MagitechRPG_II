import type { ReactElement } from 'react';
import {
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import { NumberField } from '@components/misc';
import type { CampaignWidget } from '@models';
import SectionAccordion from './SectionAccordion';
import type { WidgetPatch, WidgetPatchLabel } from './types';

interface BarsSectionProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
    patchLabel: WidgetPatchLabel;
}

/** Seção "Barras Principais" (integridade e barra secundária) */
export default function BarsSection({ widget, patch, patchLabel }: BarsSectionProps): ReactElement {
    return (
        <SectionAccordion
            summary={(
                <Typography fontWeight={700}>
                    Barras Principais — {widget.labels.integrity} {widget.integrity}/{widget.maxIntegrity}
                    {widget.showSecondary ? ` · ${widget.labels.secondary} ${widget.secondary}/${widget.maxSecondary}` : ''}
                </Typography>
            )}
        >
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={widget.showIntegrity}
                                onChange={(e) => patch({ showIntegrity: e.target.checked })}
                            />
                        }
                        label="Barra principal"
                    />
                </Grid>
                {widget.showIntegrity && (
                    <>
                        <Grid item xs={4} sm={3}>
                            <TextField fullWidth size="small" label="Rótulo"
                                value={widget.labels.integrity}
                                onChange={(e) => patchLabel('integrity', e.target.value)} />
                        </Grid>
                        <Grid item xs={4} sm={3}>
                            <NumberField fullWidth size="small" label="Atual" min={0} max={widget.maxIntegrity}
                                value={widget.integrity} onChange={(integrity) => patch({ integrity })} />
                        </Grid>
                        <Grid item xs={4} sm={3}>
                            <NumberField fullWidth size="small" label="Máximo" min={1}
                                value={widget.maxIntegrity}
                                onChange={(maxIntegrity) => patch({ maxIntegrity, integrity: Math.min(widget.integrity, maxIntegrity) })} />
                        </Grid>
                    </>
                )}

                <Grid item xs={12} sm={3}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={widget.showSecondary}
                                onChange={(e) => patch({ showSecondary: e.target.checked })}
                            />
                        }
                        label="Barra secundária"
                    />
                </Grid>
                {widget.showSecondary && (
                    <>
                        <Grid item xs={4} sm={3}>
                            <TextField fullWidth size="small" label="Rótulo"
                                value={widget.labels.secondary}
                                onChange={(e) => patchLabel('secondary', e.target.value)} />
                        </Grid>
                        <Grid item xs={4} sm={3}>
                            <NumberField fullWidth size="small" label="Atual" min={0} max={widget.maxSecondary}
                                value={widget.secondary} onChange={(secondary) => patch({ secondary })} />
                        </Grid>
                        <Grid item xs={4} sm={3}>
                            <NumberField fullWidth size="small" label="Máximo" min={0}
                                value={widget.maxSecondary}
                                onChange={(maxSecondary) => patch({ maxSecondary, secondary: Math.min(widget.secondary, maxSecondary) })} />
                        </Grid>
                    </>
                )}
            </Grid>
        </SectionAccordion>
    );
}
