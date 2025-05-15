
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maladies } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export interface Maladie {
  idMaladie: number;
  nomMaladie: string;
}

export interface MaladieWithVariants extends Maladie {
  variants: string[];
}

export interface MaladieInput {
  nomMaladie: string;
}

export function useGetMaladies() {
  return useQuery({
    queryKey: ['maladies'],
    queryFn: async () => {
      const response = await maladies.getAll();
      return response.data;
    },
  });
}

export function useGetVariantsByMaladie(idMaladie: number) {
  return useQuery({
    queryKey: ['variants', idMaladie],
    queryFn: async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/variants/by-maladie/${idMaladie}`);
        if (!response.ok) return [];
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching variants:", error);
        return [];
      }
    },
    enabled: !!idMaladie, // Only run query if idMaladie is available
  });
}

export function useGetMaladieWithVariants(idMaladie: number) {
  return useQuery({
    queryKey: ['maladie', 'variants', idMaladie],
    queryFn: async () => {
      try {
        // Get maladie details
        const maladieResponse = await maladies.getById(idMaladie);
        const maladieData = maladieResponse.data;
        
        // Get variants for this maladie
        const variantsResponse = await fetch(`http://127.0.0.1:8000/variants/by-maladie/${idMaladie}`)
          .then(res => res.ok ? res.json() : []);
        
        return {
          ...maladieData,
          variants: variantsResponse.map((v: any) => v.nomVariant) || []
        };
      } catch (error) {
        console.error("Error fetching maladie with variants:", error);
        throw error;
      }
    },
    enabled: !!idMaladie,
  });
}

export function useCreateMaladie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: MaladieInput) => maladies.create(data),
    onSuccess: () => {
      toast({
        title: "Maladie créée",
        description: "La maladie a été créée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['maladies'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.detail || "Une erreur est survenue lors de la création",
      });
    }
  });
}

export function useUpdateMaladie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: MaladieInput }) => 
      maladies.update(id, data),
    onSuccess: () => {
      toast({
        title: "Maladie mise à jour",
        description: "La maladie a été mise à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['maladies'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.detail || "Une erreur est survenue lors de la mise à jour",
      });
    }
  });
}

export function useDeleteMaladie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => maladies.delete(id),
    onSuccess: () => {
      toast({
        title: "Maladie supprimée",
        description: "La maladie a été supprimée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['maladies'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.detail || "Une erreur est survenue lors de la suppression",
      });
    }
  });
}
