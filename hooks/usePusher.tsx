import { useEffect, useRef, useCallback } from 'react';
import PusherClient, { type PresenceChannel } from 'pusher-js';
import { useChannel } from '@contexts/channelContext';
import { PusherEvent } from '@enums';

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const CLUSTER = 'sa1';

export function usePusher(campaignName: string, isUserGM: boolean, ficha: any, session: any) {
    const pusherRef = useRef<PusherClient | null>(null);
    const channelRef = useRef<PresenceChannel | null>(null);
    const { setChannel } = useChannel();

    const subscribe = useCallback(() => {
        if (!pusherRef.current || !campaignName || (!isUserGM && !ficha)) return;

        const channel = pusherRef.current.subscribe(campaignName) as PresenceChannel;

        channel.bind(PusherEvent.SUBSCRIPTION, () => {
            setChannel(channel);
            channelRef.current = channel;
        });
    }, [ campaignName, isUserGM, ficha, setChannel ]);

    useEffect(() => {
        if (!pusherRef.current) {
            pusherRef.current = new PusherClient(PUSHER_KEY, {
                cluster: CLUSTER,
                authEndpoint: `/api/pusher/auth?session=${JSON.stringify(session)}`,
                forceTLS: true
            });
        }

        subscribe();

        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                const state = pusherRef.current?.connection.state;
                if (state !== 'connected') {
                    pusherRef.current?.connect();
                    subscribe();
                }
            }
        };

        document.addEventListener('visibilitychange', onVisible);

        return () => {
            document.removeEventListener('visibilitychange', onVisible);

            if (channelRef.current) {
                channelRef.current.unbind_all();
                pusherRef.current?.unsubscribe(campaignName);
                setChannel(null);
            }

            pusherRef.current?.disconnect();
            pusherRef.current = null;
        };
    }, [ subscribe, campaignName, isUserGM, ficha, setChannel ]);
}
