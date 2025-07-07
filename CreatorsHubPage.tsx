
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import * as api from '../api';
import { Artisan } from '../types';
import { Link } from 'react-router-dom';
import { CertifiedBadgeIcon, SearchIcon } from '../components/IconComponents';
import LoadingSpinner from '../components/LoadingSpinner';

const CreatorsHubPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const [allArtisans, setAllArtisans] = useState<Artisan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [certifiedOnly, setCertifiedOnly] = useState(false);

    useEffect(() => {
        const fetchArtisans = async () => {
            try {
                setLoading(true);
                const artisans = await api.getArtisans();
                setAllArtisans(artisans);
            } catch (error) {
                console.error("Failed to fetch artisans:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtisans();
    }, []);


    const filteredArtisans = allArtisans
        .filter(artisan => 
            artisan.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(artisan => 
            !certifiedOnly || artisan.isCertified
        );

    return (
        <div className="bg-stone-100 min-h-screen">
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold font-heading text-elw-charcoal text-center">{t('creatorsHubPage.title')}</h1>
                <p className="text-center mt-2 text-lg text-gray-600 max-w-3xl mx-auto">{t('creatorsHubPage.description')}</p>
                
                <div className="my-8 bg-white p-3 rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full sm:w-auto">
                        <input 
                            type="text"
                            placeholder={t('creatorsHubPage.filters.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-md border border-stone-300 focus:ring-2 focus:ring-elw-blue focus:outline-none"
                        />
                        <SearchIcon className="w-5 h-5 absolute top-1/2 -translate-y-1/2 left-3 text-stone-400" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-stone-100">
                        <input 
                            type="checkbox"
                            checked={certifiedOnly}
                            onChange={(e) => setCertifiedOnly(e.target.checked)}
                            className="h-5 w-5 rounded text-elw-blue focus:ring-elw-blue"
                        />
                        <span className="font-semibold">{t('creatorsHubPage.filters.certifiedOnly')}</span>
                    </label>
                </div>
                
                {loading ? <LoadingSpinner /> : (
                    <>
                        {filteredArtisans.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {filteredArtisans.map((artisan: Artisan) => (
                                    <div key={artisan.id} className="border rounded-lg p-6 bg-white shadow-lg text-center transition-transform hover:-translate-y-2 transform duration-300 flex flex-col items-center">
                                        <img src={artisan.avatarUrl} alt={artisan.name} className="w-28 h-28 rounded-full mx-auto mb-4 ring-4 ring-elw-blue p-1 object-cover" />
                                        <h3 className="font-bold text-xl font-heading">{artisan.name}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{artisan.location[lang]}</p>
                                         <div className="text-xs text-gray-500 mb-3">{artisan.specialties.map(s => s[lang]).join(' • ')}</div>
                                        {artisan.isCertified && <div className="flex items-center gap-1.5 text-green-700 font-semibold mt-1 text-sm bg-green-100 px-3 py-1 rounded-full"><CertifiedBadgeIcon className="w-4 h-4"/>{t('common.certified')}</div>}
                                        <Link to={`/creators/${artisan.id}`} className="font-semibold text-white bg-elw-blue hover:bg-opacity-90 mt-4 py-2 px-6 rounded-lg inline-block">{t('creatorsHubPage.viewPortfolio')}</Link>
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

export default CreatorsHubPage;