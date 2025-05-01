/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { useCampaignContext } from '@contexts/campaignContext'
import { useEffect, useRef } from 'react'
import { debounce } from 'lodash'
import { campaignService } from '@services';

interface UseSaveFichaChangesProps {
    callback?: () => void;
    delay?: number;
    deps?: any[];
}

export default function useSaveFichaChanges(props?: UseSaveFichaChangesProps): () => void {
    const { campaign: { myFicha, campaignCode }, fichaUpdated, setFichaUpdated } = useCampaignContext()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const debouncedFunction = debounce(async () => {
            if (!myFicha || !fichaUpdated) return;

            props?.callback?.();
            await campaignService.updateUserFicha(campaignCode, myFicha)

            console.log({ myFicha, deps: props?.deps })
            setFichaUpdated(false)
        }, props?.delay || 1000)

        if (fichaUpdated) {
            timeoutRef.current = setTimeout(debouncedFunction, props?.delay || 1000)
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [ myFicha, props?.callback, props?.delay, ...props?.deps ? props?.deps : [], fichaUpdated ])

    return () => {}
}