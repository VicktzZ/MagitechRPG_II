import {
    Box,
    Button,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { type ReactElement, memo, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormTextField } from './fields';
import { FormSelect } from './fields';
import { rarities } from '@constants/dataTypes';

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

/**
 * Tipo para formulário de criação de itens
 */
export type ItemFormData = CommonItemFields & Record<string, any>;

export function mapArrayToOptions(items: string[]): Array<{ value: string, label: string }> {
    return items?.map(item => ({
        value: item,
        label: item
    }));
}

/**
 * Wrapper para modais de criação de itens de inventário com campos comuns
 * @param props Propriedades do componente
 * @returns Componente React
 */
export default memo(function InventoryCreateModalWrapper({ children, onSubmit  }: any): ReactElement {
    const form = useFormContext<ItemFormData>();
    const { register, handleSubmit, formState: { errors }, getValues, watch, setValue } = form;

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

    return (
        <>
            <Box 
                display={!matches ? 'flex' : 'column'} 
                gap={2} 
                component='form' 
                noValidate 
                onSubmit={handleSubmit(onSubmit)}
            >
                <FormTextField 
                    label='Nome'
                    registration={register('name')}
                    error={errors?.name}
                    sx={{ width: '30%' }}
                />
        
                <FormSelect
                    name="rarity"
                    label="Raridade"
                    options={rarityOptions}
                    error={errors.rarity as any}
                    required
                    defaultValue='Comum'
                    sx={{ width: '20%' }}
                />
        
                <FormTextField 
                    name="description"
                    label="Descrição"
                    multiline
                    rows={3}
                    registration={register('description')}
                    error={errors.description as any}
                    fullWidth
                />
            </Box>
      
            {children}
      
            <Box display='flex' alignItems='center' gap={2} mt={3}>
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
                />
        
                <Box display='flex' alignItems='center' gap={1}>
                    <FormTextField 
                        label='Peso' 
                        type='number'
                        registration={register('weight')}
                        error={errors.weight as any}
                        value={watch('weight') || ''}
                        onChange={handleWeightChange}
                        inputProps={{
                            min: 0,
                            step: 0.1,
                            onWheel: handleWheelEvent
                        }}
                    />
                    <Typography variant='h6'>KG</Typography>
                    <Typography variant='h6'>x</Typography>
                    <Typography variant='h6'>{getValues('quantity') ?? 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Quantidade: {watch('quantity' as keyof ItemFormData)}
                    </Typography>
                </Box>
        
                <Box width='100%' display='flex' justifyContent='flex-end' alignItems='flex-end'>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        type='submit'
                        variant='contained'
                        color={'terciary' as any}
                    >
            Criar Item
                    </Button>
                </Box>
            </Box>
        </>
    );
});