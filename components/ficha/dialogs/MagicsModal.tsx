/* eslint-disable @typescript-eslint/unbound-method */
import { useFormContext } from 'react-hook-form';
import { magiaService } from '@services';
import { ResourceListModal } from '@components/utils';
import type { Ficha, Magia as MagicType } from '@types';
import type { ReactElement } from 'react';
import { elements } from '@constants';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Backdrop } from '@mui/material';
import Magic from '../subcomponents/Magic';

const MagicsResourceListModal = ResourceListModal;    

export default function MagicsModal({ open, onClose }: { open: boolean, onClose: () => void }): ReactElement {
    const { getValues, setValue } = useFormContext<Ficha>();
    
    const invalidate = (message: string) => ({ isValid: false, errorMessage: message });

    const validateAdd = (magic: MagicType) => {
        const { ORMLevel, magicsSpace, points } = getValues();
        
        if (ORMLevel < Number(magic.nível)) {
            return invalidate('Seu nível de ORM não é suficiente para esta magia!');
        }
        if (magicsSpace < 1 || points.magics < 1) {
            return invalidate('Você não tem mais espaço ou pontos de magia suficientes!');
        }

        return { isValid: true };
    };

    const addMagic = async (magic: MagicType) => {
        const currentMagics = getValues('magics') || [];
        const currentPoints = getValues('points');
        const currentMagicsSpace = getValues('magicsSpace');
        
        const newMagic = {
            ...magic,
            _id: magic._id ?? Date.now().toString()
        };
        
        setValue('magics', [ ...currentMagics, newMagic ], { shouldValidate: true });
        setValue('points.magics', currentPoints.magics - 1, { shouldValidate: true });
        setValue('magicsSpace', currentMagicsSpace - 1, { shouldValidate: true });
        console.log(getValues().magics)

        return newMagic;
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
                        <MagicsResourceListModal
                            title="Gerenciar Magias"
                            open={open}
                            onClose={onClose}
                            queryKey="Magics"
                            fetchFunction={async (params) => await magiaService.fetch(params)}
                            addFunction={addMagic}
                            validateAdd={validateAdd}
                            successMessage={(magic) => `Magia ${magic.nome} adicionada!`}
                            errorMessage={(err) => err.message || 'Erro ao adicionar magia'}
                            filterOptions={elements}
                            sortOptions={[ 'Nível', 'Elemento', 'Alfabética' ]}
                            renderResource={({ item, handleAddItem }) => {
                                const currentMagics = getValues('magics') || [];
                                const alreadyAdded = currentMagics.some(m => m._id === item._id);
                                
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
                                            key={item._id ?? item.nome}
                                            magic={item}
                                            id={item._id ?? item.nome}
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
