'use client';

import React, { useState } from 'react';
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
    IconButton
} from '@mui/material';
import { elementColor } from '@constants';
import { Edit } from '@mui/icons-material';
import ChangePlayerStatusModal from './ChangePlayerStatusModal';
import type { CharsheetDTO } from '@models/dtos';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';

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

    const [ modalStates, setModalStates ] = useState({
        changePlayerStatusModalOpen: false,
        changePlayerAttributesModalOpen: false,
        changePlayerSkillsModalOpen: false,
        changePlayerSpellsModalOpen: false,
        changePlayerInventoryModalOpen: false,
        changePlayerAbilitiesModalOpen: false
    })

    const { data: spells } = useFirestoreRealtime('spell', {
        filters: [
            { field: 'id', operator: 'in', value: charsheet.spells }
        ],
        enabled: charsheet.spells.length > 0
    })

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
                                <Typography variant="h6">
                                    {charsheet.name} - Nível {charsheet.level}
                                </Typography>
                                <Typography color="textSecondary" variant="subtitle1">({charsheet.id})</Typography>
                            </Box>
                            <Typography variant="subtitle1">
                                {charsheet.playerName}
                            </Typography>
                        </Box>
                        <Chip 
                            label={`${charsheet.class as string} ${charsheet.subclass ? `/ ${charsheet.subclass as string}` : ''}`}
                            color="primary"
                        />
                    </Box>
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
                                                <TableCell>{charsheet.name}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Jogador</TableCell>
                                                <TableCell>{charsheet.playerName}</TableCell>
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
                                                <TableCell>{charsheet.race}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Gênero</TableCell>
                                                <TableCell>{charsheet.gender}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Idade</TableCell>
                                                <TableCell>{charsheet.age} anos</TableCell>
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
                                    <IconButton 
                                        size="small"
                                        color="primary"
                                        onClick={() => setModalStates({ ...modalStates, changePlayerStatusModalOpen: true })}
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                </Box>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>HP</TableCell>
                                                <TableCell>{charsheet.stats.lp}/{charsheet.stats.maxLp}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>MP</TableCell>
                                                <TableCell>{charsheet.stats.mp}/{charsheet.stats.maxMp}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>AP</TableCell>
                                                <TableCell>{charsheet.stats.ap}/{charsheet.stats.maxAp}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Deslocamento</TableCell>
                                                <TableCell>{charsheet.displacement}m</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Capacidade</TableCell>
                                                <TableCell>{charsheet.capacity.cargo}/{charsheet.capacity.max} kg</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Dinheiro</TableCell>
                                                <TableCell>$ {charsheet.inventory.money}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Munição</TableCell>
                                                <TableCell>{charsheet.ammoCounter.current}/{charsheet.ammoCounter.max}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Espaço mágico</TableCell>
                                                <TableCell>{charsheet.spellSpace}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Maestria Elemental</TableCell>
                                                <TableCell>{charsheet.elementalMastery || 'Nenhuma'}</TableCell>
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
                                            <Chip 
                                                label={`Atributos: ${charsheet.points.attributes}`} 
                                                color="primary" 
                                                variant="outlined"
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Chip 
                                                label={`Perícias: ${charsheet.points.expertises}`} 
                                                color="secondary" 
                                                variant="outlined"
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Chip 
                                                label={`Habilidades: ${charsheet.points.skills}`} 
                                                color="info" 
                                                variant="outlined"
                                                sx={{ width: '100%' }}
                                            />
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
                                    <TableRow>
                                        <TableCell>Vigor (VIG)</TableCell>
                                        <TableCell>{charsheet.attributes.vig}</TableCell>
                                        <TableCell>{charsheet.mods.attributes.vig}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Destreza (DES)</TableCell>
                                        <TableCell>{charsheet.attributes.des}</TableCell>
                                        <TableCell>{charsheet.mods.attributes.des}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Lógica (LOG)</TableCell>
                                        <TableCell>{charsheet.attributes.log}</TableCell>
                                        <TableCell>{charsheet.mods.attributes.log}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Sabedoria (SAB)</TableCell>
                                        <TableCell>{charsheet.attributes.sab}</TableCell>
                                        <TableCell>{charsheet.mods.attributes.sab}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Foco (FOC)</TableCell>
                                        <TableCell>{charsheet.attributes.foc}</TableCell>
                                        <TableCell>{charsheet.mods.attributes.foc}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Carisma (CAR)</TableCell>
                                        <TableCell>{charsheet.attributes.car}</TableCell>
                                        <TableCell>{charsheet.mods.attributes.car}</TableCell>
                                    </TableRow>
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
                                                <TableCell>{expertise.value}</TableCell>
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
                                <Typography variant="subtitle1" gutterBottom>Armas ({charsheet.inventory.weapons.length})</Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>Dano</TableCell>
                                                <TableCell>Tipo</TableCell>
                                                <TableCell>Categoria</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {charsheet.inventory.weapons.map((weapon, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{weapon.name}</TableCell>
                                                    <TableCell>{weapon.effect.value}</TableCell>
                                                    <TableCell>{weapon.kind}</TableCell>
                                                    <TableCell>{weapon.categ}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>Armaduras ({charsheet.inventory.armors.length})</Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>Defesa</TableCell>
                                                <TableCell>Tipo</TableCell>
                                                <TableCell>Categoria</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {charsheet.inventory.armors.map((armor, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{armor.name}</TableCell>
                                                    <TableCell>{armor.value}</TableCell>
                                                    <TableCell>{armor.kind}</TableCell>
                                                    <TableCell>{armor.categ}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>Itens ({charsheet.inventory.items.length})</Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>Tipo</TableCell>
                                                <TableCell>Quantidade</TableCell>
                                                <TableCell>Peso</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {charsheet.inventory.items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell>{item.kind}</TableCell>
                                                    <TableCell>{item.quantity ?? 1}</TableCell>
                                                    <TableCell>{item.weight} kg</TableCell>
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
                                <Typography variant="subtitle1" gutterBottom>Habilidades de Classe ({charsheet.skills.class.length})</Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>Nível</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {charsheet.skills.class.map((skill, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{skill.name}</TableCell>
                                                    <TableCell>{skill.level ?? '—'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            
                            {charsheet.skills.subclass.length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>Habilidades de Subclasse ({charsheet.skills.subclass.length})</Typography>
                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Nome</TableCell>
                                                    <TableCell>Nível</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {charsheet.skills.subclass.map((skill, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{skill.name}</TableCell>
                                                        <TableCell>{skill.level ?? '—'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            )}
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>Habilidades de Linhagem ({charsheet.skills.lineage?.length})</Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>Origem</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {charsheet.skills.lineage?.map((skill, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{skill.name}</TableCell>
                                                    <TableCell>{skill.origin ?? '—'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            
                            {charsheet.skills.bonus?.length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>Habilidades Bônus ({charsheet.skills.bonus?.length})</Typography>
                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Nome</TableCell>
                                                    <TableCell>Origem</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {charsheet.skills.bonus?.map((skill, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{skill.name}</TableCell>
                                                        <TableCell>{skill.origin ?? '—'}</TableCell>
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
