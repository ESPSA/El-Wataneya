import React from 'react';
import { Link } from 'react-router-dom';

interface PageLinkProps {
  to: string;
  title: string;
  description: string;
}

const PageLinkCard: React.FC<PageLinkProps> = ({ to, title, description }) => {
  return (
    <Link to={to} className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <h3 className="font-bold font-heading text-xl text-elw-blue">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </Link>
  );
};


const AllThePages: React.FC = () => {

    const publicPages = [
        { to: '/', title: 'Home Page', description: 'The main landing page of the application.' },
        { to: '/souq', title: 'Elwataneya Souq', description: 'Marketplace for building materials.' },
        { to: '/creators', title: 'Creators\' Hub', description: 'Directory of certified artisans.' },
        { to: '/inspiration', title: 'Inspiration Gallery', description: 'Showcase of completed projects.' },
        { to: '/articles', title: 'Articles', description: 'Blog-style articles and news.' },
        { to: '/contact', title: 'Contact Us', description: 'Page with contact form and information.' },
        { to: '/cart', title: 'Shopping Cart', description: 'View and manage items to purchase.' },
    ];

    const authPages = [
        { to: '/login', title: 'Login Page', description: 'Login for users, artisans, and admins.' },
        { to: '/register', title: 'Register Page', description: 'Registration for new users and artisans.' },
    ];
    
    const userPages = [
        { to: '/profile', title: 'User Profile', description: 'View and manage your user profile.' },
    ];

    const artisanPages = [
        { to: '/artisan/dashboard', title: 'Artisan Dashboard', description: 'The main hub for artisan actions.' },
        { to: '/artisan/projects', title: 'Manage Projects', description: 'View, edit, or delete your projects.' },
        { to: '/artisan/upload', title: 'Upload Work', description: 'Add a new project to your portfolio.' },
        { to: '/artisan/edit-profile', title: 'Edit Artisan Profile', description: 'Update your public-facing information.' },
        { to: '/artisan/edit/proj1', title: 'Edit Project (Sample)', description: 'Edit details of a specific project.' },
    ];

    const adminPages = [
        { to: '/admin/dashboard', title: 'Admin Dashboard', description: 'The main hub for administrators.' },
        { to: '/admin/products', title: 'Manage Products & Offers', description: 'Approve products and create offers.' },
        { to: '/admin/projects', title: 'Manage Projects', description: 'Approve or reject artisan projects.' },
        { to: '/admin/articles', title: 'Manage Articles', description: 'Create and publish articles.' },
        { to: '/admin/users', title: 'Manage Users', description: 'View and manage user and artisan accounts.' },
        { to: '/admin/admins', title: 'Manage Admins', description: 'Create and manage other administrators.' },
        { to: '/admin/edit-project/proj1', title: 'Edit Project (Admin Sample)', description: 'Edit project details as an admin.' },
    ];

    return (
        <div className="bg-stone-100 min-h-screen py-12">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-bold font-heading text-elw-charcoal mb-8 text-center">
                    Application Sitemap
                </h1>
                <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
                    This page provides quick access to all the main pages and features within the Elwataneya application. Use it for navigation, testing, and demonstration.
                </p>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold font-heading text-elw-charcoal mb-6 border-b-2 border-elw-blue pb-2">Public & Core Pages</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {publicPages.map(page => <PageLinkCard key={page.to} {...page} />)}
                        </div>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-bold font-heading text-elw-charcoal mb-6 border-b-2 border-elw-blue pb-2">Authentication Pages</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {authPages.map(page => <PageLinkCard key={page.to} {...page} />)}
                        </div>
                    </section>

                     <section>
                        <h2 className="text-2xl font-bold font-heading text-elw-charcoal mb-6 border-b-2 border-elw-blue pb-2">Logged-in User Pages</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userPages.map(page => <PageLinkCard key={page.to} {...page} />)}
                        </div>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-bold font-heading text-elw-charcoal mb-6 border-b-2 border-elw-blue pb-2">Artisan Section</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {artisanPages.map(page => <PageLinkCard key={page.to} {...page} />)}
                        </div>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-bold font-heading text-elw-charcoal mb-6 border-b-2 border-elw-blue pb-2">Admin Section</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {adminPages.map(page => <PageLinkCard key={page.to} {...page} />)}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AllThePages;