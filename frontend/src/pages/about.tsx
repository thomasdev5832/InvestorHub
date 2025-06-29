import React from 'react';
import Logo from '../assets/logo.png';
import ChainlinkLogo from '../assets/Chainlink-Logo-Blue.svg';
import Logo77 from '../assets/77logo.svg';
import Button from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
    ArrowUpRight,
    Github,
    Linkedin,
    MessageCircle,
    Send,
    Twitter,
    Zap,
    Cpu,
    Eye,
    Key,
    Crosshair,
    Globe,
    DollarSign,
    BookOpen,
    Rocket,
    Layers,
    Shield,
    BarChart2
} from 'lucide-react';

const AboutPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white min-h-screen flex flex-col">
            {/* Header with subtle shadow */}
            <header className="bg-white/80 backdrop-blur-sm w-full z-50 sticky top-0 border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div
                            className="flex items-center space-x-2 cursor-pointer group"
                            onClick={() => navigate('/')}
                        >
                            <img
                                src={Logo}
                                alt="InvestorHub Logo"
                                className="h-10 transition-all duration-200 group-hover:scale-105 group-hover:rotate-3"
                            />
                            <span className="text-xl font-bold bg-gradient-to-r from-sky-800 to-sky-600 bg-clip-text text-transparent">
                                InvestorHub
                            </span>
                        </div>
                        <Button
                            variant="primary"
                            size="md"
                            icon={<ArrowUpRight size={18} />}
                            className="group hover:shadow-lg transition-shadow duration-200"
                            onClick={() => navigate('/dashboard')}
                        >
                            Launch dApp
                        </Button>
                    </div>
                </div>
            </header>

            {/* About Content */}
            <main className="flex-grow py-16 px-6 sm:px-12 lg:px-24 max-w-4xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                        About <span className="bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">InvestorHub</span>
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        InvestorHub is a decentralized finance platform that simplifies crypto investing through automated processes and cross-chain compatibility.
                    </p>
                </div>

                <div className="space-y-16">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                            <Zap className="text-sky-500" size={20} />
                            What We Do
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            We break down the barriers of DeFi complexity by providing one-click investments, automated gas fee handling, and seamless cross-chain support. Our platform aggregates and curates investment opportunities from multiple blockchains, making decentralized finance accessible to everyone.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                            <Eye className="text-sky-500" size={20} />
                            Our Vision
                        </h2>
                        <div className="">
                            <p className="text-lg text-gray-700 leading-relaxed mb-4">
                                <span className="font-semibold text-sky-600">InvestorHub</span> was born from a simple but powerful vision: to become the most trusted and intuitive platform for investors entering the world of decentralized finance.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed mb-4">
                                We're building more than just an investment platform - we're creating an <span className="font-semibold text-sky-600">Investment Integration Protocol</span> that seamlessly connects users to trusted DeFi opportunities while eliminating the cognitive barriers and common pitfalls that deter mainstream adoption.
                            </p>
                            <div className="grid gap-4 md:grid-cols-2 mt-6">
                                <div className="bg-white p-5 rounded-lg border border-sky-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Key className="text-sky-400" size={16} />
                                        For Beginners
                                    </h3>
                                    <p className="text-gray-600">
                                        A secure, engaging gateway with educational content and guided investment paths to build confidence in crypto investing.
                                    </p>
                                </div>
                                <div className="bg-white p-5 rounded-lg border border-sky-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Layers className="text-sky-400" size={16} />
                                        For the Ecosystem
                                    </h3>
                                    <p className="text-gray-600">
                                        A protocol that aggregates and curates quality opportunities, bringing liquidity and users to vetted DeFi projects.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                            <Cpu className="text-sky-500" size={20} />
                            How It Works
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-4">
                            Powered by Chainlink's Cross-Chain Interoperability Protocol (CCIP), InvestorHub connects users to secure, audited investments across any CCIP-enabled blockchain. Users can provide any supported token, and our platform handles all the complex processes:
                        </p>
                        <ul className="list-disc list-inside text-lg text-gray-600 space-y-2 ml-4 marker:text-sky-400">
                            <li className="pl-2">Automatic token swapping</li>
                            <li className="pl-2">Cross-chain bridging</li>
                            <li className="pl-2">Smart contract approvals</li>
                            <li className="pl-2">Investment execution</li>
                        </ul>
                    </section>



                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                            <Crosshair className="text-sky-500" size={20} />
                            Key Features
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            {[
                                {
                                    icon: <Shield className="text-sky-500" size={18} />,
                                    title: "Self-Custody",
                                    desc: "You maintain full control of your assets. We never hold or access your funds."
                                },
                                {
                                    icon: <Globe className="text-sky-500" size={18} />,
                                    title: "Cross-Chain Support",
                                    desc: "Access opportunities across Ethereum, Avalanche, Arbitrum, and more."
                                },
                                {
                                    icon: <DollarSign className="text-sky-500" size={18} />,
                                    title: "Transparent Fees",
                                    desc: "All costs are displayed upfront with automated fee handling."
                                },
                                {
                                    icon: <BookOpen className="text-sky-500" size={18} />,
                                    title: "Educational Tools",
                                    desc: "Learn crypto fundamentals through our gamified learning system."
                                }
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="p-5 rounded-lg border border-gray-100 bg-white hover:border-sky-100 hover:shadow-sm transition-all duration-200"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        {feature.icon}
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                            <BarChart2 className="text-sky-500" size={20} />
                            Technology Partners
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            InvestorHub is developed by <span className="font-semibold text-gray-800">77 Innovation Labs Team</span> and built using <span className="font-semibold text-gray-800">Chainlink</span> solutions to ensure security and reliability.
                        </p>
                        <div className="flex gap-8 items-center">
                            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-sky-200 transition-colors duration-200">
                                <img src={ChainlinkLogo} alt="Chainlink Oracle" className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-sky-200 transition-colors duration-200">
                                <img src={Logo77} alt="77 Innovation Labs" className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-b from-white to-sky-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Ready to <span className="bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">Redefine</span> Your Future?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join thousands of investors who've unlocked their wealth's true potential.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="/dashboard/pools">
                            <Button
                                variant="primary"
                                size="lg"
                                className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <Rocket className="mr-2" size={18} />
                                Start Your Journey
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start mb-4">
                                <img src={Logo} alt="InvestorHub" className="h-8 mr-2" />
                                <span className="text-xl font-semibold text-white">InvestorHub</span>
                            </div>
                            <p className="text-sm text-gray-400">InvestorHub is a transformative web application designed to simplify cryptocurrency investing through all DeFi opportunities.</p>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h3>
                            <ul className="space-y-2">
                                {['Guides', 'Help', 'Insights'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-sm text-gray-400 hover:text-sky-400 transition-colors duration-200">
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
                                        <a
                                            href={item === 'About' ? '/about' : '#'}
                                            className="text-sm text-gray-400 hover:text-sky-400 transition-colors duration-200"
                                        >
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Connect</h3>
                            <ul className="flex flex-wrap justify-center md:justify-start gap-4">
                                {[
                                    { name: 'X', icon: <Twitter size={18} />, url: 'https://x.com/investorhubdefi' },
                                    { name: 'Discord', icon: <MessageCircle size={18} />, url: '#' },
                                    { name: 'Telegram', icon: <Send size={18} />, url: '#' },
                                    { name: 'LinkedIn', icon: <Linkedin size={18} />, url: 'https://www.linkedin.com/company/77innovationlabs/' },
                                    { name: 'GitHub', icon: <Github size={18} />, url: 'https://github.com/77InnovationLabs/InvestorHub' },
                                ].map(({ name, icon, url }) => (
                                    <li key={name}>
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center text-gray-400 hover:text-sky-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-800"
                                        >
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
                                <a key={item} href="#" className="text-xs text-gray-500 hover:text-sky-400 transition-colors duration-200">
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

export default AboutPage;