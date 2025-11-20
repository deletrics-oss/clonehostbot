import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STRIPE_PRODUCTS } from '../constants';

const Subscription: React.FC = () => {
  const navigate = useNavigate();

  const handleSubscribe = (product: any) => {
    // Simulação do processo de checkout
    // Num ambiente real, aqui você redirecionaria para o Stripe Checkout usando a chave pública
    
    const confirm = window.confirm(`Confirma a assinatura do plano "${product.name}"?\n\nValor: ${product.price}\nID Produto: ${product.id}`);
    
    if (confirm) {
      // Cria "banco" novo para o cliente (simulado no localStorage)
      const username = localStorage.getItem('username') || 'user';
      const userDbName = `db_${username}`;
      
      localStorage.setItem('hasSubscription', 'true');
      localStorage.setItem('plan', product.key);
      localStorage.setItem('userDb', userDbName);
      
      alert(`Pagamento processado!\n\nBanco de dados criado: ${userDbName}\nDispositivos liberados.`);
      
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark p-8 animate-fade-in">
      <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
        Escolha seu Plano
      </h1>
      <p className="text-gray-400 mb-12 text-center max-w-xl">
        Desbloqueie o poder da IA e gerenciamento de múltiplos dispositivos.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {STRIPE_PRODUCTS.map((product) => (
          <div 
            key={product.id} 
            className={`glass-panel p-8 flex flex-col relative transition-all duration-300 hover:-translate-y-2 ${
              product.key === 'fixed_bot' 
                ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-blue-900/20' 
                : 'hover:bg-white/5'
            }`}
          >
            {product.key === 'fixed_bot' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                Recomendado
              </div>
            )}
            
            <h3 className="text-2xl font-bold text-center mb-2 text-white">{product.name}</h3>
            <p className="text-3xl font-bold text-center mb-6 text-blue-300">{product.price}</p>
            <p className="text-xs text-center text-gray-500 mb-4">ID: {product.id}</p>
            
            <div className="border-t border-white/10 my-4"></div>
            
            <ul className="flex-1 space-y-4 mb-8">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✓</div>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleSubscribe(product)}
              className={`w-full py-3 rounded-lg font-bold transition-all ${
                product.key === 'fixed_bot' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg hover:shadow-blue-500/25' 
                  : 'bg-white/10 hover:bg-white/20 text-white hover:text-white'
              }`}
            >
              Assinar Agora
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;