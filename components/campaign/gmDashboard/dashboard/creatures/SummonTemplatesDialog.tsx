'use client';

import { Pets } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import { describeCreatureDice } from '@utils/combat/creatureDice';
import { SUMMON_TEMPLATES, type SummonTemplate } from '@utils/combat/summonTemplates';
import type { ReactElement } from 'react';

interface SummonTemplateListProps {
    /** Id do modelo sendo criado agora (o botão dele espera) */
    creatingId: string | null;
    onCreate: (template: SummonTemplate) => void;
}

/** A lista dos modelos: nome, de onde vem, vida/AP/dano e o botão de criar (separada do diálogo para poder ser testada fora do navegador) */
export function SummonTemplateList({ creatingId, onCreate }: SummonTemplateListProps): ReactElement {
    return (
        <Box component="ul" aria-label="Modelos de invocação" sx={{ m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }} data-testid="summon-templates">
            {SUMMON_TEMPLATES.map(template => (
                <Box
                    key={template.id}
                    component="li"
                    data-testid={`summon-template-${template.id}`}
                    sx={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.raised' }}
                >
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                        <Typography sx={{ fontWeight: 700 }}>{template.name}</Typography>
                        <Typography variant="caption" color="text.secondary" component="div">{template.source}</Typography>
                        <Typography variant="caption" component="div" sx={{ fontFamily: font.mono }}>
                            {[ `LP ${template.stats.lp}`, `AP ${template.stats.ap}`, ...template.dices.map(dice => `${dice.name} ${describeCreatureDice(dice)}`) ].join(' · ')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{template.description}</Typography>
                    </Box>
                    <Button
                        size="small"
                        variant="outlined"
                        disabled={creatingId !== null}
                        onClick={() => { onCreate(template); }}
                        aria-label={`Criar ${template.name}`}
                        sx={{ textTransform: 'none' }}
                    >
                        {creatingId === template.id ? 'Criando...' : 'Criar na campanha'}
                    </Button>
                </Box>
            ))}
        </Box>
    );
}

interface SummonTemplatesDialogProps extends SummonTemplateListProps {
    open: boolean;
    onClose: () => void;
}

/** "Modelos de invocação": o mestre cria na campanha, com um clique, o invocado de uma habilidade (golem, lacaios, espíritos, duplicata); depois o põe no combate sob o controle de um jogador */
export default function SummonTemplatesDialog({ open, onClose, creatingId, onCreate }: SummonTemplatesDialogProps): ReactElement {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="summon-templates-title">
            <DialogTitle id="summon-templates-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Pets fontSize="small" /> Modelos de invocação</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Vida, AP e dano vêm do texto das habilidades; os atributos são sugestão (ajuste no editor). Depois de criar, use &quot;Adicionar ao combate&quot; e escolha &quot;Invocado por&quot; o jogador que invocou.
                </Typography>
                <SummonTemplateList creatingId={creatingId} onCreate={onCreate} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" sx={{ textTransform: 'none' }}>Fechar</Button>
            </DialogActions>
        </Dialog>
    );
}
