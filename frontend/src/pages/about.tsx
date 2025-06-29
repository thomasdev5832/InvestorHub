import React from 'react';
import Logo from '../assets/logo.png';
import ChainlinkLogo from '../assets/Chainlink-Logo-Blue.svg';
import Logo77 from '../assets/77logo.svg';
import Button from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Github, Linkedin, MessageCircle, Send, Twitter } from 'lucide-react';

const AboutPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white min-h-screen flex flex-col">
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


            {/* About Content */}
            <main className="flex-grow py-16 px-6 sm:px-12 lg:px-24 max-w-4xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                        About InvestorHub
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        InvestorHub is a decentralized finance platform that simplifies crypto investing through automated processes and cross-chain compatibility.
                    </p>
                </div>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            We break down the barriers of DeFi complexity by providing one-click investments, automated gas fee handling, and seamless cross-chain support. Our platform aggregates and curates investment opportunities from multiple blockchains, making decentralized finance accessible to everyone.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-4">
                            Powered by Chainlink's Cross-Chain Interoperability Protocol (CCIP), InvestorHub connects users to secure, audited investments across any CCIP-enabled blockchain. Users can provide any supported token, and our platform handles all the complex processes:
                        </p>
                        <ul className="list-disc list-inside text-lg text-gray-600 space-y-2 ml-4">
                            <li>Automatic token swapping</li>
                            <li>Cross-chain bridging</li>
                            <li>Smart contract approvals</li>
                            <li>Investment execution</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Self-Custody</h3>
                                <p className="text-gray-600">You maintain full control of your assets. We never hold or access your funds.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cross-Chain Support</h3>
                                <p className="text-gray-600">Access opportunities across Ethereum, Avalanche, Arbitrum, and more.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent Fees</h3>
                                <p className="text-gray-600">All costs are displayed upfront with automated fee handling.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Tools</h3>
                                <p className="text-gray-600">Learn crypto fundamentals through our gamified learning system.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology Partners</h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            InvestorHub is developed by <span className="font-semibold text-gray-800">77 Innovation Labs Team</span> and built using <span className="font-semibold text-gray-800">Chainlink</span> solutions to ensure security and reliability.
                        </p>
                        <div className="flex gap-8 items-center">
                            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <img src={ChainlinkLogo} alt="Chainlink Oracle" className="h-8 opacity-80" />
                            </div>
                            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <img src={Logo77} alt="77 Innovation Labs" className="h-8 opacity-80" />
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Redefine Your Future?</h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join thousands of investors who’ve unlocked their wealth’s true potential.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="/dashboard/pools">
                            <Button variant="primary" size="lg">
                                Start Your Journey
                            </Button>
                        </a>

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
                            <p className="text-sm text-gray-400">InvestorHub is a transformative web application designed to simplify cryptocurrency investing through all DeFi opportunities.</p>
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
                                        <a
                                            href={item === 'About' ? '/about' : '#'}
                                            className="text-sm text-gray-400 hover:text-sky-400 transition-colors"
                                        >
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
                                    { name: 'X', icon: <Twitter size={18} />, url: '#' },
                                    { name: 'Discord', icon: <MessageCircle size={18} />, url: '#' },
                                    { name: 'Telegram', icon: <Send size={18} />, url: '#' },
                                    { name: 'LinkedIn', icon: <Linkedin size={18} />, url: 'https://www.linkedin.com/company/77innovationlabs/' },
                                    { name: 'GitHub', icon: <Github size={18} />, url: 'https://github.com/77InnovationLabs/InvestorHub' },
                                ].map(({ name, icon, url }) => (
                                    <li key={name} className="w-1/2 md:w-auto">
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start text-sm text-gray-400 hover:text-sky-400 transition-colors">
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

export default AboutPage;