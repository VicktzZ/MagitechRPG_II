import { Box, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import { Ficha } from '@types';
import { useFormikContext } from 'formik';
import { type ReactElement } from 'react';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250
        }
    }
};

const names = [
    'Oliver Hansen',
    'Van Henry',
    'April Tucker',
    'Ralph Hubbard',
    'Omar Alexander',
    'Carlos Abbott',
    'Miriam Wagner',
    'Bradley Wilkerson',
    'Virginia Andrews',
    'Kelly Snyder',
];

export default function Traits({ formik }: { formik: any }): ReactElement {
    const FormikType = useFormikContext<Ficha>()
    const f: typeof FormikType = formik

    return (
        <FormControl sx={{ m: 1, width: 300 }}>
            <InputLabel>Traços</InputLabel>
            <Select
                multiple
                name='perks'
                value={f.values.perks}
                onChange={f.handleChange}
                input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                MenuProps={MenuProps}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((trait) => (
                            <Chip key={trait.name} label={trait.name} />
                        ))}
                    </Box>
                )}
            >
                {names.map((name) => (
                    <MenuItem
                        key={name}
                        value={name}
                    >
                        {name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}