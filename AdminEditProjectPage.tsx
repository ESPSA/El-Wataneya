
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import * as api from '../api';
import type { Project } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';

const AdminEditProjectPage: React.FC = () => {
    const { t } = useTranslation();
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formState, setFormState] = useState({
        titleEn: '',
        titleAr: '',
        imageUrls: [] as string[],
    });

    useEffect(() => {
        if (!projectId || !accessToken) return;
        const fetchProject = async () => {
            setLoading(true);
            try {
                const data = await api.getProjectByIdForAdmin(projectId, accessToken);
                if (data) {
                    setProject(data);
                    setFormState({
                        titleEn: data.title.en,
                        titleAr: data.title.ar,
                        imageUrls: data.imageUrls || [],
                    });
                } else {
                    setError("Project not found.");
                }
            } catch (err) {
                console.error("Failed to fetch project for admin", err);
                setError("An error occurred while fetching the project.");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId, accessToken]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleImageUrlsChange = (urls: string[]) => {
        setFormState(prev => ({ ...prev, imageUrls: urls }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !accessToken) return;

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const updatedData: Partial<Project> = {
                title: { en: formState.titleEn, ar: formState.titleAr },
                imageUrls: formState.imageUrls,
            };
            await api.updateProjectByAdmin(projectId, updatedData, accessToken);
            setSuccess(t('adminManage.updateSuccess'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error("Failed to update project", err);
            setError("An error occurred while updating.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;
    if (error) return <div className="text-center text-red-500 font-bold py-10">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold font-heading text-elw-charcoal mb-2">{t('adminManage.editProject')}</h1>
            <p className="text-gray-600 mb-8">{project?.title.en}</p>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="titleEn" className="block text-sm font-medium">{t('adminManage.projectTitleEn')}</label>
                        <input type="text" id="titleEn" name="titleEn" value={formState.titleEn} onChange={handleInputChange} required className="input-field" />
                    </div>
                     <div>
                        <label htmlFor="titleAr" className="block text-sm font-medium">{t('adminManage.projectTitleAr')}</label>
                        <input type="text" id="titleAr" name="titleAr" value={formState.titleAr} onChange={handleInputChange} required className="input-field" dir="rtl"/>
                    </div>
                </div>

                <ImageUploader imageUrls={formState.imageUrls} onImageUrlsChange={handleImageUrlsChange} />

                {success && <p className="text-green-600 text-center font-semibold">{success}</p>}
                
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/admin/projects')} className="py-2 px-6 rounded-md bg-gray-200 hover:bg-gray-300 font-semibold">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="py-2 px-6 rounded-md text-white bg-elw-blue hover:bg-opacity-90 font-semibold disabled:opacity-50">
                        {submitting ? t('adminManage.updating') : t('adminManage.update')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminEditProjectPage;
