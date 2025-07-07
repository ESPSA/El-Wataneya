
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../i18n';
import * as api from '../api';
import { User, AdminPermissions } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { DeleteIcon } from '../components/IconComponents';

type PermissionKeys = keyof AdminPermissions;

const AdminManageAdminsPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const { user, accessToken } = useAuth();
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const initialPermissions = {
        canManageProducts: false,
        canManageProjects: false,
        canManageUsers: false,
        canManageAdmins: false,
        canManageArticles: false,
    };
    // Form state
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [permissions, setPermissions] = useState<AdminPermissions>(initialPermissions);
    
    const fetchAdmins = useCallback(async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            const data = await api.getAdmins(accessToken);
            setAdmins(data);
        } catch (error) {
            console.error("Failed to fetch admins:", error);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);
    
    if (!user?.isPrimary) {
        return <div className="text-red-500 font-bold">Access Denied. Only the Primary Admin can manage other admins.</div>
    }

    const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setPermissions(prev => ({ ...prev, [name]: checked }));
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) return;
        setSubmitting(true);
        try {
            const adminData = {
                name: newName,
                email: newEmail,
                password: newPassword,
                type: 'admin' as const,
                isPrimary: false,
                permissions: permissions
            };
            const newAdmin = await api.createAdmin(adminData, accessToken);
            if (newAdmin) {
                // Reset form and refetch
                setNewName('');
                setNewEmail('');
                setNewPassword('');
                setPermissions(initialPermissions);
                await fetchAdmins();
            } else {
                 alert("An admin with this email already exists.");
            }
        } catch (error) {
            console.error("Failed to create admin:", error);
            alert("Could not create admin.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (adminId: string) => {
        if (!accessToken || !window.confirm(t('adminManage.deleteAdminConfirm'))) return;
        setSubmitting(true);
        try {
            await api.deleteUser(adminId, accessToken);
            await fetchAdmins();
        } catch (error) {
            console.error("Failed to delete admin:", error);
            alert("Could not delete admin.");
        } finally {
            setSubmitting(false);
        }
    };
    
    const permissionKeys: PermissionKeys[] = ['canManageProducts', 'canManageProjects', 'canManageArticles', 'canManageUsers', 'canManageAdmins'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <h1 className="text-4xl font-bold font-heading text-elw-charcoal mb-8">{t('adminManage.titleAdmins')}</h1>
                {loading ? <LoadingSpinner /> : (
                    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('common.name')}</th>
                                    <th scope="col" className="px-6 py-3">{t('adminManage.permissions')}</th>
                                    <th scope="col" className="px-6 py-3">{t('adminManage.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.length > 0 ? admins.map(admin => (
                                    <tr key={admin.id} className="bg-white border-b hover:bg-stone-50">
                                        <td className="px-6 py-4 font-semibold">{admin.name} {admin.isPrimary && <span className="text-xs text-green-600">(Primary)</span>}</td>
                                        <td className="px-6 py-4">
                                            <ul className="flex flex-wrap gap-1">
                                                {permissionKeys.map(pKey => (admin.permissions?.[pKey] ? 
                                                    <li key={pKey} className="text-xs bg-elw-beige text-elw-brown font-semibold px-2 py-1 rounded">{t(`adminManage.permissionsList.${pKey}`)}</li> 
                                                    : null
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4">
                                            {!admin.isPrimary && (
                                                <button onClick={() => handleDelete(admin.id)} disabled={submitting} className="text-red-500 hover:text-red-700 disabled:opacity-50">
                                                    <DeleteIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="p-8 text-center text-gray-500">{t('adminManage.noAdmins')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold font-heading text-elw-charcoal mb-4">{t('adminManage.createAdmin')}</h2>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('common.name')}</label>
                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-elw-blue focus:ring-elw-blue" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('common.email')}</label>
                        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-elw-blue focus:ring-elw-blue" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('common.password')}</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-elw-blue focus:ring-elw-blue" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('adminManage.permissions')}</label>
                        <div className="space-y-2">
                             {permissionKeys.map(pKey => (
                                <label key={pKey} className="flex items-center gap-2">
                                    <input type="checkbox" name={pKey} checked={permissions[pKey]} onChange={handlePermissionChange} disabled={pKey === 'canManageAdmins'} className="rounded text-elw-blue focus:ring-elw-blue" />
                                    <span>{t(`adminManage.permissionsList.${pKey}`)}</span>
                                </label>
                             ))}
                        </div>
                    </div>
                    <button type="submit" disabled={submitting} className="w-full py-2 px-4 rounded-md text-white bg-elw-blue hover:bg-opacity-90 font-semibold disabled:opacity-50">
                        {submitting ? t('adminManage.creating') : t('adminManage.create')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminManageAdminsPage;