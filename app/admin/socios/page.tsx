// app\admin\socios\page.tsx

'use client';

import React from 'react';
import MainLayout from '../components/MainLayout';
import SocioList from '@/components/SocioList';


const Socios: React.FC = () => {
    return (
        <MainLayout>
            <SocioList />
        </MainLayout>
    );
};

export default Socios;
