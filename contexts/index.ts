import { campaignContext } from './campaignContext';
import { fichaContext } from './fichaContext';
import { userContext } from './userContext';
import { drawerContext } from './drawerContext';
import { channelContext } from './channelContext';
import { chatContext } from './chatContext';
import { savingSpinnerContext, useSavingSpinner } from './savingSpinnerContext';
import { useCampaignContext } from './campaignContext';
import { campaignCurrentFichaContext, useCampaignCurrentFichaContext } from './campaignCurrentFichaContext';
import { ThemeProvider, useThemeContext } from './themeContext';
import FichaFormProvider from './FichaFormProvider';

export {
    fichaContext,
    userContext,
    drawerContext,
    channelContext,
    chatContext,
    campaignContext,
    savingSpinnerContext,
    useSavingSpinner,
    useCampaignContext,
    campaignCurrentFichaContext,
    useCampaignCurrentFichaContext,
    ThemeProvider,
    useThemeContext,
    FichaFormProvider
}