/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider,
    Paper,
    IconButton,
    useTheme,
    useMediaQuery,
    Alert
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { positiveTraits, negativeTraits } from '@constants/traits';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { green, red, blue } from '@mui/material/colors';
import type { Trait, Lineage } from '@models';
interface TraitWithSelected extends Trait {
    selected: boolean;
}

interface TraitsModalProps {
    open: boolean;
    onClose: () => void;
    selectedTraits: string[];
    onTraitsChange: (traits: string[]) => void;
    lineage?: Lineage['name'];
}

function TraitsModal({ open, onClose, selectedTraits, onTraitsChange, lineage }: TraitsModalProps) {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const [ tabIndex, setTabIndex ] = useState(0);
    const [ positiveTraitsData, setPositiveTraitsData ] = useState<TraitWithSelected[]>([]);
    const [ negativeTraitsData, setNegativeTraitsData ] = useState<TraitWithSelected[]>([]);
    const [ selectedPositive, setSelectedPositive ] = useState<string[]>([]);
    const [ selectedNegative, setSelectedNegative ] = useState<string[]>([]);
    const [ selectedTraitDetails, setSelectedTraitDetails ] = useState<Trait | null>(null);

    useEffect(() => {
        const positiveSelected = selectedTraits.filter(
            trait => positiveTraits.some(pt => pt.name === trait)
        );
        const negativeSelected = selectedTraits.filter(
            trait => negativeTraits.some(nt => nt.name === trait)
        );

        setSelectedPositive(positiveSelected);
        setSelectedNegative(negativeSelected);

        setPositiveTraitsData(
            positiveTraits.map(trait => ({
                ...trait,
                selected: positiveSelected.includes(trait.name)
            }))
        );

        setNegativeTraitsData(
            negativeTraits.map(trait => ({
                ...trait,
                selected: negativeSelected.includes(trait.name)
            }))
        );
    }, [ selectedTraits ]);

    const areOppositeTraits = (positive: Trait | undefined, negative: Trait | undefined): boolean => {
        if (!positive || !negative) return false;
        
        if (positive.target.name.toLowerCase() !== negative.target.name.toLowerCase()) return false;
        if (positive.target.kind !== negative.target.kind) return false;
        
        return (positive.value > 0 && negative.value < 0) || 
               (positive.value < 0 && negative.value > 0);
    };

    const isNovato = lineage === 'Novato';

    const handleTraitToggle = (trait: Trait, isPositive: boolean) => {
        if (isNovato && !isPositive) return;
        if (isPositive) {
            if (isNovato) {
                const updatedSelection = selectedPositive.includes(trait.name)
                    ? selectedPositive.filter(t => t !== trait.name)
                    : selectedPositive.length < 2
                        ? [ ...selectedPositive, trait.name ]
                        : selectedPositive;

                setSelectedPositive(updatedSelection);
                setPositiveTraitsData(prevTraits =>
                    prevTraits.map(t => ({
                        ...t,
                        selected: updatedSelection.includes(t.name)
                    }))
                );
            } else {
                const updatedSelection = selectedPositive.includes(trait.name)
                    ? []
                    : [ trait.name ];

                setSelectedPositive(updatedSelection);
                setPositiveTraitsData(prevTraits =>
                    prevTraits.map(t => ({
                        ...t,
                        selected: t.name === trait.name && !t.selected
                    }))
                );
            }
        } else {
            const updatedSelection = selectedNegative.includes(trait.name)
                ? []
                : [ trait.name ];

            setSelectedNegative(updatedSelection);
            setNegativeTraitsData(prevTraits =>
                prevTraits.map(t => ({
                    ...t,
                    selected: t.name === trait.name && !t.selected
                }))
            );
        }

        const traitDetails = isPositive
            ? positiveTraits.find(t => t.name === trait.name)
            : negativeTraits.find(t => t.name === trait.name);
            
        setSelectedTraitDetails(traitDetails ?? null);
    };

    const handleSave = () => {
        onTraitsChange([ ...selectedPositive, ...selectedNegative ]);
        onClose();
    };

    const getValidationStatus = () => {
        if (isNovato) {
            const hasEnoughPositives = selectedPositive.length === 2;
            
            if (hasEnoughPositives) {
                return { 
                    valid: true, 
                    message: 'Seleção válida: 2 traços positivos (requerido para Novato)', 
                    severity: 'success' 
                };
            } else {
                return { 
                    valid: false, 
                    message: `Selecione mais ${2 - selectedPositive.length} traço(s) positivo(s) (requerido para Novato)`, 
                    severity: 'warning' 
                };
            }
        }

        const hasPositive = selectedPositive.length === 1;
        const hasNegative = selectedNegative.length === 1;
        
        const positiveTrait = positiveTraits.find(pt => selectedPositive.includes(pt.name));
        const negativeTrait = negativeTraits.find(nt => selectedNegative.includes(nt.name));
        const hasOppositeTraits = areOppositeTraits(positiveTrait, negativeTrait);
        
        if (hasPositive && hasNegative) {
            if (hasOppositeTraits) {
                const target = positiveTrait?.target.name ?? '';
                const targetType = positiveTrait?.target.kind === 'attribute' ? 'atributo' : 'perícia';
                return { 
                    valid: false, 
                    message: `Traços incompatíveis: ${positiveTrait?.name} e ${negativeTrait?.name} afetam o mesmo ${targetType} ${target}`, 
                    severity: 'error' 
                };
            }
            return { valid: true, message: 'Seleção válida: 1 traço positivo e 1 traço negativo', severity: 'success' };
        } else if (!hasPositive && !hasNegative) {
            return { valid: false, message: 'Selecione pelo menos 1 traço positivo e 1 traço negativo', severity: 'warning' };
        } else if (!hasPositive) {
            return { valid: false, message: 'Selecione 1 traço positivo', severity: 'warning' };
        } else {
            return { valid: false, message: 'Selecione 1 traço negativo', severity: 'warning' };
        }
    };

    const validationStatus = getValidationStatus();

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-tracos-titulo"
            closeAfterTransition
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: matches ? '95%' : 700,
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
                        Selecione seus Traços
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

                {/* Status de validação */}
                <Box sx={{ px: 2, pt: 1 }}>
                    <Alert 
                        severity={validationStatus.severity as any} 
                        icon={validationStatus.valid ? <CheckCircleIcon /> : <ErrorOutlineIcon />}
                        sx={{ mb: 1 }}
                    >
                        {validationStatus.message}
                    </Alert>
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
                            flex: matches ? '0 0 auto' : '0 0 40%',
                            borderRight: matches ? 'none' : `1px solid ${theme.palette.divider}`,
                            borderBottom: matches ? `1px solid ${theme.palette.divider}` : 'none',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Tabs
                            value={tabIndex}
                            onChange={(_, newValue) => setTabIndex(newValue)}
                            aria-label="tipos de traços"
                            sx={{ borderBottom: 1, borderColor: 'divider' }}
                            variant="fullWidth"
                        >
                            <Tab 
                                label="Positivos" 
                                icon={<AddCircleOutlineIcon />} 
                                sx={{ 
                                    color: tabIndex === 0 ? green[600] : 'inherit',
                                    position: 'relative',
                                    bottom: !matches ? 10 : 0,
                                    '&.Mui-selected': { color: green[700] }
                                }}
                                iconPosition="start"
                            />
                            <Tab 
                                label="Negativos" 
                                icon={<RemoveCircleOutlineIcon />} 
                                sx={{ 
                                    color: tabIndex === 1 ? red[600] : 'inherit',
                                    position: 'relative',
                                    bottom: !matches ? 10 : 0,
                                    '&.Mui-selected': { color: red[700] }
                                }}
                                iconPosition="start"
                            />
                        </Tabs>

                        <Box sx={{ overflow: 'auto', maxHeight: matches ? '200px' : '100%' }}>
                            {tabIndex === 0 && (
                                <List dense>
                                    {positiveTraitsData.map((trait) => (
                                        <ListItem
                                            key={trait.name}
                                            button
                                            onClick={() => handleTraitToggle(trait, true)}
                                            sx={{
                                                bgcolor: trait.selected 
                                                    ? alpha(green[500], 0.1) 
                                                    : 'transparent',
                                                '&:hover': {
                                                    bgcolor: trait.selected 
                                                        ? alpha(green[500], 0.2) 
                                                        : alpha(theme.palette.action.hover, 0.1)
                                                }
                                            }}
                                            secondaryAction={
                                                trait.selected && (
                                                    <CheckCircleIcon 
                                                        sx={{ color: green[500] }} 
                                                        fontSize="small" 
                                                    />
                                                )
                                            }
                                        >
                                            <ListItemText
                                                primary={trait.name}
                                                secondary={`+${trait.value} ${trait.target.name}`}
                                                primaryTypographyProps={{
                                                    fontWeight: trait.selected ? 'bold' : 'normal'
                                                }}
                                                secondaryTypographyProps={{
                                                    color: 'success.main'
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}

                            {tabIndex === 1 && (
                                <List dense>
                                    {negativeTraitsData.map((trait) => (
                                        <ListItem
                                            key={trait.name}
                                            onClick={() => !isNovato && handleTraitToggle(trait, false)}
                                            sx={{
                                                bgcolor: trait.selected 
                                                    ? alpha(red[500], 0.1) 
                                                    : 'transparent',
                                                '&:hover': {
                                                    bgcolor: !isNovato && (trait.selected 
                                                        ? alpha(red[500], 0.2) 
                                                        : alpha(theme.palette.action.hover, 0.1))
                                                },
                                                opacity: isNovato ? 0.5 : 1,
                                                cursor: isNovato ? 'not-allowed' : 'pointer',
                                                pointerEvents: isNovato ? 'none' : 'auto'
                                            }}
                                            secondaryAction={
                                                trait.selected && !isNovato && (
                                                    <CheckCircleIcon 
                                                        sx={{ color: red[500] }} 
                                                        fontSize="small" 
                                                    />
                                                )
                                            }
                                        >
                                            <ListItemText
                                                primary={trait.name}
                                                secondary={`${trait.value} ${trait.target.name}`}
                                                primaryTypographyProps={{
                                                    fontWeight: trait.selected ? 'bold' : 'normal'
                                                }}
                                                secondaryTypographyProps={{
                                                    color: 'error.main'
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Box>

                    {/* Seção de Detalhes */}
                    <Box
                        sx={{
                            flex: matches ? '0 0 auto' : '1 1 60%',
                            p: 2,
                            overflow: 'auto',
                            maxHeight: matches ? '300px' : 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        {selectedTraitDetails ? (
                            <>
                                <Box>
                                    <Typography variant="h6" color={selectedTraitDetails.value > 0 ? 'success.main' : 'error.main'}>
                                        {selectedTraitDetails.name}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Chip
                                            label={`${selectedTraitDetails.value > 0 ? '+' : ''}${selectedTraitDetails.value} ${selectedTraitDetails.target.name}`}
                                            color={selectedTraitDetails.value > 0 ? 'success' : 'error'}
                                            size="small"
                                        />
                                        <Chip
                                            label={selectedTraitDetails.target.kind === 'attribute' ? 'Atributo' : 'Perícia'}
                                            color="primary"
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                    
                                    <Divider sx={{ mb: 2 }} />
                                    
                                    <Typography variant="subtitle1" gutterBottom>
                                        Efeitos:
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
                                        <Typography>
                                            {selectedTraitDetails.value > 0 ? (
                                                <>Aumenta <strong>{selectedTraitDetails.value}</strong> {selectedTraitDetails.target.kind === 'attribute' ? 'ponto' : 'pontos'} {selectedTraitDetails.target.kind === 'attribute' ? 'no atributo' : 'na perícia'} <strong>{selectedTraitDetails.target.name}</strong>.</>
                                            ) : (
                                                <>Reduz <strong>{Math.abs(selectedTraitDetails.value)}</strong> {selectedTraitDetails.target.kind === 'attribute' ? 'ponto' : 'pontos'} {selectedTraitDetails.target.kind === 'attribute' ? 'no atributo' : 'na perícia'} <strong>{selectedTraitDetails.target.name}</strong>.</>
                                            )}
                                        </Typography>
                                    </Paper>
                                    
                                    <Typography variant="subtitle1" gutterBottom>
                                        Roleplay:
                                    </Typography>
                                    
                                    <Paper 
                                        elevation={0} 
                                        sx={{ 
                                            p: 2, 
                                            bgcolor: alpha(blue[500], 0.05),
                                            border: '1px solid',
                                            borderColor: alpha(blue[300], 0.2),
                                            borderRadius: 1
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <InfoOutlinedIcon color="info" sx={{ mt: 0.2 }} />
                                            <Typography>
                                                {selectedTraitDetails.value > 0 ? (
                                                    <>Seu personagem se destaca por ser <strong>{selectedTraitDetails.name.toLowerCase()}</strong>, o que proporciona uma vantagem significativa em situações que exigem <strong>{selectedTraitDetails.target.name}</strong>.</>
                                                ) : (
                                                    <>Seu personagem tem dificuldades por ser <strong>{selectedTraitDetails.name.toLowerCase()}</strong>, o que representa uma desvantagem em situações que exigem <strong>{selectedTraitDetails.target.name}</strong>.</>
                                                )}
                                            </Typography>
                                        </Box>
                                    </Paper>
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
                                <InfoOutlinedIcon sx={{ fontSize: 40, mb: 2, opacity: 0.7 }} />
                                <Typography variant="body1" gutterBottom>
                                    Selecione um traço para ver seus detalhes
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isNovato 
                                        ? 'Você precisa selecionar exatamente dois traços positivos (nenhum negativo)'
                                        : 'Você precisa selecionar exatamente um traço positivo e um negativo'}
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
                        onClick={handleSave} 
                        variant="contained" 
                        color="primary"
                        disabled={!validationStatus.valid}
                        sx={{
                            '&.Mui-disabled': {
                                bgcolor: validationStatus.severity === 'error' ? 'error.main' : 'action.disabledBackground',
                                opacity: validationStatus.severity === 'error' ? 0.7 : 0.3,
                                color: validationStatus.severity === 'error' ? 'white' : 'action.disabled'
                            }
                        }}
                    >
                        Salvar
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

export default TraitsModal;
