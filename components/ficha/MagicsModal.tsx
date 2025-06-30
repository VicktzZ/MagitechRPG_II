/* eslint-disable @typescript-eslint/unbound-method */
import { useFormikContext } from 'formik';
import { magiaService } from '@services';
import { ResourceListModal }from '@components/utils';
import type { Ficha, Magia as MagicType } from '@types';
import type { ReactElement } from 'react';
import { elements } from '@constants';
import Magic from './Magic';

const MagicsResourceListModal = ResourceListModal<MagicType>;    

export default function MagicsModal({ open, onClose }: { open: boolean, onClose: () => void }): ReactElement {
    const { values: f } = useFormikContext<Ficha>();
    const invalidate = (message: string) => ({ isValid: false, errorMessage: message });

    const validateAdd = (magic: MagicType) => {
        if (f.ORMLevel < Number(magic.nível))
            return invalidate('Seu nível de ORM não é suficiente para esta magia!');
        if (f.magicsSpace < 1)
            return invalidate('Você não tem mais espaço para mais magias!');
        if (f.points.magics < 1)
            return invalidate('Você não tem pontos suficientes para esta magia!');

        return { isValid: true };
    };

    const addMagic = async (magic: MagicType) => {
        // const updatedPowers = [
        //     ...ficha.Magics.powers,
        //     {
        //         name: power.nome,
        //         description: `${power.descrição}\n\nPré-requisitos: ${power['pré-requisito'] ?? 'Nenhum'}`,
        //         type: 'Poder Mágico'
        //     }
        // ];

        // await fichaService.updateById({ id: ficha._id, data: { Magics: { ...ficha.Magics, powers: updatedPowers } } });
        
        return { ...magic, name: magic.nome || Date.now().toString() };
    };
    
    return (
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
            filterOptions={elements.map(element => element.toUpperCase())}
            sortOptions={[ 'Nível', 'Elemento', 'Alfabética' ]}
            renderResource={({ item, handleAddItem }) => (
                <Magic
                    as="magic-spell"
                    key={item.nome}
                    magic={item}
                    id={item.nome}
                    isAdding
                    onIconClick={handleAddItem}
                />
            )}
        />
    )
}
