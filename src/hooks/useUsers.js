import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ledgerToast } from '../components/LedgerToast';
import api from '../services/api';

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

export function useUsers({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['users'],
    enabled,
    queryFn: async () => {
      try {
        const res = await api.get('users');
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        if (err.response?.status === 404) return [];
        throw err;
      }
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useUserMutations({
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
} = {}) {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: (payload) => api.post('auth/register', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onCreateSuccess?.();
    },
    onError: (err) => {
      ledgerToast.error(getErrorMessage(err, 'Erro ao cadastrar usuário.'));
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, ...payload }) => api.put(`users/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onUpdateSuccess?.();
    },
    onError: (err) => {
      ledgerToast.error(getErrorMessage(err, 'Erro ao atualizar usuário.'));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => api.delete(`users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      ledgerToast.error(getErrorMessage(err, 'Erro ao excluir usuário.'));
    },
  });

  return { createUserMutation, updateUserMutation, deleteUserMutation };
}
