import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ledgerToast } from '../components/LedgerToast';
import api from '../services/api';

export function useCategories({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['categories'],
    enabled,
    queryFn: async () => {
      const res = await api.get('/category');
      return res.data || [];
    },
  });
}

export function useCategoryMutations({ onAddSuccess, onUpdateSuccess, onDeleteSuccess } = {}) {
  const queryClient = useQueryClient();

  const addCategoryMutation = useMutation({
    mutationFn: async (name) => {
      const res = await api.post('category', { name });
      return res.data;
    },
    onSuccess: (createdCategory) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      if (onAddSuccess) onAddSuccess(createdCategory);
    },
    onError: (error) => {
      ledgerToast.error(error.response?.data?.message || 'Falha ao adicionar categoria.');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (updatedCat) => api.put(`/category/${updatedCat.id}`, updatedCat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (onUpdateSuccess) onUpdateSuccess();
    },
    onError: (error) => {
      ledgerToast.error(error.response?.data?.message || 'Falha ao atualizar categoria.');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => api.delete(`/category/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      if (onDeleteSuccess) onDeleteSuccess();
    },
    onError: (error) => {
      ledgerToast.error(error.response?.data?.message || 'Falha ao deletar categoria.');
    },
  });

  return {
    addCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  };
}
