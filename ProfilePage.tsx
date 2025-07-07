
import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { Navigate, Link } from 'react-router-dom';
import { UserIcon, DashboardIcon, EditIcon } from '../components/IconComponents';
import { uploadImage } from '../services/imageUpload';

const ProfilePage: React.FC = () => {
    const { user, updateUserAvatar } = useAuth();
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);


    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            setUploadError(null);
            try {
                const newAvatarUrl = await uploadImage(file);
                await updateUserAvatar(newAvatarUrl);
            } catch (error: any) {
                console.error("Avatar upload failed:", error);
                setUploadError(error.message || "Failed to upload avatar. Please try again.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="bg-stone-100 min-h-full py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto">
                         {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-32 h-32 rounded-full object-cover ring-4 ring-elw-blue/20"/>
                        ) : (
                            <UserIcon className="mx-auto h-32 w-32 rounded-full text-elw-blue bg-elw-beige p-6" />
                        )}
                        <button
                            onClick={handleAvatarClick}
                            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-stone-200 hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-elw-blue"
                            title={t('profilePage.changePhoto')}
                            aria-label={t('profilePage.changePhoto')}
                            disabled={isUploading}
                        >
                            {isUploading ?
                                <svg className="animate-spin h-5 w-5 text-elw-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                :
                                <EditIcon className="w-5 h-5 text-elw-charcoal"/>
                            }
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/jpeg"
                        />
                    </div>

                    {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}

                    <h1 className="mt-4 text-3xl font-bold font-heading text-elw-charcoal">{t('profilePage.title')}</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        {t('profilePage.welcome')}, <span className="font-semibold">{user.name}!</span>
                    </p>
                </div>
                
                <div className="mt-8 border-t border-gray-200 pt-8">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">{t('common.name')}</dt>
                            <dd className="mt-1 text-lg text-gray-900">{user.name}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">{t('common.email')}</dt>
                            <dd className="mt-1 text-lg text-gray-900">{user.email}</dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">{t('profilePage.accountType')}</dt>
                            <dd className="mt-1 text-lg text-gray-900 capitalize">{t(`profilePage.${user.type}`)}</dd>
                        </div>
                    </dl>
                </div>
                
                {user.type === 'artisan' && (
                    <div className="mt-8 border-t border-gray-200 pt-8 space-y-4">
                        <Link 
                            to="/artisan/edit-profile"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md shadow-sm text-white bg-elw-charcoal hover:bg-opacity-90 font-semibold"
                        >
                            <EditIcon className="w-5 h-5" />
                            {t('profilePage.editArtisanProfile')}
                        </Link>
                        <Link 
                            to="/artisan/dashboard"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md shadow-sm text-white bg-elw-blue hover:bg-opacity-90 font-semibold"
                        >
                            <DashboardIcon className="w-5 h-5" />
                            {t('profilePage.goToDashboard')}
                        </Link>
                    </div>
                )}
                 {user.type === 'admin' && (
                    <div className="mt-8 border-t border-gray-200 pt-8">
                        <Link 
                            to="/admin/dashboard"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md shadow-sm text-white bg-elw-blue hover:bg-opacity-90 font-semibold"
                        >
                            <DashboardIcon className="w-5 h-5" />
                            {t('profilePage.goToAdminDashboard')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;