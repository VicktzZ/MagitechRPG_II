import { Grid } from '@mui/material';
import CharacterDetailsTable from './CharacterDetailsTable';
import StatusPointsPanel from './StatusPointsPanel';
import type { CharsheetTabProps, HandleNumberInputChange } from './types';

interface BasicInfoTabProps extends CharsheetTabProps {
    handleNumberInputChange: HandleNumberInputChange;
    weightUnit: string;
    onOpenStatusModal: () => void;
}

/** Aba "Informações Básicas": detalhes do personagem, status e pontos */
export default function BasicInfoTab({
    charsheet,
    editedData,
    isEditing,
    updateNestedField,
    handleNumberInputChange,
    weightUnit,
    onOpenStatusModal
}: BasicInfoTabProps) {
    return (
        <Grid container spacing={2}>
            <CharacterDetailsTable
                charsheet={charsheet}
                editedData={editedData}
                isEditing={isEditing}
                updateNestedField={updateNestedField}
                handleNumberInputChange={handleNumberInputChange}
            />

            <StatusPointsPanel
                charsheet={charsheet}
                editedData={editedData}
                isEditing={isEditing}
                updateNestedField={updateNestedField}
                handleNumberInputChange={handleNumberInputChange}
                weightUnit={weightUnit}
                onOpenStatusModal={onOpenStatusModal}
            />
        </Grid>
    );
}
