import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../services/api';

export function useProductSummary() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: async () => {
      const res = await api.get('/product/summary');
      return (
        res.data || {
          totalProduct: 0,
          lowStock: 0,
          noStock: 0,
          totalStockValue: 0,
          totalSaleValue: 0,
        }
      );
    },
  });
}

export function useStockMovements({ enabled = false } = {}) {
  return useQuery({
    queryKey: ['movements'],
    enabled,
    queryFn: async () => {
      const res = await api.get('/product/movements');
      return res.data || [];
    },
  });
}

export function useProducts({
  searchTerm = '',
  stockFilter = 'all',
  categoryFilter = 'all',
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: ['products', searchTerm, stockFilter, categoryFilter],
    enabled,
    queryFn: async () => {
      let list = [];

      if (searchTerm) {
        const params = new URLSearchParams({ name: searchTerm });
        const res = await api.get(`/product/pesquisar?${params.toString()}`);
        list = res.data.content || res.data || [];

        if (stockFilter === 'low') {
          list = list.filter((p) => p.qtd > 0 && p.qtd <= (p.minQuantity ?? 5));
        } else if (stockFilter === 'out_of_stock') {
          list = list.filter((p) => p.qtd === 0);
        }
      } else {
        switch (stockFilter) {
          case 'low': {
            const res = await api.get('/product/lowStock');
            list = res.data.content || res.data || [];
            break;
          }
          case 'out_of_stock': {
            const res = await api.get('/product/noStock');
            list = res.data.content || res.data || [];
            break;
          }
          default: {
            const res = await api.get('/product');
            list = res.data.content || res.data || [];
            break;
          }
        }
      }

      if (categoryFilter && categoryFilter !== 'all') {
        const catId = parseInt(categoryFilter, 10);
        list = list.filter((p) => p.categoryId === catId);
      }

      return list;
    },
  });
}

export function useProductMutations({ onAddSuccess, onUpdateSuccess, onDeleteSuccess } = {}) {
  const queryClient = useQueryClient();

  const addProductMutation = useMutation({
    mutationFn: (productData) => api.post('/product', productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      toast.success('Produto adicionado com sucesso!');
      if (onAddSuccess) onAddSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Falha ao adicionar produto.');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (updatedProduct) => api.put(`/product/${updatedProduct.id}`, updatedProduct),
    onMutate: async (updatedProduct) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ['products'] });

      queryClient.setQueriesData({ queryKey: ['products'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((item) =>
          item.id === updatedProduct.id ? { ...item, ...updatedProduct } : item
        );
      });

      return { previousQueries };
    },
    onError: (error, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(error.response?.data?.message || 'Falha ao atualizar produto.');
    },
    onSuccess: (_data, variables) => {
      if (!variables._silentToast) {
        toast.success('Produto atualizado com sucesso!');
      }
      if (onUpdateSuccess) onUpdateSuccess();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => api.delete(`/product/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      toast.success('Produto deletado com sucesso!');
      if (onDeleteSuccess) onDeleteSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Falha ao deletar produto.');
    },
  });

  return {
    addProductMutation,
    updateProductMutation,
    deleteProductMutation,
  };
}
