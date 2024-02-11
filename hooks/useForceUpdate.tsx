import { useCallback, useState } from 'react';

export default function useForceUpdate(): () => void {
    const [ , updateState ] = useState<Record<any, any>>();
    const forceUpdate = useCallback(() => { updateState({}) }, []);

    return forceUpdate
}