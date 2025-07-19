import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider,
    Paper,
    IconButton,
    useTheme,
    useMediaQuery,
    Card,
    CardContent
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { subclasses } from '@constants/subclasses';
import { skills } from '@constants/skills';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { blue, orange } from '@mui/material/colors';
import type { Classes, Subclasses } from '@types';

interface SubclassModalProps {
    open: boolean;
    onClose: () => void;
    currentClass: Classes | null;
    onConfirm: (subclass: Subclasses) => void;
}

const obj = {}

function SubclassModal({ open, onClose, currentClass, onConfirm }: SubclassModalProps) {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const [ selectedSubclass, setSelectedSubclass ] = useState<Subclasses | null>(null);
    const [ availableSubclasses, setAvailableSubclasses ] = useState<Partial<Record<Subclasses, { description: string }>>>({});

    // Ao inicializar, carregar as subclasses disponíveis para a classe atual
    useEffect(() => {
        if (currentClass) {
            setAvailableSubclasses(subclasses[currentClass] || obj as Partial<Record<Subclasses, { description: string }>>);
        } else {
            setAvailableSubclasses(obj as Partial<Record<Subclasses, { description: string }>>);
        }
        // Resetar a seleção quando a classe mudar
        setSelectedSubclass(null);
    }, [ currentClass ]);

    // Manipular seleção de subclasse
    const handleSubclassSelect = (subclassName: Subclasses) => {
        setSelectedSubclass(subclassName);
    };

    // Confirmar seleção
    const handleConfirm = () => {
        if (selectedSubclass) {
            onConfirm(selectedSubclass);
            onClose();
        }
    };

    // Buscar habilidades da subclasse selecionada
    const getSubclassSkills = () => {
        if (!selectedSubclass) return [];
        return skills.subclass[selectedSubclass as keyof typeof skills.subclass] || [];
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-subclasse-titulo"
            closeAfterTransition
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: matches ? '95%' : 800,
                    maxHeight: '90vh',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: 2,
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="h6" component="h2">
                        Escolha sua Subclasse
                    </Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={onClose}
                        aria-label="fechar"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Conteúdo */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: matches ? 'column' : 'row',
                        height: '100%',
                        maxHeight: 'calc(90vh - 130px)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Seção de Seleção */}
                    <Box
                        sx={{
                            flex: matches ? '0 0 auto' : '0 0 35%',
                            borderRight: matches ? 'none' : `1px solid ${theme.palette.divider}`,
                            borderBottom: matches ? `1px solid ${theme.palette.divider}` : 'none',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Subclasses de {currentClass}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Selecione uma subclasse para ver detalhes
                            </Typography>
                        </Box>

                        <Box sx={{ overflow: 'auto', maxHeight: matches ? '200px' : '100%' }}>
                            <List dense>
                                {Object.entries(availableSubclasses).map(([ name ]) => (
                                    <ListItem
                                        key={name}
                                        button
                                        onClick={() => handleSubclassSelect(name as Subclasses)}
                                        sx={{
                                            bgcolor: selectedSubclass === name 
                                                ? alpha(orange[500], 0.1) 
                                                : 'transparent',
                                            '&:hover': {
                                                bgcolor: selectedSubclass === name 
                                                    ? alpha(orange[500], 0.2) 
                                                    : alpha(theme.palette.action.hover, 0.1)
                                            }
                                        }}
                                        secondaryAction={
                                            selectedSubclass === name && (
                                                <CheckCircleIcon 
                                                    sx={{ color: orange[500] }} 
                                                    fontSize="small" 
                                                />
                                            )
                                        }
                                    >
                                        <ListItemText
                                            primary={name}
                                            primaryTypographyProps={{
                                                fontWeight: selectedSubclass === name ? 'bold' : 'normal'
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>

                    {/* Seção de Detalhes */}
                    <Box
                        sx={{
                            flex: matches ? '0 0 auto' : '1 1 65%',
                            p: 2,
                            overflow: 'auto',
                            maxHeight: matches ? '400px' : 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        {selectedSubclass && availableSubclasses[selectedSubclass] ? (
                            <>
                                <Box>
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        {selectedSubclass}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Chip
                                            label={`Subclasse de ${currentClass}`}
                                            color="primary"
                                            size="small"
                                            icon={<PsychologyIcon />}
                                        />
                                        <Chip
                                            label="Nível 10+"
                                            color="secondary"
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                    
                                    <Divider sx={{ mb: 2 }} />
                                    
                                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                                        Descrição:
                                    </Typography>
                                    
                                    <Paper 
                                        elevation={0} 
                                        sx={{ 
                                            p: 2, 
                                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.primary.main, 0.2),
                                            borderRadius: 1,
                                            mb: 2
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                                            {availableSubclasses[selectedSubclass].description}
                                        </Typography>
                                    </Paper>
                                    
                                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                                        Habilidades:
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {getSubclassSkills().length > 0 ? (
                                            getSubclassSkills().map((skill, index) => (
                                                <Card 
                                                    key={index}
                                                    sx={{
                                                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                                                        border: '1px solid',
                                                        borderColor: alpha(theme.palette.divider, 0.2),
                                                        '&:hover': {
                                                            borderColor: alpha(theme.palette.primary.main, 0.3),
                                                            boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.2)}`
                                                        }
                                                    }}
                                                >
                                                    <CardContent sx={{ pb: '16px !important' }}>
                                                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                                            <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                                                                {skill.name}
                                                            </Typography>
                                                            <Box display="flex" gap={0.5}>
                                                                {skill.level && (
                                                                    <Chip
                                                                        label={`Nível ${skill.level}`}
                                                                        size="small"
                                                                        color="info"
                                                                        sx={{ fontSize: '0.7rem' }}
                                                                    />
                                                                )}
                                                                <Chip
                                                                    label={skill.type}
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    sx={{ fontSize: '0.7rem' }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                        <Typography variant="body2" color="text.secondary" lineHeight={1.5}>
                                                            {skill.description}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <Paper 
                                                elevation={0} 
                                                sx={{ 
                                                    p: 2, 
                                                    bgcolor: alpha(blue[500], 0.05),
                                                    border: '1px solid',
                                                    borderColor: alpha(blue[300], 0.2),
                                                    borderRadius: 1,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <InfoOutlinedIcon color="info" sx={{ mb: 1 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Nenhuma habilidade específica encontrada para esta subclasse.
                                                </Typography>
                                            </Paper>
                                        )}
                                    </Box>
                                </Box>
                            </>
                        ) : (
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    p: 3,
                                    textAlign: 'center',
                                    color: 'text.secondary'
                                }}
                            >
                                <AutoAwesomeIcon sx={{ fontSize: 40, mb: 2, opacity: 0.7 }} />
                                <Typography variant="body1" gutterBottom>
                                    Selecione uma subclasse para ver seus detalhes
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Cada subclasse desbloqueia habilidades especiais nos níveis 10, 15 e 20
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Footer */}
                <Box
                    sx={{
                        p: 2,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2
                    }}
                >
                    <Button onClick={onClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleConfirm} 
                        variant="contained" 
                        color="primary"
                        disabled={!selectedSubclass}
                    >
                        Confirmar Seleção
                    </Button>
                </Box>

                {/* Aviso sobre permanência */}
                <Box
                    sx={{
                        p: 2,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        bgcolor: alpha(theme.palette.warning.main, 0.1)
                    }}
                >
                    <Typography variant="body2" color="warning.main" textAlign="center" fontWeight="500">
                        ⚠️ A subclasse não pode ser alterada após ser selecionada e salva
                    </Typography>
                </Box>
            </Box>
        </Modal>
    );
}

export default SubclassModal;
