




import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import * as api from '../api';
import type { Product, Artisan, Project } from '../types';
import { CertifiedBadgeIcon, LocationIcon } from '../components/IconComponents';
import { useTranslation } from '../i18n';
import LoadingSpinner from '../components/LoadingSpinner';


const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const { lang } = useTranslation();
    return (
        <NavLink to={`/souq/${product.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <img src={product.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/400/300'} alt={product.name[lang]} className="w-full h-40 object-cover"/>
            <div className="p-4">
                <h3 className="font-bold font-heading text-md">{product.name[lang]}</h3>
                <p className="text-xs text-elw-brown mt-1">{product.category[lang]}</p>
            </div>
        </NavLink>
    );
};

const ArtisanCard: React.FC<{ artisan: Artisan }> = ({ artisan }) => {
    const { t } = useTranslation();
    return (
     <NavLink to={`/creators/${artisan.id}`} className="block bg-white p-4 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-4">
            <img src={artisan.avatarUrl} alt={artisan.name} className="w-16 h-16 rounded-full object-cover"/>
            <div>
                <p className="text-xs text-gray-500">{t('project.createdBy')}</p>
                <h4 className="font-bold text-lg font-heading">{artisan.name}</h4>
                 {artisan.isCertified && (
                    <div className="mt-1 flex items-center gap-1 text-green-600 font-semibold text-xs">
                        <CertifiedBadgeIcon className="w-4 h-4"/> {t('common.certified')}
                    </div>
                )}
            </div>
        </div>
     </NavLink>
    );
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

const ProjectDetailPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const { projectId } = useParams<{ projectId: string }>();
    
    const [project, setProject] = useState<Project | null>(null);
    const [artisan, setArtisan] = useState<Artisan | null>(null);
    const [productsUsed, setProductsUsed] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!projectId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const projectData = await api.getProjectById(projectId);
                if (!projectData) {
                    setProject(null);
                    return;
                }
                setProject(projectData);

                const [artisanData, allProducts] = await Promise.all([
                    api.getArtisanById(projectData.artisanId),
                    api.getProducts()
                ]);
                
                setArtisan(artisanData || null);
                setProductsUsed(allProducts.filter(p => projectData.productsUsed.includes(p.id)));

            } catch (error) {
                console.error("Failed to fetch project details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId]);


    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!project || !artisan) {
        return <div className="text-center py-20 font-bold text-2xl">{t('project.notFound')}</div>;
    }

    return (
        <div className="bg-stone-100">
            <div className="container mx-auto px-6 py-12">
                {/* Project Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold font-heading text-elw-charcoal">{project.title[lang]}</h1>
                    <div className="flex items-center gap-4 mt-2 text-gray-600">
                         <div className="flex items-center gap-2">
                            <LocationIcon className="w-5 h-5 text-elw-brown"/>
                            <span>{project.location[lang]}</span>
                        </div>
                        <span>&bull;</span>
                        <span className="bg-elw-beige px-3 py-1 rounded-full text-sm font-semibold text-elw-brown">{project.style[lang]}</span>
                    </div>
                </div>

                {/* Main Content */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <div className="lg:col-span-2">
                        <ImageGallery images={project.imageUrls} alt={project.title[lang]} />
                    </div>
                    <div className="lg:col-span-1 flex flex-col gap-8 sticky top-28">
                        <div>
                            <h2 className="text-2xl font-bold font-heading mb-4">{t('project.creator')}</h2>
                            <ArtisanCard artisan={artisan} />
                        </div>
                        
                         <div>
                            <h2 className="text-2xl font-bold font-heading mb-4">{t('project.getTheLook')}</h2>
                            <div className="bg-white p-4 rounded-lg shadow-md border">
                                <h3 className="font-bold mb-4">{t('project.productsUsed')}</h3>
                                {productsUsed.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {productsUsed.map(product => <ProductCard key={product.id} product={product}/>)}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">{t('project.noProducts')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailPage;