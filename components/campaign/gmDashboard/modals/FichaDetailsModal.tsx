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
import type { Ficha } from '@types';
import { elementColor } from '@constants';
import { Edit } from '@node_modules/@mui/icons-material';
import ChangePlayerStatusModal from './ChangePlayerStatusModal';

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
            id={`ficha-tabpanel-${index}`}
            aria-labelledby={`ficha-tab-${index}`}
            {...other}
            style={{ maxHeight: '500px', overflowY: 'auto' }}
        >
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `ficha-tab-${index}`,
        'aria-controls': `ficha-tabpanel-${index}`
    };
}

interface FichaDetailsModalProps {
    open: boolean;
    onClose: () => void;
    ficha: Required<Ficha>;
}

export default function FichaDetailsModal({ open, onClose, ficha }: FichaDetailsModalProps) {
    const [ tabValue, setTabValue ] = useState(0);

    const [ modalStates, setModalStates ] = useState({
        changePlayerStatusModalOpen: false,
        changePlayerAttributesModalOpen: false,
        changePlayerSkillsModalOpen: false,
        changePlayerMagicsModalOpen: false,
        changePlayerInventoryModalOpen: false,
        changePlayerAbilitiesModalOpen: false
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
                        <Typography variant="h6">
                            {ficha.name} - Nível {ficha.level}
                        </Typography>
                        <Chip 
                            label={`${ficha.class as string} ${ficha.subclass ? `/ ${ficha.subclass as string}` : ''}`}
                            color="primary"
                        />
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="detalhes da ficha">
                            <Tab label="Informações Básicas" {...a11yProps(0)} />
                            <Tab label="Atributos" {...a11yProps(1)} />
                            <Tab label="Perícias" {...a11yProps(2)} />
                            <Tab label="Inventário" {...a11yProps(3)} />
                            <Tab label="Habilidades" {...a11yProps(4)} />
                            <Tab label="Magias" {...a11yProps(5)} />
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
                                                <TableCell>{ficha.name}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Jogador</TableCell>
                                                <TableCell>{ficha.playerName}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Classe</TableCell>
                                                <TableCell>{ficha.class as string}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Subclasse</TableCell>
                                                <TableCell>{ficha.subclass as string || 'Nenhuma'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Linhagem</TableCell>
                                                <TableCell>{ficha.lineage as unknown as string}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Raça</TableCell>
                                                <TableCell>{typeof ficha.race === 'string' ? ficha.race : ficha.race.name}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Gênero</TableCell>
                                                <TableCell>{ficha.gender}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Idade</TableCell>
                                                <TableCell>{ficha.age} anos</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Modo</TableCell>
                                                <TableCell>{ficha.mode}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Condição Financeira</TableCell>
                                                <TableCell>{ficha.financialCondition}</TableCell>
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
                                                <TableCell>{ficha.attributes.lp}/{ficha.attributes.maxLp}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>MP</TableCell>
                                                <TableCell>{ficha.attributes.mp}/{ficha.attributes.maxMp}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>AP</TableCell>
                                                <TableCell>{ficha.attributes.ap}/{ficha.attributes.maxAp}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Deslocamento</TableCell>
                                                <TableCell>{ficha.displacement}m</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Capacidade</TableCell>
                                                <TableCell>{ficha.capacity.cargo}/{ficha.capacity.max} kg</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Dinheiro</TableCell>
                                                <TableCell>$ {ficha.inventory.money}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Munição</TableCell>
                                                <TableCell>{ficha.ammoCounter.current}/{ficha.ammoCounter.max}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Espaço mágico</TableCell>
                                                <TableCell>{ficha.magicsSpace}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Maestria Elemental</TableCell>
                                                <TableCell>{ficha.elementalMastery || 'Nenhuma'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Traços</TableCell>
                                                <TableCell>{ficha.traits?.map((trait) => trait.name).join(', ') || 'Nenhum'}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Box mt={2}>
                                    <Typography variant="subtitle1" gutterBottom>Pontos Disponíveis</Typography>
                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Chip 
                                                label={`Atributos: ${ficha.points.attributes}`} 
                                                color="primary" 
                                                variant="outlined"
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Chip 
                                                label={`Perícias: ${ficha.points.expertises}`} 
                                                color="secondary" 
                                                variant="outlined"
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Chip 
                                                label={`Habilidades: ${ficha.points.skills}`} 
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
                                        <TableCell>Bônus</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Destreza (DES)</TableCell>
                                        <TableCell>{ficha.attributes.des}</TableCell>
                                        <TableCell>{Math.floor((ficha.attributes.des - 10) / 2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Vigor (VIG)</TableCell>
                                        <TableCell>{ficha.attributes.vig}</TableCell>
                                        <TableCell>{Math.floor((ficha.attributes.vig - 10) / 2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Lógica (LOG)</TableCell>
                                        <TableCell>{ficha.attributes.log}</TableCell>
                                        <TableCell>{Math.floor((ficha.attributes.log - 10) / 2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Sabedoria (SAB)</TableCell>
                                        <TableCell>{ficha.attributes.sab}</TableCell>
                                        <TableCell>{Math.floor((ficha.attributes.sab - 10) / 2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Foco (FOC)</TableCell>
                                        <TableCell>{ficha.attributes.foc}</TableCell>
                                        <TableCell>{Math.floor((ficha.attributes.foc - 10) / 2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Carisma (CAR)</TableCell>
                                        <TableCell>{ficha.attributes.car}</TableCell>
                                        <TableCell>{Math.floor((ficha.attributes.car - 10) / 2)}</TableCell>
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
                                        <TableCell>Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(ficha.expertises).map(([ name, expertise ]) => {
                                        const attrValue = expertise.defaultAttribute 
                                            ? Math.floor((ficha.attributes[expertise.defaultAttribute as keyof typeof ficha.attributes] - 10) / 2)
                                            : 0;    
                                        
                                        return (
                                            <TableRow key={name}>
                                                <TableCell>{name}</TableCell>
                                                <TableCell>{expertise.value}</TableCell>
                                                <TableCell>{expertise.defaultAttribute?.toUpperCase() || '—'}</TableCell>
                                                <TableCell>{expertise.value + attrValue}</TableCell>
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
                                <Typography variant="subtitle1" gutterBottom>Armas ({ficha.inventory.weapons.length})</Typography>
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
                                            {ficha.inventory.weapons.map((weapon, index) => (
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
                                <Typography variant="subtitle1" gutterBottom>Armaduras ({ficha.inventory.armors.length})</Typography>
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
                                            {ficha.inventory.armors.map((armor, index) => (
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
                                <Typography variant="subtitle1" gutterBottom>Itens ({ficha.inventory.items.length})</Typography>
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
                                            {ficha.inventory.items.map((item, index) => (
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
                                <Typography variant="subtitle1" gutterBottom>Habilidades de Classe ({ficha.skills.class.length})</Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>Nível</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {ficha.skills.class.map((skill, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{skill.name}</TableCell>
                                                    <TableCell>{skill.level ?? '—'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            
                            {ficha.skills.subclass.length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>Habilidades de Subclasse ({ficha.skills.subclass.length})</Typography>
                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Nome</TableCell>
                                                    <TableCell>Nível</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {ficha.skills.subclass.map((skill, index) => (
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
                                <Typography variant="subtitle1" gutterBottom>Habilidades de Linhagem ({ficha.skills.lineage?.length})</Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>Origem</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {ficha.skills.lineage?.map((skill, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{skill.name}</TableCell>
                                                    <TableCell>{skill.origin ?? '—'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            
                            {ficha.skills.bonus?.length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>Habilidades Bônus ({ficha.skills.bonus?.length})</Typography>
                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Nome</TableCell>
                                                    <TableCell>Origem</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {ficha.skills.bonus?.map((skill, index) => (
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

                    {/* Magias */}
                    <TabPanel value={tabValue} index={5}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Espaço Mágico: {ficha.magicsSpace} / Maestria Elemental: {ficha.elementalMastery ?? 'Nenhuma'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Total de Magias: {ficha.magics?.length}
                            </Typography>
                        </Box>
                        
                        {ficha.magics?.length > 0 ? (
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
                                        {ficha.magics?.map((magia, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Typography variant="body2" fontWeight="bold">{magia?.nome}</Typography>
                                                        {magia?.tipo && (
                                                            <Chip 
                                                                label={magia?.tipo} 
                                                                size="small" 
                                                                variant="outlined"
                                                                sx={{ mt: 0.5, alignSelf: 'flex-start' }}
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={magia?.elemento} 
                                                        size="small" 
                                                        sx={{ bgcolor: elementColor[magia?.elemento], color: magia?.elemento === 'NÃO-ELEMENTAL' || magia?.elemento === 'LUZ' ? 'black' : 'white' }}
                                                    />
                                                </TableCell>
                                                <TableCell>{magia?.custo} MP</TableCell>
                                                <TableCell>
                                                    {magia?.nível}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ maxWidth: 250, whiteSpace: 'pre-wrap' }}>
                                                        {magia?.['estágio 1']}
                                                    </Typography>
                                                    {/* {magia.dano && (
                                                        <Box mt={1}>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                Dano: {magia.dano}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    {magia['pré-requisito'] && (
                                                        <Box mt={1}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Pré-requisito: {magia['pré-requisito']}
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
                                    Este personagem não possui magias
                                </Typography>
                            </Box>
                        )}
                        
                        {ficha.elementalMastery && ficha.magics?.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Estatísticas de Magia
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper2' }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Custo Médio
                                            </Typography>
                                            <Typography variant="h6">
                                                {Math.round(ficha.magics?.reduce((acc, m) => acc + (m.custo || 0), 0) / ficha.magics?.length)} MP
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper2' }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Elementos Dominantes
                                            </Typography>
                                            <Typography variant="body2">
                                                {Array.from(new Set(ficha.magics?.map(m => m.elemento))).join(', ')}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper2' }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Maestria
                                            </Typography>
                                            <Typography variant="h6">
                                                {ficha.elementalMastery}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper2' }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Total MP
                                            </Typography>
                                            <Typography variant="h6">
                                                {ficha.attributes.mp}/{ficha.attributes.maxMp}
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
                ficha={ficha}
            />
        </>
    );
}
