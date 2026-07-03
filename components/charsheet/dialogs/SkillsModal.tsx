/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/unbound-method */
import { ResourceListModal } from '@components/utils';
import { elements } from '@constants';
import {
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    TextField,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { poderService } from '@services';
import type { Power, RPGSystem, SystemSkill } from '@models/entities';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import Magic from '../subcomponents/Magic';
import type { CharsheetDTO } from '@models/dtos';

const SkillsResourceListModal = ResourceListModal;

export default function SkillsModal({ open, onClose }: { open: boolean, onClose: () => void }): ReactElement {
    const { getValues, setValue } = useFormContext<CharsheetDTO>();
    const { enqueueSnackbar } = useSnackbar();
    const [ customSystem, setCustomSystem ] = useState<RPGSystem | null>(null);
    const [ searchTerm, setSearchTerm ] = useState('');

    const systemId = getValues('systemId');

    useEffect(() => {
        if (systemId) {
            fetch(`/api/rpg-system/${systemId}`)
                .then(async res => await res.json())
                .then((data: RPGSystem) => setCustomSystem(data))
                .catch(() => setCustomSystem(null));
        } else {
            setCustomSystem(null);
        }
    }, [ systemId ]);

    const isCustomSystem = !!customSystem;
    
    const invalidate = (message: string) => ({ isValid: false, errorMessage: message });
    
    const validateAdd = (power: Power) => {
        const availableSkillPoints = getValues().points.skills || 0;
        if (availableSkillPoints <= 0) {
            return invalidate('Você não tem pontos de habilidade disponíveis!');
        }
        
        // Verificar se o nível de ORM é suficiente
        if (getValues().ORMLevel < Number(power.preRequisite?.split(' ')[2]?.replace(',', '') ?? 0)) {
            return invalidate('Seu nível de ORM não é suficiente para este poder!');
        }
        
        // Verificar se o usuário já possui esta habilidade
        const currentPowers = getValues().skills.powers || [];
        const alreadyHasPower = currentPowers.some(existingPower => 
            existingPower.name === power.name && existingPower.type === 'Poder Mágico'
        );
        
        if (alreadyHasPower) {
            return invalidate('Você já possui este poder mágico!');
        }
        
        return { isValid: true };
    };

    const addPower = async (power: Power) => {
        const currentPowers = getValues().skills.powers || [];
        
        // Criar a nova habilidade no formato correto
        const newSkill: Power = {
            name: power.name,
            description: `${power.description}\n\nPré-requisitos: ${power.preRequisite ?? 'Nenhum'}`,
            type: 'Poder Mágico',
            origin: power.element || 'Desconhecido',
            mastery: power.mastery || 'Nenhum',
            element: power.element,
            id: power.id ?? Date.now().toString()
        };

        console.log(newSkill)
        
        // Adicionar a nova habilidade à charsheet
        const updatedPowers = [ ...currentPowers, newSkill ];
        setValue('skills.powers', updatedPowers, { shouldValidate: true });
        
        // Decrementar o contador de pontos de habilidade
        const currentSkillPoints = getValues().points.skills || 0;
        setValue('points.skills', currentSkillPoints - 1, { shouldValidate: true });
        
        // Tocar som de confirmação (opcional)
        const audio = new Audio('/sounds/confirm.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => console.log('Erro ao tocar áudio'));
        
        return { ...power, id: power.id || Date.now().toString() };
    };
    
    // Função para remover um poder mágico da charsheet
    const removePower = (power: Power) => {
        const currentPowers = getValues().skills.powers || [];
        const updatedPowers = currentPowers.filter(existingPower => 
            !(existingPower.name === power.name && existingPower.type === 'Poder Mágico')
        );
        
        setValue('skills.powers', updatedPowers, { shouldValidate: true });
        
        // Tocar som de remoção (opcional)
        const audio = new Audio('/sounds/delete.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => console.log('Erro ao tocar áudio'));
        
        return power;
    };
    
    // ── Habilidades de sistema customizado ─────────────────────
    const ownedCustomSkillNames = useMemo(() => {
        const powers = getValues('skills.powers') || [];
        return new Set(powers.map((p: any) => p.name));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ open, customSystem ]);

    const [ , forceUpdate ] = useState(0);

    const customSkills = useMemo(() => {
        const skills = customSystem?.skills ?? [];
        const term = searchTerm.trim().toLowerCase();
        if (!term) return skills;
        return skills.filter(s =>
            s.name.toLowerCase().includes(term) ||
            (s.description || '').toLowerCase().includes(term)
        );
    }, [ customSystem, searchTerm ]);

    const skillCost = (skill: SystemSkill): number => Math.max(1, skill.cost || 1);

    const customSkillRequirementError = (skill: SystemSkill): string | null => {
        const charLevel = getValues('level') || 0;
        if (skill.level != null && skill.level > 0 && charLevel < skill.level) {
            return `Requer nível ${skill.level}`;
        }
        if (skill.requiredClass) {
            const charClass = getValues('class') as unknown as string;
            const classDef = customSystem?.classes?.find(c => c.key === skill.requiredClass || c.name === skill.requiredClass);
            const matches = charClass && (charClass === skill.requiredClass || charClass === classDef?.name || charClass === classDef?.key);
            if (!matches) {
                return `Exclusiva de ${classDef?.name ?? skill.requiredClass}`;
            }
        }
        return null;
    };

    const addCustomSkill = (skill: SystemSkill) => {
        const points = getValues('points.skills') || 0;
        const cost = skillCost(skill);

        const requirementError = customSkillRequirementError(skill);
        if (requirementError) {
            enqueueSnackbar(requirementError, { variant: 'warning' });
            return;
        }
        if (points < cost) {
            enqueueSnackbar(`Pontos de habilidade insuficientes (custo: ${cost})`, { variant: 'warning' });
            return;
        }

        const currentPowers = getValues('skills.powers') || [];
        setValue('skills.powers', [
            ...currentPowers,
            {
                id: skill.id ?? Date.now().toString(),
                name: skill.name,
                description: skill.description,
                type: skill.type || customSystem?.conceptNames?.skill || 'Habilidade',
                origin: customSystem?.name ?? 'Sistema'
            }
        ] as any, { shouldValidate: true });
        setValue('points.skills', points - cost, { shouldValidate: true });
        ownedCustomSkillNames.add(skill.name);
        forceUpdate(n => n + 1);
        enqueueSnackbar(`${skill.name} adquirida!`, { variant: 'success' });
    };

    const removeCustomSkill = (skill: SystemSkill) => {
        const currentPowers = getValues('skills.powers') || [];
        setValue(
            'skills.powers',
            currentPowers.filter((p: any) => p.name !== skill.name) as any,
            { shouldValidate: true }
        );
        // Devolve os pontos gastos
        const points = getValues('points.skills') || 0;
        setValue('points.skills', points + skillCost(skill), { shouldValidate: true });
        ownedCustomSkillNames.delete(skill.name);
        forceUpdate(n => n + 1);
    };

    // Configuração da animação do modal
    const modalVariants = {
        hidden: { 
            opacity: 0, 
            y: -50,
            scale: 0.95,
            transition: { duration: 0.2 }
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: { 
                type: 'spring',
                damping: 25,
                stiffness: 500
            }
        },
        exit: { 
            opacity: 0, 
            y: -50,
            scale: 0.95,
            transition: { duration: 0.2 }
        }
    };

    // ── Branch: sistema customizado — lista habilidades do próprio sistema ──
    if (isCustomSystem) {
        const skillLabel = customSystem?.conceptNames?.skill || 'Habilidade';
        const availablePoints = getValues('points.skills') || 0;

        return (
            <AnimatePresence>
                {open && (
                    <Box
                        component={motion.div}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={modalVariants}
                        sx={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1400,
                            width: '90%',
                            maxWidth: '760px',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            borderRadius: '12px',
                            boxShadow: 24,
                            outline: 'none',
                            backgroundColor: 'background.paper'
                        }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Typography variant="h6" flex={1}>
                                Gerenciar {skillLabel}s — {customSystem?.name}
                            </Typography>
                            <Chip
                                label={`Pontos: ${availablePoints}`}
                                color={availablePoints > 0 ? 'warning' : 'default'}
                                sx={{ fontWeight: 'bold' }}
                            />
                            <IconButton onClick={onClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        {/* Busca */}
                        <Box sx={{ p: 2, pb: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder={`Buscar ${skillLabel.toLowerCase()}...`}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </Box>

                        {/* Lista */}
                        <Box sx={{ overflow: 'auto', flex: 1, px: 2, pb: 2 }}>
                            {customSkills.length === 0 ? (
                                <Typography color="text.secondary" textAlign="center" py={4}>
                                    Nenhuma {skillLabel.toLowerCase()} disponível neste sistema.
                                </Typography>
                            ) : (
                                <List dense>
                                    {customSkills.map(skill => {
                                        const owned = ownedCustomSkillNames.has(skill.name);
                                        const requirementError = customSkillRequirementError(skill);
                                        const cost = skillCost(skill);

                                        return (
                                            <ListItem
                                                key={skill.id ?? skill.name}
                                                sx={{
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    borderRadius: 2,
                                                    mb: 1,
                                                    opacity: !owned && requirementError ? 0.55 : 1
                                                }}
                                                secondaryAction={
                                                    owned ? (
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            startIcon={<RemoveCircleOutlineIcon />}
                                                            onClick={() => removeCustomSkill(skill)}
                                                        >
                                                            Remover
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="small"
                                                            color="primary"
                                                            startIcon={<AddCircleOutlineIcon />}
                                                            disabled={!!requirementError || availablePoints < cost}
                                                            onClick={() => addCustomSkill(skill)}
                                                        >
                                                            Adquirir
                                                        </Button>
                                                    )
                                                }
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                                            <Typography fontWeight={600}>{skill.name}</Typography>
                                                            {skill.type && <Chip label={skill.type} size="small" variant="outlined" />}
                                                            <Chip label={`Custo: ${cost}`} size="small" color="warning" variant="outlined" />
                                                            {skill.level != null && skill.level > 0 && (
                                                                <Chip label={`Nv. ${skill.level}+`} size="small" variant="outlined" />
                                                            )}
                                                            {requirementError && !owned && (
                                                                <Chip label={requirementError} size="small" color="error" variant="outlined" />
                                                            )}
                                                            {owned && <Chip label="Adquirida" size="small" color="success" />}
                                                        </Box>
                                                    }
                                                    secondary={skill.description}
                                                    secondaryTypographyProps={{
                                                        sx: {
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }
                                                    }}
                                                />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            )}
                        </Box>

                        <Divider />
                        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={onClose}>Fechar</Button>
                        </Box>
                    </Box>
                )}
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            {open && (
                <Box
                    component={motion.div}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={modalVariants}
                    sx={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1400,
                        width: '90%',
                        maxWidth: '1200px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        borderRadius: '12px',
                        boxShadow: 24,
                        outline: 'none',
                        backgroundColor: 'background.paper'
                    }}
                >
                    <SkillsResourceListModal
                        title="Gerenciar Habilidades"
                        open={open}
                        onClose={onClose}
                        queryKey="magicPowers"
                        fetchFunction={async (params) => await poderService.fetch(params)}
                        addFunction={addPower}
                        validateAdd={validateAdd}
                        successMessage={(power) => `Poder Mágico ${power.nome} adicionado!`}
                        errorMessage={(err) => err.message || 'Erro ao adicionar poder mágico'}
                        filterOptions={elements.map(element => element.toUpperCase())}
                        sortOptions={[ 'Elemento', 'Nome' ]}
                        initialSort={{ value: 'Nome', order: 'ASC' }}
                        renderResource={({ item, handleAddItem }) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                // style={{ maxHeight: '300px' }}
                            >
                                <Magic
                                    as="magic-power"
                                    key={item.id}
                                    magicPower={item}
                                    id={item.id}
                                    isAdding={(() => {
                                        const currentPowers = getValues().skills.powers || [];
                                        return !currentPowers.some(existingPower => 
                                            existingPower.name === item.nome && existingPower.type === 'Poder Mágico'
                                        );
                                    })()}
                                    onIconClick={(() => {
                                        const currentPowers = getValues().skills.powers || [];
                                        const alreadyHasPower = currentPowers.some(existingPower => 
                                            existingPower.name === item.nome && existingPower.type === 'Poder Mágico'
                                        );
                                        
                                        return alreadyHasPower 
                                            ? () => removePower(item) 
                                            : handleAddItem;
                                    })()}
                                />
                                
                            </motion.div>
                        )}
                    />
                </Box>
            )}
        </AnimatePresence>
    )
}
