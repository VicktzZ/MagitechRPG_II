'use client';

import { useCampaignContext } from '@contexts';
import type { CharsheetDTO } from '@models/dtos';
import { getSheetMetrics } from '@utils/charsheetMetrics';
import { TextField, Typography } from '@mui/material';
import { useState, type ReactElement, type ReactNode } from 'react';
import ChangePlayerStatusModal from '../modals/ChangePlayerStatusModal';
import AttributesTab from '../modals/charsheetDetails/AttributesTab';
import BasicInfoTab from '../modals/charsheetDetails/BasicInfoTab';
import { getInputValue } from '../modals/charsheetDetails/charsheetEdit';
import ExpertisesTab from '../modals/charsheetDetails/ExpertisesTab';
import InventoryTab from '../modals/charsheetDetails/InventoryTab';
import SkillsTab from '../modals/charsheetDetails/SkillsTab';
import SpellsTab from '../modals/charsheetDetails/SpellsTab';
import { useCharsheetSpells } from '../modals/charsheetDetails/useCharsheetSpells';
import EditableSection from './EditableSection';
import { combatantEffects } from '@utils/combat/effectDice';
import { useGMExpertiseRoll } from './useGMExpertiseRoll';

type Sheet = Required<CharsheetDTO>;

interface SheetWindowProps {
    charsheetId: string;
    children: (charsheet: Sheet) => ReactNode;
}

/** Busca a ficha da janela na campanha (em tempo real); se ela saiu da campanha, diz isso em vez de quebrar */
export function SheetWindow({ charsheetId, children }: SheetWindowProps): ReactElement {
    const { charsheets } = useCampaignContext();
    const charsheet = charsheets.find(sheet => sheet.id === charsheetId);

    if (!charsheet) {
        return <Typography color="text.secondary">Esta ficha não está mais na campanha.</Typography>;
    }

    return <>{children(charsheet as unknown as Sheet)}</>;
}

/** "Informações": detalhes do personagem, pontos vitais e pontos para gastar (o nível se edita aqui também) */
export function InfoWindow({ charsheetId }: { charsheetId: string }): ReactElement {
    const { campaign } = useCampaignContext();
    const [ statusOpen, setStatusOpen ] = useState(false);

    return (
        <SheetWindow charsheetId={charsheetId}>
            {charsheet => (
                <>
                    <EditableSection charsheet={charsheet}>
                        {({ editedData, isEditing, updateNestedField, handleNumberInputChange, weightUnit }) => (
                            <>
                                {isEditing && (
                                    <TextField
                                        size="small"
                                        type="number"
                                        label="Nível"
                                        value={getInputValue(editedData.level, 0)}
                                        onChange={event => handleNumberInputChange('level', event.target.value)}
                                        sx={{ width: 120, mb: 2 }}
                                    />
                                )}
                                <BasicInfoTab
                                    metrics={getSheetMetrics(charsheet, campaign.mode, campaign.session?.combat)}
                                    charsheet={charsheet}
                                    editedData={editedData}
                                    isEditing={isEditing}
                                    updateNestedField={updateNestedField}
                                    handleNumberInputChange={handleNumberInputChange}
                                    weightUnit={weightUnit}
                                    onOpenStatusModal={() => setStatusOpen(true)}
                                />
                            </>
                        )}
                    </EditableSection>
                    <ChangePlayerStatusModal open={statusOpen} onClose={() => setStatusOpen(false)} charsheet={charsheet} />
                </>
            )}
        </SheetWindow>
    );
}

export function AttributesWindow({ charsheetId }: { charsheetId: string }): ReactElement {
    return (
        <SheetWindow charsheetId={charsheetId}>
            {charsheet => (
                <EditableSection charsheet={charsheet}>
                    {({ editedData, isEditing, updateNestedField }) => (
                        <AttributesTab charsheet={charsheet} editedData={editedData} isEditing={isEditing} updateNestedField={updateNestedField} />
                    )}
                </EditableSection>
            )}
        </SheetWindow>
    );
}

/** Perícias: além de editar, o mestre rola a perícia pelo jogador (resultado no chat) */
function ExpertisesBody({ charsheet }: { charsheet: Sheet }): ReactElement {
    const { campaign } = useCampaignContext();
    // Os efeitos do personagem no combate mexem nos d20 de Percepção e Furtividade
    const { planFor, roll } = useGMExpertiseRoll(charsheet, combatantEffects(campaign.session?.combat, charsheet.id));

    return (
        <EditableSection charsheet={charsheet}>
            {({ editedData, isEditing, updateNestedField }) => (
                <ExpertisesTab
                    charsheet={charsheet}
                    editedData={editedData}
                    isEditing={isEditing}
                    updateNestedField={updateNestedField}
                    roll={{ planFor, onRoll: name => { void roll(name); } }}
                />
            )}
        </EditableSection>
    );
}

export function ExpertisesWindow({ charsheetId }: { charsheetId: string }): ReactElement {
    return (
        <SheetWindow charsheetId={charsheetId}>
            {charsheet => <ExpertisesBody charsheet={charsheet} />}
        </SheetWindow>
    );
}

export function InventoryWindow({ charsheetId }: { charsheetId: string }): ReactElement {
    return (
        <SheetWindow charsheetId={charsheetId}>
            {charsheet => (
                <EditableSection charsheet={charsheet}>
                    {({ editedData, isEditing, updateNestedField, weightUnit }) => (
                        <InventoryTab
                            charsheet={charsheet}
                            editedData={editedData}
                            isEditing={isEditing}
                            updateNestedField={updateNestedField}
                            weightUnit={weightUnit}
                        />
                    )}
                </EditableSection>
            )}
        </SheetWindow>
    );
}

export function SkillsWindow({ charsheetId }: { charsheetId: string }): ReactElement {
    return (
        <SheetWindow charsheetId={charsheetId}>
            {charsheet => (
                <EditableSection charsheet={charsheet}>
                    {({ editedData, isEditing, updateNestedField }) => (
                        <SkillsTab charsheet={charsheet} editedData={editedData} isEditing={isEditing} updateNestedField={updateNestedField} />
                    )}
                </EditableSection>
            )}
        </SheetWindow>
    );
}

/** Busca as magias da ficha (por id, em tempo real) só quando a janela de magias está aberta */
function SpellsBody({ charsheet }: { charsheet: Sheet }): ReactElement {
    const spells = useCharsheetSpells(charsheet);

    return (
        <EditableSection charsheet={charsheet}>
            {({ editedData, isEditing, updateNestedField }) => (
                <SpellsTab
                    charsheet={charsheet}
                    editedData={editedData}
                    isEditing={isEditing}
                    updateNestedField={updateNestedField}
                    spells={spells}
                />
            )}
        </EditableSection>
    );
}

export function SpellsWindow({ charsheetId }: { charsheetId: string }): ReactElement {
    return (
        <SheetWindow charsheetId={charsheetId}>
            {charsheet => <SpellsBody charsheet={charsheet} />}
        </SheetWindow>
    );
}
