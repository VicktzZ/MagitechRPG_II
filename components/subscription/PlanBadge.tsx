'use client';

import React from 'react';
import { PlanIcon } from './PlanIcon';
import { Chip, Tooltip } from '@mui/material';
import { SubscriptionPlan, SubscriptionPlanMetadata } from '@enums/subscriptionEnum';
import type { User } from '@models/entities';

interface PlanBadgeProps {
  user: User | null;
  size?: 'small' | 'medium';
  showIcon?: boolean;
  variant?: 'filled' | 'outlined';
}

/**
 * Componente para exibir o badge do plano do usuário
 */
export function PlanBadge({
    user,
    size = 'small',
    showIcon = true,
    variant = 'filled'
}: PlanBadgeProps) {
    if (!user?.subscription) {
        return null;
    }

    const plan = user.subscription.plan || SubscriptionPlan.FREEMIUM;
    const metadata = SubscriptionPlanMetadata[plan];

    return (
        <Tooltip title={`Plano: ${metadata.displayName}`} arrow>
            <Chip
                label={
                    showIcon ? (
                        <>
                            <PlanIcon plan={plan} sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                            {metadata.name}
                        </>
                    ) : (
                        metadata.name
                    )
                }
                size={size}
                variant={variant}
                sx={{
                    backgroundColor: variant === 'filled' ? metadata.color : 'transparent',
                    color: variant === 'filled' ? 'primary.contrastText' : metadata.color,
                    borderColor: metadata.color,
                    fontWeight: 'bold',
                    fontSize: size === 'small' ? '0.75rem' : '0.875rem'
                }}
            />
        </Tooltip>
    );
}
