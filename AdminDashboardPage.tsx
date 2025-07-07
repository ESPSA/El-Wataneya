


import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { DashboardIcon, EditIcon, UserIcon } from '../components/IconComponents';

const AdminDashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    if (!user || user.type !== 'admin') {
        return null;
    }
    
    const allDashboardItems = [
        { 
            id: 'products',
            title: t('adminDashboardPage.manageProducts'), 
            description: t('adminDashboardPage.manageProductsDesc'), 
            link: '/admin/products', 
            icon: <EditIcon className="w-8 h-8 text-white"/>,
            permission: user.permissions?.canManageProducts
        },
        { 
            id: 'projects',
            title: t('adminDashboardPage.manageProjects'), 
            description: t('adminDashboardPage.manageProjectsDesc'), 
            link: '/admin/projects', 
            icon: <DashboardIcon className="w-8 h-8 text-white"/>,
            permission: user.permissions?.canManageProjects
        },
        {
            id: 'articles',
            title: t('adminDashboardPage.manageArticles'),
            description: t('adminDashboardPage.manageArticlesDesc'),
            link: '/admin/articles',
            icon: <EditIcon className="w-8 h-8 text-white"/>,
            permission: user.permissions?.canManageArticles
        },
        { 
            id: 'users',
            title: t('adminDashboardPage.manageUsers'), 
            description: t('adminDashboardPage.manageUsersDesc'), 
            link: '/admin/users', 
            icon: <UserIcon className="w-8 h-8 text-white"/>,
            permission: user.permissions?.canManageUsers
        },
        { 
            id: 'admins',
            title: t('adminDashboardPage.manageAdmins'), 
            description: t('adminDashboardPage.manageAdminsDesc'), 
            link: '/admin/admins', 
            icon: <UserIcon className="w-8 h-8 text-white"/>,
            permission: user.isPrimary // Only primary admin can see this
        },
    ];

    const visibleItems = allDashboardItems.filter(item => item.permission);

    return (
        <div>
            <div className="text-center mb-12">
                 <h1 className="text-4xl font-bold font-heading text-elw-charcoal">{t('adminDashboardPage.title')}</h1>
                 <p className="mt-2 text-lg text-gray-600">{t('profilePage.welcome')}, {user?.name}!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {visibleItems.map(item => (
                    <Link to={item.link} key={item.id} className="block bg-elw-charcoal text-white p-6 rounded-lg shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                       <div className="flex items-center justify-center bg-white/20 rounded-full w-16 h-16 mb-4">
                           {item.icon}
                       </div>
                       <h3 className="font-heading text-xl font-bold">{item.title}</h3>
                       <p className="mt-2 text-stone-300/80">{item.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboardPage;