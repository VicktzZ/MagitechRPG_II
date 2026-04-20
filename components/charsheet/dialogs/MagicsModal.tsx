/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/unbound-method */
import { useFormContext } from 'react-hook-form';
import { magiaService as spellService } from '@services';
import { ResourceListModal } from '@components/utils';
import { elements, specialElements } from '@constants';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Backdrop } from '@mui/material';
import type { Spell } from '@models/entities';
import type { ReactElement } from 'react';
import type { CharsheetDTO } from '@models/dtos';

import Magic from '../subcomponents/Magic';

const SpellsResourceListModal = ResourceListModal;    

export default function SpellsModal({ open, onClose }: { open: boolean, onClose: () => void }): ReactElement {
    const { getValues, setValue } = useFormContext<CharsheetDTO>();
    
    const invalidate = (message: string) => ({ isValid: false, errorMessage: message });

    const getSpellPointCost = (level: number): 1 | 2 => {
        return level >= 3 ? 2 : 1
    }

    const validateAdd = (spell: Spell) => {
        const { ORMLevel, spellSpace, points } = getValues();
        const cost = getSpellPointCost(Number(spell.level))
        
        if (ORMLevel < Number(spell.level)) {
            return invalidate('Seu nível de ORM não é suficiente para esta magia!');
        }
        if (spellSpace < 1 || (points.magics ?? 0) < cost) {
            return invalidate('Você não tem mais espaço ou pontos de magia suficientes!');
        }

        return { isValid: true };
    };

    const addSpell = async (spell: Spell) => {
        const currentSpells = getValues('spells') || [];
        const currentPoints = getValues('points');
        const currentSpellsSpace = getValues('spellSpace');
        const cost = getSpellPointCost(Number(spell.level))
        
        const newSpell = {
            ...spell,
            id: spell.id ?? Date.now().toString()
        };
        
        setValue('spells', [ ...currentSpells, newSpell ], { shouldValidate: true });
        setValue('points.magics', (currentPoints.magics ?? 0) - cost, { shouldValidate: true });
        setValue('spellSpace', currentSpellsSpace - 1, { shouldValidate: true });

        return newSpell;
    };
    
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

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { duration: 0.2 }
        },
        exit: { 
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <Backdrop
                        component={motion.div}
                        initial="hidden"
                        animate="visible"
                        variants={backdropVariants}
                        open={open}
                        onClick={onClose}
                        sx={{ 
                            zIndex: 1300,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)'
                        }}
                    />
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
                        <SpellsResourceListModal
                            title="Gerenciar Magias"
                            open={open}
                            onClose={onClose}
                            queryKey="Spells"
                            fetchFunction={async (params) => await spellService.fetch(params)}
                            addFunction={addSpell}
                            validateAdd={validateAdd}
                            successMessage={(spell) => `Magia ${spell.name} adicionada!`}
                            errorMessage={(err) => err.message || 'Erro ao adicionar magia'}
                            filterOptions={getValues('level') < 15 ? elements : [ ...elements, ...specialElements ]}
                            sortOptions={[ 'Nível', 'Elemento', 'Alfabética' ]}
                            renderResource={({ item, handleAddItem }) => {
                                const currentSpells = getValues('spells') || [];
                                const alreadyAdded = currentSpells.some(m => m.id === item.id);
                                
                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Magic
                                            as="magic-spell"
                                            key={item.id ?? item.nome}
                                            magic={item}
                                            id={item.id ?? item.nome}
                                            isAdding={!alreadyAdded}
                                            onIconClick={alreadyAdded ? undefined : handleAddItem}
                                        />
                                    </motion.div>
                                );
                            }}
                        />
                    </Box>
                </>
            )}
        </AnimatePresence>
    )
}
