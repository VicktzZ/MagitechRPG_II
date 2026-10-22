import type { ReactElement } from 'react';
import {
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import type { CampaignWidget } from '@models';
import SectionAccordion from './SectionAccordion';
import type { WidgetPatch } from './types';

interface IdentitySectionProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
}

/** Seção "Identidade e Situação" do widget */
export default function IdentitySection({ widget, patch }: IdentitySectionProps): ReactElement {
    return (
        <SectionAccordion defaultExpanded summary={<Typography fontWeight={700}>{widget.icon} Identidade e Situação</Typography>}>
            <Grid container spacing={2}>
                <Grid item xs={8} sm={5}>
                    <TextField
                        fullWidth size="small" label="Nome"
                        value={widget.name}
                        onChange={(e) => patch({ name: e.target.value })}
                    />
                </Grid>
                <Grid item xs={4} sm={2}>
                    <TextField
                        fullWidth size="small" label="Ícone"
                        value={widget.icon ?? ''}
                        onChange={(e) => patch({ icon: e.target.value })}
                        placeholder="🚀"
                        inputProps={{ maxLength: 4 }}
                    />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <TextField
                        fullWidth size="small" label="Subtítulo"
                        value={widget.subtitle ?? ''}
                        onChange={(e) => patch({ subtitle: e.target.value })}
                        placeholder="Ex: Fragata de Exploração, Hospedaria"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth size="small" label="Status"
                        value={widget.status}
                        onChange={(e) => patch({ status: e.target.value })}
                        placeholder="Ex: Em órbita, Aberto ao público, Sob cerco"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth size="small" label="Localização"
                        value={widget.location ?? ''}
                        onChange={(e) => patch({ location: e.target.value })}
                        placeholder="Ex: Órbita de Kepler-442b, Distrito Portuário"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth size="small" multiline rows={2} label="Descrição"
                        value={widget.description ?? ''}
                        onChange={(e) => patch({ description: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={widget.playersCanManageResources !== false}
                                onChange={(e) => patch({ playersCanManageResources: e.target.checked })}
                            />
                        }
                        label="Jogadores podem ajustar recursos e estoque diretamente"
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                        Se desativado, somente o mestre pode alterar o valor dos recursos e a
                        quantidade do estoque — jogadores ainda podem depositar/retirar itens do
                        próprio inventário normalmente.
                    </Typography>
                </Grid>
            </Grid>
        </SectionAccordion>
    );
}
