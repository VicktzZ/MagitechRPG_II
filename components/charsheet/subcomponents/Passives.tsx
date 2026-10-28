/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
    Box,
    Typography,
    Button,
    TextField,
    IconButton,
    Card,
    CardContent,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery,
    useTheme,
    Chip
} from '@mui/material';
import { Add, Delete, Edit, EventNote } from '@mui/icons-material';
import { useFormContext, useWatch } from 'react-hook-form';
import { color } from '@themes/tokens';
import type { PassiveOccasion } from '@models/types/string';
import type { Charsheet } from '@models/entities';
import type { Passive } from '@models';
import { useCampaignCurrentCharsheetContext } from '@contexts';

/** Ficha sem passivas: a mesma lista vazia a cada render (não cria um array novo) */
const NO_PASSIVES: Passive[] = [];

const occasionOptions: PassiveOccasion[] = [
    'Início do turno',
    'Final do turno',
    'Ao ser atacado',
    'Ao atacar',
    'Ao usar magia',
    'Ao sofrer dano',
    'Ao causar dano',
    'Sempre ativo',
    'Quando curar',
    'Ao se deslocar',
    'Condição específica',
    'Personalizado'
];

// Mapeamento de cores para ocasiões (pelo papel: dano/ataque sofrido em vermelho, turno e magia em ciano,
// cura em verde, aviso em laranja, neutros para o que não tem gatilho próprio)
const occasionColors: Record<PassiveOccasion, string> = {
    'Início do turno': color.cyan,
    'Final do turno': color.cyan,
    'Ao ser atacado': color.danger,
    'Ao atacar': color.amber,
    'Ao usar magia': color.mp,
    'Ao sofrer dano': color.danger,
    'Ao causar dano': color.danger,
    'Sempre ativo': color.inkMuted,
    'Quando curar': color.success,
    'Ao se deslocar': color.cyan,
    'Condição específica': color.warning,
    'Personalizado': color.inkFaint
};

interface PassiveFormData {
    id?: string;
    title: string;
    description: string;
    occasion: PassiveOccasion;
    custom: boolean;
}

