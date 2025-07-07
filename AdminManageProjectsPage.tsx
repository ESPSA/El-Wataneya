
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../i18n';
import * as api from '../api';
import { Project, Artisan } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { EditIcon } from '../components/IconComponents';
import ImageUploader from '../components/ImageUploader';

const AdminManageProjectsPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const { user, accessToken } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [artisans, setArtisans] = useState<Artisan[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Form State
    const [formState, setFormState] = useState({
        titleEn: '',
        titleAr: '',
        locationEn: '',
        locationAr: '',
        styleKey: 'modern' as 'modern' | 'classic' | 'neo',
        assignedArtisanId: '',
        imageUrls: [] as string[]
    });

    const canManage = user?.permissions?.canManageProjects;

    const fetchData = useCallback(async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            const [projectsData, artisansData] = await Promise.all([
                api.getProjectsForAdmin(accessToken),
                api.getArtisans() // Public endpoint is fine for getting a list of artisans
            ]);
            
            projectsData.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return 0;
            });
            setProjects(projectsData);
            setArtisans(artisansData);
            if (artisansData.length > 0 && !formState.assignedArtisanId) {
                setFormState(p => ({...p, assignedArtisanId: artisansData[0].id}));
            }
        } catch (error) {
            console.error("Failed to fetch data for admin projects page:", error);
        } finally {
            setLoading(false);
        }
    }, [accessToken, formState.assignedArtisanId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateStatus = async (projectId: string, status: 'approved' | 'rejected') => {
        if (!canManage || !accessToken) return;
        setUpdatingId(projectId);
        try {
            await api.updateProjectStatus(projectId, status, accessToken);
            await fetchData(); 
        } catch (error) {
            console.error(`Failed to ${status} project:`, error);
        } finally {
            setUpdatingId(null);
        }
    };
    
    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManage || !formState.assignedArtisanId || !accessToken) return;
        setSubmitting(true);
        try {
            const projectData: Omit<Project, 'id' | 'status'> = {
                title: { en: formState.titleEn, ar: formState.titleAr },
                location: { en: formState.locationEn, ar: formState.locationAr },
                style: { en: t(`styles.${formState.styleKey}`), ar: t(`styles.${formState.styleKey}`) },
                styleKey: formState.styleKey,
                artisanId: formState.assignedArtisanId,
                productsUsed: [],
                imageUrls: formState.imageUrls.length > 0 ? formState.imageUrls : [`https://picsum.photos/seed/adminproj${Date.now()}/600/400`],
                isActive: true,
            };
            await api.createProjectByAdmin(projectData, accessToken);
            await fetchData();
            // Reset form
            setFormState(p => ({
                ...p,
                titleEn: '', titleAr: '', locationEn: '', locationAr: '', imageUrls: []
            }));
        } catch (error) {
            console.error("Failed to create project:", error);
        } finally {
            setSubmitting(false);
        }
    };
    
    const getStatusBadge = (status: Project['status']) => {
        const baseClasses = "px-3 py-1 text-xs font-bold rounded-full capitalize whitespace-nowrap";
        switch (status) {
            case 'approved': return `${baseClasses} bg-green-100 text-green-800`;
            case 'rejected': return `${baseClasses} bg-red-100 text-red-800`;
            case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
            default: return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };
    
    const stylesOptions = [
        { key: 'modern', label: t('styles.modern') },
        { key: 'classic', label: t('styles.classic') },
        { key: 'neo', label: t('styles.neo') },
    ];

    const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUrlsChange = (urls: string[]) => {
        setFormState(prev => ({ ...prev, imageUrls: urls }));
    };

    return (
        <div>
            <h1 className="text-4xl font-bold font-heading text-elw-charcoal mb-8">{t('adminManage.titleProjects')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    {loading ? <LoadingSpinner /> : (
                        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t('adminManage.projectTitle')}</th>
                                        <th scope="col" className="px-6 py-3">{t('adminManage.status')}</th>
                                        {canManage && <th scope="col" className="px-6 py-3 text-center">{t('adminManage.actions')}</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map(project => (
                                        <tr key={project.id} className="bg-white border-b hover:bg-stone-50">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"><div className="flex items-center gap-3"><img src={project.imageUrls?.[0]} alt={project.title[lang]} className="w-16 h-12 rounded object-cover"/>{project.title[lang]}</div></th>
                                            <td className="px-6 py-4"><span className={getStatusBadge(project.status)}>{t(`adminManage.${project.status === 'approved' ? 'active' : (project.status === 'rejected' ? 'inactive' : project.status)}`)}</span></td>
                                            {canManage && (
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link to={`/admin/edit-project/${project.id}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1"><EditIcon className="w-4 h-4"/>{t('common.edit')}</Link>
                                                        {project.status === 'pending' && (<>
                                                            <button onClick={() => handleUpdateStatus(project.id, 'approved')} disabled={updatingId === project.id} className="font-medium text-green-600 hover:underline disabled:opacity-50">{t('adminManage.approve')}</button>
                                                            <button onClick={() => handleUpdateStatus(project.id, 'rejected')} disabled={updatingId === project.id} className="font-medium text-orange-500 hover:underline disabled:opacity-50">{t('adminManage.reject')}</button>
                                                        </>)}
                                                        {project.status === 'approved' && <button onClick={() => handleUpdateStatus(project.id, 'rejected')} disabled={updatingId === project.id} className="font-medium text-orange-500 hover:underline disabled:opacity-50">{t('adminManage.deactivate')}</button>}
                                                        {project.status === 'rejected' && <button onClick={() => handleUpdateStatus(project.id, 'approved')} disabled={updatingId === project.id} className="font-medium text-green-600 hover:underline disabled:opacity-50">{t('adminManage.activate')}</button>}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {projects.length === 0 && <div className="p-8 text-center text-gray-500">{t('adminManage.noPendingProjects')}</div>}
                        </div>
                    )}
                </div>
                 {canManage && (
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold font-heading text-elw-charcoal mb-4">{t('adminManage.createProject')}</h2>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div><label className="block text-sm font-medium">{t('adminManage.projectTitleEn')}</label><input name="titleEn" type="text" value={formState.titleEn} onChange={handleFormInputChange} required className="input-field" /></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.projectTitleAr')}</label><input name="titleAr" type="text" value={formState.titleAr} onChange={handleFormInputChange} required className="input-field" /></div>
                            <div><label className="block text-sm font-medium">{t('uploadWorkPage.location')}</label><input name="locationEn" type="text" value={formState.locationEn} onChange={handleFormInputChange} required className="input-field" /></div>
                            <div><label className="block text-sm font-medium">{t('uploadWorkPage.style')}</label><select name="styleKey" value={formState.styleKey} onChange={handleFormInputChange} className="input-field">{stylesOptions.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}</select></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.assignToArtisan')}</label><select name="assignedArtisanId" value={formState.assignedArtisanId} onChange={handleFormInputChange} required className="input-field">{artisans.length > 0 ? artisans.map(a => <option key={a.id} value={a.id}>{a.name}</option>) : <option disabled>{t('common.loading')}</option>}</select></div>
                            <ImageUploader imageUrls={formState.imageUrls} onImageUrlsChange={handleImageUrlsChange} />
                            <button type="submit" disabled={submitting || artisans.length === 0} className="w-full py-2 px-4 rounded-md text-white bg-elw-blue hover:bg-opacity-90 font-semibold disabled:opacity-50">{submitting ? t('adminManage.creating') : t('adminManage.create')}</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminManageProjectsPage;
