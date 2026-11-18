import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../services/api';

export function useDebtors({ searchTerm = '', paid = false, enabled = true } = {}) {
  const normalizedPaid = Boolean(paid);
  return useQuery({
    queryKey: ['debtors', searchTerm, normalizedPaid],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('name', searchTerm);
      params.append('paid', String(normalizedPaid));
      const res = await api.get(`/debtor/pesquisar?${params.toString()}`);
      return {
        debtorDTOList: res.data.debtorDTOList || [],
        summaryDebtorsDTO: res.data.summaryDebtorsDTO || { totalValue: 0, totalDebtors: 0 },
      };
    },
  });
}

export function useDebtorTransactions({ debtorId = null, enabled = false } = {}) {
  return useQuery({
    queryKey: ['debtor-transactions', debtorId ?? 'all'],
    enabled,
    queryFn: async () => {
      const endpoint =
        debtorId != null ? `/debtor/${debtorId}/transactions` : '/debtor/transactions';
      const res = await api.get(endpoint);
      return res.data || [];
    },
  });
}

export function useDebtorMutations({
  onAddSuccess,
  onUpdateSuccess,
  onPaidSuccess,
  onDeleteSuccess,
} = {}) {
  const queryClient = useQueryClient();

  const invalidateDebtorData = () => {
    queryClient.invalidateQueries({ queryKey: ['debtors'] });
    queryClient.invalidateQueries({ queryKey: ['debtor-transactions'] });
  };

  const addDebtorMutation = useMutation({
    mutationFn: (data) => api.post('/debtor', data),
    onSuccess: () => {
      invalidateDebtorData();
      toast.success('Lançamento registrado na caderneta!');
      if (onAddSuccess) onAddSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Falha ao registrar lançamento.');
    },
  });

  const updateDebtorMutation = useMutation({
    mutationFn: ({ id, name, description, value, transactionNote }) =>
      api.put(`/debtor/${id}`, { id, name, description, value, transactionNote }),
    onSuccess: (_data, variables) => {
      invalidateDebtorData();
      toast.success(variables?._customToast || 'Lançamento atualizado com sucesso!');
      if (onUpdateSuccess) onUpdateSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Falha ao atualizar lançamento.');
    },
  });

  const partialPayMutation = useMutation({
    mutationFn: ({ id, amount }) => api.patch(`/debtor/${id}/pay`, { amount }),
    onSuccess: (res) => {
      invalidateDebtorData();
      toast.success(
        res.status === 204
          ? 'Dívida quitada e salva no histórico!'
          : 'Abatimento registrado com sucesso!'
      );
      if (onPaidSuccess) onPaidSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Falha ao registrar abatimento.');
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: (id) => api.patch(`/debtor/${id}/settle`),
    onSuccess: () => {
      invalidateDebtorData();
      toast.success('Conta quitada e salva no histórico!');
      if (onPaidSuccess) onPaidSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Falha ao quitar conta.');
    },
  });

  const deleteDebtorMutation = useMutation({
    mutationFn: (id) => api.delete(`/debtor/${id}`),
    onSuccess: () => {
      invalidateDebtorData();
      toast.success('Registro excluído permanentemente.');
      if (onDeleteSuccess) onDeleteSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Falha ao excluir registro.');
    },
  });

  return {
    addDebtorMutation,
    updateDebtorMutation,
    partialPayMutation,
    markAsPaidMutation,
    deleteDebtorMutation,
  };
}
