


import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import * as api from '../api';
import type { Project, Artisan } from '../types';
import { CertifiedBadgeIcon, LocationIcon } from '../components/IconComponents';
import { useTranslation } from '../i18n';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const { lang } = useTranslation();
    return (
        <NavLink to={`/inspiration/${project.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden group">
            <div className="relative">
                <img src={project.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/600/400'} alt={project.title[lang]} className="w-full h-56 object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                     <h3 className="text-white font-bold font-heading text-xl">{project.title[lang]}</h3>
                </div>
            </div>
            <div className="p-3 bg-white">
                <p className="text-sm flex items-center gap-1 text-gray-600">
                    <LocationIcon className="w-4 h-4 text-elw-brown" />
                    {project.location[lang]}
                </p>
            </div>
        </NavLink>
    );
};


const ArtisanDetailPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const { artisanId } = useParams<{ artisanId: string }>();
    const [artisan, setArtisan] = useState<Artisan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!artisanId) return;

        const fetchArtisan = async () => {
            try {
                setLoading(true);
                const artisanData = await api.getArtisanById(artisanId);
                setArtisan(artisanData || null);
            } catch (error) {
                console.error("Failed to fetch artisan details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtisan();
    }, [artisanId]);

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!artisan) {
        return <div className="text-center py-20 font-bold text-2xl">{t('artisan.notFound')}</div>;
    }

    const message = encodeURIComponent(t('artisan.contactMessage'));
    const whatsappUrl = `https://wa.me/${artisan.phone}?text=${message}`;

    const activeProjects = artisan.projects.filter(p => p.isActive && p.status === 'approved');

    return (
        <div className="bg-stone-50">
            {/* Hero Section */}
            <div className="bg-elw-charcoal">
                <div className="container mx-auto px-6 py-12 text-white flex flex-col md:flex-row items-center gap-8">
                    <img src={artisan.avatarUrl} alt={artisan.name} className="w-40 h-40 rounded-full object-cover ring-4 ring-white/50 border-4 border-elw-blue"/>
                    <div>
                        <h1 className="text-4xl font-bold font-heading">{artisan.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-stone-300">
                             <div className="flex items-center gap-2">
                                <LocationIcon className="w-5 h-5"/>
                                <span>{artisan.location[lang]}</span>
                            </div>
                            <span>&bull;</span>
                            <span>{artisan.experience} {t('artisan.yearsExperience')}</span>
                        </div>
                        {artisan.isCertified && (
                            <div className="mt-3 flex items-center gap-1.5 text-green-300 font-bold text-sm bg-green-500/20 px-3 py-1 rounded-full w-fit">
                                <CertifiedBadgeIcon className="w-5 h-5"/> {t('common.certified')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold font-heading mb-4">{t('artisan.about')} {artisan.name}</h2>
                        <p className="text-lg text-gray-700 leading-relaxed">{artisan.bio[lang]}</p>

                         <div className="mt-12">
                            <h2 className="text-2xl font-bold font-heading mb-6">{t('artisan.portfolio')}</h2>
                             {activeProjects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {activeProjects.map(project => <ProjectCard key={project.id} project={project} />)}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white rounded-lg border">
                                    <p className="text-gray-500">{t('artisan.noProjects')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md border sticky top-28">
                            <h3 className="text-xl font-bold font-heading mb-4">{t('artisan.specialties')}</h3>
                            <ul className="flex flex-wrap gap-2">
                                {artisan.specialties.map(spec => (
                                    <li key={spec.en} className="bg-elw-beige px-3 py-1 rounded-full text-sm font-semibold text-elw-brown">{spec[lang]}</li>
                                ))}
                            </ul>

                             <h3 className="text-xl font-bold font-heading mt-8 mb-4">{t('artisan.contactInfo')}</h3>
                             <a 
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full block text-center bg-green-500 text-white font-heading px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                              >
                                {t('artisan.contact')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtisanDetailPage;