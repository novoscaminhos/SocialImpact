import React, { useState } from 'react';
import { Header } from './components/Header';
import { TriageForm } from './components/TriageForm';
import { ResultCard } from './components/ResultCard';
import { analyzeCase } from './services/geminiService';
import { TriageResult, AppState } from './types';
import { History, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentResult, setCurrentResult] = useState<TriageResult | null>(null);
  const [history, setHistory] = useState<TriageResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleTriage = async (report: string) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg('');
    setCurrentResult(null);

    try {
      const result = await analyzeCase(report);
      setCurrentResult(result);
      setHistory(prev => [result, ...prev]);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      setErrorMsg('Falha ao conectar com o assistente inteligente. Verifique sua conexão ou a chave API.');
    }
  };

  const clearHistory = () => {
    if(confirm('Limpar histórico de atendimentos?')) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Intro */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Assistente de Triagem Social</h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Informe as condições do cidadão para receber o encaminhamento correto conforme o protocolo municipal.
          </p>
        </div>

        {/* Input Form */}
        <section className="relative z-10">
          <TriageForm onSubmit={handleTriage} isLoading={appState === AppState.ANALYZING} />
        </section>

        {/* Error State */}
        {appState === AppState.ERROR && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-center text-sm">
            {errorMsg}
          </div>
        )}

        {/* Results Section */}
        {appState === AppState.SUCCESS && currentResult && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Resultado da Análise</h3>
              <button 
                onClick={() => {
                  setAppState(AppState.IDLE);
                  setCurrentResult(null);
                }}
                className="text-sm text-brand-600 hover:text-brand-800 font-medium"
              >
                Nova Consulta
              </button>
            </div>
            <ResultCard result={currentResult} />
          </section>
        )}

        {/* Recent History (Simple List) */}
        {history.length > 0 && appState !== AppState.SUCCESS && (
          <section className="pt-8 border-t border-slate-200">
             <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                Atendimentos Recentes
              </h3>
              <button onClick={clearHistory} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {history.slice(0, 4).map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 hover:border-brand-300 transition-colors shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-800 text-sm truncate pr-2">{item.destination}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide 
                      ${item.severity_level === 'high' ? 'bg-red-100 text-red-700' : 
                        item.severity_level === 'medium' ? 'bg-orange-100 text-orange-700' : 
                        'bg-green-100 text-green-700'}`}>
                      {item.severity_level === 'high' ? 'Urgente' : item.severity_level === 'medium' ? 'Médio' : 'Baixo'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{item.justification}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default App;