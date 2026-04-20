import { useCallback } from 'react';

export default function useNumbersWithSpaces(): (x: number) => string {
    const numberWithSpaces = useCallback((x: number): string => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }, [ ])

    return numberWithSpaces
}