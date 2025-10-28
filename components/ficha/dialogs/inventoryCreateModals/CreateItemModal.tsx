import { Box } from '@mui/material';
import { type ReactElement, memo, useMemo } from 'react';
import { InventoryCreateWeaponModal } from './InventoryCreateWeaponModal';
import { InventoryCreateArmorModal } from './InventoryCreateArmorModal';
import { InventoryCreateItemModal } from './InventoryCreateItemModal';
import type { Armor, Item, Weapon } from '@models';

interface CreateItemModalProps {
    itemType: 'weapon' | 'armor' | 'item';
    disableDefaultCreate?: boolean;
    onClose: () => void;
    onConfirm?: (item: Weapon | Item | Armor) => void
}

const CreateItemModal = memo(({ 
    itemType,
    disableDefaultCreate = false,
    onClose,
    onConfirm
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
            <CreateItemComponentModal 
                disableDefaultCreate={disableDefaultCreate} 
                action={onClose}
                onConfirm={onConfirm}
            />
        </Box>
    );
});

CreateItemModal.displayName = 'CreateItemModal';

export default CreateItemModal;