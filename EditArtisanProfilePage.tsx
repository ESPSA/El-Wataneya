import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { EditIcon } from '../components/IconComponents';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import type { Artisan } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const EditArtisanProfilePage: React.FC = () => {
    const { t } = useTranslation();
    const { user, updateArtisanProfile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [artisan, setArtisan] = useState<Artisan | null>(null);
    
    const [formState, setFormState] = useState({
        name: '',
        phone: '',
        bioEn: '',
        bioAr: '',
        locationEn: '',
        locationAr: '',
        specialtiesEn: '',
        specialtiesAr: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    useEffect(() => {
        if (!user || user.type !== 'artisan') {
            setLoading(false);
            setError("You are not authorized to view this page.");
            return;
        }
        
        const artisanId = user.id.replace('-user', '');

        const fetchArtisan = async () => {
            try {
                const artisanData = await api.getArtisanById(artisanId);
                if (artisanData) {
                    setArtisan(artisanData);
                    setFormState({
                        name: artisanData.name,
                        phone: artisanData.phone,
                        bioEn: artisanData.bio.en,
                        bioAr: artisanData.bio.ar,
                        locationEn: artisanData.location.en,
                        locationAr: artisanData.location.ar,
                        specialtiesEn: artisanData.specialties.map(s => s.en).join(', '),
                        specialtiesAr: artisanData.specialties.map(s => s.ar).join(', '),
                    });
                } else {
                    setError("Artisan profile not found.");
                }
            } catch (err) {
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };
        fetchArtisan();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        // Parse specialties from comma-separated strings
        const specialtiesEnList = formState.specialtiesEn.split(',').map(s => s.trim()).filter(Boolean);
        const specialtiesArList = formState.specialtiesAr.split(',').map(s => s.trim()).filter(Boolean);
        
        // Ensure both lists have the same length for zipping
        const maxLen = Math.max(specialtiesEnList.length, specialtiesArList.length);
        const specialties = Array.from({ length: maxLen }, (_, i) => ({
            en: specialtiesEnList[i] || specialtiesArList[i] || '',
            ar: specialtiesArList[i] || specialtiesEnList[i] || '',
        }));

        const profileData = {
            name: formState.name,
            phone: formState.phone,
            bio: { en: formState.bioEn, ar: formState.bioAr },
            location: { en: formState.locationEn, ar: formState.locationAr },
            specialties,
        };
        
        try {
            const success = await updateArtisanProfile(profileData);
            if (success) {
                setSuccess(t('editArtisanProfilePage.success'));
                setTimeout(() => {
                    navigate('/artisan/dashboard');
                }, 1500);
            } else {
                setError(t('editArtisanProfilePage.error'));
            }
        } catch (err) {
            setError(t('editArtisanProfilePage.error'));
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (error && !artisan) {
        return (
             <div className="text-center py-20">
                <p className="text-xl text-red-500">{error}</p>
                <Link to="/artisan/dashboard" className="mt-4 inline-block text-elw-blue hover:underline">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="bg-stone-100 min-h-screen py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-heading text-elw-charcoal">{t('editArtisanProfilePage.title')}</h1>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('common.name')}</label>
                        <input type="text" id="name" name="name" required value={formState.name} onChange={handleInputChange} className="input-field" />
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('editArtisanProfilePage.phone')}</label>
                        <input type="tel" id="phone" name="phone" required value={formState.phone} onChange={handleInputChange} className="input-field" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="bioEn" className="block text-sm font-medium text-gray-700">{t('editArtisanProfilePage.bioEn')}</label>
                            <textarea id="bioEn" name="bioEn" required value={formState.bioEn} onChange={handleInputChange} className="input-field" rows={4} />
                        </div>
                         <div>
                            <label htmlFor="bioAr" className="block text-sm font-medium text-gray-700">{t('editArtisanProfilePage.bioAr')}</label>
                            <textarea id="bioAr" name="bioAr" required value={formState.bioAr} onChange={handleInputChange} className="input-field" rows={4} dir="rtl"/>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="locationEn" className="block text-sm font-medium text-gray-700">{t('editArtisanProfilePage.locationEn')}</label>
                            <input type="text" id="locationEn" name="locationEn" required value={formState.locationEn} onChange={handleInputChange} className="input-field" />
                        </div>
                         <div>
                            <label htmlFor="locationAr" className="block text-sm font-medium text-gray-700">{t('editArtisanProfilePage.locationAr')}</label>
                            <input type="text" id="locationAr" name="locationAr" required value={formState.locationAr} onChange={handleInputChange} className="input-field" dir="rtl"/>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="specialtiesEn" className="block text-sm font-medium text-gray-700">{t('editArtisanProfilePage.specialtiesEn')}</label>
                            <input type="text" id="specialtiesEn" name="specialtiesEn" required value={formState.specialtiesEn} onChange={handleInputChange} className="input-field" />
                        </div>
                         <div>
                            <label htmlFor="specialtiesAr" className="block text-sm font-medium text-gray-700">{t('editArtisanProfilePage.specialtiesAr')}</label>
                            <input type="text" id="specialtiesAr" name="specialtiesAr" required value={formState.specialtiesAr} onChange={handleInputChange} className="input-field" dir="rtl"/>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                     <div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-elw-blue hover:bg-opacity-90 font-semibold disabled:opacity-50"
                        >
                            <EditIcon className="w-5 h-5" />
                            {submitting ? t('editArtisanProfilePage.updating') : t('editArtisanProfilePage.updateProfile')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditArtisanProfilePage;