import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { Article } from '../types';
import { useTranslation } from '../i18n';
import LoadingSpinner from '../components/LoadingSpinner';

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
    const { t, lang } = useTranslation();
    
    const formattedDate = new Date(article.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Link to={`/articles/${article.id}`} className="group block bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
            <div className="overflow-hidden">
                <img src={article.imageUrl} alt={article.title[lang]} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-6">
                <h3 className="font-heading text-xl font-bold text-elw-charcoal group-hover:text-elw-blue transition-colors">{article.title[lang]}</h3>
                <p className="text-sm text-gray-500 mt-2">{t('articles.by')} <span className="font-semibold">{article.authorName}</span> &bull; {formattedDate}</p>
                <p className="text-gray-700 mt-3">{article.summary[lang]}</p>
                <div className="mt-4 font-bold text-elw-blue group-hover:underline">
                    {t('articles.readMore')} &rarr;
                </div>
            </div>
        </Link>
    );
};


const ArticlesPage: React.FC = () => {
    const { t } = useTranslation();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                setLoading(true);
                const data = await api.getArticles();
                setArticles(data);
            } catch (error) {
                console.error("Failed to fetch articles:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    return (
        <div className="bg-stone-100 min-h-screen">
            <div className="container mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold font-heading text-elw-charcoal">{t('articles.pageTitle')}</h1>
                    <p className="text-center mt-3 text-lg text-gray-600 max-w-3xl mx-auto">{t('articles.pageDescription')}</p>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map(article => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow">
                        <p className="text-xl text-gray-500">{t('articles.noArticles')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticlesPage;
