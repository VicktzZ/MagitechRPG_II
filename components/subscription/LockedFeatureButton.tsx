'use client';

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  Tooltip,
  type ButtonProps
} from '@mui/material';
import {
  Lock as LockIcon
} from '@mui/icons-material';
import type { Permission, SubscriptionPlan } from '@enums/subscriptionEnum';
import { UpgradePrompt } from './UpgradePrompt';

interface LockedFeatureButtonProps extends Omit<ButtonProps, 'onClick'> {
  requiredPlan: SubscriptionPlan;
  permission?: Permission;
  featureName?: string;
  showDialog?: boolean;
}

/**
 * Componente para exibir botões de funcionalidades bloqueadas
 * Ao clicar, mostra um modal com informações do upgrade
 */
export function LockedFeatureButton({
  requiredPlan,
  permission,
  featureName = 'Esta funcionalidade',
  showDialog = true,
  children,
  ...buttonProps
}: LockedFeatureButtonProps) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (showDialog) {
      setOpen(true);
    }
  };

  return (
    <>
      <Tooltip title={`${featureName} requer upgrade`} arrow>
        <span>
          <Button
            {...buttonProps}
            onClick={handleClick}
            disabled={!showDialog}
            startIcon={<LockIcon />}
            sx={{
              ...buttonProps.sx,
              opacity: 0.6,
              '&:hover': {
                opacity: 1
              }
            }}
          >
            {children}
          </Button>
        </span>
      </Tooltip>

      {showDialog && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent sx={{ p: 0 }}>
            <UpgradePrompt
              requiredPlan={requiredPlan}
              permission={permission}
              title={featureName}
              variant="compact"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
