
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Section from '../components/Section';
import * as api from '../api';
import { Product, Artisan, Project, Offer, Article } from '../types';
import { CertifiedBadgeIcon, LocationIcon } from '../components/IconComponents';
import { useTranslation } from '../i18n';
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
    let displayPrice: React.ReactNode = <p className="font-semibold text-elw-blue mt-2">{originalPrice}</p>;

    if (offer) {
        const discountedPrice = calculateDiscountedPrice(originalPrice, offer.discountPercentage);
        if (discountedPrice) {
            displayPrice = (
                <div className="flex items-baseline gap-2 mt-2">
                    <p className="font-bold text-red-600">{discountedPrice}</p>
                    <p className="text-sm text-gray-500 line-through">{originalPrice}</p>
                </div>
            )
        }
    }

    return (
        <NavLink to={`/souq/${product.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 relative">
            {offer && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md z-10">{t('common.sale')}</div>
            )}
            <img src={product.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/400/300'} alt={product.name[lang]} className="w-full h-48 object-cover"/>
            <div className="p-4">
                <p className="text-sm text-elw-brown">{product.category[lang]}</p>
                <h3 className="font-bold font-heading text-lg mt-1">{product.name[lang]}</h3>
                <p className="text-xs text-gray-500 mt-1">{product.origin[lang]}</p>
                {displayPrice}
            </div>
        </NavLink>
    );
};

const ArtisanCard: React.FC<{ artisan: Artisan }> = ({ artisan }) => {
    const { t, lang } = useTranslation();
    return (
        <NavLink to={`/creators/${artisan.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden text-center p-6 transform hover:-translate-y-1 transition-transform duration-300">
            <img src={artisan.avatarUrl} alt={artisan.name} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-elw-beige"/>
            <h3 className="font-bold font-heading text-xl mt-4">{artisan.name}</h3>
            <div className="flex items-center justify-center gap-1 text-gray-600 mt-1">
                <LocationIcon className="w-4 h-4 text-elw-brown"/>
                {artisan.location[lang]}
            </div>
            {artisan.isCertified && (
                <div className="mt-2 flex items-center justify-center gap-1 text-green-600 font-semibold text-sm">
                    <CertifiedBadgeIcon className="w-5 h-5"/> {t('common.certified')}
                </div>
            )}
            <p className="text-sm text-gray-500 mt-3">{artisan.specialties.map(s => s[lang]).join(', ')}</p>
        </NavLink>
    );
}

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
}

const HomeArticleCard: React.FC<{ article: Article }> = ({ article }) => {
    const { t, lang } = useTranslation();
    return (
        <NavLink to={`/articles/${article.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden group">
            <div className="relative">
                <img src={article.imageUrl || 'https://picsum.photos/seed/article/600/400'} alt={article.title[lang]} className="w-full h-56 object-cover"/>
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h3 className="text-white font-bold font-heading text-lg leading-tight">{article.title[lang]}</h3>
                </div>
            </div>
        </NavLink>
    );
};

const HeroSection: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="relative bg-cover bg-center text-white" style={{ backgroundImage: `url('https://picsum.photos/seed/hero/1600/600')` }}>
            <div className="absolute inset-0 bg-elw-charcoal bg-opacity-60"></div>
            <div className="relative container mx-auto px-6 py-32 text-center">
                <h1 className="text-5xl font-bold font-heading">{t('homePage.hero.title')}</h1>
                <h2 className="text-3xl font-heading mt-2">{t('homePage.hero.subtitle')}</h2>
                <p className="text-lg mt-4 max-w-2xl mx-auto text-elw-beige">{t('homePage.hero.description')}</p>
                <div className="mt-8 flex justify-center gap-4">
                    <NavLink to="/souq" className="bg-elw-blue hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-colors font-heading">
                        {t('homePage.hero.exploreSouq')}
                    </NavLink>
                    <NavLink to="/creators" className="bg-white hover:bg-stone-200 text-elw-charcoal font-bold py-3 px-6 rounded-lg transition-colors font-heading">
                        {t('homePage.hero.findArtisan')}
                    </NavLink>
                </div>
            </div>
        </div>
    );
}


const HomePage: React.FC = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState<Product[]>([]);
    const [artisans, setArtisans] = useState<Artisan[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomePageData = async () => {
            try {
                setLoading(true);
                const [productsData, artisansData, projectsData, offersData, articlesData] = await Promise.all([
                    api.getProducts(),
                    api.getArtisans(),
                    api.getProjects(),
                    api.getOffers(),
                    api.getArticles(),
                ]);
                setProducts(productsData.filter(p => p.status === 'approved'));
                setArtisans(artisansData);
                setProjects(projectsData);
                setOffers(offersData);
                setArticles(articlesData.filter(a => a.status === 'published'));
            } catch (error) {
                console.error("Failed to fetch home page data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHomePageData();
    }, []);


    return (
        <div>
            <HeroSection />
            
            {loading ? <LoadingSpinner /> :
            <>
                <Section title={t('homePage.featuredProducts')} seeAllLink="/souq">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.slice(0, 4).map(product => {
                            const offer = getActiveOffer(product.id, offers);
                            return <ProductCard key={product.id} product={product} offer={offer} />;
                        })}
                    </div>
                </Section>

                <div className="bg-elw-beige">
                    <Section title={t('homePage.topCreators')} seeAllLink="/creators">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {artisans.slice(0, 4).map(artisan => <ArtisanCard key={artisan.id} artisan={artisan} />)}
                        </div>
                    </Section>
                </div>

                <Section title={t('homePage.getInspired')} seeAllLink="/inspiration">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.slice(0, 3).map(project => <ProjectCard key={project.id} project={project} />)}
                    </div>
                </Section>

                <div className="bg-elw-beige">
                    <Section title={t('homePage.fromTheBlog')} seeAllLink="/articles">
                        {articles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {articles.slice(0, 3).map(article => <HomeArticleCard key={article.id} article={article} />)}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white rounded-lg border">
                                <p className="text-gray-500">{t('articles.noArticles')}</p>
                            </div>
                        )}
                    </Section>
                </div>
            </>
            }
        </div>
    );
};

export default HomePage;
