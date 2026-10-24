import { ResourceListModal } from '@components/utils';
import Magic from '@components/charsheet/subcomponents/Magic';
import { poderService, magiaService } from '@services';
import { elements, specialElements } from '@constants';
import { elementHint } from '@utils/elements';
import { SPELL_FILTERS } from '@utils/spellCategory';
import type { Power, Spell } from '@models/entities';
import type { SkillData, SpellData } from './types';

interface CreatureResourceModalsProps {
    skillsModalOpen: boolean;
    onCloseSkills: () => void;
    spellsModalOpen: boolean;
    onCloseSpells: () => void;
    validateAddPowerForCreature: () => { isValid: boolean };
    handleAddPowerToCreature: (power: Power) => Promise<SkillData>;
    validateAddSpellForCreature: () => { isValid: boolean };
    handleAddSpellToCreature: (spell: Spell) => Promise<SpellData>;
}

/** Seletores do banco de dados: habilidades (poderes) e magias adicionadas à criatura */
export default function CreatureResourceModals({
    skillsModalOpen,
    onCloseSkills,
    spellsModalOpen,
    onCloseSpells,
    validateAddPowerForCreature,
    handleAddPowerToCreature,
    validateAddSpellForCreature,
    handleAddSpellToCreature
}: CreatureResourceModalsProps) {
    return (
        <>
            <ResourceListModal
                title="Selecionar Habilidades"
                open={skillsModalOpen}
                onClose={onCloseSkills}
                queryKey="magicPowers-creature"
                fetchFunction={async (params) => await poderService.fetch(params)}
                addFunction={handleAddPowerToCreature}
                validateAdd={validateAddPowerForCreature}
                successMessage={(power: Power) => `Habilidade ${power.name} adicionada à criatura!`}
                errorMessage={(err: Error) => err.message || 'Erro ao adicionar habilidade'}
                filterOptions={elements.map(element => element.toUpperCase())}
                filterLabel="Elemento"
                sortOptions={[ 'Elemento', 'Nome' ]}
                initialSort={{ value: 'Nome', order: 'ASC' }}
                renderResource={({ item, handleAddItem }) => (
                    <Magic
                        as="magic-power"
                        key={item.id}
                        magicPower={item}
                        id={item.id}
                        isAdding
                        onIconClick={handleAddItem}
                    />
                )}
            />

            <ResourceListModal
                title="Selecionar Magias"
                open={spellsModalOpen}
                onClose={onCloseSpells}
                queryKey="spells-creature"
                fetchFunction={async (params) => await magiaService.fetch(params)}
                addFunction={handleAddSpellToCreature}
                validateAdd={validateAddSpellForCreature}
                successMessage={(spell: Spell) => `Magia ${spell.name} adicionada à criatura!`}
                errorMessage={(err: Error) => err.message || 'Erro ao adicionar magia'}
                filterOptions={[ ...elements, ...specialElements ]}
                filterLabel="Elemento"
                filterOptionHint={elementHint}
                secondaryFilters={SPELL_FILTERS}
                sortOptions={[ 'Nível', 'Elemento', 'Alfabética' ]}
                initialSort={{ value: 'Nível', order: 'ASC' }}
                itemMinWidth={360}
                itemMaxColumns={5}
                renderResource={({ item, handleAddItem }) => (
                    <Magic
                        as="magic-spell"
                        compact
                        key={item.id}
                        magic={item}
                        id={item.id}
                        isAdding
                        onIconClick={handleAddItem}
                    />
                )}
            />
        </>
    );
}
