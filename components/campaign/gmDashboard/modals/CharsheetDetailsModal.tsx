'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Tabs,
    Tab,
    Grid,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    IconButton,
    TextField,
    Alert,
    CircularProgress,
    Tooltip
} from '@mui/material';
import { elementColor } from '@constants';
import { Edit, Save, Cancel, Delete } from '@mui/icons-material';
import ChangePlayerStatusModal from './ChangePlayerStatusModal';
import type { CharsheetDTO } from '@models/dtos';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import { charsheetEntity } from '@utils/firestoreEntities';
import { useSnackbar } from 'notistack';
import { green, red, orange } from '@mui/material/colors';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`charsheet-tabpanel-${index}`}
            aria-labelledby={`charsheet-tab-${index}`}
            {...other}
            style={{ maxHeight: '500px', overflowY: 'auto' }}
        >
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `charsheet-tab-${index}`,
        'aria-controls': `charsheet-tabpanel-${index}`
    };
}

interface CharsheetDetailsModalProps {
    open: boolean;
    onClose: () => void;
    charsheet: Required<CharsheetDTO>;
}

export default function CharsheetDetailsModal({ open, onClose, charsheet }: CharsheetDetailsModalProps) {
    const [ tabValue, setTabValue ] = useState(0);
    const { enqueueSnackbar } = useSnackbar();

    const [ modalStates, setModalStates ] = useState({
        changePlayerStatusModalOpen: false,
        changePlayerAttributesModalOpen: false,
        changePlayerSkillsModalOpen: false,
        changePlayerSpellsModalOpen: false,
        changePlayerInventoryModalOpen: false,
        changePlayerAbilitiesModalOpen: false
    });

    // Estados de edição
    const [ isEditing, setIsEditing ] = useState(false);
    const [ isSaving, setIsSaving ] = useState(false);
    const [ editedData, setEditedData ] = useState<Partial<CharsheetDTO>>({});

    // Inicializa os dados editáveis quando o modal abre
    useEffect(() => {
        if (open && charsheet) {
            setEditedData({
                name: charsheet.name,
                playerName: charsheet.playerName,
                level: charsheet.level,
                age: charsheet.age,
                gender: charsheet.gender,
                race: charsheet.race,
                stats: { ...charsheet.stats },
                attributes: { ...charsheet.attributes },
                expertises: { ...charsheet.expertises },
                mods: { 
                    attributes: { ...charsheet.mods?.attributes },
                    expertises: { ...charsheet.mods?.expertises }
                },
                points: { ...charsheet.points },
                inventory: { 
                    ...charsheet.inventory,
                    weapons: [ ...(charsheet.inventory?.weapons || []) ],
                    armors: [ ...(charsheet.inventory?.armors || []) ],
                    items: [ ...(charsheet.inventory?.items || []) ]
                },
                skills: { ...charsheet.skills },
                spells: [ ...(charsheet.spells || []) ],
                displacement: charsheet.displacement,
                spellSpace: charsheet.spellSpace,
                elementalMastery: charsheet.elementalMastery
            });
        }
    }, [ open, charsheet ]);

    // Função para salvar as alterações
    const handleSave = async () => {
        if (!charsheet?.id) return;
        
        setIsSaving(true);
        try {
            await charsheetEntity.update(charsheet.id, editedData);
            enqueueSnackbar('Ficha atualizada com sucesso!', { variant: 'success' });
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao salvar ficha:', error);
            enqueueSnackbar('Erro ao salvar alterações', { variant: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    // Função para cancelar edição
    const handleCancelEdit = () => {
        setIsEditing(false);
        // Restaura os dados originais
        setEditedData({
            name: charsheet.name,
            playerName: charsheet.playerName,
            level: charsheet.level,
            stats: { ...charsheet.stats },
            attributes: { ...charsheet.attributes },
            inventory: { ...charsheet.inventory }
        });
    };

    // Helper para atualizar dados aninhados
    const updateNestedField = (path: string, value: any) => {
        setEditedData(prev => {
            const newData = { ...prev };
            const keys = path.split('.');
            let current: any = newData;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const { data: spells } = useFirestoreRealtime('spell', {
        filters: [
            { field: 'id', operator: 'in', value: charsheet.spells }
        ],
        enabled: charsheet.spells.length > 0
    });

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                {isEditing ? (
                                    <TextField
                                        size="small"
                                        value={editedData.name || ''}
                                        onChange={(e) => updateNestedField('name', e.target.value)}
                                        label="Nome"
                                        sx={{ mr: 1 }}
                                    />
                                ) : (
                                    <Typography variant="h6">
                                        {charsheet.name} - Nível {charsheet.level}
                                    </Typography>
                                )}
                                {isEditing && (
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={editedData.level || 0}
                                        onChange={(e) => updateNestedField('level', parseInt(e.target.value) || 0)}
                                        label="Nível"
                                        sx={{ width: 80 }}
                                    />
                                )}
                                <Typography color="textSecondary" variant="subtitle1">({charsheet.id})</Typography>
                            </Box>
                            {isEditing ? (
                                <TextField
                                    size="small"
                                    value={editedData.playerName || ''}
                                    onChange={(e) => updateNestedField('playerName', e.target.value)}
                                    label="Jogador"
                                    sx={{ mt: 1 }}
                                    fullWidth
                                />
                            ) : (
                                <Typography variant="subtitle1">
                                    {charsheet.playerName}
                                </Typography>
                            )}
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Chip 
                                label={`${charsheet.class as string} ${charsheet.subclass ? `/ ${charsheet.subclass as string}` : ''}`}
                                color="primary"
                            />
                            {!isEditing ? (
                                <Tooltip title="Editar ficha">
                                    <IconButton 
                                        onClick={() => setIsEditing(true)}
                                        sx={{ bgcolor: orange[100], color: orange[800] }}
                                    >
                                        <Edit />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Box display="flex" gap={0.5}>
                                    <Tooltip title="Cancelar">
                                        <IconButton 
                                            onClick={handleCancelEdit}
                                            disabled={isSaving}
                                            sx={{ bgcolor: red[100], color: red[800] }}
                                        >
                                            <Cancel />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Salvar alterações">
                                        <IconButton 
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            sx={{ bgcolor: green[100], color: green[800] }}
                                        >
                                            {isSaving ? <CircularProgress size={24} /> : <Save />}
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    {isEditing && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                            Modo de edição ativo. Faça suas alterações e clique em Salvar.
                        </Alert>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="detalhes da charsheet">
                            <Tab label="Informações Básicas" {...a11yProps(0)} />
                            <Tab label="Atributos" {...a11yProps(1)} />
                            <Tab label="Perícias" {...a11yProps(2)} />
                            <Tab label="Inventário" {...a11yProps(3)} />
                            <Tab label="Habilidades" {...a11yProps(4)} />
                            <Tab label="Spells" {...a11yProps(5)} />
                        </Tabs>
                    </Box>
                    
                    {/* Informações Básicas */}
                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>Detalhes do Personagem</Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            value={editedData.name ?? charsheet.name}
                                                            onChange={(e) => updateNestedField('name', e.target.value)}
                                                            fullWidth
                                                        />
                                                    ) : charsheet.name}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Jogador</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            value={editedData.playerName ?? charsheet.playerName}
                                                            onChange={(e) => updateNestedField('playerName', e.target.value)}
                                                            fullWidth
                                                        />
                                                    ) : charsheet.playerName}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Classe</TableCell>
                                                <TableCell>{charsheet.class as string}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Subclasse</TableCell>
                                                <TableCell>{charsheet.subclass as string || 'Nenhuma'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Linhagem</TableCell>
                                                <TableCell>{charsheet.lineage as unknown as string}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Raça</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            value={editedData.race ?? charsheet.race}
                                                            onChange={(e) => updateNestedField('race', e.target.value)}
                                                            fullWidth
                                                        />
                                                    ) : charsheet.race}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Gênero</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            value={editedData.gender ?? charsheet.gender}
                                                            onChange={(e) => updateNestedField('gender', e.target.value)}
                                                            fullWidth
                                                        />
                                                    ) : charsheet.gender}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Idade</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={editedData.age ?? charsheet.age}
                                                            onChange={(e) => updateNestedField('age', parseInt(e.target.value) || 0)}
                                                            sx={{ width: 80 }}
                                                            InputProps={{ endAdornment: ' anos' }}
                                                        />
                                                    ) : `${charsheet.age} anos`}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Modo</TableCell>
                                                <TableCell>{charsheet.mode}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Condição Financeira</TableCell>
                                                <TableCell>{charsheet.financialCondition}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box display='flex' alignItems='center' sx={{ mb: '0.25em' }} gap={1}>
                                    <Typography variant="subtitle1">Status & Pontos</Typography>
                                    {!isEditing && (
                                        <IconButton 
                                            size="small"
                                            color="primary"
                                            onClick={() => setModalStates({ ...modalStates, changePlayerStatusModalOpen: true })}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>HP</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <Box display="flex" gap={0.5} alignItems="center">
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={editedData.stats?.lp ?? charsheet.stats.lp}
                                                                onChange={(e) => updateNestedField('stats.lp', parseInt(e.target.value) || 0)}
                                                                sx={{ width: 70 }}
                                                            />
                                                            /
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={editedData.stats?.maxLp ?? charsheet.stats.maxLp}
                                                                onChange={(e) => updateNestedField('stats.maxLp', parseInt(e.target.value) || 0)}
                                                                sx={{ width: 70 }}
                                                            />
                                                        </Box>
                                                    ) : `${charsheet.stats.lp}/${charsheet.stats.maxLp}`}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>MP</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <Box display="flex" gap={0.5} alignItems="center">
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={editedData.stats?.mp ?? charsheet.stats.mp}
                                                                onChange={(e) => updateNestedField('stats.mp', parseInt(e.target.value) || 0)}
                                                                sx={{ width: 70 }}
                                                            />
                                                            /
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={editedData.stats?.maxMp ?? charsheet.stats.maxMp}
                                                                onChange={(e) => updateNestedField('stats.maxMp', parseInt(e.target.value) || 0)}
                                                                sx={{ width: 70 }}
                                                            />
                                                        </Box>
                                                    ) : `${charsheet.stats.mp}/${charsheet.stats.maxMp}`}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>AP</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <Box display="flex" gap={0.5} alignItems="center">
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={editedData.stats?.ap ?? charsheet.stats.ap}
                                                                onChange={(e) => updateNestedField('stats.ap', parseInt(e.target.value) || 0)}
                                                                sx={{ width: 70 }}
                                                            />
                                                            /
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={editedData.stats?.maxAp ?? charsheet.stats.maxAp}
                                                                onChange={(e) => updateNestedField('stats.maxAp', parseInt(e.target.value) || 0)}
                                                                sx={{ width: 70 }}
                                                            />
                                                        </Box>
                                                    ) : `${charsheet.stats.ap}/${charsheet.stats.maxAp}`}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Deslocamento</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={editedData.displacement ?? charsheet.displacement}
                                                            onChange={(e) => updateNestedField('displacement', parseInt(e.target.value) || 0)}
                                                            sx={{ width: 80 }}
                                                            InputProps={{ endAdornment: 'm' }}
                                                        />
                                                    ) : `${charsheet.displacement}m`}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Capacidade</TableCell>
                                                <TableCell>{charsheet.capacity.cargo}/{charsheet.capacity.max} kg</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Dinheiro</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={editedData.inventory?.money ?? charsheet.inventory.money}
                                                            onChange={(e) => updateNestedField('inventory.money', parseInt(e.target.value) || 0)}
                                                            sx={{ width: 100 }}
                                                            InputProps={{ startAdornment: '¢' }}
                                                        />
                                                    ) : `¢ ${charsheet.inventory.money}`}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Munição</TableCell>
                                                <TableCell>{charsheet.ammoCounter.current}/{charsheet.ammoCounter.max}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Espaço mágico</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={editedData.spellSpace ?? charsheet.spellSpace}
                                                            onChange={(e) => updateNestedField('spellSpace', parseInt(e.target.value) || 0)}
                                                            sx={{ width: 70 }}
                                                        />
                                                    ) : charsheet.spellSpace}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Maestria Elemental</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            value={editedData.elementalMastery ?? charsheet.elementalMastery ?? ''}
                                                            onChange={(e) => updateNestedField('elementalMastery', e.target.value)}
                                                            sx={{ width: 120 }}
                                                        />
                                                    ) : (charsheet.elementalMastery || 'Nenhuma')}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Traços</TableCell>
                                                <TableCell>{charsheet.traits.join(', ') || 'Nenhum'}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Box mt={2}>
                                    <Typography variant="subtitle1" gutterBottom>Pontos Disponíveis</Typography>
                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    label="Atributos"
                                                    value={editedData.points?.attributes ?? charsheet.points.attributes}
                                                    onChange={(e) => updateNestedField('points.attributes', parseInt(e.target.value) || 0)}
                                                    fullWidth
                                                />
                                            ) : (
                                                <Chip 
                                                    label={`Atributos: ${charsheet.points.attributes}`} 
                                                    color="primary" 
                                                    variant="outlined"
                                                    sx={{ width: '100%' }}
                                                />
                                            )}
                                        </Grid>
                                        <Grid item xs={6}>
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    label="Perícias"
                                                    value={editedData.points?.expertises ?? charsheet.points.expertises}
                                                    onChange={(e) => updateNestedField('points.expertises', parseInt(e.target.value) || 0)}
                                                    fullWidth
                                                />
                                            ) : (
                                                <Chip 
                                                    label={`Perícias: ${charsheet.points.expertises}`} 
                                                    color="secondary" 
                                                    variant="outlined"
                                                    sx={{ width: '100%' }}
                                                />
                                            )}
                                        </Grid>
                                        <Grid item xs={6}>
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    label="Habilidades"
                                                    value={editedData.points?.skills ?? charsheet.points.skills}
                                                    onChange={(e) => updateNestedField('points.skills', parseInt(e.target.value) || 0)}
                                                    fullWidth
                                                />
                                            ) : (
                                                <Chip 
                                                    label={`Habilidades: ${charsheet.points.skills}`} 
                                                    color="info" 
                                                    variant="outlined"
                                                    sx={{ width: '100%' }}
                                                />
                                            )}
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* Atributos */}
                    <TabPanel value={tabValue} index={1}>
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Atributo</TableCell>
                                        <TableCell>Valor</TableCell>
                                        <TableCell>Modificador</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {([ 'vig', 'des', 'log', 'sab', 'foc', 'car' ] as const).map((attr) => {
                                        const labels: Record<string, string> = {
                                            vig: 'Vigor (VIG)',
                                            des: 'Destreza (DES)',
                                            log: 'Lógica (LOG)',
                                            sab: 'Sabedoria (SAB)',
                                            foc: 'Foco (FOC)',
                                            car: 'Carisma (CAR)'
                                        };
                                        return (
                                            <TableRow key={attr}>
                                                <TableCell>{labels[attr]}</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={editedData.attributes?.[attr] ?? charsheet.attributes[attr]}
                                                            onChange={(e) => updateNestedField(`attributes.${attr}`, parseInt(e.target.value) || 0)}
                                                            sx={{ width: 70 }}
                                                        />
                                                    ) : charsheet.attributes[attr]}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={editedData.mods?.attributes?.[attr] ?? charsheet.mods.attributes[attr]}
                                                            onChange={(e) => updateNestedField(`mods.attributes.${attr}`, parseInt(e.target.value) || 0)}
                                                            sx={{ width: 70 }}
                                                        />
                                                    ) : charsheet.mods.attributes[attr]}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>

                    {/* Perícias */}
                    <TabPanel value={tabValue} index={2}>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Perícia</TableCell>
                                        <TableCell>Valor</TableCell>
                                        <TableCell>Atributo</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(charsheet.expertises).sort((a, b) => b[1].value - a[1].value).map(([ name, expertise ]) => {
                                        return (
                                            <TableRow key={name}>
                                                <TableCell>{name}</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={editedData.expertises?.[name]?.value ?? expertise.value}
                                                            onChange={(e) => updateNestedField(`expertises.${name}.value`, parseInt(e.target.value) || 0)}
                                                            sx={{ width: 70 }}
                                                        />
                                                    ) : expertise.value}
                                                </TableCell>
                                                <TableCell>{expertise.defaultAttribute?.toUpperCase() || '—'}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>

                    {/* Inventário */}
                    <TabPanel value={tabValue} index={3}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>Armas ({editedData.inventory?.weapons?.length || charsheet.inventory.weapons.length})</Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>Dano</TableCell>
                                                <TableCell>Tipo</TableCell>
                                                <TableCell>Categoria</TableCell>
                                                {isEditing && <TableCell>Ações</TableCell>}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(editedData.inventory?.weapons || charsheet.inventory.weapons).map((weapon, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{weapon.name}</TableCell>
                                                    <TableCell>{weapon.effect.value}</TableCell>
                                                    <TableCell>{weapon.kind}</TableCell>
                                                    <TableCell>{weapon.categ}</TableCell>
                                                    {isEditing && (
                                                        <TableCell>
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => {
                                                                    const newWeapons = [ ...(editedData.inventory?.weapons || charsheet.inventory.weapons) ];
                                                                    newWeapons.splice(index, 1);
                                                                    updateNestedField('inventory.weapons', newWeapons);
                                                                }}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>Armaduras ({editedData.inventory?.armors?.length || charsheet.inventory.armors.length})</Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>Defesa</TableCell>
                                                <TableCell>Tipo</TableCell>
                                                <TableCell>Categoria</TableCell>
                                                {isEditing && <TableCell>Ações</TableCell>}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(editedData.inventory?.armors || charsheet.inventory.armors).map((armor, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{armor.name}</TableCell>
                                                    <TableCell>{armor.value}</TableCell>
                                                    <TableCell>{armor.kind}</TableCell>
                                                    <TableCell>{armor.categ}</TableCell>
                                                    {isEditing && (
                                                        <TableCell>
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => {
                                                                    const newArmors = [ ...(editedData.inventory?.armors || charsheet.inventory.armors) ];
                                                                    newArmors.splice(index, 1);
                                                                    updateNestedField('inventory.armors', newArmors);
                                                                }}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>Itens ({editedData.inventory?.items?.length || charsheet.inventory.items.length})</Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>Tipo</TableCell>
                                                <TableCell>Quantidade</TableCell>
                                                <TableCell>Peso</TableCell>
                                                {isEditing && <TableCell>Ações</TableCell>}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(editedData.inventory?.items || charsheet.inventory.items).map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell>{item.kind}</TableCell>
                                                    <TableCell>{item.quantity ?? 1}</TableCell>
                                                    <TableCell>{item.weight} kg</TableCell>
                                                    {isEditing && (
                                                        <TableCell>
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => {
                                                                    const newItems = [ ...(editedData.inventory?.items || charsheet.inventory.items) ];
                                                                    newItems.splice(index, 1);
                                                                    updateNestedField('inventory.items', newItems);
                                                                }}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* Habilidades */}
                    <TabPanel value={tabValue} index={4}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>Habilidades de Classe ({editedData.skills?.class?.length || charsheet.skills.class.length})</Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>Nível</TableCell>
                                                {isEditing && <TableCell>Ações</TableCell>}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(editedData.skills?.class || charsheet.skills.class).map((skill, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{skill.name}</TableCell>
                                                    <TableCell>{skill.level ?? '—'}</TableCell>
                                                    {isEditing && (
                                                        <TableCell>
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => {
                                                                    const newClassSkills = [ ...(editedData.skills?.class || charsheet.skills.class) ];
                                                                    newClassSkills.splice(index, 1);
                                                                    updateNestedField('skills.class', newClassSkills);
                                                                }}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            
                            {(editedData.skills?.subclass || charsheet.skills.subclass).length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>Habilidades de Subclasse ({editedData.skills?.subclass?.length || charsheet.skills.subclass.length})</Typography>
                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Nome</TableCell>
                                                    <TableCell>Nível</TableCell>
                                                    {isEditing && <TableCell>Ações</TableCell>}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {(editedData.skills?.subclass || charsheet.skills.subclass).map((skill, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{skill.name}</TableCell>
                                                        <TableCell>{skill.level ?? '—'}</TableCell>
                                                        {isEditing && (
                                                            <TableCell>
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="error"
                                                                    onClick={() => {
                                                                        const newSubclassSkills = [ ...(editedData.skills?.subclass || charsheet.skills.subclass) ];
                                                                        newSubclassSkills.splice(index, 1);
                                                                        updateNestedField('skills.subclass', newSubclassSkills);
                                                                    }}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            )}
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>Habilidades de Linhagem ({editedData.skills?.lineage?.length || charsheet.skills.lineage?.length})</Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>Origem</TableCell>
                                                {isEditing && <TableCell>Ações</TableCell>}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(editedData.skills?.lineage || charsheet.skills.lineage)?.map((skill, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{skill.name}</TableCell>
                                                    <TableCell>{skill.origin ?? '—'}</TableCell>
                                                    {isEditing && (
                                                        <TableCell>
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => {
                                                                    const newLineageSkills = [ ...(editedData.skills?.lineage || charsheet.skills.lineage) ];
                                                                    newLineageSkills.splice(index, 1);
                                                                    updateNestedField('skills.lineage', newLineageSkills);
                                                                }}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            
                            {(editedData.skills?.bonus || charsheet.skills.bonus)?.length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>Habilidades Bônus ({editedData.skills?.bonus?.length || charsheet.skills.bonus?.length})</Typography>
                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Nome</TableCell>
                                                    <TableCell>Origem</TableCell>
                                                    {isEditing && <TableCell>Ações</TableCell>}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {(editedData.skills?.bonus || charsheet.skills.bonus)?.map((skill, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{skill.name}</TableCell>
                                                        <TableCell>{skill.origin ?? '—'}</TableCell>
                                                        {isEditing && (
                                                            <TableCell>
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="error"
                                                                    onClick={() => {
                                                                        const newBonusSkills = [ ...(editedData.skills?.bonus || charsheet.skills.bonus) ];
                                                                        newBonusSkills.splice(index, 1);
                                                                        updateNestedField('skills.bonus', newBonusSkills);
                                                                    }}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            )}
                        </Grid>
                    </TabPanel>

                    {/* Spells */}
                    <TabPanel value={tabValue} index={5}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Espaço Mágico: {charsheet.spellSpace} / Maestria Elemental: {charsheet.elementalMastery ?? 'Nenhuma'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Total de Spells: {charsheet.spells?.length}
                            </Typography>
                        </Box>
                        
                        {charsheet.spells?.length > 0 ? (
                            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nome</TableCell>
                                            <TableCell>Elemento</TableCell>
                                            <TableCell>Custo de Mana</TableCell>
                                            <TableCell>Nível</TableCell>
                                            <TableCell>Descrição</TableCell>
                                            {isEditing && <TableCell>Ações</TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {spells?.map((spell, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Typography variant="body2" fontWeight="bold">{spell?.name}</Typography>
                                                        {spell?.element && (
                                                            <Chip 
                                                                label={spell?.type} 
                                                                size="small" 
                                                                variant="outlined"
                                                                sx={{ mt: 0.5, alignSelf: 'flex-start' }}
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={spell?.element} 
                                                        size="small" 
                                                        sx={{ 
                                                            bgcolor: elementColor[spell?.element?.toUpperCase() as keyof typeof elementColor],
                                                            color: spell?.element?.toUpperCase() === 'NÃO-ELEMENTAL' || spell?.element?.toUpperCase() === 'LUZ' ? 'black' : 'white' 
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{spell?.mpCost} MP</TableCell>
                                                <TableCell>
                                                    {spell?.level}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ maxWidth: 250, whiteSpace: 'pre-wrap' }}>
                                                        {spell?.stages?.[0]}
                                                    </Typography>
                                                    {/* {spell.dano && (
                                                        <Box mt={1}>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                Dano: {spell.dano}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    {spell['pré-requisito'] && (
                                                        <Box mt={1}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Pré-requisito: {spell['pré-requisito']}
                                                            </Typography>
                                                        </Box>
                                                    )} */}
                                                </TableCell>
                                                {isEditing && (
                                                    <TableCell>
                                                        <IconButton 
                                                            size="small" 
                                                            color="error"
                                                            onClick={() => {
                                                                const newSpells = [ ...(editedData.spells || charsheet.spells) ];
                                                                newSpells.splice(index, 1);
                                                                updateNestedField('spells', newSpells);
                                                            }}
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                    Este personagem não possui spells
                                </Typography>
                            </Box>
                        )}
                        
                        {charsheet.elementalMastery && charsheet.spells?.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Estatísticas de Spell
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper2' }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                MpCompCost Médio
                                            </Typography>
                                            <Typography variant="h6">
                                                {Math.round(charsheet.spells?.reduce((acc, m) => acc + (m.mpCost || 0), 0) / charsheet.spells?.length)} MP
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper2' }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Elements Dominantes
                                            </Typography>
                                            <Typography variant="body2">
                                                {Array.from(new Set(charsheet.spells?.map(m => m.element))).join(', ')}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper2' }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Maestria
                                            </Typography>
                                            <Typography variant="h6">
                                                {charsheet.elementalMastery}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper2' }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Total MP
                                            </Typography>
                                            <Typography variant="h6">
                                                {charsheet.stats.mp}/{charsheet.stats.maxMp}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </TabPanel>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Fechar</Button>
                </DialogActions>
            </Dialog>

            {/* Modals */}
            <ChangePlayerStatusModal
                open={modalStates.changePlayerStatusModalOpen}
                onClose={() => setModalStates({ ...modalStates, changePlayerStatusModalOpen: false })}
                charsheet={charsheet}
            />
        </>
    );
}
