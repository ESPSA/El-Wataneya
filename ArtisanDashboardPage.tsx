


import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { UserIcon, DashboardIcon, UploadIcon } from '../components/IconComponents';

const ArtisanDashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    
    const dashboardItems = [
        { 
            title: t('dashboardPage.manageProfile'), 
            description: t('dashboardPage.manageProfileDesc'), 
            link: '/artisan/edit-profile', 
            icon: <UserIcon className="w-8 h-8 text-white"/> 
        },
        { 
            title: t('dashboardPage.manageProjects'), 
            description: t('dashboardPage.manageProjectsDesc'), 
            link: '/artisan/projects', 
            icon: <DashboardIcon className="w-8 h-8 text-white"/> 
        },
        { 
            title: t('dashboardPage.uploadWork'), 
            description: t('dashboardPage.uploadWorkDesc'), 
            link: '/artisan/upload', 
            icon: <UploadIcon className="w-8 h-8 text-white"/> 
        }
    ];

    return (
        <div className="bg-stone-100 min-h-full py-12 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                     <h1 className="text-4xl font-bold font-heading text-elw-charcoal">{t('dashboardPage.title')}</h1>
                     <p className="mt-2 text-lg text-gray-600">{t('profilePage.welcome')}, {user?.name}!</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {dashboardItems.map(item => (
                        <Link to={item.link} key={item.title} className="block bg-elw-blue text-white p-6 rounded-lg shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                           <div className="flex items-center justify-center bg-white/20 rounded-full w-16 h-16 mb-4">
                               {item.icon}
                           </div>
                           <h3 className="font-heading text-xl font-bold">{item.title}</h3>
                           <p className="mt-2 text-elw-beige/80">{item.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArtisanDashboardPage;