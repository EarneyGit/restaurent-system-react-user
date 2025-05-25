import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios.config';
import { useBranch } from '../context/BranchContext';
import { toast } from 'sonner';

interface BranchApiOptions<T> {
  endpoint: string;
  params?: Record<string, any>;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export function useBranchApi<T>({ endpoint, params = {}, onSuccess, onError }: BranchApiOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { selectedBranch } = useBranch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedBranch) {
        navigate('/outlet-selection');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<T>(endpoint, {
          params: {
            ...params,
            branchId: selectedBranch.id
          }
        });

        if (response.data) {
          setData(response.data);
          onSuccess?.(response.data);
        }
      } catch (err: any) {
        console.error('API Error:', err);
        setError(err);
        onError?.(err);

        if (err.response?.status === 401) {
          toast.error('Please select a branch first');
          navigate('/outlet-selection');
        } else {
          toast.error(err.response?.data?.message || 'Failed to fetch data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [endpoint, selectedBranch, navigate]);

  return { data, isLoading, error };
}

export default useBranchApi; 