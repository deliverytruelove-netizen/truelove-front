// src/pages/Usuarios.tsx

'use client';

import React from 'react';
import MainLayout from '../components/MainLayout';
import MotorizadoList from '@/components/MotorizadoList'; 


const Socios: React.FC = () => {
    return (
        <MainLayout>
            <MotorizadoList />
        </MainLayout>
    );
};

export default Socios;
