# MIGRATION: useCampaignData Hook

## Problema Original Resolvido

O hook `useCampaignData` original tinha problemas de dependência entre hooks customizados:

```typescript
// ❌ PROBLEMA: dependências entre hooks
const campaign = useCampaignRealtime({...}).data[0]; // Busca campanha
const charsheets = useCharsheetsRealtime({...}).data; // Depende de campaign.players ← ERRO!
const users = useUsersRealtime({...}).data; // Depende de campaign.admin ← ERRO!
```

**Problemas:**
- `useCharsheetsRealtime` tentava acessar `campaign.players.map()` quando `campaign` era `undefined`
- `useUsersRealtime` tentava acessar `campaign.admin` quando `campaign` era `undefined`
- Dependências circulares entre hooks customizados

## Solução Implementada

### 1. **Versão com Promises** (Recomendada)
```typescript
// ✅ Busca sequencial com promises
export async function getCampaignData({ campaignCode, userId }) {
    // 1. Busca campanha primeiro
    const campaign = await CampaignEntity.findOne({...});

    // 2. Busca charsheets e usuários em paralelo
    const [charsheets, users] = await Promise.all([...]);

    // 3. Retorna dados organizados
    return { campaign, charsheets, users };
}
```

### 2. **Hook React Query** (Para componentes)
```typescript
// ✅ Hook com cache automático
export function useCampaignDataQuery({ campaignCode, userId }) {
    return useQuery({
        queryKey: ['campaign-data', campaignCode, userId],
        queryFn: () => getCampaignData({ campaignCode, userId }),
        staleTime: 5 * 60 * 1000, // Cache por 5 minutos
        retry: 3
    });
}
```

## Como Migrar

### **Para novos componentes:**
```typescript
// ❌ Antes
const campaignData = useCampaignData({ campaignCode, userId });

// ✅ Depois
const { data: campaignData, isLoading, error } = useCampaignDataQuery({
    campaignCode,
    userId
});
```

### **Para código existente:**
```typescript
// ✅ Mantém funcionando (compatibilidade)
const campaignData = useCampaignData({ campaignCode, userId });
```

## Benefícios da Nova Versão

1. **✅ Sem problemas de dependência** - Busca sequencial com promises
2. **✅ Performance melhor** - Busca em paralelo quando possível
3. **✅ Cache automático** - React Query gerencia cache e invalidação
4. **✅ Loading states** - Estados de carregamento automáticos
5. **✅ Retry automático** - Tenta novamente em caso de erro
6. **✅ Logs detalhados** - Debugging mais fácil
7. **✅ Type safety** - Tipos TypeScript completos

## Arquivos Modificados

- `hooks/useCampaignData.ts` - Hook principal com versão nova
- `components/examples/CampaignDataExample.tsx` - Exemplo de uso

## Compatibilidade

- ✅ **Backward compatible** - Código existente continua funcionando
- ✅ **Nova API** - Versão melhorada com promises e React Query
- ✅ **Mesma interface** - Retorna os mesmos dados
- ✅ **Melhor performance** - Menos re-renders e subscriptions
