'use client';

import React from 'react';
import MainLayout from '../components/MainLayout';
import TipoNegocioList from '@/components/TipoNegocioList';


const TiposNegocio: React.FC = () => {
    return (
        <MainLayout>
            <TipoNegocioList />
        </MainLayout>
    );
};

export default TiposNegocio;
