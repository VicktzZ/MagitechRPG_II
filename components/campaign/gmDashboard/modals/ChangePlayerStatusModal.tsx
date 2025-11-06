import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Tab, Tabs, TextField } from '@mui/material';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { charsheetService } from '@services';
import { useSnackbar } from 'notistack';
import { type CharsheetDTO } from '@models/dtos';

const playerStatusSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    race: z.string().min(1, 'Raça é obrigatória'),
    traits: z.string().refine(val => !val.includes(',  '), { message: 'Os traços devem ser separados por apenas uma vírgula e um espaço' }),
    attributes: z.object({
        vig: z.number().int().min(0),
        des: z.number().int().min(0),
        foc: z.number().int().min(0),
        log: z.number().int().min(0),
        sab: z.number().int().min(0),
        car: z.number().int().min(0),
    }),
    stats: z.object({
        lp: z.number().int().min(0),
        mp: z.number().int().min(0),
        ap: z.number().int().min(0),
        maxLp: z.number().int().min(0),
        maxMp: z.number().int().min(0),
        maxAp: z.number().int().min(0)
    }),
    money: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val >= 0, { message: 'O valor deve ser um número válido e maior ou igual a 0' })
});

type PlayerStatusFormData = z.infer<typeof playerStatusSchema>;

function ChangePlayerStatusModal({ open, onClose, charsheet }: { open: boolean, onClose: () => void, charsheet: Required<CharsheetDTO> }) {
    const [ tabValue, setTabValue ] = useState(0);
    const { enqueueSnackbar } = useSnackbar();

    const defaultValues = {
        name: charsheet.name,
        race: charsheet.race as unknown as string,
        traits: charsheet.traits.join(', '),
        attributes: {
            vig: Number(charsheet.attributes?.vig),
            des: Number(charsheet.attributes?.des),
            foc: Number(charsheet.attributes?.foc),
            log: Number(charsheet.attributes?.log),
            sab: Number(charsheet.attributes?.sab),
            car: Number(charsheet.attributes?.car)
        },
        stats: {
            lp: Number(charsheet.stats?.lp),
            mp: Number(charsheet.stats?.mp),
            ap: Number(charsheet.stats?.ap),
            maxLp: Number(charsheet.stats.maxLp),
            maxMp: Number(charsheet.stats.maxMp),
            maxAp: Number(charsheet.stats.maxAp)
        },
        money: Number(charsheet.inventory.money)
    };  

    const { control, handleSubmit, formState: { errors } } = useForm<PlayerStatusFormData>({
        resolver: zodResolver(playerStatusSchema),
        defaultValues
    });

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const onSubmit = async (data: PlayerStatusFormData) => {
        const { money, ...rest } = data;
        
        const processedData = {
            ...rest,
            traits: rest.traits.split(',').map(trait => trait.trim()).filter(Boolean),
            inventory: {
                ...charsheet.inventory,
                money
            }
        };

        try {
            await charsheetService.updateById({
                id: charsheet.id,
                data: {
                    ...charsheet,
                    ...processedData
                } as unknown as CharsheetDTO
            });
    
            enqueueSnackbar('Status do jogador atualizado com sucesso!', { variant: 'success' });
        } catch (error) {
            console.error(error);
            enqueueSnackbar('Erro ao atualizar charsheet', { variant: 'error' });
            return;
        }

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Alterar Status do Jogador</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="abas de status do jogador">
                            <Tab label="Características" />
                            <Tab label="Atributos" />
                        </Tabs>
                    </Box>

                    {tabValue === 0 && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Nome"
                                            margin="normal"
                                            error={!!errors.name}
                                            helperText={errors.name?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="race"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Raça"
                                            margin="normal"
                                            error={!!errors.race}
                                            helperText={errors.race?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="traits"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Traços"
                                            margin="normal"
                                            placeholder="Separe os traços por vírgula (traço1, traço2, traço3)"
                                            error={!!errors.traits}
                                            helperText={errors.traits?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {tabValue === 1 && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="attributes.vig"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Vigor (VIG)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.attributes?.vig}
                                            helperText={errors.attributes?.vig?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="attributes.des"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Destreza (DES)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.attributes?.des}
                                            helperText={errors.attributes?.des?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="attributes.foc"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Foco (FOC)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.attributes?.foc}
                                            helperText={errors.attributes?.foc?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="attributes.log"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Lógica (LOG)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.attributes?.log}
                                            helperText={errors.attributes?.log?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="attributes.sab"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Sabedoria (SAB)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.attributes?.sab}
                                            helperText={errors.attributes?.sab?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="attributes.car"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Carisma (CAR)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.attributes?.car}
                                            helperText={errors.attributes?.car?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Controller
                                    name="stats.lp"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Pontos de Vida (LP)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.stats?.lp}
                                            helperText={errors.stats?.lp?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Controller
                                    name="maxLp"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Pontos de Vida Máximos (MaxLp)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors?.stats?.maxLp}
                                            helperText={errors?.stats?.maxLp?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="stats.mp"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Pontos de Mana (MP)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.stats?.mp}
                                            helperText={errors.stats?.mp?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="stats.ap"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Pontos de Armadura (AP)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.stats?.ap}
                                            helperText={errors.stats?.ap?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="money"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Dinheiro"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.money}
                                            helperText={errors.money?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained" color="primary">Salvar Alterações</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default ChangePlayerStatusModal;
