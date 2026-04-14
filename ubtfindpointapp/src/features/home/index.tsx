import React from 'react';
import HomeView from './view/HomeView';
import { useHomeViewModel } from './viewmodel/useHomeViewModel';

export default function HomeScreen() {
  const { points, loading, error, refresh } = useHomeViewModel();

  return (
    <HomeView 
      points={points}
      loading={loading}
      error={error}
      onRefresh={refresh}
    />
  );
}