'use client'
import Image from "next/image";
import { useEffect, useState } from 'react';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Improved InputQty component with validation and styling
export function InputQty({ maxQty, currentQty, onQuantityChange }) {
  const [quantity, setQuantity] = useState(currentQty || 0);

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      const numValue = parseInt(value) || 0;
      // Don't exceed max quantity
      const finalValue = Math.min(numValue, maxQty);
      setQuantity(finalValue);
      onQuantityChange && onQuantityChange(finalValue);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxQty) {
      const newQty = quantity + 1;
      setQuantity(newQty);
      onQuantityChange && onQuantityChange(newQty);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      onQuantityChange && onQuantityChange(newQty);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleDecrement}
        disabled={quantity <= 0}
        className="w-8 h-8 p-0 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
      >
        -
      </Button>
      <Input 
        type="text"
        value={quantity}
        onChange={handleInputChange}
        className="w-16 h-8 text-center font-semibold border-2 focus:ring-2 focus:ring-primary text-white dark:text-white bg-slate-800 dark:bg-slate-700 border-slate-600"
        placeholder="0"
        max={maxQty}
      />
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleIncrement}
        disabled={quantity >= maxQty}
        className="w-8 h-8 p-0 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        +
      </Button>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [selectedQuantities, setSelectedQuantities] = useState({})

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('stoq')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('Erro ao buscar produtos:', error)
      } else {
        setProducts(data || [])
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (productId, newQuantity) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.cartQty, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.cartQty), 0);
  };

  const processCart = async () => {
    if (cart.length === 0) return;

    try {
      // Process each item in the cart - subtract quantities from database
      for (const item of cart) {
        const { error } = await supabase
          .from('stoq')
          .update({ qty: item.qty - item.cartQty })
          .eq('id', item.id);

        if (error) {
          console.error('Erro ao processar item:', error);
          alert(`Erro ao processar ${item.name}`);
          return;
        }
      }

      // Clear cart and selected quantities after processing
      setCart([]);
      setSelectedQuantities({});
      
      // Refresh products to show updated quantities
      fetchProducts();
      
      alert(`Pedido processado! ${getTotalItems()} itens foram subtraídos do estoque.`);
    } catch (error) {
      console.error('Erro ao processar carrinho:', error);
      alert('Erro ao processar carrinho');
    }
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-950 to-black">
      <div className="max-w-6xl mx-auto p-6 pb-30">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-slate-800 dark:text-slate-200 tracking-tight">
            📦 Inventário de Produtos
          </h1>
          <div className="inline-flex items-center bg-white dark:bg-slate-800 rounded-full px-6 py-2 shadow-md">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Total de Produtos:</span>
            <span className="ml-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{products.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-md">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Nenhum produto encontrado. Clique em "Adicionar Produtos de Exemplo" para começar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div key={product.id} className="h-full">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 h-full flex flex-col">
                      {/* Product Header */}
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">📱</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 leading-tight">
                          {product.name}
                        </h3>
                      </div>

                      {/* Product Details */}
                      <div className="space-y-3 flex-grow">
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">💰 Preço:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">${product.price}</span>
                        </div>
                        
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">📅 Lote:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {new Date(product.lote).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">📦 Disponível:</span>
                          <span className={`font-bold text-lg ${
                            product.qty > 10 ? 'text-green-600 dark:text-green-400' : 
                            product.qty > 5 ? 'text-yellow-600 dark:text-yellow-400' : 
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {product.qty}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 text-center">
                          Selecionar Quantidade
                        </label>
                        <InputQty 
                          maxQty={product.qty} 
                          currentQty={selectedQuantities[product.id] || 0}
                          onQuantityChange={(qty) => {
                            handleQuantityChange(product.id, qty);
                            // Auto add/update cart when quantity changes
                            if (qty > 0) {
                              const existingItem = cart.find(item => item.id === product.id);
                              if (existingItem) {
                                setCart(cart.map(item => 
                                  item.id === product.id 
                                    ? { ...item, cartQty: qty }
                                    : item
                                ));
                              } else {
                                setCart([...cart, { ...product, cartQty: qty }]);
                              }
                            } else {
                              // Remove from cart if quantity is 0
                              setCart(cart.filter(item => item.id !== product.id));
                            }
                          }}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">
                          Máximo: {product.qty}
                        </p>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
      
      {/* Floating Cart Summary - Always visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 dark:bg-slate-950 border-t border-slate-700 shadow-2xl z-50">
        <div className="max-w-6xl mx-auto p-4 ">
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={processCart}
              disabled={cart.length === 0}
              className={`flex items-center space-x-2 p-3 rounded-lg transition-all duration-200 ${
                cart.length > 0 
                  ? 'hover:bg-slate-800 cursor-pointer transform hover:scale-105' 
                  : 'cursor-not-allowed opacity-50'
              }`}
              title={cart.length > 0 ? 'Clique para finalizar pedido' : 'Carrinho vazio'}
            >
              <span className="text-3xl">🛒</span>
              <span className={`font-semibold ${cart.length > 0 ? 'text-white' : 'text-gray-400'}`}>
                {cart.length > 0 ? `${getTotalItems()} ${getTotalItems() === 1 ? 'item' : 'itens'}` : '0 itens'}
              </span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <span className={`text-2xl font-bold ${cart.length > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                ${cart.length > 0 ? getTotalPrice().toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}