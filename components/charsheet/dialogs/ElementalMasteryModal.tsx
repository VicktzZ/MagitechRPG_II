import React, { useState } from 'react';
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
    CardContent,
    Grid
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import GrassIcon from '@mui/icons-material/Grass';
import AirIcon from '@mui/icons-material/Air';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import { blue, red, green, grey, purple, amber, blueGrey } from '@mui/material/colors';
import type { Element } from '@models/types/string';

interface ElementalMasteryModalProps {
    open: boolean;
    onClose: () => void;
    onElementSelect: (element: Element) => void;
}

// Definição dos elementos e suas propriedades
const elementalData: Record<Element, {
    color: string;
    icon: React.ReactNode;
    description: string;
    benefits: string[];
    weakness: string;
    uniqueProperties: string[];
}> = {
    'Fogo': {
        color: red[500],
        icon: <LocalFireDepartmentIcon />,
        description: 'Domínio sobre as chamas e o calor, permitindo manipular o fogo com maestria incomparável.',
        benefits: [
            'Upgrades em Poderes Mágicos de Fogo',
            'Acesso a estágios extras de magias nível 4 de Fogo',
            'Sofre metade do dano de Fogo',
            'Magias de Fogo não precisam mais de material'
        ],
        weakness: 'Sofre o dobro de dano de Água',
        uniqueProperties: [
            'Aumento de 25% no dano de magias de Fogo',
            'Capacidade de criar pequenas chamas sem conjurar magias',
            'Resistência a ambientes de calor extremo',
            'Aura que aquece o ambiente ao redor'
        ]
    },
    'Água': {
        color: blue[500],
        icon: <WaterDropIcon />,
        description: 'Controle sobre os fluidos e umidade, permitindo manipular a água e suas propriedades curativas.',
        benefits: [
            'Upgrades em Poderes Mágicos de Água',
            'Acesso a estágios extras de magias nível 4 de Água',
            'Sofre metade do dano de Água',
            'Magias de Água não precisam mais de material'
        ],
        weakness: 'Sofre o dobro de dano de Eletricidade',
        uniqueProperties: [
            'Aumento de 25% no efeito de cura em magias de Água',
            'Capacidade de respirar debaixo d\'água',
            'Detecção de fontes de água próximas',
            'Purificação de água contaminada pelo toque'
        ]
    },
    'Terra': {
        color: green[800],
        icon: <GrassIcon />,
        description: 'Conexão profunda com o solo e a natureza, permitindo controlar a terra e suas criaturas.',
        benefits: [
            'Upgrades em Poderes Mágicos de Terra',
            'Acesso a estágios extras de magias nível 4 de Terra',
            'Sofre metade do dano de Terra',
            'Magias de Terra não precisam mais de material'
        ],
        weakness: 'Sofre o dobro de dano de Ar',
        uniqueProperties: [
            'Aumento de 25% na duração de magias de Terra',
            'Sentir vibrações através do solo (detecção de movimento)',
            'Capacidade de comunicação limitada com plantas',
            'Maior resistência física e defesa natural'
        ]
    },
    'Ar': {
        color: blueGrey[300],
        icon: <AirIcon />,
        description: 'Maestria sobre os ventos e o ar, permitindo manipular correntes de ar e sons com precisão.',
        benefits: [
            'Upgrades em Poderes Mágicos de Ar',
            'Acesso a estágios extras de magias nível 4 de Ar',
            'Sofre metade do dano de Ar',
            'Magias de Ar não precisam mais de material'
        ],
        weakness: 'Sofre o dobro de dano de Terra',
        uniqueProperties: [
            'Aumento de 25% na velocidade de movimento',
            'Capacidade de planar por curtas distâncias',
            'Amplificação ou abafamento de sons ao redor',
            'Detecção de mudanças na pressão atmosférica'
        ]
    },
    'Eletricidade': {
        color: amber[500],
        icon: <ElectricBoltIcon />,
        description: 'Controle sobre a energia elétrica, permitindo gerar e manipular raios e correntes elétricas.',
        benefits: [
            'Upgrades em Poderes Mágicos de Eletricidade',
            'Acesso a estágios extras de magias nível 4 de Eletricidade',
            'Sofre metade do dano de Eletricidade',
            'Magias de Eletricidade não precisam mais de material'
        ],
        weakness: 'Sofre o dobro de dano de Terra',
        uniqueProperties: [
            'Aumento de 25% na velocidade de conjuração',
            'Capacidade de energizar objetos metálicos pelo toque',
            'Sentir campos eletromagnéticos ao redor',
            'Reflexos aprimorados e tempo de reação reduzido'
        ]
    },
    'Trevas': {
        color: purple[900],
        icon: <DarkModeIcon />,
        description: 'Domínio sobre as sombras e a escuridão, permitindo manipular a ausência de luz e energias negativas.',
        benefits: [
            'Upgrades em Poderes Mágicos de Trevas',
            'Acesso a estágios extras de magias nível 4 de Trevas',
            'Sofre metade do dano de Trevas',
            'Magias de Trevas não precisam mais de material'
        ],
        weakness: 'Sofre o dobro de dano de Luz',
        uniqueProperties: [
            'Visão na escuridão total',
            'Capacidade de se fundir parcialmente com sombras',
            'Aumento de 25% no efeito de magias de controle mental',
            'Presença que naturalmente intimida criaturas menores'
        ]
    },
    'Luz': {
        color: amber[300],
        icon: <LightModeIcon />,
        description: 'Controle sobre a luz e a radiação, permitindo manipular a luminosidade e energias positivas.',
        benefits: [
            'Upgrades em Poderes Mágicos de Luz',
            'Acesso a estágios extras de magias nível 4 de Luz',
            'Sofre metade do dano de Luz',
            'Magias de Luz não precisam mais de material'
        ],
        weakness: 'Sofre o dobro de dano de Trevas',
        uniqueProperties: [
            'Capacidade de emitir luz pelo corpo',
            'Aumento de 25% na eficácia contra mortos-vivos',
            'Visão aprimorada em condições de baixa luminosidade',
            'Aura que naturalmente acalma criaturas agitadas'
        ]
    },
    'Não-elemental': {
        color: grey[500],
        icon: <AllInclusiveIcon />,
        description: 'Equilíbrio entre todos os elementos, sem especialização mas também sem fraquezas específicas.',
        benefits: [
            'Versatilidade em todos os tipos de magia',
            'Acesso a magias de múltiplos elementos',
            'Não sofre dano dobrado de nenhum elemento',
            'Custo de mana reduzido em 10% para todas as magias'
        ],
        weakness: 'Não possui resistência a nenhum tipo de dano elemental',
        uniqueProperties: [
            'Capacidade de converter um tipo de energia elemental em outro',
            'Adaptabilidade aumentada a ambientes extremos',
            'Maior facilidade para aprender magias de qualquer elemento',
            'Equilíbrio natural entre forças opostas'
        ]
    }
};

