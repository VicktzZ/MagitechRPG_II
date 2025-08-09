import { FichaCard } from '@components/ficha';
import { Backdrop, Box, CircularProgress, Grid, Modal, Skeleton, Typography } from '@mui/material';
import { campaignService, fichaService, sessionService } from '@services';
import { useQuery } from '@tanstack/react-query';
import { type Ficha } from '@types';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { type ReactElement, useEffect, useState } from 'react';
import { campaignContext } from './campaignContext';
import { enqueueSnackbar } from '@node_modules/notistack';
import { toastDefault } from '@constants';
import { usePusher, useRealtimeDatabase } from '@hooks';
import { useLocalStorage } from '@uidotdev/usehooks';

export function CampaignProvider({ children, code }: { children: ReactElement, code: string }) {
    const campaignName = 'presence-' + code;
    document.title = 'Campaign - ' + code;

    const router = useRouter();
    const { data: session } = useSession();
    const [ ficha, setFicha ] = useState<Ficha>();
    const [ isSubscribed, setIsSubscribed ] = useState<boolean>(false);
    const [ currentFicha, setCurrentFicha ] = useLocalStorage<string>('currentFicha', '');

    const { data: campaignDataResponse, query: { isPending } } = useRealtimeDatabase({
        collectionName: 'campaigns',
        pipeline: [
            {
                $match: {
                    campaignCode: code
                }
            }
        ],
        onChange: (params: any) => {
            console.log(params)
            // for (const [ key, value ] of Object.entries(params.updateDescription?.updatedFields ?? {})) {
            //     if (key.startsWith('session.users')) {
            //         if (value !== session?.user?._id) {
            //             const user = campaignDataResponse?.users.all.find((user) => user._id === value);
            //             enqueueSnackbar(`${user?.name} entrou na sessão!`, toastDefault('enterInSession'));
            //         }
            //     }
            // }
        }
    }, {
        queryKey: [ 'campaignData', code ],
        queryFn: async () => await campaignService.getAllData(code, session?.user?._id ?? ''),
        enabled: !!session?.user?._id && !isSubscribed
    });

    const isUserGM = campaignDataResponse?.isUserGM ?? false;

    usePusher(campaignName, isUserGM ?? false, ficha, session);

    const { data: fichasResponse, isPending: isFichaLoading } = useQuery({
        queryKey: [ 'userFichas', session?.user?._id ?? '' ],
        queryFn: async () => {
            if (session?.user?._id) return await fichaService.fetch({ queryParams: { userId: session?.user?._id ?? '' } });
        },
        enabled: !isUserGM
    });

    useEffect(() => {
        if (fichasResponse && currentFicha) setFicha(fichasResponse.find((f) => f._id === currentFicha));

        if (!isPending && (isUserGM || ficha) && !isSubscribed) {
            setIsSubscribed(true);
            sessionService.connect({ campaignCode: code, userId: session?.user?._id ?? '', isGM: isUserGM ?? false });
            enqueueSnackbar('Você entrou na sessão!', toastDefault('enterInSession', 'success'));
        }

        return () => {
            const userId = session?.user?._id;
            if (!userId) return;

            setIsSubscribed(false);
            sessionService.disconnect({ campaignCode: code, userId });
        }
    }, [ isPending, isUserGM, ficha ])

    return (
        <>
            {isPending ? (
                <Backdrop open={true}>
                    <CircularProgress />
                </Backdrop>
            ) : (!isUserGM && !ficha) ? (
                <Modal
                    open={true}
                    onClose={() => { router.push('/app'); }}
                    disableAutoFocus
                    disableEnforceFocus
                    disableRestoreFocus
                    disablePortal
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        width: '100vw'
                    }}
                >
                    <Box
                        display='flex'
                        height='50%'
                        width='61%'
                        bgcolor='background.paper'
                        borderRadius={1}
                        flexDirection='column'
                        p={2}
                        gap={2}
                    >
                        <Box>
                            <Typography variant='h6'>Escolha uma Ficha para ingressar</Typography>
                        </Box>
                        <Grid minHeight='100%' overflow='auto' gap={2} container>
                            {isFichaLoading ? [ 0, 1, 2, 4, 5 ].map(() => (
                                <Skeleton
                                    variant='rectangular' key={Math.random()} width='20rem' height='15rem' 
                                />
                            )) : fichasResponse?.map((f) => (
                                <FichaCard 
                                    key={f._id}
                                    ficha={f}
                                    disableDeleteButton
                                    onClick={() => { setCurrentFicha(f._id ?? ''); setFicha(f); }}
                                />
                            ))}
                        </Grid>
                    </Box>
                </Modal>
            ) : null}
            {campaignDataResponse && (isUserGM || ficha) && (
                <campaignContext.Provider value={{ ...campaignDataResponse, code }}>
                    {children}
                </campaignContext.Provider>   
            )}
            {!campaignDataResponse && !isPending && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        width: '100vw'
                    }}
                >
                    <Typography variant='h5'>Campanha não encontrada</Typography>
                </Box>
            )}
        </>
    )
}