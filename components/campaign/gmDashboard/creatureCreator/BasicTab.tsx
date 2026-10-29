import type { Dispatch, SetStateAction } from 'react';
import { Box } from '@mui/material';
import type { RPGSystem } from '@models/entities';
import type { RolePreset } from './constants';
import IdentitySection from './IdentitySection';
import RolePresets from './RolePresets';
import AttributesSection from './AttributesSection';
import StatsSection from './StatsSection';
import DefensesSection from './DefensesSection';
import ScalingSection from './ScalingSection';
import type { AttributeDef, CreatureData } from './types';

interface BasicTabProps {
    creatureData: CreatureData;
    setCreatureData: Dispatch<SetStateAction<CreatureData>>;
    isReadOnly: boolean;
    rpgSystem: RPGSystem | null;
    attrDefs: AttributeDef[];
    setAttribute: (key: string, value: number) => void;
    applyRolePreset: (preset: RolePreset) => void;
    baseCreature: CreatureData | null;
    scalingOpen: boolean;
    setScalingOpen: Dispatch<SetStateAction<boolean>>;
    scalingLevel: number;
    setScalingLevel: (level: number) => void;
    scalingPlayers: number;
    setScalingPlayers: (players: number) => void;
    handleApplyScaling: () => void;
}

/** Aba "Básico": identidade, presets de papel, atributos, status, defesas e escalonamento */
export default function BasicTab({
    creatureData,
    setCreatureData,
    isReadOnly,
    rpgSystem,
    attrDefs,
    setAttribute,
    applyRolePreset,
    baseCreature,
    scalingOpen,
    setScalingOpen,
    scalingLevel,
    setScalingLevel,
    scalingPlayers,
    setScalingPlayers,
    handleApplyScaling
}: BasicTabProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <IdentitySection
                creatureData={creatureData}
                setCreatureData={setCreatureData}
                isReadOnly={isReadOnly}
            />

            {/* Presets rápidos */}
            {!isReadOnly && <RolePresets onApply={applyRolePreset} />}

            {/* Atributos */}
            <AttributesSection
                creatureData={creatureData}
                attrDefs={attrDefs}
                rpgSystem={rpgSystem}
                isReadOnly={isReadOnly}
                setAttribute={setAttribute}
            />

            {/* Status */}
            <StatsSection
                creatureData={creatureData}
                setCreatureData={setCreatureData}
                isReadOnly={isReadOnly}
            />

            {/* Defesas: elemento, fraquezas e resistências (só o mestre vê) */}
            <DefensesSection
                creatureData={creatureData}
                setCreatureData={setCreatureData}
                isReadOnly={isReadOnly}
            />

            {/* Escalonamento (avançado) */}
            {!isReadOnly && (
                <ScalingSection
                    baseCreature={baseCreature}
                    scalingOpen={scalingOpen}
                    setScalingOpen={setScalingOpen}
                    scalingLevel={scalingLevel}
                    setScalingLevel={setScalingLevel}
                    scalingPlayers={scalingPlayers}
                    setScalingPlayers={setScalingPlayers}
                    onApply={handleApplyScaling}
                />
            )}
        </Box>
    );
}
