import { Box } from '@mui/material';
import { type ReactElement } from 'react';
import type { Ficha } from '@types';
import { type FormikContextType, useFormikContext } from 'formik';
import { ArmorModal, ItemModal, WeaponModal } from './CreateModals';

export default function CreateItemModal({ 
    itemType,
    onClose
}: {
    itemType: 'weapon' | 'armor' | 'item',
    onClose: () => void
}): ReactElement {
    const f: FormikContextType<Ficha> = useFormikContext();
    const CreateItemComponentModal = itemType === 'weapon' ? WeaponModal : itemType === 'armor' ? ArmorModal : ItemModal

    return (
        <Box
            display='flex'
            flexDirection='column'
            width='100%'
            gap={2}
        >
            <CreateItemComponentModal closeModal={ onClose } formik={ f } />
        </Box>
    );
}