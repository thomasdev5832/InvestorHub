import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo.png';
import {
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import ConnectButton from './connect-button';

// Interface for menu items
interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    path: string;
    active?: boolean;
    onClick?: () => void;
}

// Component for menu items
const MenuItem: React.FC<MenuItemProps> = ({ icon, label, path, active = false, onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(path);
        if (onClick) onClick(); // Closes the menu on mobile, if applicable
    };

    return (
        <button
            onClick={handleClick}
            className={`flex items-center w-full p-3 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${active
                ? 'bg-sky-100 text-sky-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-sky-600'
                }`}
        >
            <span className="mr-3">{icon}</span>
            {label}
        </button>
    );
};

// Interface for Header props
interface HeaderProps {
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
    menuItems: { icon: React.ReactNode; label: string; path: string }[];
    activePath: string;
}

const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen, menuItems, activePath }) => {
    // Variants for dropdown animation
    const menuVariants = {
        open: { opacity: 1, y: 0 },
        closed: { opacity: 0, y: -10 },
    };

    return (
        <header className="bg-white shadow-sm w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">
                    {/* Logo and Hamburger (Mobile) */}
                    <div className="flex items-center space-x-4">
                        <img src={Logo} alt="InvestorHub Logo" className="h-8" />
                        <span className="text-xl font-bold text-gray-900 hidden lg:block">InvestorHub</span>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors lg:hidden"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Desktop Menu */}
                    <nav className="hidden lg:flex items-center space-x-4">
                        {menuItems.map((item) => (
                            <MenuItem
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                                path={item.path}
                                active={activePath === item.path}
                            />
                        ))}
                    </nav>

                    {/* Connect Wallet Button */}
                    <ConnectButton />

                </div>

                {/* Dropdown Menu (Mobile) */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={menuVariants}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="lg:hidden bg-white border-t border-gray-200 shadow-lg w-full px-4 py-2"
                        >
                            <nav className="space-y-2">
                                {menuItems.map((item) => (
                                    <MenuItem
                                        key={item.label}
                                        icon={item.label}
                                        label={item.label}
                                        path={item.path}
                                        active={activePath === item.path}
                                        onClick={() => setIsMenuOpen(false)}
                                    />
                                ))}
                                <MenuItem
                                    icon={<LogOut size={20} />}
                                    label="Logout"
                                    path="/"
                                    active={activePath === '/'}
                                    onClick={() => setIsMenuOpen(false)}
                                />
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};

export default Header;