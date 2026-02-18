import React, { useState } from 'react';
import { Send, Loader2, Mic } from 'lucide-react';

interface TriageFormProps {
  onSubmit: (report: string) => void;
  isLoading: boolean;
}

export const TriageForm: React.FC<TriageFormProps> = ({ onSubmit, isLoading }) => {
  const [report, setReport] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (report.trim()) {
      onSubmit(report);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
      <label htmlFor="report" className="block text-sm font-semibold text-slate-700 mb-2">
        Relato da Situação
      </label>
      <p className="text-xs text-slate-500 mb-4">
        Descreva o caso detalhadamente (sintomas, se tem documentos, se há animais, se é dependência química, etc).
      </p>
      
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          id="report"
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder="Ex: Homem de aprox. 40 anos na Praça Santa Cruz, reclama de dores no peito, sem documentos, acompanhado de um cachorro..."
          className="w-full h-32 p-4 text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none bg-slate-50 placeholder-slate-400 text-sm sm:text-base"
          disabled={isLoading}
        />
        
        <div className="mt-4 flex justify-between items-center">
          <button
            type="button"
            className="flex items-center space-x-2 text-slate-400 hover:text-brand-600 transition-colors text-sm"
            onClick={() => alert("Funcionalidade de voz em desenvolvimento")}
          >
            <Mic className="w-4 h-4" />
            <span>Gravar áudio</span>
          </button>

          <button
            type="submit"
            disabled={!report.trim() || isLoading}
            className={`
              flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all
              ${!report.trim() || isLoading 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-lg active:scale-95'}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analisando...</span>
              </>
            ) : (
              <>
                <span>Triagem</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};