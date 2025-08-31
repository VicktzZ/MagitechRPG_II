import {
    Box,
    Button,
    Typography,
    useMediaQuery,
    useTheme,
    Stack,
    Divider,
    IconButton,
    InputAdornment,
    ButtonGroup
} from '@mui/material';
import { type ReactElement, memo, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormTextField } from './fields';
import { FormSelect } from './fields';
import { rarities } from '@constants/dataTypes';
import { Add, Remove } from '@mui/icons-material';

/**
 * Interface para as propriedades dos itens comuns a todos os tipos
 */
export interface CommonItemFields {
  name: string;
  rarity: string;
  description: string;
  weight: number;
  quantity: number;
}

export type ItemFormData = CommonItemFields & Record<string, any>;

export function mapArrayToOptions(items: string[]): Array<{ value: string, label: string }> {
    return items?.map(item => ({
        value: item,
        label: item
    }));
}

interface WrapperProps {
    children: ReactElement;
    action?: (data: any /* ItemFormData */) => void;
    submitLabel?: string;
    headerComponent?: ReactElement;
};

export default memo(function InventoryCreateModalWrapper({ children, action, submitLabel = 'Criar Item', headerComponent }: WrapperProps): ReactElement {
    const { register, handleSubmit, formState: { errors }, getValues, watch, setValue } = useFormContext<ItemFormData>();

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));

    // Usar useCallback para evitar re-renderizações desnecessárias
    const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10) || 0;
        setValue('quantity' as keyof ItemFormData, value, { shouldValidate: true });
    }, [ setValue ]);

    const handleWeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setValue('weight' as keyof ItemFormData, value, { shouldValidate: true });
    }, [ setValue ]);

    const handleWheelEvent = useCallback((e: React.WheelEvent) => {
        (e.target as HTMLElement).blur();
    }, []);

    const rarityOptions = mapArrayToOptions(rarities);

    const onSubmit = (data: ItemFormData) => {
        console.log(data);
        action?.(data);
    };

    return (
        <>
            <Box component='form' onSubmit={handleSubmit(onSubmit)}
                sx={{
                    px: { xs: 0, sm: 0 },
                    pt: 0.5
                }}
            >
                <Stack spacing={3}>
                    {headerComponent}
                    <Stack spacing={1} sx={{ flex: 1 }}>
                        <Typography variant='overline' color='text.disabled' sx={{ letterSpacing: 0.6 }}>Informações gerais</Typography>
                        <Stack direction={matches ? 'column' : 'row'} spacing={2} alignItems='stretch'>
                            <FormTextField 
                                label='Nome'
                                registration={register('name')}
                                error={errors?.name}
                                sx={{ width: matches ? '100%' : '60%' }}
                            />
                            <FormSelect
                                registration={register('rarity')}
                                label="Raridade"
                                options={rarityOptions}
                                error={errors.rarity as any}
                                required
                                sx={{ width: matches ? '100%' : '40%' }}
                            />
                        </Stack>
                        <FormTextField 
                            name="description"
                            label="Descrição"
                            multiline
                            rows={matches ? 4 : 3}
                            registration={register('description')}
                            error={errors.description as any}
                            fullWidth
                        />
                    </Stack>
                </Stack>
            </Box>

            {children}

            <Divider sx={{ my: 2, opacity: 0.6 }} />
            <Stack direction={matches ? 'column' : 'row'} spacing={3} alignItems={matches ? 'stretch' : 'flex-end'}>
                <Stack direction='row' alignItems='center' spacing={1} sx={{ flex: matches ? 'unset' : 0 }}>
                    <ButtonGroup variant='outlined' size='small' sx={{ borderRadius: 2 }}>
                        <FormTextField
                            label='Quantidade' 
                            type='number'
                            registration={register('quantity')}
                            error={errors.quantity as any}
                            value={watch('quantity') || ''}
                            onChange={handleQuantityChange}
                            inputProps={{
                                min: 1,
                                onWheel: handleWheelEvent
                            }}
                            sx={{ width: 160 }}
                        />
                        <IconButton aria-label='aumentar' size='small' onClick={() => setValue('quantity', Math.max(1, (getValues('quantity') ?? 1) + 1), { shouldValidate: true })}>
                            <Add fontSize='small' />
                        </IconButton>
                        <IconButton aria-label='diminuir' size='small' onClick={() => setValue('quantity', Math.max(1, (getValues('quantity') ?? 1) - 1), { shouldValidate: true })}>
                            <Remove fontSize='small' />
                        </IconButton>
                    </ButtonGroup>
                </Stack>

                <FormTextField 
                    label='Peso' 
                    type='number'
                    registration={register('weight')}
                    error={errors.weight as any}
                    value={watch('weight') || 0}
                    onChange={handleWeightChange}
                    inputProps={{
                        min: 0,
                        step: 0.1,
                        onWheel: handleWheelEvent
                    }}
                    InputProps={{ endAdornment: <InputAdornment position='end'>kg</InputAdornment> }}
                    sx={{ width: matches ? '100%' : 200 }}
                />

                <Box flex={1} />

                <Typography variant='body2' color='text.secondary'>
                    Total: {((getValues('quantity') ?? 0) * (getValues('weight') ?? 0)).toFixed(2)} kg · Qtd {getValues('quantity') ?? 0}
                </Typography>

                <Box display='flex' justifyContent='flex-end'>
                    <Button onClick={handleSubmit(onSubmit)} type='submit' variant='contained' color={'terciary' as any}
                        sx={{ px: 3, textTransform: 'none' }}>
                        {submitLabel}
                    </Button>
                </Box>
            </Stack>
        </>
    );
});