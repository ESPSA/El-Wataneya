import React from 'react';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../i18n';
import { Link } from 'react-router-dom';
import { DeleteIcon } from '../components/IconComponents';
import type { CartItem } from '../types';

const CartPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const { cart, removeFromCart, updateQuantity, subtotal, totalDiscount, total } = useCart();
    
    const whatsappNumber = '201234567890'; // Your business WhatsApp number

    const handleCheckout = () => {
        let message = t('cart.checkoutMessage');
        cart.forEach(item => {
            message += `- ${item.name[lang]} (x${item.quantity}) - ${(item.price * item.quantity).toLocaleString()} ${t('common.egp')}\n`;
        });
        message += `\n*${t('cart.grandTotal')}: ${total.toLocaleString()} ${t('common.egp')}*`;
        
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (cart.length === 0) {
        return (
            <div className="text-center py-20 container mx-auto">
                <h1 className="text-4xl font-bold font-heading text-elw-charcoal mb-4">{t('cart.title')}</h1>
                <p className="text-xl text-gray-500 mb-8">{t('cart.empty')}</p>
                <Link to="/souq" className="bg-elw-blue text-white font-bold py-3 px-6 rounded-lg transition-colors font-heading">
                    {t('cart.continueShopping')}
                </Link>
            </div>
        );
    }
    
    return (
        <div className="bg-stone-100 min-h-screen py-12">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-bold font-heading text-elw-charcoal mb-8">{t('cart.title')}</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Cart Items */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 space-y-4">
                       {cart.map((item: CartItem) => (
                           <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4 last:border-b-0">
                               <img src={item.imageUrl} alt={item.name[lang]} className="w-24 h-24 rounded-lg object-cover"/>
                               <div className="flex-grow text-center sm:text-left">
                                   <p className="text-xs uppercase text-elw-brown font-semibold">{item.category[lang]}</p>
                                   <p className="font-bold text-lg">{item.name[lang]}</p>
                                   <p className="text-elw-blue font-semibold">{item.price.toLocaleString()} {t('common.egp')}</p>
                                   {item.offerDiscountPercentage && (
                                       <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">{item.offerDiscountPercentage}% {t('common.sale')}</span>
                                   )}
                               </div>
                               <div className="flex items-center gap-4">
                                   <input 
                                     type="number"
                                     min="1"
                                     value={item.quantity}
                                     onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                     className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center"
                                     aria-label={t('cart.quantity')}
                                   />
                                   <p className="font-bold w-28 text-center">{(item.price * item.quantity).toLocaleString()} {t('common.egp')}</p>
                                   <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                                     <DeleteIcon className="w-6 h-6"/>
                                   </button>
                               </div>
                           </div>
                       ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 sticky top-28">
                        <h2 className="text-2xl font-bold font-heading mb-6 border-b pb-4">{t('cart.summary')}</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-lg">
                                <span>{t('cart.subtotal')}</span>
                                <span className="font-semibold">{subtotal.toLocaleString()} {t('common.egp')}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between text-lg text-green-600">
                                    <span>{t('cart.discount')}</span>
                                    <span className="font-semibold">- {totalDiscount.toLocaleString()} {t('common.egp')}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-2xl font-bold border-t pt-4 mt-4">
                                <span>{t('cart.grandTotal')}</span>
                                <span>{total.toLocaleString()} {t('common.egp')}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleCheckout} 
                            className="w-full mt-8 bg-green-500 text-white font-bold py-4 rounded-lg hover:bg-green-600 transition-colors text-xl">
                            {t('cart.checkout')}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CartPage;