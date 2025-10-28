/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/unbound-method */
import { ResourceListModal } from '@components/utils';
import { elements } from '@constants';
import { Box } from '@mui/material';
import { poderService } from '@services';
import type { Power } from '@models/entities';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactElement } from 'react';
import { useFormContext } from 'react-hook-form';
import Magic from '../subcomponents/Magic';
import type { CharsheetDTO } from '@models/dtos';

const SkillsResourceListModal = ResourceListModal;    

export default function SkillsModal({ open, onClose }: { open: boolean, onClose: () => void }): ReactElement {
    const { getValues, setValue } = useFormContext<CharsheetDTO>();
    
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
        
        // Adicionar a nova habilidade à ficha
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
    
    // Função para remover um poder mágico da ficha
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
                                        // Verificar se o usuário já possui esta habilidade
                                        const currentPowers = getValues().skills.powers || [];
                                        return !currentPowers.some(existingPower => 
                                            existingPower.name === item.nome && existingPower.type === 'Poder Mágico'
                                        );
                                    })()}
                                    onIconClick={(() => {
                                        // Verificar se o usuário já possui esta habilidade
                                        const currentPowers = getValues().skills.powers || [];
                                        const alreadyHasPower = currentPowers.some(existingPower => 
                                            existingPower.name === item.nome && existingPower.type === 'Poder Mágico'
                                        );
                                        
                                        // Retornar a função de adicionar ou remover conforme o caso
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
