import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../api';
import { Article } from '../types';
import { useTranslation } from '../i18n';
import LoadingSpinner from '../components/LoadingSpinner';

const ArticleDetailPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const { articleId } = useParams<{ articleId: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!articleId) return;

        const fetchArticle = async () => {
            try {
                setLoading(true);
                const data = await api.getArticleById(articleId);
                setArticle(data || null);
            } catch (error) {
                console.error("Failed to fetch article:", error);
                setArticle(null);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [articleId]);

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!article) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">{t('articles.noArticles')}</h1>
                <Link to="/articles" className="mt-4 inline-block text-elw-blue hover:underline">
                    &larr; {t('header.articles')}
                </Link>
            </div>
        );
    }
    
    const formattedDate = new Date(article.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto max-w-4xl px-6 py-12">
                <article>
                    <header className="mb-8 text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-elw-charcoal leading-tight">
                            {article.title[lang]}
                        </h1>
                        <p className="mt-4 text-lg text-gray-500">
                            {t('articles.publishedOn')} {formattedDate} {t('articles.by')} <span className="font-semibold text-elw-brown">{article.authorName}</span>
                        </p>
                    </header>
                    
                    <img
                        src={article.imageUrl}
                        alt={article.title[lang]}
                        className="w-full h-auto max-h-[500px] object-cover rounded-xl shadow-2xl mb-12"
                    />

                    <div
                        className="prose prose-lg lg:prose-xl max-w-none text-elw-charcoal leading-relaxed space-y-6"
                        // Using dangerouslySetInnerHTML assuming the backend sanitizes the HTML content to prevent XSS.
                        dangerouslySetInnerHTML={{ __html: article.content[lang] }}
                    />
                </article>

                <div className="mt-16 text-center border-t pt-8">
                     <Link to="/articles" className="font-semibold text-elw-blue hover:underline">
                        &larr; {t('header.articles')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetailPage;
