
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { LogoIcon, ArrowLeftIcon } from '../components/IconComponents';

const RegisterPage: React.FC = () => {
    const { t } = useTranslation();
    const { register } = useAuth();
    const navigate = useNavigate();
    const [registerType, setRegisterType] = useState<'user' | 'artisan'>('user');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        const success = await register(name, email, password, registerType);
        if (!success) {
            setError("An account with this email already exists.");
        }
        setLoading(false);
    };
    
    return (
        <div className="min-h-screen bg-stone-100 relative">
             <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-10">
                <div className="container mx-auto flex justify-between items-center">
                     <button 
                        onClick={() => navigate(-1)} 
                        aria-label={t('common.back')}
                        className="flex items-center gap-2 text-elw-charcoal hover:text-elw-blue transition-colors group"
                    >
                        <ArrowLeftIcon className="w-6 h-6 transform rtl:scale-x-[-1] transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                        <span className="font-semibold hidden sm:block">{t('common.back')}</span>
                    </button>
                     <Link to="/" aria-label="Go to Homepage">
                        <LogoIcon className="h-10 w-auto text-elw-blue" />
                    </Link>
                    <div className="w-24 hidden sm:flex items-center justify-start" style={{ visibility: 'hidden' }}>
                        <button className="flex items-center gap-2">
                           <ArrowLeftIcon className="w-6 h-6" />
                           <span className="font-semibold hidden sm:block">{t('common.back')}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                    <div>
                        <h2 className="text-center text-3xl font-extrabold text-elw-charcoal font-heading">
                            {t('registerPage.title')}
                        </h2>
                    </div>

                    <div className="flex border-b border-gray-200">
                        <button 
                            onClick={() => setRegisterType('user')}
                            className={`w-1/2 py-4 text-center font-medium font-heading ${registerType === 'user' ? 'border-b-2 border-elw-blue text-elw-blue' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t('registerPage.userRegister')}
                        </button>
                        <button 
                            onClick={() => setRegisterType('artisan')}
                            className={`w-1/2 py-4 text-center font-medium font-heading ${registerType === 'artisan' ? 'border-b-2 border-elw-blue text-elw-blue' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t('registerPage.artisanRegister')}
                        </button>
                    </div>
                    
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="full-name">{t('common.name')}</label>
                                <input
                                    id="full-name" name="name" type="text" required value={name} onChange={e => setName(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-elw-blue focus:border-elw-blue sm:text-sm"
                                    placeholder={t('common.name')}
                                />
                            </div>
                            <div>
                                <label htmlFor="email-address">{t('common.email')}</label>
                                <input
                                    id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-elw-blue focus:border-elw-blue sm:text-sm"
                                    placeholder={t('common.email')}
                                />
                            </div>
                            <div>
                                <label htmlFor="password">{t('common.password')}</label>
                                <input
                                    id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-elw-blue focus:border-elw-blue sm:text-sm"
                                    placeholder={t('common.password')}
                                />
                            </div>
                             <div>
                                <label htmlFor="confirm-password">{t('common.confirmPassword')}</label>
                                <input
                                    id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-elw-blue focus:border-elw-blue sm:text-sm"
                                    placeholder={t('common.confirmPassword')}
                                />
                            </div>
                        </div>
                        
                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-elw-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-elw-blue disabled:opacity-50"
                            >
                                {loading ? t('common.loading') : t('registerPage.register')}
                            </button>
                        </div>
                    </form>

                    <div className="text-sm text-center">
                        <p className="text-gray-600">
                            {t('registerPage.haveAccount')}{' '}
                            <Link to="/login" className="font-medium text-elw-blue hover:underline">
                                {t('registerPage.loginNow')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;