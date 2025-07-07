// src/api.ts
/**
 * This file contains the API layer for the application.
 * It makes fetch requests to a real backend server.
 */

import type { Product, Artisan, Project, Article, User, Offer, BilingualString, AdminPermissions } from './types';

const BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Handles the response from the fetch API.
 * @param response The response object from a fetch call.
 * @returns The JSON response.
 * @throws An error if the response is not ok.
 */
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An API error occurred');
    }
    // Handle 204 No Content response
    if (response.status === 204) {
        return null;
    }
    return response.json();
};

/**
 * A wrapper around fetch for making API calls.
 * @param endpoint The API endpoint to call.
 * @param options The fetch options.
 * @returns The JSON response.
 */
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });
    return handleResponse(response);
};

/**
 * A wrapper around fetch for making authenticated API calls.
 * @param endpoint The API endpoint to call.
 * @param token The JWT access token.
 * @param options The fetch options.
 * @returns The JSON response.
 */
const authApiFetch = async (endpoint: string, token: string, options: RequestInit = {}) => {
    return apiFetch(endpoint, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        },
    });
};


// --- CONTACT ---
export const sendContactMessage = (data: { name: string, email: string, subject: string, message: string }): Promise<{ success: boolean }> => {
    return apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// --- AUTH & USERS ---
export const loginUser = (email: string, password_sent: string, type: User['type']): Promise<{ user: User, accessToken: string, refreshToken: string }> => {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: password_sent, type }),
    });
};

export const refreshAuthToken = (refreshToken: string): Promise<{ user: User, accessToken: string }> => {
    return apiFetch('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
    });
};

export const registerUser = (name: string, email: string, password_sent: string, type: 'user' | 'artisan'): Promise<User> => {
     return apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password: password_sent, type }),
    });
};

export const getUsers = (token: string): Promise<User[]> => {
    return authApiFetch('/admin/users', token);
};

export const updateUserAvatar = (userId: string, newAvatarUrl: string, token: string): Promise<User> => {
    return authApiFetch(`/users/${userId}/avatar`, token, {
        method: 'PUT',
        body: JSON.stringify({ newAvatarUrl }),
    });
};

export const deleteUser = (userId: string, token: string): Promise<{ success: boolean }> => {
    return authApiFetch(`/admin/users/${userId}`, token, { method: 'DELETE' });
};

// --- ADMIN MANAGEMENT ---
export const getAdmins = (token: string): Promise<User[]> => {
    return authApiFetch('/admin/admins', token);
};

export const createAdmin = (adminData: Omit<User, 'id'>, token: string): Promise<User> => {
    return authApiFetch('/admin/admins', token, {
        method: 'POST',
        body: JSON.stringify(adminData),
    });
};

// --- PRODUCTS ---
export const getProducts = (): Promise<Product[]> => {
    return apiFetch('/products');
};

export const getProductsForAdmin = (token: string): Promise<Product[]> => {
    return authApiFetch('/admin/products', token);
};

export const getProductById = (id: string): Promise<Product | undefined> => {
    return apiFetch(`/products/${id}`);
};

export const getProductByIdForAdmin = (id: string, token: string): Promise<Product | undefined> => {
    return authApiFetch(`/admin/products/${id}`, token);
};

export const createProduct = (productData: Omit<Product, 'id' | 'status'>, token: string): Promise<Product> => {
    return authApiFetch('/admin/products', token, {
        method: 'POST',
        body: JSON.stringify(productData),
    });
};

