


import React, { useState } from 'react';
import { useTranslation } from '../i18n';
import * as api from '../api';

const ContactPage: React.FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await api.sendContactMessage(formData);
            setSuccess(t('contact.form.success'));
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setError(t('contact.form.error'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-stone-50">
            <div className="container mx-auto px-6 py-12">
                <div className="text-center">
                    <h1 className="text-4xl font-bold font-heading text-elw-charcoal">{t('contact.pageTitle')}</h1>
                    <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">{t('contact.pageDescription')}</p>
                </div>

                <div className="mt-12 grid md:grid-cols-2 gap-12 items-start">
                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('contact.form.name')}</label>
                                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-elw-blue focus:ring-elw-blue" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('contact.form.email')}</label>
                                    <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-elw-blue focus:ring-elw-blue" />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">{t('contact.form.subject')}</label>
                                    <input type="text" name="subject" id="subject" required value={formData.subject} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-elw-blue focus:ring-elw-blue" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">{t('contact.form.message')}</label>
                                    <textarea name="message" id="message" rows={4} required value={formData.message} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-elw-blue focus:ring-elw-blue"></textarea>
                                </div>
                                
                                {success && <p className="text-sm text-green-600">{success}</p>}
                                {error && <p className="text-sm text-red-600">{error}</p>}

                                <div>
                                    <button type="submit" disabled={submitting} className="w-full py-3 px-4 rounded-md shadow-sm text-white bg-elw-blue hover:bg-opacity-90 font-semibold disabled:opacity-50">
                                        {submitting ? t('common.loading') : t('contact.form.sendMessage')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold font-heading text-elw-charcoal">{t('footer.contactUs')}</h3>
                            <div className="mt-4 space-y-2 text-gray-700">
                                <p><strong className="font-semibold">{t('contact.address')}:</strong><br/>New Borg El Arab, Alexandria, Egypt</p>
                                <p><strong className="font-semibold">Email:</strong><br/>info@elwataneya.com</p>
                                <p><strong className="font-semibold">{t('contact.phone')}:</strong><br/>+20 123 456 7890</p>
                            </div>
                        </div>
                         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                             <img src={`https://picsum.photos/seed/map/600/400`} alt="Map location" className="w-full h-64 object-cover" />
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;