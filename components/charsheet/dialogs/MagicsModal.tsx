/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/unbound-method */
import { useFormContext } from 'react-hook-form';
import { magiaService as spellService } from '@services';
import { ResourceListModal } from '@components/utils';
import { elements, specialElements } from '@constants';
import { AnimatePresence, motion } from 'framer-motion';
import { alpha, Box, Backdrop } from '@mui/material';
import type { Spell } from '@models/entities';
import type { ReactElement } from 'react';
import type { CharsheetDTO } from '@models/dtos';
import { SPELL_FILTERS } from '@utils/spellCategory';
import { color, shadow } from '@themes/tokens';
import { normalizeToArray } from '@utils/normalizeToArray';
import { getStageProgress, spellStageCount, usesStageUnlock } from '@utils/spellStages';
import { useCharsheetBaseline } from '@contexts';

import Magic from '../subcomponents/Magic';

const SpellsResourceListModal = ResourceListModal;

/** Chave da magia na ficha: o id; magias sem id usam o nome (mesma regra de `spellStages` e da remoção) */
export function spellKey(spell: Pick<Spell, 'id' | 'name'>): string {
    return spell.id || spell.name;
}

function hasSpell(spells: unknown, spell: Spell): boolean {
    const key = spellKey(spell);
    return normalizeToArray<Spell>(spells).some(owned => spellKey(owned) === key);
}

export default function SpellsModal({ open, onClose }: { open: boolean, onClose: () => void }): ReactElement {
    const { getValues, setValue } = useFormContext<CharsheetDTO>();
    const baseline = useCharsheetBaseline();
    
    const invalidate = (message: string) => ({ isValid: false, errorMessage: message });

    const getSpellPointCost = (level: number): 1 | 2 => {
        return level >= 3 ? 2 : 1
    }

    const validateAdd = (spell: Spell) => {
        const { ORMLevel, spellSpace, points, spells } = getValues();
        const cost = getSpellPointCost(Number(spell.level))

        if (hasSpell(spells, spell)) {
            return invalidate('Você já possui esta magia!');
        }
        if (ORMLevel < Number(spell.level)) {
            return invalidate('Seu nível de ORM não é suficiente para esta magia!');
        }
        if (spellSpace < 1 || (points.magics ?? 0) < cost) {
            return invalidate('Você não tem mais espaço ou pontos de magia suficientes!');
        }

        return { isValid: true };
    };

    const addSpell = async (spell: Spell) => {
        const currentSpells = normalizeToArray<Spell>(getValues('spells'));
        const currentPoints = getValues('points');
        const currentSpellsSpace = getValues('spellSpace');
        const cost = getSpellPointCost(Number(spell.level))

        // Segunda barreira (a primeira é o validateAdd): dois cliques seguidos não gastam espaço e pontos duas vezes
        if (hasSpell(currentSpells, spell)) {
            throw new Error('Você já possui esta magia!');
        }

        const newSpell = {
            ...spell,
            id: spellKey(spell)
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
                            backgroundColor: alpha(color.canvas, 0.7)
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
                            boxShadow: shadow.overlay,
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
                            filterLabel="Elemento"
                            secondaryFilters={SPELL_FILTERS}
                            sortOptions={[ 'Nível', 'Elemento', 'Alfabética' ]}
                            itemMinWidth={360}
                            itemMaxColumns={5}
                            renderResource={({ item, handleAddItem }) => {
                                const alreadyAdded = hasSpell(getValues('spells'), item);

                                // Estágios bloqueados também aqui (ver utils/spellStages.ts): magia que a ficha já tem mostra o liberado
                                // dela; magia nova começa no estágio 1. Sistema customizado e Roguelite não usam a regra.
                                const stageRule = usesStageUnlock({ systemId: getValues('systemId'), class: getValues('class') });
                                const progress = getStageProgress(
                                    { spellStages: getValues('spellStages'), spellUnlocked: getValues('spellUnlocked') },
                                    spellKey(item),
                                    spellStageCount(item),
                                    stageRule,
                                    baseline.get()?.spellStages
                                );

                                return (
                                    <Magic
                                        as="magic-spell"
                                        compact
                                        key={spellKey(item)}
                                        magic={item}
                                        id={spellKey(item)}
                                        isAdding={!alreadyAdded}
                                        selectedStage={stageRule ? (alreadyAdded ? progress.active : 1) : undefined}
                                        unlockedStage={stageRule ? (alreadyAdded ? progress.unlocked : 1) : undefined}
                                        onIconClick={alreadyAdded ? undefined : handleAddItem}
                                    />
                                );
                            }}
                        />
                    </Box>
                </>
            )}
        </AnimatePresence>
    )
}
