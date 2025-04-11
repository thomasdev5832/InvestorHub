import React from 'react';
import { ArrowRight, Aperture } from 'lucide-react';
import Button from '../ui/button';

interface InvestmentCardProps {
    title: string;
    description: string;
    apr: string; // Changed from apy to apr
    riskLevel: string;
    icon: React.ReactNode;
    featured?: boolean;
    chains: string[];
    algorithmScore: number;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({
    title,
    description,
    apr, // Changed from apy to apr
    riskLevel,
    icon,
    featured = false,
    chains,
    algorithmScore,
}) => (
    <div
        className={`relative p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out border ${featured ? 'border-sky-500' : 'border-gray-200'
            } hover:border-sky-400 group overflow-hidden`}
    >
        {featured && (
            <div className="absolute top-0 right-0 bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                FEATURED
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
        <div className="relative z-10">
            <div className="flex justify-center mb-4">
                <div
                    className={`p-3 rounded-xl ${featured ? 'bg-sky-100' : 'bg-gray-100'} group-hover:bg-sky-100 transition-colors duration-300`}
                >
                    {icon}
                </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center text-gray-900">{title}</h3>
            <p className="text-gray-600 text-sm mb-4 text-center leading-relaxed min-h-[60px]">{description}</p>
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500">POTENTIAL RETURN</span>
                    <span className="text-xs font-medium text-gray-500">ALGORITHM RATING</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-sky-600">{apr}</span> {/* Changed from apy to apr */}
                    <div className="flex items-center">
                        <Aperture className="w-4 h-4 text-amber-500 mr-1" />
                        <span className="text-sm font-medium">{algorithmScore}/5</span>
                    </div>
                </div>
            </div>
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500">RISK PROFILE</span>
                    <span className="text-xs font-medium text-gray-500">NETWORKS</span>
                </div>
                <div className="flex justify-between items-center">
                    <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${riskLevel === 'Low'
                            ? 'bg-green-100 text-green-800'
                            : riskLevel === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                    >
                        {riskLevel}
                    </span>
                    <span className="text-xs font-medium text-gray-700">{chains.length}+ networks</span>
                </div>
            </div>
            <div className="border-t border-gray-200 my-4" />
            <div className="flex justify-center">
                <Button
                    variant={featured ? 'primary' : 'outline'}
                    size="sm"
                    className={`w-full justify-center gap-2 ${featured ? 'shadow-sm' : ''}`}
                    icon={<ArrowRight size={14} />}
                >
                    Explore
                </Button>
            </div>
        </div>
    </div>
);

export default InvestmentCard;