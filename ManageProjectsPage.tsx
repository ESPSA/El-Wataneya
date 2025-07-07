
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { Project } from '../types';
import { EditIcon, UploadIcon } from '../components/IconComponents';
import LoadingSpinner from '../components/LoadingSpinner';

const ManageProjectsPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const { user, accessToken } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        if (user && accessToken) {
            // In a real app, user.id for an artisan might be different from the artisanId.
            // Here we assume it's the same or derivable.
            const artisanId = user.id; 
            try {
                setLoading(true);
                const artisanProjects = await api.getProjectsByArtisan(artisanId, accessToken);
                artisanProjects.sort((a, b) => b.isActive === a.isActive ? 0 : b.isActive ? -1 : 1);
                setProjects(artisanProjects);
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            } finally {
                setLoading(false);
            }
        }
    }, [user, accessToken]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleToggleActivation = async (project: Project) => {
        if (!accessToken) return;
        setUpdatingId(project.id);
        try {
            await api.updateProjectActivation(project.id, !project.isActive, accessToken);
            await fetchProjects();
        } catch (error) {
            console.error("Failed to update project activation:", error);
            alert("Could not update project status. Please try again.");
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusPill = (project: Project) => {
        const baseClasses = "px-2 py-0.5 text-xs font-bold rounded-full";
        if (project.status === 'pending') {
            return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>{t('adminManage.pending')}</span>
        }
        if (project.status === 'rejected') {
            return <span className={`${baseClasses} bg-red-100 text-red-800`}>{t('adminManage.rejected')}</span>
        }
        if (project.isActive) {
            return <span className={`${baseClasses} bg-green-100 text-green-800`}>{t('manageProjectsPage.active')}</span>
        }
        return <span className={`${baseClasses} bg-gray-200 text-gray-700`}>{t('manageProjectsPage.inactive')}</span>
    };

    return (
        <div className="bg-stone-100 min-h-screen py-12 px-4">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold font-heading text-elw-charcoal">{t('manageProjectsPage.title')}</h1>
                    <Link 
                        to="/artisan/upload"
                        className="flex items-center gap-2 py-2 px-4 rounded-md text-white bg-elw-blue hover:bg-opacity-90 font-semibold"
                    >
                        <UploadIcon className="w-5 h-5"/>
                        {t('dashboardPage.uploadWork')}
                    </Link>
                </div>

                {loading ? <LoadingSpinner /> : (
                    <div className="bg-white rounded-xl shadow-lg">
                        <ul className="divide-y divide-gray-200">
                            {projects.length > 0 ? projects.map(project => (
                                <li key={project.id} className="p-4 flex flex-col sm:flex-row items-center justify-between hover:bg-stone-50">
                                    <div className="flex items-center gap-4 flex-grow mb-4 sm:mb-0">
                                        <img src={project.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/100/100'} alt={project.title[lang]} className="w-24 h-16 rounded-md object-cover"/>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold font-heading text-lg">{project.title[lang]}</h3>
                                                {getStatusPill(project)}
                                            </div>
                                            <p className="text-sm text-gray-500">{project.location[lang]}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Link to={`/artisan/edit/${project.id}`} className="flex items-center gap-1.5 p-2 rounded-md text-sm text-blue-600 bg-blue-100 hover:bg-blue-200">
                                            <EditIcon className="w-4 h-4"/> {t('manageProjectsPage.edit')}
                                        </Link>
                                         <button 
                                            onClick={() => handleToggleActivation(project)}
                                            className={`flex items-center gap-1.5 p-2 rounded-md text-sm disabled:opacity-50 ${project.isActive ? 'text-orange-600 bg-orange-100 hover:bg-orange-200' : 'text-green-600 bg-green-100 hover:bg-green-200'}`}
                                            disabled={updatingId === project.id || project.status !== 'approved'}
                                            title={project.status !== 'approved' ? 'Project must be approved to be activated' : ''}
                                        >
                                            {updatingId === project.id 
                                                ? t('manageProjectsPage.updating') 
                                                : (project.isActive ? t('manageProjectsPage.deactivate') : t('manageProjectsPage.activate'))
                                            }
                                        </button>
                                    </div>
                                </li>
                            )) : (
                                <li className="p-8 text-center text-gray-500">{t('artisan.noProjects')}</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageProjectsPage;