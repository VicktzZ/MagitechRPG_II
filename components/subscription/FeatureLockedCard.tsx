'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  alpha,
  Chip
} from '@mui/material';
import {
  Lock as LockIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import type { SubscriptionPlan } from '@enums/subscriptionEnum';
import { SubscriptionPlanMetadata } from '@enums/subscriptionEnum';

interface FeatureLockedCardProps {
  requiredPlan: SubscriptionPlan;
  featureName: string;
  description?: string;
  imageUrl?: string;
  onClick?: () => void;
}

/**
 * Componente para exibir cards de funcionalidades bloqueadas
 * Uso: Em listas de funcionalidades, dashboards, etc.
 */
export function FeatureLockedCard({
  requiredPlan,
  featureName,
  description,
  imageUrl,
  onClick
}: FeatureLockedCardProps) {
  const router = useRouter();
  const planMetadata = SubscriptionPlanMetadata[requiredPlan];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/app/subscription/checkout?plan=${requiredPlan}`);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        border: 2,
        borderColor: planMetadata.color,
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(planMetadata.color, 0.1)} 100%)`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          borderColor: planMetadata.color
        }
      }}
      onClick={handleClick}
    >
      {/* Badge */}
      <Chip
        icon={<LockIcon />}
        label={`Requer ${planMetadata.name}`}
        size="small"
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          bgcolor: planMetadata.color,
          color: 'white',
          fontWeight: 'bold',
          zIndex: 1
        }}
      />

      {/* Imagem (se fornecida) */}
      {imageUrl && (
        <Box
          sx={{
            height: 180,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px) brightness(0.7)',
            position: 'relative'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'rgba(0,0,0,0.7)',
              borderRadius: '50%',
              p: 2
            }}
          >
            <LockIcon sx={{ fontSize: 48, color: 'white' }} />
          </Box>
        </Box>
      )}

      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h2" sx={{ fontSize: '2rem' }}>
            {planMetadata.icon}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: planMetadata.color }}>
            {featureName}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description || `Esta funcionalidade está disponível no plano ${planMetadata.displayName}.`}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) => alpha(planMetadata.color, 0.1),
            mb: 2
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              A partir de
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: planMetadata.color }}>
              {planMetadata.priceFormatted}
              {planMetadata.billingPeriod && (
                <Typography component="span" variant="caption" color="text.secondary">
                  /{planMetadata.billingPeriod}
                </Typography>
              )}
            </Typography>
          </Box>
          <ArrowForwardIcon sx={{ color: planMetadata.color }} />
        </Box>

        <Button
          variant="contained"
          fullWidth
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          sx={{
            bgcolor: planMetadata.color,
            fontWeight: 'bold',
            '&:hover': {
              bgcolor: planMetadata.color,
              filter: 'brightness(0.9)'
            }
          }}
        >
          Desbloquear Agora
        </Button>
      </CardContent>
    </Card>
  );
}
