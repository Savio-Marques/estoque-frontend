import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../services/api';

export function useDebtors({ searchTerm = '', enabled = true } = {}) {
  return useQuery({
    queryKey: ['debtors', searchTerm],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('name', searchTerm);
      const res = await api.get(`/debtor/pesquisar?${params.toString()}`);
      return {
        debtorDTOList: res.data.debtorDTOList || [],
        summaryDebtorsDTO: res.data.summaryDebtorsDTO || { totalValue: 0, totalDebtors: 0 },
      };
    },
  });
}

export function useDebtorMutations({ onAddSuccess, onUpdateSuccess, onPaidSuccess } = {}) {
  const queryClient = useQueryClient();

  const addDebtorMutation = useMutation({
    mutationFn: (data) => api.post('/debtor', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debtors'] });
      toast.success('Pagamento pendente adicionado com sucesso!');
      if (onAddSuccess) onAddSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Falha ao adicionar pagamento.');
    },
  });

  const updateDebtorMutation = useMutation({
    mutationFn: (updatedDebtor) => api.put(`/debtor/${updatedDebtor.id}`, updatedDebtor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debtors'] });
      toast.success('Devedor atualizado com sucesso!');
      if (onUpdateSuccess) onUpdateSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Falha ao atualizar devedor.');
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: (id) => api.delete(`/debtor/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debtors'] });
      toast.success('Pagamento debitado com sucesso!');
      if (onPaidSuccess) onPaidSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Falha ao debitar pagamento.');
    },
  });

  return {
    addDebtorMutation,
    updateDebtorMutation,
    markAsPaidMutation,
  };
}
