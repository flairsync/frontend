import { MarketplaceItem } from './types';

export const MOCK_ITEMS: MarketplaceItem[] = [
    // Guest Items
    { id: '1', name: 'Signature Latte', description: 'Our famous house blend with a hint of vanilla.', price: 4.5, currency: '$', type: 'guest', category: 'coffee', image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=800&auto=format&fit=crop' },
    { id: '2', name: 'Avocado Toast', description: 'Fresh avocado on sourdough with chili flakes.', price: 12.0, currency: '$', type: 'guest', category: 'restaurants', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop' },
    { id: '3', name: 'Artisanal Croissant', description: 'Flaky, buttery, and baked fresh daily.', price: 3.5, currency: '$', type: 'guest', category: 'coffee', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop' },

    // B2B Items
    { id: 'b1', name: 'Premium Espresso Beans', description: '10kg bag of ethically sourced Arabica beans.', price: 150.0, currency: '$', type: 'b2b', category: 'equipment', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop' },
    { id: 'b2', name: 'Compostable Cups', description: 'Case of 500 eco-friendly 12oz cups.', price: 85.0, currency: '$', type: 'b2b', category: 'equipment', image: 'https://images.unsplash.com/photo-1517611330261-d499633f1f11?q=80&w=800&auto=format&fit=crop' },
    { id: 'b3', name: 'Commercial Milk Frother', description: 'High-performance frother for heavy-duty use.', price: 299.0, currency: '$', type: 'b2b', category: 'equipment', image: 'https://images.unsplash.com/photo-1518057111178-44a106bad636?q=80&w=800&auto=format&fit=crop' },

    // SaaS / Admin Items
    { id: 's1', name: 'Smart NFC Tag', description: 'Programmable tag for easy check-ins and payments.', price: 15.0, currency: '$', type: 'saas', category: 'equipment', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=800&auto=format&fit=crop', customizable: true },
    { id: 's2', name: 'Premium Display Stand', description: 'Elegant wooden stand for your tablet/POS.', price: 45.0, currency: '$', type: 'saas', category: 'equipment', image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=800&auto=format&fit=crop', customizable: true },
    { id: 's3', name: 'Analytics Dashboard Pro', description: 'Unlock advanced AI insights for your business.', price: 29.99, currency: '$', type: 'saas', category: 'rewards', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop' },
];
