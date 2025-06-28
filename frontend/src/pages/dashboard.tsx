// src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
    PieChart,
    DollarSign,
    Settings,
    Droplet,
    BookOpen,
} from 'lucide-react';
import Header from '../components/ui/header'; // Ajuste o caminho conforme sua estrutura

const Dashboard: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Lista de itens do menu com seus caminhos
    const menuItems = [
        { icon: <PieChart size={20} />, label: 'Portfolio', path: '/dashboard' },
        {
            icon: <Droplet size={20} />,
            label: 'Pools',
            path: '/dashboard/pools',
        },
        { icon: <DollarSign size={20} />, label: 'Opportunities', path: '/dashboard/opportunities' },
        { icon: <BookOpen size={20} />, label: 'Learning', path: '/dashboard/learning' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/dashboard/settings' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans antialiased">
            {/* Conteúdo principal com rolagem */}
            <div className="flex-1 flex flex-col">
                {/* Header como componente separado */}
                <Header
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    menuItems={menuItems}
                    activePath={location.pathname}
                />

                {/* Main Content */}
                <main className="flex-1 p-6 overflow-y-auto max-w-6xl flex flex-col mx-auto">
                    <Outlet /> {/* Renderiza o conteúdo das rotas filhas */}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;