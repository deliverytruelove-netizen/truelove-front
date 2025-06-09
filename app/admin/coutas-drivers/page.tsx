// app\admin\coutas-drivers\page.tsx

'use client';

import React from 'react';
import MainLayout from '../components/MainLayout';
import CuotasList from './components/CuotasList';

const Usuarios: React.FC = () => {
  return (
    <MainLayout>
       <CuotasList />
    </MainLayout>
  );
};

export default Usuarios;
