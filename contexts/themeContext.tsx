'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Verifica se há preferência salva no localStorage ou usa 'dark' como padrão
    const [ themeMode, setThemeMode ] = useState<ThemeMode>('dark');
  
    useEffect(() => {
    // Ao carregar, verifica localStorage
        const savedTheme = localStorage.getItem('theme') as ThemeMode;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            setThemeMode(savedTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = themeMode === 'dark' ? 'light' : 'dark';
        setThemeMode(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useThemeContext = (): ThemeContextType => {
    const context = useContext(ThemeContext);
  
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
  
    return context;
};
