import { type User } from '@types';
import { type Dispatch, type SetStateAction, createContext } from 'react';

export const userContext = createContext<{user: Partial<User> | null, setUser: Dispatch<SetStateAction<User>> | Dispatch<SetStateAction<null>>}>({
    user: null,
    setUser: () => {}
})