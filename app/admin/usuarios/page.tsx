// src/pages/Usuarios.tsx

'use client';

import React from 'react';
import MainLayout from '../components/MainLayout';
import UserList from '@/components/UserList';

const Usuarios: React.FC = () => {
  return (
    <MainLayout>
      <UserList />
    </MainLayout>
  );
};

export default Usuarios;
