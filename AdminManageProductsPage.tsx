
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../i18n';
import * as api from '../api';
import { Product, Offer, Project } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { DeleteIcon, EditIcon, SearchIcon } from '../components/IconComponents';
import { Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';

const AdminManageProductsPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'products' | 'offers'>('products');
    
    return (
        <div>
            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`${activeTab === 'products' ? 'border-elw-blue text-elw-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
                        >
                            {t('adminManage.products')}
                        </button>
                        <button
                            onClick={() => setActiveTab('offers')}
                            className={`${activeTab === 'offers' ? 'border-elw-blue text-elw-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
                        >
                             {t('adminManage.offers')}
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'products' && <ProductsPanel />}
            {activeTab === 'offers' && <OffersPanel />}
        </div>
    );
};


const ProductsPanel: React.FC = () => {
    const { t, lang } = useTranslation();
    const { user, accessToken } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formState, setFormState] = useState({ nameEn: '', nameAr: '', categoryKey: 'aluminum' as 'aluminum' | 'kitchen', imageUrls: [] as string[], priceEn: '', priceAr: '', originEn: '', originAr: '', descriptionEn: '', descriptionAr: '' });
    
    const canManage = user?.permissions?.canManageProducts;

    const fetchProducts = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const data = await api.getProductsForAdmin(accessToken);
            data.sort((a, b) => (a.status === 'pending' && b.status !== 'pending') ? -1 : (a.status !== 'pending' && b.status === 'pending') ? 1 : 0);
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products for admin:", error);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleUpdateStatus = async (productId: string, status: 'approved' | 'rejected') => {
        if (!canManage || !accessToken) return;
        setUpdatingId(productId);
        try {
            await api.updateProductStatus(productId, status, accessToken);
            await fetchProducts();
        } catch (error) {
            console.error(`Failed to update product status:`, error);
        } finally {
            setUpdatingId(null);
        }
    };
    
    const handleDelete = async (productId: string) => {
        if (!canManage || !accessToken || !window.confirm("Are you sure you want to PERMANENTLY DELETE this product? This cannot be undone.")) return;
        setUpdatingId(productId);
        try {
            await api.deleteProduct(productId, accessToken);
            await fetchProducts();
        } catch (error) {
            console.error("Failed to delete product:", error);
        } finally {
            setUpdatingId(null);
        }
    };
    
    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManage || !accessToken) return;
        setSubmitting(true);
        try {
            const productData: Omit<Product, 'id' | 'status'> = {
                name: { en: formState.nameEn, ar: formState.nameAr },
                categoryKey: formState.categoryKey,
                category: { en: t(`categories.${formState.categoryKey}`), ar: t(`categories.${formState.categoryKey}`) },
                imageUrls: formState.imageUrls,
                price: { en: formState.priceEn, ar: formState.priceAr },
                origin: { en: formState.originEn, ar: formState.originAr },
                description: { en: formState.descriptionEn, ar: formState.descriptionAr },
            };
            await api.createProduct(productData, accessToken);
            await fetchProducts();
            setFormState({ nameEn: '', nameAr: '', categoryKey: 'aluminum', imageUrls: [], priceEn: '', priceAr: '', originEn: '', originAr: '', descriptionEn: '', descriptionAr: '' });
        } catch (error) {
            console.error("Failed to create product:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: Product['status']) => {
        const baseClasses = "px-3 py-1 text-xs font-bold rounded-full capitalize whitespace-nowrap";
        switch (status) {
            case 'approved': return `${baseClasses} bg-green-100 text-green-800`;
            case 'rejected': return `${baseClasses} bg-red-100 text-red-800`;
            case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold font-heading text-elw-charcoal mb-8">{t('adminManage.titleProducts')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    {loading ? <LoadingSpinner /> : (
                        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                             <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t('adminManage.productName')}</th>
                                        <th scope="col" className="px-6 py-3">{t('adminManage.status')}</th>
                                        {canManage && <th scope="col" className="px-6 py-3 text-center">{t('adminManage.actions')}</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id} className="bg-white border-b hover:bg-stone-50">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"><div className="flex items-center gap-3"><img src={product.imageUrls?.[0]} alt={product.name[lang]} className="w-16 h-12 rounded object-cover"/>{product.name[lang]}</div></th>
                                            <td className="px-6 py-4"><span className={getStatusBadge(product.status)}>{t(`adminManage.${product.status}`)}</span></td>
                                            {canManage && <td className="px-6 py-4 text-center"><div className="flex items-center justify-center gap-2">
                                                <Link to={`/admin/edit-product/${product.id}`} className="font-medium text-blue-600 hover:underline disabled:opacity-50 flex items-center gap-1.5"><EditIcon className="w-4 h-4"/> {t('common.edit')}</Link>
                                                {product.status === 'pending' && (<>
                                                    <button onClick={() => handleUpdateStatus(product.id, 'approved')} disabled={updatingId === product.id} className="font-medium text-green-600 hover:underline disabled:opacity-50">{t('adminManage.approve')}</button>
                                                    <button onClick={() => handleUpdateStatus(product.id, 'rejected')} disabled={updatingId === product.id} className="font-medium text-orange-500 hover:underline disabled:opacity-50">{t('adminManage.reject')}</button>
                                                </>)}
                                                {product.status === 'approved' && <button onClick={() => handleUpdateStatus(product.id, 'rejected')} disabled={updatingId === product.id} className="font-medium text-orange-500 hover:underline disabled:opacity-50">{t('adminManage.deactivate')}</button>}
                                                {product.status === 'rejected' && <button onClick={() => handleUpdateStatus(product.id, 'approved')} disabled={updatingId === product.id} className="font-medium text-green-600 hover:underline disabled:opacity-50">{t('adminManage.activate')}</button>}
                                                <button onClick={() => handleDelete(product.id)} disabled={updatingId === product.id} className="font-medium text-red-600 hover:underline disabled:opacity-50">{t('adminManage.delete')}</button>
                                            </div></td>}
                                        </tr>
                                    ))}
                                    {products.length === 0 && <tr><td colSpan={canManage ? 3 : 2} className="p-8 text-center text-gray-500">{t('adminManage.noPendingProducts')}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {canManage && (
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold font-heading text-elw-charcoal mb-4">{t('adminManage.createProduct')}</h2>
                        <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div><label className="block text-sm font-medium">{t('adminManage.productNameEn')}</label><input type="text" value={formState.nameEn} onChange={(e) => setFormState(p => ({ ...p, nameEn: e.target.value }))} required className="input-field" /></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.productNameAr')}</label><input type="text" value={formState.nameAr} onChange={(e) => setFormState(p => ({ ...p, nameAr: e.target.value }))} required className="input-field" /></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.category')}</label><select value={formState.categoryKey} onChange={(e) => setFormState(p => ({ ...p, categoryKey: e.target.value as any }))} className="input-field"><option value="aluminum">{t('categories.aluminum')}</option><option value="kitchen">{t('categories.kitchen')}</option></select></div>
                            
                            <ImageUploader imageUrls={formState.imageUrls} onImageUrlsChange={(urls) => setFormState(p => ({ ...p, imageUrls: urls }))} />

                            <div><label className="block text-sm font-medium">{t('adminManage.priceEn')}</label><input type="text" value={formState.priceEn} onChange={(e) => setFormState(p => ({ ...p, priceEn: e.target.value }))} required className="input-field" /></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.priceAr')}</label><input type="text" value={formState.priceAr} onChange={(e) => setFormState(p => ({ ...p, priceAr: e.target.value }))} required className="input-field" /></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.originEn')}</label><input type="text" value={formState.originEn} onChange={(e) => setFormState(p => ({ ...p, originEn: e.target.value }))} required className="input-field" /></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.originAr')}</label><input type="text" value={formState.originAr} onChange={(e) => setFormState(p => ({ ...p, originAr: e.target.value }))} required className="input-field" /></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.descriptionEn')}</label><textarea value={formState.descriptionEn} onChange={(e) => setFormState(p => ({ ...p, descriptionEn: e.target.value }))} required className="input-field" rows={2}/></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.descriptionAr')}</label><textarea value={formState.descriptionAr} onChange={(e) => setFormState(p => ({ ...p, descriptionAr: e.target.value }))} required className="input-field" rows={2}/></div>
                            
                            <button type="submit" disabled={submitting} className="w-full py-2 px-4 rounded-md text-white bg-elw-blue hover:bg-opacity-90 font-semibold disabled:opacity-50">{submitting ? t('adminManage.creating') : t('adminManage.create')}</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};


