
import React, { useState } from 'react';
import { useTranslation } from '../i18n';
import { UploadIcon } from '../components/IconComponents';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../types';
import ImageUploader from '../components/ImageUploader';

const UploadWorkPage: React.FC = () => {
    const { t } = useTranslation();
    const { user, accessToken } = useAuth();
    const navigate = useNavigate();

    // Form state
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [style, setStyle] = useState<'modern' | 'classic' | 'neo'>('modern');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const stylesOptions = [
        { key: 'modern', label: t('styles.modern') },
        { key: 'classic', label: t('styles.classic') },
        { key: 'neo', label: t('styles.neo') },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!user || !accessToken) {
            setError("You must be logged in to upload a project.");
            return;
        }
        if (imageUrls.length === 0) {
            setError(t('uploadWorkPage.error'));
            return;
        }

        setSubmitting(true);
        setSuccess('');

        const projectData: Omit<Project, 'id' | 'status' | 'isActive'> = {
            title: { en: title, ar: title }, // For simplicity, using same text for both languages
            location: { en: location, ar: location },
            style: { en: t(`styles.${style}`), ar: t(`styles.${style}`) },
            styleKey: style,
            productsUsed: [], // In a real app, you'd have a multi-select for products
            artisanId: user.id,
            imageUrls: imageUrls,
        };
        
        try {
            await api.createProject(projectData, accessToken);
            setSuccess(t('uploadWorkPage.success'));
            setTimeout(() => {
                navigate('/artisan/projects');
            }, 1500);
        } catch (err) {
            setError("Failed to upload project. Please try again.");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="bg-stone-100 min-h-screen py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-heading text-elw-charcoal">{t('uploadWorkPage.title')}</h1>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700">{t('uploadWorkPage.projectTitle')}</label>
                        <input type="text" id="projectTitle" required value={title} onChange={e => setTitle(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">{t('uploadWorkPage.location')}</label>
                        <input type="text" id="location" required value={location} onChange={e => setLocation(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label htmlFor="style" className="block text-sm font-medium text-gray-700">{t('uploadWorkPage.style')}</label>
                        <select id="style" required value={style} onChange={e => setStyle(e.target.value as any)} className="input-field">
                            {stylesOptions.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}
                        </select>
                    </div>
                    
                    <ImageUploader imageUrls={imageUrls} onImageUrlsChange={setImageUrls} />

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                     <div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-elw-blue hover:bg-opacity-90 font-semibold disabled:opacity-50"
                        >
                            <UploadIcon className="w-5 h-5" />
                            {submitting ? t('uploadWorkPage.uploading') : t('uploadWorkPage.upload')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadWorkPage;
