import { Grid } from '@mui/material';
import type { SheetMetrics } from '@utils/charsheetMetrics';
import SheetMetricsView from '../../SheetMetricsView';
import CharacterDetailsTable from './CharacterDetailsTable';
import StatusPointsPanel from './StatusPointsPanel';
import type { CharsheetTabProps, HandleNumberInputChange } from './types';

interface BasicInfoTabProps extends CharsheetTabProps {
    handleNumberInputChange: HandleNumberInputChange;
    weightUnit: string;
    onOpenStatusModal: () => void;
    /** Overall e limite de MP por turno (derivados da ficha: não se editam aqui) */
    metrics?: SheetMetrics;
}

/** Aba "Informações Básicas": detalhes do personagem, status e pontos */
export default function BasicInfoTab({
    charsheet,
    editedData,
    isEditing,
    updateNestedField,
    handleNumberInputChange,
    weightUnit,
    onOpenStatusModal,
    metrics
}: BasicInfoTabProps) {
    return (
        <Grid container spacing={2}>
            {metrics && (
                <Grid item xs={12}>
                    <SheetMetricsView metrics={metrics} />
                </Grid>
            )}

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