export const updateProductStatus = (productId: string, status: 'approved' | 'rejected', token: string): Promise<{ success: boolean }> => {
    return authApiFetch(`/admin/products/${productId}/status`, token, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

export const updateProductByAdmin = (productId: string, productData: Partial<Omit<Product, 'id' | 'status'>>, token: string): Promise<Product> => {
    return authApiFetch(`/admin/products/${productId}`, token, {
        method: 'PUT',
        body: JSON.stringify(productData),
    });
};

export const deleteProduct = (productId: string, token: string): Promise<{ success: boolean }> => {
    return authApiFetch(`/admin/products/${productId}`, token, { method: 'DELETE' });
};

// --- ARTISANS ---
export const getArtisans = (): Promise<Artisan[]> => {
    return apiFetch('/artisans');
};

export const getArtisanById = (id: string): Promise<Artisan | undefined> => {
    return apiFetch(`/artisans/${id}`);
};

export const updateArtisanProfile = (userId: string, data: { name: string, phone: string, bio: BilingualString, location: BilingualString, specialties: BilingualString[] }, token: string): Promise<User> => {
    const artisanId = userId.replace('-user', '');
    return authApiFetch(`/artisans/${artisanId}/profile`, token, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// --- PROJECTS ---
export const getProjects = (): Promise<Project[]> => {
    return apiFetch('/projects');
};

export const getProjectsForAdmin = (token: string): Promise<Project[]> => {
    return authApiFetch('/admin/projects', token);
};

export const getProjectById = (id: string): Promise<Project | undefined> => {
    return apiFetch(`/projects/${id}`);
};

export const getProjectByIdForAdmin = (id: string, token: string): Promise<Project | undefined> => {
    return authApiFetch(`/admin/projects/${id}`, token);
};

export const getProjectsByArtisan = (artisanId: string, token: string): Promise<Project[]> => {
    return authApiFetch(`/artisans/${artisanId}/projects`, token);
};

export const getProjectForArtisan = (projectId: string, artisanId: string, token: string): Promise<Project | undefined> => {
    return authApiFetch(`/artisans/${artisanId}/projects/${projectId}`, token);
};

export const createProject = (projectData: Omit<Project, 'id' | 'status' | 'isActive'>, token: string): Promise<Project> => {
    return authApiFetch('/projects', token, {
        method: 'POST',
        body: JSON.stringify(projectData),
    });
};

export const createProjectByAdmin = (projectData: Omit<Project, 'id' | 'status'>, token: string): Promise<Project> => {
    return authApiFetch('/admin/projects', token, {
        method: 'POST',
        body: JSON.stringify(projectData),
    });
};

export const updateProject = (projectId: string, projectData: Partial<Omit<Project, 'id' | 'artisanId' | 'status'>>, token: string): Promise<Project> => {
    return authApiFetch(`/projects/${projectId}`, token, {
        method: 'PUT',
        body: JSON.stringify(projectData),
    });
};

export const updateProjectByAdmin = (projectId: string, projectData: Partial<Omit<Project, 'id' | 'artisanId' | 'status'>>, token: string): Promise<Project> => {
    return authApiFetch(`/admin/projects/${projectId}`, token, {
        method: 'PUT',
        body: JSON.stringify(projectData),
    });
};

export const updateProjectStatus = (projectId: string, status: 'approved' | 'rejected', token: string): Promise<{ success: boolean }> => {
    return authApiFetch(`/admin/projects/${projectId}/status`, token, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

export const updateProjectActivation = (projectId: string, isActive: boolean, token: string): Promise<Project> => {
    return authApiFetch(`/projects/${projectId}/activation`, token, {
        method: 'PUT',
        body: JSON.stringify({ isActive }),
    });
};

export const deleteProjectByAdmin = (projectId: string, token: string): Promise<{ success: boolean }> => {
    return authApiFetch(`/admin/projects/${projectId}`, token, { method: 'DELETE' });
};


// --- ARTICLES ---
// Public
export const getArticles = (): Promise<Article[]> => {
    return apiFetch('/articles');
};

export const getArticleById = (id: string): Promise<Article | undefined> => {
    return apiFetch(`/articles/${id}`);
};

// Admin
export const getAdminArticles = (token: string): Promise<Article[]> => {
    return authApiFetch('/admin/articles', token);
};

export const createArticle = (articleData: Omit<Article, 'id' | 'authorName' | 'createdAt' | 'updatedAt'>, token: string): Promise<Article> => {
    return authApiFetch('/admin/articles', token, {
        method: 'POST',
        body: JSON.stringify(articleData),
    });
};

export const updateArticle = (articleId: string, articleData: Partial<Omit<Article, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt'>>, token: string): Promise<Article> => {
    return authApiFetch(`/admin/articles/${articleId}`, token, {
        method: 'PUT',
        body: JSON.stringify(articleData),
    });
};

export const deleteArticle = (articleId: string, token: string): Promise<{ success: boolean }> => {
    return authApiFetch(`/admin/articles/${articleId}`, token, { method: 'DELETE' });
};


// --- OFFERS ---
export const getOffers = (): Promise<Offer[]> => {
    return apiFetch('/offers');
};

export const createOffer = (offerData: Omit<Offer, 'id' | 'status'>, token: string): Promise<Offer> => {
    return authApiFetch('/admin/offers', token, {
        method: 'POST',
        body: JSON.stringify(offerData),
    });
};

export const deleteOffer = (offerId: string, token: string): Promise<{ success: boolean }> => {
    return authApiFetch(`/admin/offers/${offerId}`, token, { method: 'DELETE' });
};