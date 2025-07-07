
import React, { useState, useEffect } from 'react';
import * as api from '../api';
import { Product, Offer } from '../types';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { SearchIcon } from '../components/IconComponents';
import LoadingSpinner from '../components/LoadingSpinner';

// Helper to find the active offer for a product
const getActiveOffer = (productId: string, offers: Offer[]): Offer | undefined => {
    const now = new Date();
    return offers.find(offer => 
        offer.productIds.includes(productId) &&
        offer.status === 'active' &&
        new Date(offer.startDate) <= now &&
        new Date(offer.endDate) >= now
    );
};

// Helper to calculate discounted price
const calculateDiscountedPrice = (priceStr: string, discount: number): string | null => {
    const priceMatch = priceStr.match(/(\d+)/);
    if (!priceMatch) return null;
    const price = parseFloat(priceMatch[0]);
    const discountedPrice = price * (1 - discount / 100);
    return priceStr.replace(priceMatch[0], discountedPrice.toFixed(0));
};

const ProductCard: React.FC<{ product: Product, offer?: Offer }> = ({ product, offer }) => {
    const { t, lang } = useTranslation();
    const originalPrice = product.price[lang];
    let displayPrice: React.ReactNode = <p className="font-bold text-elw-blue text-lg">{originalPrice}</p>;
    
    if (offer) {
        const discountedPrice = calculateDiscountedPrice(originalPrice, offer.discountPercentage);
        if (discountedPrice) {
            displayPrice = (
                <div className="flex items-center gap-2">
                    <p className="font-bold text-red-600 text-lg">{discountedPrice}</p>
                    <p className="text-sm text-gray-500 line-through">{originalPrice}</p>
                </div>
            )
        }
    }
    
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col relative">
            {offer && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md z-10">{t('common.sale')}</div>
            )}
            <img src={product.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/400/300'} alt={product.name[lang]} className="w-full h-56 object-cover"/>
            <div className="p-5 flex flex-col flex-grow">
                <p className="text-sm text-elw-brown font-semibold">{product.category[lang]}</p>
                <h3 className="font-bold font-heading text-xl mt-2 flex-grow">{product.name[lang]}</h3>
                <p className="text-xs text-gray-500 mt-2">{t('product.origin')}: {product.origin[lang]}</p>
                <div className="mt-4">
                    {displayPrice}
                    <NavLink to={`/souq/${product.id}`} className="block text-center w-full mt-2 bg-elw-charcoal text-white font-heading px-4 py-2 rounded-lg hover:bg-elw-blue transition-colors">
                        {t('common.viewDetails')}
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

const SouqPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState<'All' | 'aluminum' | 'kitchen'>('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsData, offersData] = await Promise.all([
                    api.getProducts(),
                    api.getOffers()
                ]);
                setAllProducts(productsData);
                setOffers(offersData);
            } catch (error) {
                console.error("Failed to fetch souq data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const filteredProducts = allProducts
        .filter(p => categoryFilter === 'All' || p.categoryKey === categoryFilter)
        .filter(p => 
            p.name[lang].toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.description[lang].toLowerCase().includes(searchTerm.toLowerCase())
        );
    
    const categories: {key: 'All' | 'aluminum' | 'kitchen', label: string}[] = [
        { key: 'All', label: t('souqPage.filters.all') },
        { key: 'aluminum', label: t('categories.aluminum') },
        { key: 'kitchen', label: t('categories.kitchen') },
    ];

    return (
        <div className="bg-stone-100 min-h-screen">
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold font-heading text-elw-charcoal text-center">{t('header.souq')}</h1>
                <p className="text-center mt-2 text-lg text-gray-600 max-w-2xl mx-auto">{t('souqPage.description')}</p>

                <div className="my-8 bg-white p-3 rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex flex-wrap justify-center gap-2">
                         {categories.map(cat => (
                             <button 
                                key={cat.key}
                                onClick={() => setCategoryFilter(cat.key)} 
                                className={`px-5 py-2 rounded-md font-semibold font-heading transition-colors duration-200 ${categoryFilter === cat.key ? 'bg-elw-blue text-white' : 'text-elw-charcoal hover:bg-stone-100'}`}
                             >
                                {cat.label}
                             </button>
                        ))}
                    </div>
                     <div className="relative flex-grow w-full sm:w-auto">
                        <input 
                            type="text"
                            placeholder={t('souqPage.filters.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-md border border-stone-300 focus:ring-2 focus:ring-elw-blue focus:outline-none"
                        />
                        <SearchIcon className="w-5 h-5 absolute top-1/2 -translate-y-1/2 right-3 text-stone-400" />
                    </div>
                </div>
                
                {loading ? <LoadingSpinner/> : (
                    <>
                        {filteredProducts.length > 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {filteredProducts.map(product => {
                                    const offer = getActiveOffer(product.id, offers);
                                    return <ProductCard key={product.id} product={product} offer={offer} />;
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-xl text-gray-500">{t('common.noResults')}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SouqPage;