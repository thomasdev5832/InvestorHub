import React, { useState } from 'react';
import { BookOpen, GraduationCap, Video, FileText, Search, Filter, ChevronDown, ChevronUp, X, Grid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/button';

type LearningResource = {
    title: string;
    description: string;
    category: 'Beginner' | 'Intermediate' | 'Advanced';
    type: 'Course' | 'Guide' | 'Video' | 'Video Series';
    duration: string;
    icon: React.ReactNode;
    rating: number;
    featured?: boolean;
    lessons?: number;
    episodes?: number;
};

// Learning resource data
const learningResources: LearningResource[] = [
    {
        title: 'Crypto Investing 101',
        description: 'Learn the fundamentals of cryptocurrency investing and how to build a diversified portfolio.',
        category: 'Beginner' as const,
        type: 'Course' as const,
        duration: '2h 15m',
        icon: <GraduationCap size={24} className="text-indigo-600" />,
        rating: 4.8,
        lessons: 12,
        featured: true,
    },
    {
        title: 'Understanding DeFi Protocols',
        description: 'Deep dive into decentralized finance and learn how to evaluate different DeFi projects.',
        category: 'Intermediate',
        type: 'Course',
        duration: '3h 30m',
        icon: <GraduationCap size={24} className="text-indigo-600" />,
        rating: 4.9,
        lessons: 18,
    },
    {
        title: 'Risk Management Strategies',
        description: 'Master techniques to protect your capital while maximizing returns in volatile markets.',
        category: 'Advanced',
        type: 'Guide',
        duration: '45m read',
        icon: <FileText size={24} className="text-indigo-600" />,
        rating: 4.7,
    },
    {
        title: 'Technical Analysis Workshop',
        description: 'Learn chart patterns, indicators, and how to spot trends in crypto markets.',
        category: 'Intermediate',
        type: 'Video Series',
        duration: '4h 20m',
        icon: <Video size={24} className="text-indigo-600" />,
        rating: 4.6,
        episodes: 8,
    },
    {
        title: 'Wallet Security Essentials',
        description: 'Everything you need to know to keep your crypto assets safe from hackers.',
        category: 'Beginner',
        type: 'Guide',
        duration: '30m read',
        icon: <FileText size={24} className="text-indigo-600" />,
        rating: 4.9,
        featured: true,
    },
    {
        title: 'NFT Market Analysis',
        description: 'How to evaluate NFT projects and identify promising collections before they take off.',
        category: 'Intermediate',
        type: 'Course',
        duration: '2h',
        icon: <GraduationCap size={24} className="text-indigo-600" />,
        rating: 4.5,
        lessons: 10,
    },
    {
        title: 'Smart Contract Development',
        description: 'Introduction to writing and auditing smart contracts for Ethereum and other blockchains.',
        category: 'Advanced',
        type: 'Course',
        duration: '6h',
        icon: <GraduationCap size={24} className="text-indigo-600" />,
        rating: 4.8,
        lessons: 24,
    },
    {
        title: 'Market Psychology',
        description: 'Understand the emotional cycles of crypto markets and how to stay disciplined.',
        category: 'Intermediate',
        type: 'Video',
        duration: '1h 10m',
        icon: <Video size={24} className="text-indigo-600" />,
        rating: 4.7,
    },
    {
        title: 'Taxation for Crypto Investors',
        description: 'Comprehensive guide to crypto taxes, reporting, and compliance in major jurisdictions.',
        category: 'Beginner',
        type: 'Guide',
        duration: '1h read',
        icon: <FileText size={24} className="text-indigo-600" />,
        rating: 4.6,
    },
    {
        title: 'Yield Farming Strategies',
        description: 'Advanced techniques for maximizing returns through DeFi yield farming.',
        category: 'Advanced',
        type: 'Course',
        duration: '3h 45m',
        icon: <GraduationCap size={24} className="text-indigo-600" />,
        rating: 4.9,
        lessons: 15,
    },
    {
        title: 'Crypto Portfolio Rebalancing',
        description: 'When and how to adjust your portfolio allocation for optimal performance.',
        category: 'Intermediate',
        type: 'Guide',
        duration: '40m read',
        icon: <FileText size={24} className="text-indigo-600" />,
        rating: 4.5,
    },
];

// Component for list view
const LearningListItem: React.FC<LearningResource> = ({
    title,
    description,
    category,
    type,
    duration,
    icon,
    rating,
    lessons,
    episodes,
    featured = false,
}) => (
    <div className="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-indigo-400 transition-all duration-300">
        <div className="flex-shrink-0 mr-4 mt-1">{icon}</div>
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {featured && (
                    <span className="bg-indigo-500 text-white text-xs font-semibold px-2 py-1 rounded-full">FEATURED</span>
                )}
            </div>
            <p className="text-gray-600 text-sm mt-1">{description}</p>
            <div className="flex flex-wrap justify-between mt-3 text-sm gap-y-2">
                <span className="text-gray-500">
                    Category: <span className="font-medium">{category}</span>
                </span>
                <span className="text-gray-500">
                    Type: <span className="font-medium">{type}</span>
                </span>
                <span className="text-gray-500">
                    Duration: <span className="font-medium">{duration}</span>
                </span>
                <span className="text-gray-500">
                    Rating: <span className="font-medium">{rating}/5</span>
                </span>
                {lessons && (
                    <span className="text-gray-500">
                        Lessons: <span className="font-medium">{lessons}</span>
                    </span>
                )}
                {episodes && (
                    <span className="text-gray-500">
                        Episodes: <span className="font-medium">{episodes}</span>
                    </span>
                )}
            </div>
            <div className="mt-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                >
                    Start Learning
                </Button>
            </div>
        </div>
    </div>
);

// Component for grid view
const LearningCard: React.FC<LearningResource> = ({
    title,
    description,
    category,
    type,
    duration,
    icon,
    rating,
    lessons,
    episodes,
    featured,
}) => {
    const categoryColor = category === 'Beginner'
        ? 'bg-green-100 text-green-800'
        : category === 'Intermediate'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-red-100 text-red-800';

    const typeIcon = type === 'Course'
        ? <GraduationCap size={16} className="text-indigo-600" />
        : type === 'Guide'
            ? <FileText size={16} className="text-indigo-600" />
            : <Video size={16} className="text-indigo-600" />;

    return (
        <div className="flex flex-col p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-indigo-400 transition-all duration-300 h-full">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                    {icon}
                    <span className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${categoryColor}`}>
                        {category}
                    </span>
                </div>
                {featured && (
                    <span className="bg-indigo-500 text-white text-xs font-semibold px-2 py-1 rounded-full">FEATURED</span>
                )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>

            <div className="flex items-center text-sm text-gray-500 mb-3">
                {typeIcon}
                <span className="ml-2">{type}</span>
                <span className="mx-2">•</span>
                <span>{duration}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                    <span className="text-gray-900 font-medium">{rating}</span>
                    <span className="text-gray-500 ml-1">/5</span>
                    {lessons && (
                        <span className="text-gray-500 ml-3">
                            <span className="font-medium">{lessons}</span> lessons
                        </span>
                    )}
                    {episodes && (
                        <span className="text-gray-500 ml-3">
                            <span className="font-medium">{episodes}</span> episodes
                        </span>
                    )}
                </div>

                <Button variant="outline" size="sm">
                    Start
                </Button>
            </div>
        </div>
    );
};

const LearningPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        category: '' as '' | 'Beginner' | 'Intermediate' | 'Advanced',
        type: '' as '' | 'Course' | 'Guide' | 'Video' | 'Video Series',
        minRating: 0,
        keyword: '' as string,
        sortBy: '' as '' | 'default' | 'rating-desc' | 'rating-asc' | 'duration-desc' | 'duration-asc',
    });

    // Function to filter and sort resources
    const filteredResources = learningResources
        .filter((resource) => {
            const keywordMatch = filters.keyword
                ? resource.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
                resource.description.toLowerCase().includes(filters.keyword.toLowerCase())
                : true;

            return (
                keywordMatch &&
                (!filters.category || resource.category === filters.category) &&
                (!filters.type || resource.type === filters.type) &&
                (resource.rating >= filters.minRating)
            );
        })
        .sort((a, b) => {
            if (filters.sortBy === 'rating-desc') return b.rating - a.rating;
            if (filters.sortBy === 'rating-asc') return a.rating - b.rating;
            if (filters.sortBy === 'duration-desc') {
                // Extract numeric duration for comparison
                const aDuration = parseInt(a.duration);
                const bDuration = parseInt(b.duration);
                return (bDuration || 0) - (aDuration || 0);
            }
            if (filters.sortBy === 'duration-asc') {
                const aDuration = parseInt(a.duration);
                const bDuration = parseInt(b.duration);
                return (aDuration || 0) - (bDuration || 0);
            }
            return 0; // 'default' maintains the original order
        });

    // Handlers to update filters
    const handleCategoryFilter = (category: '' | 'Beginner' | 'Intermediate' | 'Advanced') => {
        setFilters((prev) => ({ ...prev, category }));
    };

    const handleTypeFilter = (type: '' | 'Course' | 'Guide' | 'Video' | 'Video Series') => {
        setFilters((prev) => ({ ...prev, type }));
    };

    const handleRatingFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, minRating: Number(e.target.value) }));
    };

    const handleKeywordFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters((prev) => ({ ...prev, keyword: e.target.value }));
    };

    const handleSortBy = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, sortBy: e.target.value as 'default' | 'rating-desc' | 'rating-asc' | 'duration-desc' | 'duration-asc' }));
    };

    const resetFilters = () => {
        setFilters({ category: '', type: '', minRating: 0, keyword: '', sortBy: 'default' });
    };

    // Unique list of types for the filter
    const allTypes = Array.from(new Set(learningResources.map(res => res.type))).sort();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Learning Resources</h1>
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        icon={<Filter size={16} />}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-2"
                    >
                        Filters {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </Button>
                    <div className="flex space-x-2">
                        <Button
                            variant={viewMode === 'grid' ? 'primary' : 'outline'}
                            size="sm"
                            icon={<Grid size={16} />}
                            onClick={() => setViewMode('grid')}
                            className="w-10"
                        />
                        <Button
                            variant={viewMode === 'list' ? 'primary' : 'outline'}
                            size="sm"
                            icon={<List size={16} />}
                            onClick={() => setViewMode('list')}
                            className="w-10"
                        />
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={filters.keyword}
                    onChange={handleKeywordFilter}
                    placeholder="Search learning resources..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

            {/* Filter Bar (Collapsible) */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100"
                    >
                        <div className="flex items-start gap-2 sm:gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-2">
                            {/* Category Filter */}
                            <div className="flex flex-col min-w-[110px]">
                                <label className="text-xs font-medium text-gray-600 mb-1">Category</label>
                                <div className="relative">
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleCategoryFilter(e.target.value as '' | 'Beginner' | 'Intermediate' | 'Advanced')}
                                        className="border border-gray-200 rounded-md px-2 pr-8 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 appearance-none w-full"
                                    >
                                        <option value="">All</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6.75737 7.75737C6.34892 8.16582 5.65108 8.16582 5.24263 7.75737L1.14213 3.65687C0.733683 3.24842 1.08263 2.55058 1.8905 2.55058H5.24263H10.7474C11.5553 2.55058 11.9042 3.24842 11.4958 3.65687L6.75737 7.75737Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Type Filter */}
                            <div className="flex flex-col min-w-[110px]">
                                <label className="text-xs font-medium text-gray-600 mb-1">Type</label>
                                <div className="relative">
                                    <select
                                        value={filters.type}
                                        onChange={(e) => handleTypeFilter(e.target.value as '' | 'Course' | 'Guide' | 'Video' | 'Video Series')}
                                        className="border border-gray-200 rounded-md px-2 pr-8 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 appearance-none w-full"
                                    >
                                        <option value="">All</option>
                                        {allTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6.75737 7.75737C6.34892 8.16582 5.65108 8.16582 5.24263 7.75737L1.14213 3.65687C0.733683 3.24842 1.08263 2.55058 1.8905 2.55058H5.24263H10.7474C11.5553 2.55058 11.9042 3.24842 11.4958 3.65687L6.75737 7.75737Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Minimum Rating Filter */}
                            <div className="flex flex-col min-w-[90px]">
                                <label className="text-xs font-medium text-gray-600 mb-1">Min Rating</label>
                                <div className="relative">
                                    <select
                                        value={filters.minRating}
                                        onChange={handleRatingFilter}
                                        className="border border-gray-200 rounded-md px-2 pr-8 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 appearance-none w-full"
                                    >
                                        <option value={0}>Any</option>
                                        <option value={4}>4.0+</option>
                                        <option value={4.5}>4.5+</option>
                                        <option value={4.7}>4.7+</option>
                                    </select>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6.75737 7.75737C6.34892 8.16582 5.65108 8.16582 5.24263 7.75737L1.14213 3.65687C0.733683 3.24842 1.08263 2.55058 1.8905 2.55058H5.24263H10.7474C11.5553 2.55058 11.9042 3.24842 11.4958 3.65687L6.75737 7.75737Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Sorting */}
                            <div className="flex flex-col min-w-[110px]">
                                <label className="text-xs font-medium text-gray-600 mb-1">Sort By</label>
                                <div className="relative">
                                    <select
                                        value={filters.sortBy}
                                        onChange={handleSortBy}
                                        className="border border-gray-200 rounded-md px-2 pr-8 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 appearance-none w-full"
                                    >
                                        <option value="default">Default</option>
                                        <option value="rating-desc">Rating ↓</option>
                                        <option value="rating-asc">Rating ↑</option>
                                        <option value="duration-desc">Duration ↓</option>
                                        <option value="duration-asc">Duration ↑</option>
                                    </select>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6.75737 7.75737C6.34892 8.16582 5.65108 8.16582 5.24263 7.75737L1.14213 3.65687C0.733683 3.24842 1.08263 2.55058 1.8905 2.55058H5.24263H10.7474C11.5553 2.55058 11.9042 3.24842 11.4958 3.65687L6.75737 7.75737Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <div className="flex flex-col self-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<X size={12} />}
                                    onClick={resetFilters}
                                    className="text-gray-500 hover:text-red-500 border border-gray-200 rounded-md px-2 py-1.5 bg-gray-50"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-medium">{filteredResources.length}</span> of{' '}
                    <span className="font-medium">{learningResources.length}</span> resources
                </p>
            </div>

            {filteredResources.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map((resource, index) => (
                            <LearningCard
                                key={index}
                                title={resource.title}
                                description={resource.description}
                                category={resource.category}
                                type={resource.type}
                                duration={resource.duration}
                                icon={resource.icon}
                                rating={resource.rating}
                                featured={resource.featured}
                                lessons={resource.lessons}
                                episodes={resource.episodes}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredResources.map((resource, index) => (
                            <LearningListItem
                                key={index}
                                title={resource.title}
                                description={resource.description}
                                category={resource.category}
                                type={resource.type}
                                duration={resource.duration}
                                icon={resource.icon}
                                featured={resource.featured}
                                rating={resource.rating}
                                lessons={resource.lessons}
                                episodes={resource.episodes}
                            />
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No resources found</h3>
                    <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
                    <div className="mt-6">
                        <Button
                            variant="outline"
                            onClick={resetFilters}
                        >
                            Reset all filters
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LearningPage;