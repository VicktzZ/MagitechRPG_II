import { Box } from '@mui/material';
import { type ReactElement, memo, useMemo } from 'react';
import { InventoryCreateWeaponModal } from './InventoryCreateWeaponModal';
import { InventoryCreateArmorModal } from './InventoryCreateArmorModal';
import { InventoryCreateItemModal } from './InventoryCreateItemModal';

interface CreateItemModalProps {
    itemType: 'weapon' | 'armor' | 'item';
    onClose: () => void;
}

const CreateItemModal = memo(({ 
    itemType,
    onClose
}: CreateItemModalProps): ReactElement => {
    const CreateItemComponentModal = useMemo(() => {
        switch (itemType) {
        case 'weapon':
            return InventoryCreateWeaponModal;
        case 'armor':
            return InventoryCreateArmorModal;
        case 'item':
        default:
            return InventoryCreateItemModal;
        }
    }, [ itemType ]);

    return (
        <Box
            display='flex'
            flexDirection='column'
            width='100%'
            gap={2}
        >
            <CreateItemComponentModal action={onClose} />
        </Box>
    );
});

CreateItemModal.displayName = 'CreateItemModal';

export default CreateItemModal;