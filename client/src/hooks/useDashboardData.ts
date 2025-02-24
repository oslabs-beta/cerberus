import { useEffect } from 'react';
import { useProtectedApi } from './useProtectedApi';
import type { DashboardData } from '../types';

export const useDashboardData = () => {
  const { data, error, isLoading, fetchProtectedData } =
    useProtectedApi<DashboardData>();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch all data in parallel
        await Promise.all([
          fetchProtectedData('profile'),
          fetchProtectedData('login-history'),
          // fetchProtectedData('activity'),
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadDashboardData();
  }, []); // Run once on mount

  return {
    dashboardData: data,
    error,
    isLoading,
  };
};
