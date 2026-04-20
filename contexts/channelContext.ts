import { type Dispatch, type SetStateAction, createContext, useContext } from 'react';
import type { PresenceChannel } from 'pusher-js';

interface ChannelContextType { channel: PresenceChannel | null, setChannel: Dispatch<SetStateAction<PresenceChannel | null>> }

const channelObj = {}

export const channelContext = createContext<ChannelContextType>({
    channel: channelObj as PresenceChannel,
    setChannel: () => {}
})

export const useChannel = (): ChannelContextType => useContext(channelContext)