export default function Passives({ realtime = false }: { realtime?: boolean }) {
    const { control, setValue, getValues } = useFormContext<Charsheet>();
    const { updateCharsheet } = useCampaignCurrentCharsheetContext()
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [ open, setOpen ] = useState(false);
    const [ editingPassive, setEditingPassive ] = useState<PassiveFormData | null>(null);
    
    // Observar as passivas. Sem `defaultValue`: na primeira renderização ele vence o valor da ficha (ver `Expertises.tsx`) e as passivas salvas não apareciam
    const passives = useWatch<Charsheet, 'passives'>({
        control,
        name: 'passives'
    }) ?? NO_PASSIVES;
    
    const handleOpen = () => {
        setEditingPassive({
            title: '',
            description: '',
            occasion: 'Sempre ativo',
            custom: false
        });
        setOpen(true);
    };
    
    const handleEdit = (passive: Passive) => {
        setEditingPassive({
            id: passive.id,
            title: passive.title,
            description: passive.description,
            occasion: passive.occasion,
            custom: passive.custom || false
        });
        setOpen(true);
        if (realtime) {
            updateCharsheet({ passives: getValues('passives') });
        }
    };
    
    const handleClose = () => {
        setOpen(false);
        setEditingPassive(null);
    };
    
    const handleDelete = (id: string) => {
        const updatedPassives = passives.filter(p => p.id !== id);
        setValue('passives', updatedPassives, { shouldValidate: true });
        if (realtime) {
            updateCharsheet({ passives: updatedPassives });
        }
    };
    
    const handleSave = () => {
        if (!editingPassive?.title.trim()) return;
        
        const currentPassives = [ ...getValues('passives') ];
        const newPassive: Passive = {
            id: editingPassive.id ?? uuidv4(),
            title: editingPassive.title,
            description: editingPassive.description,
            occasion: editingPassive.occasion,
            custom: editingPassive.custom
        };
        
        // Se for edição, substituir a passiva existente
        if (editingPassive.id) {
            const index = currentPassives.findIndex(p => p.id === editingPassive.id);
            if (index !== -1) {
                currentPassives[index] = newPassive;
            }
        } else {
            // Caso contrário, adicionar nova passiva
            currentPassives.push(newPassive);
        }
        
        setValue('passives', currentPassives, { shouldValidate: true });
        handleClose();
        if (realtime) {
            updateCharsheet({ passives: currentPassives });
        }
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                    <EventNote sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" component="h3" fontWeight="bold">
                        Habilidades Passivas
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<Add />}
                    onClick={handleOpen}
                >
                    Adicionar
                </Button>
            </Box>

            {passives.length === 0 ? (
                <Typography color="text.secondary" align="center" py={2}>
                    Sem habilidades passivas. Adicione uma nova habilidade passiva clicando no botão acima.
                </Typography>
            ) : (
                <Grid container spacing={2}>
                    {passives.map((passive) => (
                        <Grid item xs={12} md={6} key={passive.id}>
                            <Card 
                                variant="outlined" 
                                sx={{ 
                                    position: 'relative',
                                    borderLeft: `4px solid ${occasionColors[passive.occasion] || color.inkMuted}`
                                }}
                            >
                                <CardContent sx={{ pb: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="h6" component="h4" gutterBottom fontWeight="bold">
                                            {passive.title.length > 20 ? `${passive.title.slice(0, 20)}...` : passive.title}
                                        </Typography>
                                        <Box>
                                            <Chip 
                                                size="small" 
                                                label={passive.occasion}
                                                sx={{ 
                                                    bgcolor: occasionColors[passive.occasion] || color.inkMuted,
                                                    color: theme.palette.getContrastText(occasionColors[passive.occasion] || color.inkMuted),
                                                    fontSize: '0.7rem',
                                                    mb: 1
                                                }} 
                                            />
                                        </Box>
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                                        {passive.description.length > 50 ? `${passive.description.slice(0, 50)}...` : passive.description}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                        <IconButton 
                                            size="small" 
                                            aria-label={`Editar passiva ${passive.title}`}
                                            onClick={() => handleEdit(passive)}
                                            sx={{ color: 'primary.main' }}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            aria-label={`Excluir passiva ${passive.title}`}
                                            onClick={() => handleDelete(passive.id)}
                                            sx={{ color: 'error.main' }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
            
            {/* Modal de adição/edição de passiva */}
            <Dialog 
                open={open} 
                onClose={handleClose} 
                fullWidth 
                maxWidth="sm"
                fullScreen={isMobile}
            >
                <DialogTitle>
                    {editingPassive?.id ? 'Editar Habilidade Passiva' : 'Nova Habilidade Passiva'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Título"
                            fullWidth
                            value={editingPassive?.title || ''}
                            onChange={(e) => setEditingPassive(prev => prev ? { ...prev, title: e.target.value } : null)}
                            required
                        />
                        
                        <FormControl fullWidth>
                            <InputLabel id="occasion-label">Ocasião</InputLabel>
                            <Select
                                labelId="occasion-label"
                                value={editingPassive?.occasion || 'Sempre ativo'}
                                onChange={(e) => setEditingPassive(prev => prev ? { 
                                    ...prev, 
                                    occasion: e.target.value as PassiveOccasion,
                                    custom: e.target.value === 'Personalizado'
                                } : null)}
                                label="Ocasião"
                            >
                                {occasionOptions.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <TextField
                            label="Descrição"
                            fullWidth
                            multiline
                            rows={4}
                            value={editingPassive?.description || ''}
                            onChange={(e) => setEditingPassive(prev => prev ? { ...prev, description: e.target.value } : null)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit">Cancelar</Button>
                    <Button onClick={handleSave} color="primary" variant="contained" disabled={!editingPassive?.title}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
