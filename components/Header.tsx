import React from 'react';
import { MapPin, ShieldAlert } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-brand-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <MapPin className="w-6 h-6 text-brand-100" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Navegador de Impacto</h1>
            <p className="text-xs text-brand-100 opacity-80">Triagem Social - Araraquara</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-xs bg-brand-800 px-3 py-1 rounded-full border border-brand-700">
          <ShieldAlert className="w-3 h-3 text-yellow-400" />
          <span>Protocolo Master Ativo</span>
        </div>
      </div>
    </header>
  );
};