import { SubscriptionPlan } from '@enums/subscriptionEnum'
import Bolt from '@mui/icons-material/Bolt'
import Diamond from '@mui/icons-material/Diamond'
import WorkspacePremium from '@mui/icons-material/WorkspacePremium'
import type { SvgIconProps } from '@mui/material'

const PLAN_ICONS = {
    [SubscriptionPlan.FREEMIUM]: Bolt,
    [SubscriptionPlan.PREMIUM]: WorkspacePremium,
    [SubscriptionPlan.PREMIUM_PLUS]: Diamond
}

/** Ícone do plano em Material, no lugar do emoji; herda a cor e o tamanho do texto ao redor */
export function PlanIcon({ plan, ...props }: { plan: SubscriptionPlan } & SvgIconProps) {
    const Icon = PLAN_ICONS[plan] ?? Bolt
    return <Icon fontSize="inherit" {...props} />
}
