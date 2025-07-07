
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../i18n';
import * as api from '../api';
import { User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { DeleteIcon } from '../components/IconComponents';

const AdminManageUsersPage: React.FC = () => {
    const { t } = useTranslation();
    const { user, accessToken } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const canManage = user?.permissions?.canManageUsers;

    const fetchUsers = useCallback(async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            const data = await api.getUsers(accessToken);
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (canManage) {
            fetchUsers();
        }
    }, [fetchUsers, canManage]);

    if (!canManage) {
        return <div className="text-red-500 font-bold">Access Denied.</div>
    }

    const handleDelete = async (userId: string) => {
        if (!window.confirm(t('adminManage.deleteConfirm')) || !accessToken) {
            return;
        }
        setDeletingId(userId);
        try {
            await api.deleteUser(userId, accessToken);
            await fetchUsers();
        } catch (error) {
            console.error("Failed to delete user:", error);
            alert("Could not delete user.");
        } finally {
            setDeletingId(null);
        }
    };
    
    const getRoleBadge = (role: User['type']) => {
        const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
        switch (role) {
            case 'user': return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'artisan': return `${baseClasses} bg-purple-100 text-purple-800`;
            default: return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    return (
        <div>
            <h1 className="text-4xl font-bold font-heading text-elw-charcoal mb-8">{t('adminManage.titleUsers')}</h1>

            {loading ? <LoadingSpinner /> : (
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('common.name')}</th>
                                <th scope="col" className="px-6 py-3">{t('common.email')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminManage.role')}</th>
                                <th scope="col" className="px-6 py-3 text-center">{t('adminManage.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? users.map(u => (
                                <tr key={u.id} className="bg-white border-b hover:bg-stone-50">
                                    <td className="px-6 py-4 font-semibold">{u.name}</td>
                                    <td className="px-6 py-4">{u.email}</td>
                                    <td className="px-6 py-4"><span className={getRoleBadge(u.type)}>{t(`profilePage.${u.type}`)}</span></td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleDelete(u.id)} 
                                            disabled={deletingId === u.id} 
                                            className="font-medium text-red-600 hover:underline disabled:opacity-50 flex items-center gap-1.5 mx-auto"
                                        >
                                            <DeleteIcon className="w-4 h-4"/>
                                            {deletingId === u.id ? t('adminManage.deleting') : t('adminManage.delete')}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">{t('adminManage.noUsers')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminManageUsersPage;
