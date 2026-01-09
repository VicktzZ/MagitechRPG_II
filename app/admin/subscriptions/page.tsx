'use client';

import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  IconButton,
  Tooltip,
  InputAdornment,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import type { User } from '@models/entities';
import { SubscriptionPlan, SubscriptionPlanMetadata, SubscriptionStatus } from '@enums/subscriptionEnum';
import { isAdminEmail } from '@utils/adminCheck';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function AdminSubscriptionsPage() {
  const { data: session } = useSession();
  const { data: allUsers, loading } = useFirestoreRealtime('user');
  
  // Verificar se o usuário atual é admin
  const isAdmin = isAdminEmail(session?.user?.email);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SubscriptionPlan.FREEMIUM);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    updated: number;
    errors: number;
  } | null>(null);

  // Filtrar usuários baseado na busca
  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    if (!searchQuery) return allUsers as User[];

    const query = searchQuery.toLowerCase();
    return (allUsers as User[]).filter((user: User) =>
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.id?.toLowerCase().includes(query)
    );
  }, [allUsers, searchQuery]);

  // Estatísticas
  const stats = useMemo(() => {
    if (!allUsers) return { total: 0, freemium: 0, premium: 0, premiumPlus: 0 };

    const users = allUsers as User[];
    return {
      total: users.length,
      freemium: users.filter(u => u.subscription?.plan === SubscriptionPlan.FREEMIUM).length,
      premium: users.filter(u => u.subscription?.plan === SubscriptionPlan.PREMIUM).length,
      premiumPlus: users.filter(u => u.subscription?.plan === SubscriptionPlan.PREMIUM_PLUS).length,
      noSubscription: users.filter(u => !u.subscription).length
    };
  }, [allUsers]);

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u: User) => u.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleConfirmUpdate = () => {
    setConfirmDialogOpen(true);
  };

  const handleUpdatePlans = async () => {
    setProcessing(true);
    setResult(null);

    try {
      let updated = 0;
      let errors = 0;

      // Atualizar cada usuário selecionado
      for (const userId of selectedUsers) {
        try {
          const response = await fetch(`/api/user/${userId}/subscription`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              plan: selectedPlan,
              paymentData: {
                paymentMethod: 'admin_assignment',
                transactionId: `admin_${Date.now()}`
              }
            })
          });

          if (response.ok) {
            updated++;
          } else {
            errors++;
          }
        } catch (error) {
          console.error(`Erro ao atualizar usuário ${userId}:`, error);
          errors++;
        }
      }

      setResult({
        success: errors === 0,
        message: errors === 0
          ? `${updated} usuário(s) atualizado(s) com sucesso!`
          : `${updated} atualizado(s), ${errors} erro(s)`,
        updated,
        errors
      });

      // Limpar seleção após sucesso
      if (errors === 0) {
        setSelectedUsers([]);
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao processar atualizações',
        updated: 0,
        errors: selectedUsers.length
      });
    } finally {
      setProcessing(false);
      setConfirmDialogOpen(false);
    }
  };

  const getPlanChip = (plan?: SubscriptionPlan) => {
    if (!plan) return <Chip label="Sem plano" size="small" color="default" />;
    
    const metadata = SubscriptionPlanMetadata[plan];
    return (
      <Chip
        label={`${metadata.icon} ${metadata.name}`}
        size="small"
        sx={{
          bgcolor: metadata.color,
          color: 'white',
          fontWeight: 'bold'
        }}
      />
    );
  };

  // Se não é admin, mostrar mensagem de acesso negado
  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            🔒 Acesso Negado
          </Typography>
          <Typography variant="body2">
            Você não tem permissões para acessar esta página. Apenas administradores podem gerenciar planos de usuários.
          </Typography>
          <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
            Email atual: {session?.user?.email || 'Não autenticado'}
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            🔧 Gerenciamento de Planos (Admin)
          </Typography>
          <Chip
            label="ADMIN"
            size="small"
            color="error"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Atribua planos de assinatura para um ou múltiplos usuários
        </Typography>
        <Alert severity="success" sx={{ mt: 2 }}>
          ✅ Você está autenticado como <strong>{session?.user?.email}</strong> (Admin)
        </Alert>
        <Alert severity="warning" sx={{ mt: 1 }}>
          ⚠️ Esta é uma página administrativa. Tenha cuidado ao modificar planos de usuários.
        </Alert>
      </Box>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Total de Usuários
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: '#9E9E9E' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                ⚡ Freemium
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9E9E9E' }}>
                {stats.freemium}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: '#2196F3' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                👑 Premium
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                {stats.premium}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: '#9C27B0' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                💎 Premium+
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9C27B0' }}>
                {stats.premiumPlus}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de Ações */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Busca */}
          <TextField
            label="Buscar usuários"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            placeholder="Nome, email ou ID..."
          />

          {/* Seletor de Plano */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Plano a Atribuir</InputLabel>
            <Select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value as SubscriptionPlan)}
              label="Plano a Atribuir"
            >
              {Object.values(SubscriptionPlan).map((plan) => {
                const metadata = SubscriptionPlanMetadata[plan];
                return (
                  <MenuItem key={plan} value={plan}>
                    {metadata.icon} {metadata.displayName}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Botão de Atribuir */}
          <Button
            variant="contained"
            onClick={handleConfirmUpdate}
            disabled={selectedUsers.length === 0 || processing}
            sx={{ minWidth: 150 }}
          >
            Atribuir a {selectedUsers.length} usuário(s)
          </Button>

          {/* Botão de Refresh */}
          <Tooltip title="Recarregar dados">
            <IconButton onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Info de Seleção */}
        {selectedUsers.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.main', borderRadius: 1, color: 'white' }}>
            <Typography variant="body2">
              ℹ️ {selectedUsers.length} usuário(s) selecionado(s) receberão o plano{' '}
              <strong>{SubscriptionPlanMetadata[selectedPlan].displayName}</strong>
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Resultado */}
      {result && (
        <Alert
          severity={result.success ? 'success' : result.errors > 0 ? 'warning' : 'error'}
          onClose={() => setResult(null)}
          sx={{ mb: 3 }}
        >
          {result.message}
        </Alert>
      )}

      {/* Tabela de Usuários */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                  onChange={handleSelectAll}
                  sx={{ color: 'white' }}
                />
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuário</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Plano Atual</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data de Início</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    Nenhum usuário encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user: User) => (
                <TableRow
                  key={user.id}
                  hover
                  selected={selectedUsers.includes(user.id)}
                  sx={{
                    cursor: 'pointer',
                    '&.Mui-selected': {
                      bgcolor: (theme) => theme.palette.action.selected
                    }
                  }}
                  onClick={() => handleSelectUser(user.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedUsers.includes(user.id)} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{ width: 40, height: 40 }}
                        src={user.image}
                      >
                        {user.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {user.name || 'Sem nome'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.email || 'Sem email'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getPlanChip(user.subscription?.plan)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.subscription?.status || 'N/A'}
                      size="small"
                      color={
                        user.subscription?.status === SubscriptionStatus.ACTIVE
                          ? 'success'
                          : user.subscription?.status === SubscriptionStatus.CANCELLED
                          ? 'warning'
                          : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.subscription?.startDate
                        ? new Date(user.subscription.startDate).toLocaleDateString('pt-BR')
                        : 'N/A'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Confirmação */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => !processing && setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar Atribuição de Plano</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você está prestes a atribuir o plano{' '}
            <strong>{SubscriptionPlanMetadata[selectedPlan].displayName}</strong>{' '}
            para <strong>{selectedUsers.length}</strong> usuário(s).
          </DialogContentText>
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Usuários selecionados:
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {selectedUsers.map(userId => {
                const user = (allUsers as User[])?.find((u: User) => u.id === userId);
                return (
                  <Typography key={userId} variant="body2">
                    • {user?.name || user?.email || userId}
                  </Typography>
                );
              })}
            </Box>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            Esta ação irá:
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>Atualizar o plano dos usuários selecionados</li>
              <li>Registrar a mudança no histórico</li>
              <li>Ativar as permissões do novo plano</li>
            </ul>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={processing}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdatePlans}
            variant="contained"
            disabled={processing}
            startIcon={processing && <CircularProgress size={16} />}
          >
            {processing ? 'Processando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