function ElementalMasteryModal({ open, onClose, onElementSelect }: ElementalMasteryModalProps) {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const [ selectedElement, setSelectedElement ] = useState<Element | null>(null);

    // Manipular seleção de elemento
    const handleElementSelect = (element: Element) => {
        setSelectedElement(element);
    };

    // Confirmar seleção
    const handleConfirm = () => {
        if (selectedElement) {
            onElementSelect(selectedElement);
            onClose();
        }
    };

    // Renderizar ícone do elemento com a cor correta
    const renderElementIcon = (element: Element) => {
        const iconProps = { 
            sx: { 
                color: elementalData[element].color,
                fontSize: '1.5rem'
            }
        };
        return React.cloneElement(elementalData[element].icon as React.ReactElement, iconProps);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-maestria-elemental-titulo"
            closeAfterTransition
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: matches ? '95%' : 900,
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
                        bgcolor: blue[700],
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Box display="flex" alignItems="center">
                        <AutoAwesomeIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" component="h2">
                            Escolha sua Maestria Elemental
                        </Typography>
                    </Box>
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
                                <AutoAwesomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Elementos Disponíveis
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Selecione um elemento para ver detalhes
                            </Typography>
                        </Box>

                        <Box sx={{ overflow: 'auto', maxHeight: matches ? '200px' : '100%' }}>
                            <List dense>
                                {Object.keys(elementalData).map((element) => (
                                    <ListItem
                                        key={element}
                                        button
                                        onClick={() => handleElementSelect(element as Element)}
                                        sx={{
                                            bgcolor: selectedElement === element 
                                                ? alpha(blue[500], 0.1) 
                                                : 'transparent',
                                            '&:hover': {
                                                bgcolor: selectedElement === element 
                                                    ? alpha(blue[500], 0.2) 
                                                    : alpha(theme.palette.action.hover, 0.1)
                                            }
                                        }}
                                        secondaryAction={
                                            selectedElement === element && (
                                                <CheckCircleIcon 
                                                    sx={{ color: blue[500] }} 
                                                    fontSize="small" 
                                                />
                                            )
                                        }
                                    >
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            {renderElementIcon(element as Element)}
                                            <ListItemText
                                                primary={element}
                                                primaryTypographyProps={{
                                                    fontWeight: selectedElement === element ? 'bold' : 'normal'
                                                }}
                                            />
                                        </Box>
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
                        {selectedElement ? (
                            <>
                                <Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        {renderElementIcon(selectedElement)}
                                        <Typography variant="h6" fontWeight="bold" style={{ color: elementalData[selectedElement].color }}>
                                            Maestria Elemental: {selectedElement}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 2 }}>
                                        <Chip
                                            label="Maestria Elemental"
                                            color="primary"
                                            size="small"
                                            icon={<AutoAwesomeIcon />}
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
                                            borderColor: alpha(elementalData[selectedElement].color, 0.3),
                                            borderRadius: 1,
                                            mb: 2
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                                            {elementalData[selectedElement].description}
                                        </Typography>
                                    </Paper>
                                    
                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={12} md={6}>
                                            <Card 
                                                sx={{
                                                    bgcolor: alpha(blue[500], 0.05),
                                                    border: '1px solid',
                                                    borderColor: alpha(blue[300], 0.3),
                                                    height: '100%'
                                                }}
                                            >
                                                <CardContent>
                                                    <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                                                        Benefícios Gerais
                                                    </Typography>
                                                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                                        {elementalData[selectedElement].benefits.map((benefit, index) => (
                                                            <Typography 
                                                                component="li" 
                                                                variant="body2" 
                                                                color="text.secondary" 
                                                                key={index}
                                                                sx={{ mb: 0.5 }}
                                                            >
                                                                {benefit}
                                                            </Typography>
                                                        ))}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Card 
                                                sx={{
                                                    bgcolor: alpha(red[500], 0.05),
                                                    border: '1px solid',
                                                    borderColor: alpha(red[300], 0.3),
                                                    height: '100%'
                                                }}
                                            >
                                                <CardContent>
                                                    <Typography variant="subtitle2" fontWeight="bold" color="error" gutterBottom>
                                                        Fraqueza
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {elementalData[selectedElement].weakness}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                    
                                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                                        Propriedades Únicas:
                                    </Typography>
                                    
                                    <Card 
                                        sx={{
                                            bgcolor: alpha(elementalData[selectedElement].color, 0.05),
                                            border: '1px solid',
                                            borderColor: alpha(elementalData[selectedElement].color, 0.3)
                                        }}
                                    >
                                        <CardContent>
                                            <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                                {elementalData[selectedElement].uniqueProperties.map((property, index) => (
                                                    <Typography 
                                                        component="li" 
                                                        variant="body2" 
                                                        color="text.secondary" 
                                                        key={index}
                                                        sx={{ mb: 0.5 }}
                                                    >
                                                        {property}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
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
                                    Selecione um elemento para ver seus detalhes
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Cada maestria elemental confere habilidades únicas e resistências específicas
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
                        disabled={!selectedElement}
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
                        ⚠️ A maestria elemental não pode ser alterada após ser selecionada e salva
                    </Typography>
                </Box>
            </Box>
        </Modal>
    );
}

export default ElementalMasteryModal;
