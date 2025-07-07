
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import * as api from '../api';
import type { Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';

const AdminEditProductPage: React.FC = () => {
    const { t } = useTranslation();
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formState, setFormState] = useState({
        nameEn: '',
        nameAr: '',
        categoryKey: 'aluminum' as 'aluminum' | 'kitchen',
        imageUrls: [] as string[],
        priceEn: '',
        priceAr: '',
        originEn: '',
        originAr: '',
        descriptionEn: '',
        descriptionAr: '',
    });

    useEffect(() => {
        if (!productId || !accessToken) return;
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const data = await api.getProductByIdForAdmin(productId, accessToken);
                if (data) {
                    setProduct(data);
                    setFormState({
                        nameEn: data.name.en,
                        nameAr: data.name.ar,
                        categoryKey: data.categoryKey,
                        imageUrls: data.imageUrls || [],
                        priceEn: data.price.en,
                        priceAr: data.price.ar,
                        originEn: data.origin.en,
                        originAr: data.origin.ar,
                        descriptionEn: data.description.en,
                        descriptionAr: data.description.ar,
                    });
                } else {
                    setError("Product not found.");
                }
            } catch (err) {
                console.error("Failed to fetch product for admin", err);
                setError("An error occurred while fetching the product.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId, accessToken]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUrlsChange = (urls: string[]) => {
        setFormState(prev => ({ ...prev, imageUrls: urls }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId || !accessToken) return;

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const updatedData: Partial<Product> = {
                name: { en: formState.nameEn, ar: formState.nameAr },
                categoryKey: formState.categoryKey,
                category: { en: t(`categories.${formState.categoryKey}`), ar: t(`categories.${formState.categoryKey}`) },
                imageUrls: formState.imageUrls,
                price: { en: formState.priceEn, ar: formState.priceAr },
                origin: { en: formState.originEn, ar: formState.originAr },
                description: { en: formState.descriptionEn, ar: formState.descriptionAr },
            };
            await api.updateProductByAdmin(productId, updatedData, accessToken);
            setSuccess(t('adminManage.updateProductSuccess'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error("Failed to update product", err);
            setError("An error occurred while updating.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;
    if (error) return <div className="text-center text-red-500 font-bold py-10">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold font-heading text-elw-charcoal mb-2">{t('adminManage.editProduct')}</h1>
            <p className="text-gray-600 mb-8">{product?.name.en}</p>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium">{t('adminManage.productNameEn')}</label>
                        <input type="text" name="nameEn" value={formState.nameEn} onChange={handleInputChange} required className="input-field" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('adminManage.productNameAr')}</label>
                        <input type="text" name="nameAr" value={formState.nameAr} onChange={handleInputChange} required className="input-field" dir="rtl"/>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium">{t('adminManage.category')}</label>
                    <select name="categoryKey" value={formState.categoryKey} onChange={handleInputChange} required className="input-field">
                        <option value="aluminum">{t('categories.aluminum')}</option>
                        <option value="kitchen">{t('categories.kitchen')}</option>
                    </select>
                </div>
                
                <ImageUploader imageUrls={formState.imageUrls} onImageUrlsChange={handleImageUrlsChange} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium">{t('adminManage.priceEn')}</label>
                        <input type="text" name="priceEn" value={formState.priceEn} onChange={handleInputChange} required className="input-field" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('adminManage.priceAr')}</label>
                        <input type="text" name="priceAr" value={formState.priceAr} onChange={handleInputChange} required className="input-field" dir="rtl"/>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium">{t('adminManage.originEn')}</label>
                        <input type="text" name="originEn" value={formState.originEn} onChange={handleInputChange} required className="input-field" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('adminManage.originAr')}</label>
                        <input type="text" name="originAr" value={formState.originAr} onChange={handleInputChange} required className="input-field" dir="rtl"/>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium">{t('adminManage.descriptionEn')}</label>
                        <textarea name="descriptionEn" value={formState.descriptionEn} onChange={handleInputChange} className="input-field" rows={4} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('adminManage.descriptionAr')}</label>
                        <textarea name="descriptionAr" value={formState.descriptionAr} onChange={handleInputChange} className="input-field" dir="rtl" rows={4} />
                    </div>
                </div>
                
                {success && <p className="text-green-600 text-center font-semibold">{success}</p>}
                {error && <p className="text-red-600 text-center font-semibold">{error}</p>}
                
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/admin/products')} className="py-2 px-6 rounded-md bg-gray-200 hover:bg-gray-300 font-semibold">
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

export default AdminEditProductPage;
