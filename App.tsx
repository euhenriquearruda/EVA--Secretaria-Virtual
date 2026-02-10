
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import LandingPage from './views/LandingPage';
import AuthPage from './views/AuthPage';
import Dashboard from './views/Dashboard';
import HowItWorks from './views/HowItWorks';
import { mockAuthService } from './services/mockAuthService';
import { User } from './types';

/**
 * Componente que simula o endpoint app.get("/auth/google/callback")
 * Processa os parâmetros de autenticação e redireciona para o applet solicitado.
 */
const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code) {
      // Simulação da lógica 'saveTokens(state, tokens)'
      // Armazenamos no localStorage para persistência no lado do cliente
      localStorage.setItem(`google_auth_token_${state}`, code);
      
      // Redirecionamento solicitado
      const redirectUrl = "https://ai.studio/apps/drive/12L9ssH4HOa1pUNORJuOsU2ILmL20jl4J?fullscreenApplet=true";
      
      // "Em uma nova aba" conforme solicitado pelo usuário
      window.open(redirectUrl, '_blank');
      
      // Redireciona a aba atual de volta para o Dashboard para não ficar travado
      window.location.hash = "/dashboard";
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0a0f1a] text-blue-400">
      <div className="w-12 h-12 eva-gradient rounded-xl flex items-center justify-center animate-spin mb-4">
        <i className="fas fa-sync-alt text-white"></i>
      </div>
      <p className="font-black uppercase tracking-[0.3em] text-[10px]">Processando Autenticação Google...</p>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = mockAuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0f1a] text-blue-400">
        <div className="w-12 h-12 eva-gradient rounded-xl flex items-center justify-center animate-pulse mb-4">
          <i className="fas fa-bolt text-white"></i>
        </div>
        <p className="font-black uppercase tracking-[0.3em] text-[10px]">Iniciando EVA...</p>
      </div>
    );
  }

  const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/como-funciona" element={<HowItWorks />} />
        <Route path="/auth" element={<AuthPage onAuthSuccess={(u) => setUser(u)} />} />
        
        {/* Rota de Callback solicitada pelo usuário */}
        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
        
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <Dashboard user={user!} onLogout={() => {
                mockAuthService.logout();
                setUser(null);
              }} />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
