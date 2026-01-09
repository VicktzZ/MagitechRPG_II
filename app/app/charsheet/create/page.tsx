'use client';

import { CharsheetComponent } from '@components/charsheet';
import SystemSelectionModal from '@components/charsheet/SystemSelectionModal';
import { CharsheetFormProvider } from '@contexts';
import { SelectedSystemProvider, useSelectedSystem } from '@contexts/SelectedSystemContext';
import { Box, CircularProgress } from '@mui/material';
import { useState, type ReactElement } from 'react'
import type { RPGSystem } from '@models/entities';

function CharsheetCreateContent() {
    const [ showModal, setShowModal ] = useState(true)
    const { setSelectedSystem, selectedSystem, loading } = useSelectedSystem()

    const handleSystemSelect = (system: RPGSystem | null) => {
        setSelectedSystem(system)
        setShowModal(false)
    }

    if (showModal) {
        return (
            <SystemSelectionModal 
                open={showModal} 
                onSelect={handleSystemSelect} 
            />
        )
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        )
    }

    return (
        <SelectedSystemProvider initialSystemId={selectedSystem?.id}>
            <CharsheetFormProvider initialSystemId={selectedSystem?.id}>
                <CharsheetComponent />
            </CharsheetFormProvider>
        </SelectedSystemProvider>
    )
}

export default function CharsheetPage(): ReactElement {
    return (
        <SelectedSystemProvider>
            <CharsheetCreateContent />
        </SelectedSystemProvider>
    )
}
