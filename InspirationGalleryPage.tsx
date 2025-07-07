





import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import * as api from '../api';
import { Project, Artisan } from '../types';
import { Link } from 'react-router-dom';
import { SearchIcon } from '../components/IconComponents';
import LoadingSpinner from '../components/LoadingSpinner';

const InspirationGalleryPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [artisans, setArtisans] = useState<Artisan[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [styleFilter, setStyleFilter] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [projectsData, artisansData] = await Promise.all([
                    api.getProjects(),
                    api.getArtisans()
                ]);
                 // Public API for projects should already return only active and approved projects.
                setAllProjects(projectsData);
                setArtisans(artisansData);
            } catch (error) {
                console.error("Failed to fetch inspiration data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getArtisanName = (artisanId: string) => {
        return artisans.find(a => a.id === artisanId)?.name || t('common.unknownArtisan');
    };

    const styleKeys = ['All', ...Array.from(new Set(allProjects.map(p => p.styleKey)))];
    const styles = styleKeys.map(key => ({
        key: key,
        label: key === 'All' ? t('inspirationGalleryPage.filters.all') : t(`styles.${key}`)
    }));

    const filteredProjects = allProjects
        .filter(p => styleFilter === 'All' || p.styleKey === styleFilter)
        .filter(p => p.title[lang].toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="bg-stone-100 min-h-screen">
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold font-heading text-elw-charcoal text-center">{t('inspirationGalleryPage.title')}</h1>
                <p className="text-center mt-2 text-lg text-gray-600 max-w-3xl mx-auto">{t('inspirationGalleryPage.description')}</p>

                <div className="my-8 bg-white p-3 rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full sm:w-auto">
                        <input 
                            type="text"
                            placeholder={t('inspirationGalleryPage.filters.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-md border border-stone-300 focus:ring-2 focus:ring-elw-blue focus:outline-none"
                        />
                        <SearchIcon className="w-5 h-5 absolute top-1/2 -translate-y-1/2 left-3 text-stone-400" />
                    </div>
                     <div className="flex flex-wrap justify-center gap-2">
                         {styles.map(style => (
                             <button 
                                key={style.key}
                                onClick={() => setStyleFilter(style.key)} 
                                className={`px-5 py-2 rounded-md font-semibold font-heading transition-colors duration-200 ${styleFilter === style.key ? 'bg-elw-blue text-white' : 'text-elw-charcoal hover:bg-stone-100'}`}
                             >
                                {style.label}
                             </button>
                        ))}
                    </div>
                </div>

                {loading ? <LoadingSpinner /> : (
                    <>
                        {filteredProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredProjects.map((project: Project) => (
                                    <div key={project.id} className="border rounded-lg overflow-hidden bg-white shadow-lg transition-shadow hover:shadow-xl group flex flex-col">
                                        <div className="overflow-hidden relative">
                                            <img src={project.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/600/400'} alt={project.title[lang]} className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110" />
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <p className="text-sm text-elw-brown font-semibold">{project.style[lang]}</p>
                                            <h3 className="font-bold text-xl font-heading mt-1 flex-grow">{project.title[lang]}</h3>
                                            <p className="text-sm text-gray-600 mt-2">{t('inspirationGalleryPage.createdBy')} <Link to={`/creators/${project.artisanId}`} className="font-semibold hover:underline">{getArtisanName(project.artisanId)}</Link></p>
                                            <Link to={`/inspiration/${project.id}`} className="font-semibold text-elw-blue hover:underline mt-4 inline-block">{t('common.viewDetails')} &rarr;</Link>
                                        </div>
                                    </div>
                                ))}
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

export default InspirationGalleryPage;