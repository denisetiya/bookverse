import { useState, useEffect } from 'react';

interface CartItem {
  id: string;
  bookId: string;
  quantity: number;
  book: {
    id: string;
    title: string;
    author: string;
    price: string;
    coverImage: string;
  };
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      console.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        setItems(items.map((item) => (item.id === id ? { ...item, quantity } : item)));
      }
    } catch {
      console.error('Failed to update');
    }
  };

  const removeItem = async (id: string) => {
    try {
      const res = await fetch(`/api/cart/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter((item) => item.id !== id));
      }
    } catch {
      console.error('Failed to remove');
    }
  };

  const total = items.reduce((sum, item) => sum + Number(item.book.price) * item.quantity, 0);

  if (loading) {
    return <div className="text-center py-20 text-fg-secondary">Memuat...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <i className="ph ph-shopping-cart text-6xl text-fg-muted mb-4"></i>
        <p className="text-fg-secondary text-lg">Keranjang kosong</p>
        <a href="/books" className="inline-block mt-4 text-primary hover:text-primary-hover font-medium">
          Mulai Belanja
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 bg-surface-card rounded-lg border border-border p-4">
          <img
            src={item.book.coverImage}
            alt={item.book.title}
            className="w-20 h-28 object-cover rounded-md"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-fg">{item.book.title}</h3>
            <p className="text-sm text-fg-secondary">{item.book.author}</p>
            <p className="font-bold text-fg mt-2">
              Rp {Number(item.book.price).toLocaleString('id-ID')}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => removeItem(item.id)}
              className="text-danger hover:text-danger-hover"
            >
              <i className="ph ph-trash"></i>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-bg-muted"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-bg-muted"
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-surface-card rounded-lg border border-border p-6 mt-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-fg">Total</span>
          <span className="text-2xl font-bold text-fg">
            Rp {total.toLocaleString('id-ID')}
          </span>
        </div>
        <button className="w-full mt-4 bg-primary hover:bg-primary-hover text-fg font-semibold py-3 rounded-md transition-colors">
          Checkout
        </button>
      </div>
    </div>
  );
}
