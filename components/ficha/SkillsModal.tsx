/* eslint-disable @typescript-eslint/unbound-method */
import { useFormikContext } from 'formik';
import { poderService } from '@services';
import { ResourceListModal }from '@components/utils';
import type { Ficha, MagicPower } from '@types';
import type { ReactElement } from 'react';
import { elements } from '@constants';
import Magic from './Magic';

const SkillsResourceListModal = ResourceListModal<MagicPower>;    

export default function SkillsModal({ open, onClose }: { open: boolean, onClose: () => void }): ReactElement {
    const { values: f } = useFormikContext<Ficha>();
    
    const validateAdd = (power: MagicPower) => {
        if (f.ORMLevel < Number(power['pré-requisito']?.split(' ')[2]?.replace(',', '') ?? 0)) {
            return { 
                isValid: false, 
                errorMessage: 'Seu nível de ORM não é suficiente para este poder!' 
            };
        }
        return { isValid: true };
    };

    const addPower = async (power: MagicPower) => {
        // const updatedPowers = [
        //     ...ficha.skills.powers,
        //     {
        //         name: power.nome,
        //         description: `${power.descrição}\n\nPré-requisitos: ${power['pré-requisito'] ?? 'Nenhum'}`,
        //         type: 'Poder Mágico'
        //     }
        // ];

        // await fichaService.updateById({ id: ficha._id, data: { skills: { ...ficha.skills, powers: updatedPowers } } });
        
        return { ...power, _id: power._id || Date.now().toString() };
    };
    
    return (
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
            sortOptions={[ 'Nível', 'Elemento', 'Alfabética' ]}
            renderResource={({ item, handleAddItem }) => (
                <Magic
                    as="magic-power"
                    key={item._id}
                    magicPower={item}
                    id={item._id}
                    isAdding
                    onIconClick={handleAddItem}
                />
            )}
        />
    )
}
