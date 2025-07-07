
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { EditIcon } from '../components/IconComponents';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { Project } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageUploader from '../components/ImageUploader';

const EditProjectPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const { user, accessToken } = useAuth();
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();

    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<Project | null>(null);
    
    // Form state
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [style, setStyle] = useState<'modern' | 'classic' | 'neo'>('modern');
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    useEffect(() => {
        if (!projectId || !user || !accessToken) {
            setLoading(false);
            return;
        }
        const fetchProject = async () => {
            const artisanId = user.id.replace('-user', '');
            try {
                const projectData = await api.getProjectForArtisan(projectId, artisanId, accessToken);
                if (projectData) {
                    setProject(projectData);
                    setTitle(projectData.title[lang] || projectData.title['en']);
                    setLocation(projectData.location[lang] || projectData.location['en']);
                    setStyle(projectData.styleKey);
                    setImageUrls(projectData.imageUrls || []);
                } else {
                    setError("Project not found or you don't have permission to edit it.");
                }
            } catch (err) {
                setError("Failed to load project data.");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId, user, lang, accessToken]);

    const stylesOptions = [
        { key: 'modern', label: t('styles.modern') },
        { key: 'classic', label: t('styles.classic') },
        { key: 'neo', label: t('styles.neo') },
    ];
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!projectId || !user || !accessToken) {
            setError("Authentication error.");
            return;
        }
        if (imageUrls.length === 0) {
            setError(t('uploadWorkPage.error'));
            return;
        }

        setSubmitting(true);
        setSuccess('');

        const projectData = {
            title: { en: title, ar: title },
            location: { en: location, ar: location },
            style: { en: t(`styles.${style}`), ar: t(`styles.${style}`) },
            styleKey: style,
            imageUrls: imageUrls
        };
        
        try {
            await api.updateProject(projectId, projectData, accessToken);
            setSuccess(t('editProjectPage.success'));
            setTimeout(() => {
                navigate('/artisan/projects');
            }, 2000);
        } catch (err) {
            setError("Failed to update project. Please try again.");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };
    
    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!project) {
        return (
             <div className="text-center py-20">
                <p className="text-xl text-red-500">{error || "Could not load project."}</p>
                <Link to="/artisan/projects" className="mt-4 inline-block text-elw-blue hover:underline">Back to projects</Link>
            </div>
        );
    }

    return (
        <div className="bg-stone-100 min-h-screen py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-heading text-elw-charcoal">{t('editProjectPage.title')}</h1>
                    <p className="text-gray-600">{project.title[lang]}</p>
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
                            <EditIcon className="w-5 h-5" />
                            {submitting ? t('editProjectPage.updating') : t('editProjectPage.update')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProjectPage;