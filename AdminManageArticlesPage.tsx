
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../i18n';
import * as api from '../api';
import { Article, User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { DeleteIcon, EditIcon } from '../components/IconComponents';
import ImageUploader from '../components/ImageUploader';

const AdminManageArticlesPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const { user, accessToken } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

    const canManage = user?.permissions?.canManageArticles;

    const fetchArticles = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const data = await api.getAdminArticles(accessToken);
            setArticles(data);
        } catch (error) {
            console.error("Failed to fetch articles for admin:", error);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (canManage) {
            fetchArticles();
        }
    }, [fetchArticles, canManage]);

    const handleEdit = (article: Article) => {
        setEditingArticle(article);
        setIsFormVisible(true);
    };

    const handleCreateNew = () => {
        setEditingArticle(null);
        setIsFormVisible(true);
    };

    const handleCloseForm = () => {
        setIsFormVisible(false);
        setEditingArticle(null);
    };

    const handleDelete = async (articleId: string) => {
        if (!accessToken || !window.confirm(t('articles.deleteConfirm'))) return;
        try {
            await api.deleteArticle(articleId, accessToken);
            await fetchArticles();
        } catch (error) {
            console.error("Failed to delete article", error);
            alert("Could not delete article.");
        }
    };

    if (!canManage) {
        return <div className="text-red-500 font-bold">Access Denied. You do not have permission to manage articles.</div>;
    }

    if (isFormVisible) {
        return <ArticleForm article={editingArticle} onSave={() => { handleCloseForm(); fetchArticles(); }} onCancel={handleCloseForm} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold font-heading text-elw-charcoal">{t('articles.manageTitle')}</h1>
                <button onClick={handleCreateNew} className="py-2 px-4 rounded-md text-white bg-elw-blue hover:bg-opacity-90 font-semibold">
                    {t('articles.createTitle')}
                </button>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('articles.title')}</th>
                                <th scope="col" className="px-6 py-3">{t('articles.author')}</th>
                                <th scope="col" className="px-6 py-3">{t('articles.status')}</th>
                                <th scope="col" className="px-6 py-3 text-center">{t('adminManage.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map(article => (
                                <tr key={article.id} className="bg-white border-b hover:bg-stone-50">
                                    <td className="px-6 py-4 font-semibold">{article.title[lang]}</td>
                                    <td className="px-6 py-4">{article.authorName}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs font-bold rounded-full capitalize ${article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{t(`articles.${article.status}`)}</span></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-4">
                                            <button onClick={() => handleEdit(article)} className="text-blue-600 hover:underline"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:underline"><DeleteIcon className="w-5 h-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {articles.length === 0 && (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">{t('articles.noArticles')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};


interface ArticleFormProps {
    article: Article | null;
    onSave: () => void;
    onCancel: () => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ article, onSave, onCancel }) => {
    const { t } = useTranslation();
    const { user, accessToken } = useAuth();
    const [formState, setFormState] = useState({
        titleEn: article?.title.en || '',
        titleAr: article?.title.ar || '',
        summaryEn: article?.summary.en || '',
        summaryAr: article?.summary.ar || '',
        contentEn: article?.content.en || '',
        contentAr: article?.content.ar || '',
        imageUrl: article?.imageUrl || '',
        status: article?.status || 'draft' as 'draft' | 'published',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(p => ({ ...p, [name]: value }));
    };
    
    const handleImageChange = (urls: string[]) => {
        if(urls.length > 0) {
            setFormState(p => ({ ...p, imageUrl: urls[0]}));
        } else {
            setFormState(p => ({ ...p, imageUrl: ''}));
        }
    };

    const handleSubmit = async (e: React.FormEvent, newStatus: 'draft' | 'published') => {
        e.preventDefault();
        if (!accessToken || !user) return;
        setSubmitting(true);
        setError('');

        const articleData = {
            title: { en: formState.titleEn, ar: formState.titleAr },
            summary: { en: formState.summaryEn, ar: formState.summaryAr },
            content: { en: formState.contentEn, ar: formState.contentAr },
            imageUrl: formState.imageUrl,
            status: newStatus,
            authorId: user.id, // Assign current admin as author
        };

        try {
            if (article) {
                await api.updateArticle(article.id, articleData, accessToken);
            } else {
                await api.createArticle(articleData, accessToken);
            }
            onSave();
        } catch (err) {
            console.error(err);
            setError("Failed to save article. Please check all fields.");
        } finally {
            setSubmitting(false);
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold font-heading text-elw-charcoal mb-8">{article ? t('articles.editTitle') : t('articles.createTitle')}</h1>
            <form className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium">{t('articles.titleEn')}</label><input type="text" name="titleEn" value={formState.titleEn} onChange={handleInputChange} required className="input-field" /></div>
                    <div><label className="block text-sm font-medium">{t('articles.titleAr')}</label><input type="text" name="titleAr" value={formState.titleAr} onChange={handleInputChange} required className="input-field" dir="rtl" /></div>
                </div>
                
                 <ImageUploader imageUrls={formState.imageUrl ? [formState.imageUrl] : []} onImageUrlsChange={handleImageChange} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium">{t('articles.summaryEn')}</label><textarea name="summaryEn" value={formState.summaryEn} onChange={handleInputChange} required className="input-field" rows={3}/></div>
                    <div><label className="block text-sm font-medium">{t('articles.summaryAr')}</label><textarea name="summaryAr" value={formState.summaryAr} onChange={handleInputChange} required className="input-field" dir="rtl" rows={3}/></div>
                </div>
                
                <div><label className="block text-sm font-medium">{t('articles.contentEn')}</label><textarea name="contentEn" value={formState.contentEn} onChange={handleInputChange} required className="input-field" rows={10}/></div>
                <div><label className="block text-sm font-medium">{t('articles.contentAr')}</label><textarea name="contentAr" value={formState.contentAr} onChange={handleInputChange} required className="input-field" dir="rtl" rows={10}/></div>
                
                {error && <p className="text-red-600 text-center font-semibold">{error}</p>}
                
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={onCancel} className="py-2 px-6 rounded-md bg-gray-200 hover:bg-gray-300 font-semibold">{t('common.cancel')}</button>
                    <button type="submit" onClick={(e) => handleSubmit(e, 'draft')} disabled={submitting} className="py-2 px-6 rounded-md bg-gray-600 text-white hover:bg-gray-700 font-semibold disabled:opacity-50">{t('articles.saveDraft')}</button>
                    <button type="submit" onClick={(e) => handleSubmit(e, 'published')} disabled={submitting} className="py-2 px-6 rounded-md text-white bg-elw-blue hover:bg-opacity-90 font-semibold disabled:opacity-50">{article?.status === 'published' ? t('articles.update') : t('articles.publish')}</button>
                </div>
            </form>
        </div>
    );
};


export default AdminManageArticlesPage;
