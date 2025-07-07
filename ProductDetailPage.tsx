




import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import * as api from '../api';
import type { Project, Product, Offer } from '../types';
import { useTranslation } from '../i18n';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../context/CartContext';

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const { lang } = useTranslation();
    return (
        <NavLink to={`/inspiration/${project.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden group">
            <div className="relative">
                <img src={project.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/600/400'} alt={project.title[lang]} className="w-full h-56 object-cover"/>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end p-4">
                    <h3 className="text-white font-bold font-heading text-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{project.title[lang]}</h3>
                </div>
            </div>
        </NavLink>
    );
};

// Helper to calculate discounted price
const calculateDiscountedPrice = (priceStr: string, discount: number): string | null => {
    const priceMatch = priceStr.match(/(\d+(\.\d+)?)/);
    if (!priceMatch) return null;
    const price = parseFloat(priceMatch[0]);
    const discountedPrice = price * (1 - discount / 100);
    return priceStr.replace(priceMatch[0], discountedPrice.toFixed(0));
};

// Helper to extract a numerical price from a price string like "120 EGP/unit"
const parsePrice = (priceStr: string): number | null => {
    const match = priceStr.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : null;
};

const ImageGallery: React.FC<{ images: string[], alt: string }> = ({ images, alt }) => {
    const [mainImage, setMainImage] = useState(images[0]);

    if (!images || images.length === 0) {
        return <img src='https://picsum.photos/seed/placeholder/600/400' alt="Placeholder" className="w-full rounded-lg shadow-xl aspect-video object-cover"/>
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="aspect-video w-full">
                <img src={mainImage} alt={alt} className="w-full h-full rounded-lg shadow-xl object-cover"/>
            </div>
            {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                    {images.map((img, index) => (
                        <button key={index} onClick={() => setMainImage(img)} className={`rounded-lg overflow-hidden aspect-square border-2 ${mainImage === img ? 'border-elw-blue' : 'border-transparent'}`}>
                             <img src={img} alt={`${alt} thumbnail ${index + 1}`} className="w-full h-full object-cover"/>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const ProductDetailPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const { productId } = useParams<{ productId: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
    const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const { addToCart } = useCart();
    const numericPrice = product ? parsePrice(product.price[lang]) : null;


    useEffect(() => {
        if (!productId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const productData = await api.getProductById(productId);
                if (productData) {
                    setProduct(productData);
                    const [allProjects, allOffers] = await Promise.all([
                        api.getProjects(),
                        api.getOffers()
                    ]);
                    
                    setRelatedProjects(allProjects.filter(p => p.productsUsed.includes(productId)));

                    const now = new Date();
                    const offer = allOffers.find(o => 
                        o.productIds.includes(productId) &&
                        o.status === 'active' &&
                        new Date(o.startDate) <= now &&
                        new Date(o.endDate) >= now
                    );
                    setActiveOffer(offer || null);

                } else {
                    setProduct(null);
                }
            } catch (error) {
                console.error("Failed to fetch product details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productId]);
    
    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000); // Reset button state after 2s
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!product) {
        return <div className="text-center py-20 font-bold text-2xl">{t('product.notFound')}</div>;
    }

    const whatsappNumber = '201234567890';
    const message = encodeURIComponent(`${t('product.whatsappMessage')} ${product.name[lang]}`);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    const originalPrice = product.price[lang];
    const discountedPrice = activeOffer && numericPrice ? calculateDiscountedPrice(originalPrice, activeOffer.discountPercentage) : null;

    return (
        <div className="bg-stone-50">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div className="relative">
                        <ImageGallery images={product.imageUrls} alt={product.name[lang]} />
                        {activeOffer && (
                            <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-md z-10 shadow-lg">{t('common.sale')}</div>
                        )}
                    </div>
                    <div className="flex flex-col gap-4">
                        <p className="text-sm font-semibold text-elw-brown">{product.category[lang]}</p>
                        <h1 className="text-4xl font-bold font-heading text-elw-charcoal">{product.name[lang]}</h1>
                        
                        {activeOffer && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg">
                                <p className="font-bold">{activeOffer.title[lang]}</p>
                                <p className="text-sm">{activeOffer.description[lang]}</p>
                            </div>
                        )}

                        <p className="text-lg text-gray-600">{product.description[lang]}</p>
                        
                        <div className="mt-4 p-4 bg-white rounded-lg border border-stone-200">
                            <h3 className="font-bold text-lg mb-2 font-heading">{t('product.details')}</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-gray-500">{t('product.origin')}</p>
                                    <p className="font-semibold">{product.origin[lang]}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">{t('product.price')}</p>
                                    {discountedPrice ? (
                                        <div className="flex items-baseline gap-2">
                                            <p className="font-bold text-red-600 text-lg">{discountedPrice}</p>
                                            <p className="text-gray-500 line-through">{originalPrice}</p>
                                        </div>
                                    ) : (
                                        <p className="font-semibold text-elw-blue">{originalPrice}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {numericPrice ? (
                           <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <div>
                                    <label htmlFor="quantity" className="sr-only">{t('cart.quantity')}</label>
                                    <input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="w-24 px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:border-elw-blue focus:ring-elw-blue text-center"
                                    />
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className={`w-full text-center text-white font-heading px-6 py-3 rounded-lg transition-colors text-lg ${isAdded ? 'bg-green-500' : 'bg-elw-blue hover:bg-opacity-90'}`}
                                >
                                    {isAdded ? t('cart.itemAdded') : t('product.addToCart')}
                                </button>
                            </div>
                        ) : (
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 w-full text-center bg-elw-blue text-white font-heading px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors text-lg"
                            >
                                {t('product.requestQuote')}
                            </a>
                        )}

                    </div>
                </div>

                {relatedProjects.length > 0 && (
                     <div className="mt-20">
                        <h2 className="text-3xl font-bold font-heading text-elw-charcoal mb-8 text-center">{t('product.usedInProjects')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {relatedProjects.map(project => <ProjectCard key={project.id} project={project} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;