const OffersPanel: React.FC = () => {
    const { t, lang } = useTranslation();
    const { user, accessToken } = useAuth();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formState, setFormState] = useState({ titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '', discountPercentage: '10', startDate: '', endDate: '', productIds: [] as string[] });
    
    const [itemSearchTerm, setItemSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const canManage = user?.permissions?.canManageProducts;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [offersData, productsData] = await Promise.all([
                api.getOffers(), 
                api.getProducts()
            ]);
            setOffers(offersData);
            setProducts(productsData.filter(p => p.status === 'approved'));
        } catch (error) {
            console.error("Failed to fetch offers and products:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleDelete = async (offerId: string) => {
        if (!canManage || !accessToken || !window.confirm("Are you sure you want to delete this offer?")) return;
        setSubmitting(true);
        try {
            await api.deleteOffer(offerId, accessToken);
            await fetchData();
        } catch (error) {
            console.error("Failed to delete offer:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManage || !accessToken) return;
        setSubmitting(true);
        try {
            const offerData: Omit<Offer, 'id' | 'status'> = {
                title: { en: formState.titleEn, ar: formState.titleAr },
                description: { en: formState.descriptionEn, ar: formState.descriptionAr },
                discountPercentage: Number(formState.discountPercentage),
                startDate: new Date(formState.startDate).toISOString(),
                endDate: new Date(formState.endDate).toISOString(),
                productIds: formState.productIds,
            };
            await api.createOffer(offerData, accessToken);
            await fetchData();
            setFormState({ titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '', discountPercentage: '10', startDate: '', endDate: '', productIds: [] });
        } catch (error) {
            console.error("Failed to create offer:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedProducts = formState.productIds.map(id => products.find(item => item.id === id)).filter((i): i is Product => !!i);
    const availableProducts = products.filter(item => !formState.productIds.includes(item.id));
    const filteredAvailableProducts = availableProducts.filter(item => item.name[lang].toLowerCase().includes(itemSearchTerm.toLowerCase()));

    const handleItemSelect = (productId: string) => {
        setFormState(prev => ({...prev, productIds: [...prev.productIds, productId]}));
        setItemSearchTerm('');
    };

    const handleItemRemove = (productId: string) => {
        setFormState(prev => ({...prev, productIds: prev.productIds.filter(id => id !== productId)}));
    };

    return (
        <div>
            <h1 className="text-3xl font-bold font-heading text-elw-charcoal mb-8">{t('adminManage.manageOffers')}</h1>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    {loading ? <LoadingSpinner /> : (
                        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                           <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t('adminManage.offerTitle')}</th>
                                        <th scope="col" className="px-6 py-3">{t('adminManage.discount')}</th>
                                        <th scope="col" className="px-6 py-3">{t('adminManage.duration')}</th>
                                        {canManage && <th scope="col" className="px-6 py-3 text-center">{t('adminManage.actions')}</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {offers.map(offer => (
                                        <tr key={offer.id} className="bg-white border-b hover:bg-stone-50">
                                            <td className="px-6 py-4 font-semibold">{offer.title[lang]}</td>
                                            <td className="px-6 py-4">{offer.discountPercentage}%</td>
                                            <td className="px-6 py-4 text-xs">{new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}</td>
                                            {canManage && <td className="px-6 py-4 text-center"><button onClick={() => handleDelete(offer.id)} disabled={submitting} className="text-red-500 hover:text-red-700 disabled:opacity-50"><DeleteIcon className="w-5 h-5"/></button></td>}
                                        </tr>
                                    ))}
                                    {offers.length === 0 && <tr><td colSpan={canManage ? 4 : 3} className="p-8 text-center text-gray-500">{t('adminManage.noOffers')}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                 {canManage && (
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold font-heading text-elw-charcoal mb-4">{t('adminManage.createOffer')}</h2>
                        <form onSubmit={handleCreateOffer} className="space-y-4">
                            <div><label className="block text-sm font-medium">{t('adminManage.offerTitleEn')}</label><input type="text" value={formState.titleEn} onChange={e => setFormState(p => ({...p, titleEn: e.target.value}))} required className="input-field" /></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.offerTitleAr')}</label><input type="text" value={formState.titleAr} onChange={e => setFormState(p => ({...p, titleAr: e.target.value}))} required className="input-field" /></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.descriptionEn')}</label><textarea value={formState.descriptionEn} onChange={e => setFormState(p => ({...p, descriptionEn: e.target.value}))} required className="input-field" rows={2}/></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.descriptionAr')}</label><textarea value={formState.descriptionAr} onChange={e => setFormState(p => ({...p, descriptionAr: e.target.value}))} required className="input-field" rows={2}/></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.discountPercentage')}</label><input type="number" value={formState.discountPercentage} onChange={e => setFormState(p => ({...p, discountPercentage: e.target.value}))} required className="input-field" min="1" max="99" /></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.startDate')}</label><input type="date" value={formState.startDate} onChange={e => setFormState(p => ({...p, startDate: e.target.value}))} required className="input-field" /></div>
                            <div><label className="block text-sm font-medium">{t('adminManage.endDate')}</label><input type="date" value={formState.endDate} onChange={e => setFormState(p => ({...p, endDate: e.target.value}))} required className="input-field" /></div>
                            
                            {/* Searchable Multi-Select Component */}
                            <div ref={searchRef}>
                                <label className="block text-sm font-medium">{t('adminManage.appliedProducts')}</label>
                                <div className="relative">
                                    <div className="input-field flex flex-wrap gap-2 p-2 min-h-[42px]">
                                        {selectedProducts.map(item => (
                                            <span key={item.id} className="flex items-center gap-1.5 bg-elw-blue text-white text-xs font-bold px-2 py-1 rounded-full">
                                                {item.name[lang]}
                                                <button type="button" onClick={() => handleItemRemove(item.id)} className="text-white hover:text-red-300 font-bold">&times;</button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={itemSearchTerm}
                                        onChange={e => setItemSearchTerm(e.target.value)}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        placeholder={t('souqPage.filters.searchPlaceholder')}
                                        className="w-full mt-2 input-field"
                                    />
                                    {isDropdownOpen && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {filteredAvailableProducts.length > 0 ? filteredAvailableProducts.map(item => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => handleItemSelect(item.id)}
                                                    className="p-2 cursor-pointer hover:bg-stone-100 flex items-center gap-2"
                                                >
                                                    <img src={item.imageUrls?.[0]} className="w-10 h-10 object-cover rounded" alt=""/>
                                                    <span>{item.name[lang]}</span>
                                                </div>
                                            )) : (
                                                <div className="p-2 text-gray-500">{t('common.noResults')}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <button type="submit" disabled={submitting} className="w-full py-2 px-4 rounded-md text-white bg-elw-blue hover:bg-opacity-90 font-semibold disabled:opacity-50">{submitting ? t('adminManage.creating') : t('adminManage.create')}</button>
                        </form>
                    </div>
                 )}
             </div>
        </div>
    );
};


export default AdminManageProductsPage;