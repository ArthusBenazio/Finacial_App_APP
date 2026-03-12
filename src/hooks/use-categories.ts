import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await http.get<{ categories: Category[] }>('/categories')
      return response.data.categories
    },
  })
}

interface CreateCategoryData {
  name: string
  icon?: string
  color?: string
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const response = await http.post<{ category: Category }>('/categories', data)
      return response.data.category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (categoryId: string) => {
      await http.delete(`/categories/${categoryId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
