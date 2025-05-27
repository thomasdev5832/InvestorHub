import React, { useState } from 'react';
import Logo from '../assets/logo.png';
import Button from '../components/ui/button';
import ChainlinkLogo from '../assets/Chainlink-Logo-Blue.svg';
import Logo77 from '../assets/77logo.svg';
import {
    ArrowUpRight,
    Shield,
    Layers,
    BarChart2,
    Crosshair,
    Globe,
    Lock,
    Rocket,
    Coins,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    Twitter,
    Send,
    Linkedin,
    Github,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import InvestmentCard from '../components/ui/investment-card';

// FeatureItem Component
const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-gray-200 hover:border-sky-300 transition-colors duration-300 h-full">
        <div className="bg-sky-50 p-3 rounded-full mb-4 text-sky-600">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
);

// FAQItem Component
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-2 border-gray-200 p-4 rounded-xl hover:border-sky-300 transition duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full text-left focus:outline-none"
            >
                <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
                {isOpen ? (
                    <ChevronUp size={20} className="text-sky-600 transition-transform duration-300" />
                ) : (
                    <ChevronDown size={20} className="text-sky-600 transition-transform duration-300" />
                )}
            </button>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
            >
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{answer}</p>
            </motion.div>
        </div>
    );
};

const LandingPage: React.FC = () => {
    const [showMore, setShowMore] = useState(false);
    const navigate = useNavigate();

    const initialCards = [
        {
            title: 'Everest',
            description: 'Unshakable. Built for those who seek steady, unstoppable growth.',
            apy: '12-16%',
            riskLevel: 'Low',
            icon: <Shield size={24} className="text-sky-600" />,
            chains: ['Ethereum', 'Arbitrum', 'Optimism'],
            algorithmScore: 4.7,
        },
        {
            title: 'Equilibrium',
            description: 'Perfect harmony between security and performance. Designed for momentum.',
            apy: '18-25%',
            riskLevel: 'Medium',
            icon: <Crosshair size={24} className="text-sky-600" />,
            featured: true,
            chains: ['Solana', 'Polygon', 'Avalanche', 'Base'],
            algorithmScore: 4.9,
        },
        {
            title: 'Liftoff',
            description: 'Unleash potential. High risk, high reward. No limits. No fear.',
            apy: '25-40%',
            riskLevel: 'High',
            icon: <Rocket size={24} className="text-sky-600" />,
            chains: ['Starknet', 'Sui', 'Aptos', 'Sei'],
            algorithmScore: 4.2,
            featured: false,
        },
    ];

    const additionalCards = [
        {
            title: 'Surge',
            description: 'Ride the next wave of opportunity. Dynamic, fast, unstoppable.',
            apy: '20-30%',
            riskLevel: 'Medium',
            icon: <Rocket size={24} className="text-sky-600" />,
            chains: ['Binance Smart Chain', 'Fantom', 'Harmony'],
            algorithmScore: 4.5,
        },
        {
            title: 'Aegis',
            description: 'The ultimate shield. Stability you can trust. Strength you can build on.',
            apy: '8-12%',
            riskLevel: 'Low',
            icon: <Shield size={24} className="text-sky-600" />,
            chains: ['Ethereum', 'Polygon', 'Optimism'],
        },
        {
            title: 'Frontier',
            description: 'Where innovation meets opportunity. Designed for pioneers.',
            apy: '30-50%',
            riskLevel: 'High',
            icon: <Crosshair size={24} className="text-sky-600" />,
            chains: ['Aptos', 'Sui', 'Sei', 'Scroll'],
            algorithmScore: 4.0,
            featured: false,
        },
    ];

    return (
        <div className="text-gray-900 antialiased font-sans">
            {/* Header */}
            <header className="bg-white/50 backdrop-blur-sm w-full z-50 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                            <img src={Logo} alt="InvestorHub Logo" className="h-10 transition-transform hover:scale-105" />
                            <span className="text-xl font-bold bg-gradient-to-r from-sky-800 to-sky-700 bg-clip-text text-transparent">
                                InvestorHub
                            </span>
                        </div>
                        <Button
                            variant="primary"
                            size="md"
                            icon={<ArrowUpRight size={18} />}
                            className="group"
                            onClick={() => navigate('/dashboard')}
                        >
                            Launch dApp
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-20 pb-16 bg-gradient-to-t from-white to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center mb-4 px-4 py-1.5 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                            <Globe size={16} className="mr-2" />
                            The Future of DeFi Starts Now
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                            Your Money. <br />
                            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">Your Power.</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            No banks. Limitless possibilities.<br />
                            Invest in DeFi with confidence.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
                                Take the First Step
                            </Button>
                            <Button variant="outline" size="lg" icon={<BarChart2 size={16} />} iconPosition="left" onClick={() => navigate('/dashboard/opportunities')}>
                                See What’s Possible
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FeatureItem
                            icon={<Lock size={20} />}
                            title="Smarter. Faster. Better."
                            description="Our AI-powered engine finds high-reward opportunities for you—effortlessly."
                        />
                        <FeatureItem
                            icon={<Layers size={20} />}
                            title="Invest Anywhere"
                            description="Top-performing assets, multiple networks, zero friction. Your wealth, your way."
                        />
                        <FeatureItem
                            icon={<Coins size={20} />}
                            title="Pure Growth"
                            description="No hidden fees. No fine print. Just real, transparent returns that work for you."
                        />
                    </div>
                </div>
            </section>

            {/* Investment Products */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Opportunities That Inspire</h2>
                    <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12 text-lg">
                        Tailored for every investor. Engineered for exceptional growth.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Cards */}
                        {initialCards.map((card, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.6,
                                    ease: [0.25, 0.1, 0.25, 1],
                                    delay: index * 0.15
                                }}
                            >
                                <InvestmentCard
                                    title={card.title}
                                    description={card.description}
                                    apy={card.apy}
                                    riskLevel={card.riskLevel}
                                    icon={card.icon}
                                    featured={card.featured}
                                    chains={card.chains}
                                    algorithmScore={card.algorithmScore ?? 0}
                                />
                            </motion.div>
                        ))}

                        <AnimatePresence mode="wait">
                            {showMore && additionalCards.map((card, index) => (
                                <motion.div
                                    key={`additional-${index}`}
                                    initial={{
                                        opacity: 0,
                                        x: "100%",
                                        scale: 0.95
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        scale: 1
                                    }}
                                    exit={{
                                        opacity: 0,
                                        x: "-100%",
                                        scale: 0.95
                                    }}
                                    transition={{
                                        duration: 0.7,
                                        ease: [0.4, 0, 0.2, 1],
                                        delay: index * 0.15,
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 20
                                    }}
                                >
                                    <InvestmentCard
                                        title={card.title}
                                        description={card.description}
                                        apy={card.apy}
                                        riskLevel={card.riskLevel}
                                        icon={card.icon}
                                        featured={card.featured}
                                        chains={card.chains}
                                        algorithmScore={card.algorithmScore ?? 0}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col items-center justify-center mt-8 gap-4">
                        <AnimatePresence>
                            {showMore && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={() => navigate('dashboard/opportunities')}
                                        icon={<ArrowUpRight size={20} />}
                                        iconPosition="right"
                                        className="bg-sky-600 hover:bg-sky-700 text-white transition-colors duration-300"
                                    >
                                        More Investments
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Show More/Less Button */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setShowMore(!showMore)}
                                icon={showMore ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                iconPosition="right"
                                className="text-gray-900 hover:text-sky-600 transition-colors duration-300"
                            >
                                {showMore ? 'Show Less' : 'Discover More Opportunities'}
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Platform Stats */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-2xl font-semibold text-center text-gray-900 mb-8">Our Impact</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-gray-900">15K+</span>
                            <span className="text-gray-600 text-sm">Investors Thriving</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-gray-900">$180M+</span>
                            <span className="text-gray-600 text-sm">Assets Growing</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-gray-900">120+</span>
                            <span className="text-gray-600 text-sm">Opportunities Found</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-gray-900">10</span>
                            <span className="text-gray-600 text-sm">Networks Connected</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="py-16 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-semibold text-center mb-8 text-gray-900">Trusted by the Best</h2>
                    <div className="flex flex-wrap gap-8 items-center justify-center">
                        <div className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <img src={ChainlinkLogo} alt="Chainlink Oracle" className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <img src={Logo77} alt="77 Logo" className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <p className="mt-8 text-gray-600 text-center max-w-2xl">
                        We partner with industry leaders to ensure your investments are secure and thriving.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Investing, Redefined</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We’ve stripped away the complexity. What’s left is pure opportunity.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-sky-300 transition-colors">
                            <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900">Global Reach</h3>
                            <p className="text-gray-600">Invest across networks with ease. Your opportunities are limitless.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-sky-300 transition-colors">
                            <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900">Smart Selection</h3>
                            <p className="text-gray-600">Our algorithms find the best opportunities, so you can invest with confidence.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-sky-300 transition-colors">
                            <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900">True Growth</h3>
                            <p className="text-gray-600">Real returns, no gimmicks. Your wealth deserves the best.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Clarity for Your Journey</h2>
                        <p className="text-xl text-gray-600">Answers to help you invest with confidence.</p>
                    </div>
                    <div className="space-y-4">
                        <FAQItem
                            question="What is InvestorHub?"
                            answer="InvestorHub is your gateway to effortless investing. We simplify the process, connecting you to the best opportunities across networks, so you can grow your wealth with ease."
                        />
                        <FAQItem
                            question="How much do I need to start?"
                            answer="You can start with any amount. We believe everyone deserves the chance to grow their wealth, no matter the size of their investment."
                        />
                        <FAQItem
                            question="Is my investment secure?"
                            answer="Absolutely. Security is at the core of everything we do. We use cutting-edge technology and partner with trusted leaders to keep your investments safe."
                        />
                        <FAQItem
                            question="What are investment opportunities?"
                            answer="They’re carefully curated pools of assets designed to maximize your growth. We’ve done the hard work, so you can focus on the results."
                        />
                        <FAQItem
                            question="How do I find the best investment for me?"
                            answer="It all starts with your goals. Looking for stability? Go for lower-risk options. Want steady growth? Diversify wisely. Ready to maximize returns? Explore high-yield opportunities. The choice is yours."
                        />
                        <FAQItem
                            question="Can I withdraw anytime?"
                            answer="Yes, always. Your investments are yours to access whenever you need them, with the same ease you expect from us."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-sky-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Redefine Your Future?</h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join thousands of investors who’ve unlocked their wealth’s true potential.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button variant="primary" size="lg">
                            Start Your Journey
                        </Button>
                        <Button variant="ghost" size="lg">
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start mb-4">
                                <img src={Logo} alt="InvestorHub" className="h-8 mr-2" />
                                <span className="text-xl font-semibold text-white">InvestorHub</span>
                            </div>
                            <p className="text-sm text-gray-400">Where wealth meets opportunity.</p>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h3>
                            <ul className="space-y-2">
                                {['Guides', 'Help', 'Insights'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-sm text-gray-400 hover:text-sky-400 transition-colors">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Links</h3>
                            <ul className="space-y-2">
                                {['About', 'Team', 'Careers'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-sm text-gray-400 hover:text-sky-400 transition-colors">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Connect</h3>
                            <ul className="flex flex-wrap justify-start gap-3">
                                {[
                                    { name: 'X', icon: <Twitter size={18} /> },
                                    { name: 'Discord', icon: <MessageCircle size={18} /> },
                                    { name: 'Telegram', icon: <Send size={18} /> },
                                    { name: 'LinkedIn', icon: <Linkedin size={18} /> },
                                    { name: 'GitHub', icon: <Github size={18} /> },
                                ].map(({ name, icon }) => (
                                    <li key={name} className="w-1/2 md:w-auto">
                                        <a href="#" className="flex items-center justify-center md:justify-start text-sm text-gray-400 hover:text-sky-400 transition-colors">
                                            {icon}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-xs text-gray-500 mb-4 md:mb-0">
                            © {new Date().getFullYear()} InvestorHub. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            {['Privacy', 'Terms', 'Cookies'].map((item) => (
                                <a key={item} href="#" className="text-xs text-gray-500 hover:text-sky-400 transition-colors">
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;