'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Divider,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  Alert
} from '@mui/material';
import {
  UpgradePrompt,
  LockedFeatureButton,
  FeatureLockedCard,
  SubscriptionGuard
} from '@components/subscription';
import { SubscriptionPlan, Permission } from '@enums/subscriptionEnum';
import { useSubscription } from '@hooks';

export default function SubscriptionExamplesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { currentPlan } = useSubscription();

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          Exemplos de Limitações de Assinatura
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Seu plano atual: <strong>{currentPlan}</strong>. Esta página demonstra como as limitações são exibidas.
        </Alert>
      </Box>

      {/* Exemplo 1: UpgradePrompt Full */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          1. UpgradePrompt - Variante Full
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Card completo com todas as informações do plano necessário.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <UpgradePrompt
          requiredPlan={SubscriptionPlan.PREMIUM}
          title="Campanhas Colaborativas"
          description="Crie e gerencie campanhas épicas com seus amigos em tempo real"
          variant="full"
        />
      </Paper>

      {/* Exemplo 2: UpgradePrompt Compact */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          2. UpgradePrompt - Variante Compact
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Versão compacta para modais e diálogos.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ maxWidth: 500 }}>
          <UpgradePrompt
            requiredPlan={SubscriptionPlan.PREMIUM_PLUS}
            title="Sistemas Customizados"
            description="Crie suas próprias regras de RPG"
            variant="compact"
          />
        </Box>
      </Paper>

      {/* Exemplo 3: UpgradePrompt Inline */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          3. UpgradePrompt - Variante Inline
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Badge inline para usar dentro de textos.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body1">
          Para acessar esta funcionalidade você precisa do plano{' '}
          <UpgradePrompt requiredPlan={SubscriptionPlan.PREMIUM} variant="inline" />
        </Typography>
      </Paper>

      {/* Exemplo 4: LockedFeatureButton */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          4. LockedFeatureButton
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Botão que abre modal ao ser clicado.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <LockedFeatureButton
            requiredPlan={SubscriptionPlan.PREMIUM}
            featureName="Criar Campanha"
            variant="contained"
            color="primary"
          >
            Criar Nova Campanha
          </LockedFeatureButton>

          <LockedFeatureButton
            requiredPlan={SubscriptionPlan.PREMIUM_PLUS}
            featureName="Sistema Customizado"
            variant="outlined"
            color="secondary"
          >
            Criar Sistema Customizado
          </LockedFeatureButton>
        </Box>
      </Paper>

      {/* Exemplo 5: FeatureLockedCard */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          5. FeatureLockedCard - Grid de Funcionalidades
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Cards visuais para exibir funcionalidades bloqueadas em grids.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureLockedCard
              requiredPlan={SubscriptionPlan.PREMIUM}
              featureName="Campanhas Colaborativas"
              description="Crie campanhas épicas e jogue com amigos em tempo real"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureLockedCard
              requiredPlan={SubscriptionPlan.PREMIUM}
              featureName="Acesso ao Discord"
              description="Entre na comunidade exclusiva do MagitechRPG"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureLockedCard
              requiredPlan={SubscriptionPlan.PREMIUM_PLUS}
              featureName="Sistemas Customizados"
              description="Crie regras e sistemas de RPG personalizados"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Exemplo 6: SubscriptionGuard */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          6. SubscriptionGuard - Proteção de Página
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Clique no botão para ver como seria uma página protegida.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Button
          variant="contained"
          onClick={() => setModalOpen(true)}
        >
          Ver Exemplo de Página Protegida
        </Button>
      </Paper>

      {/* Modal de Exemplo */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Exemplo: Página de Campanhas (Usuário Freemium)
        </DialogTitle>
        <DialogContent>
          <SubscriptionGuard permission={Permission.ACCESS_CAMPAIGNS}>
            <Typography>Este conteúdo nunca será exibido se não tiver permissão</Typography>
          </SubscriptionGuard>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
