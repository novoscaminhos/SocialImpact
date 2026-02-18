import React from 'react';
import { TriageResult } from '../types';
import { MapPin, Info, ClipboardList, AlertTriangle, CheckCircle2, Siren } from 'lucide-react';

interface ResultCardProps {
  result: TriageResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const getSeverityIcon = (level: string) => {
    switch (level) {
      case 'high': return <Siren className="w-5 h-5 text-red-600" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'low': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default: return <Info className="w-5 h-5 text-slate-600" />;
    }
  };

  const severityLabel = {
    high: "Urgência Alta",
    medium: "Atenção Moderada",
    low: "Baixa Complexidade"
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className={`px-6 py-4 border-b flex items-center justify-between ${getSeverityColor(result.severity_level)} bg-opacity-30`}>
        <div className="flex items-center space-x-3">
          {getSeverityIcon(result.severity_level)}
          <span className="font-bold text-sm uppercase tracking-wide">
            {severityLabel[result.severity_level] || "Resultado da Triagem"}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Destination */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Destino Recomendado</h3>
          <div className="text-2xl font-bold text-brand-900 leading-tight">
            {result.destination}
          </div>
        </div>

        {/* Justification */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-800 text-sm mb-1">Justificativa Técnica</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {result.justification}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <div>
            <h3 className="flex items-center text-sm font-semibold text-slate-800 mb-2">
              <MapPin className="w-4 h-4 text-slate-400 mr-2" />
              Endereço e Contato
            </h3>
            <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded border border-slate-100">
              {result.address_contact}
            </p>
          </div>

          {/* Procedures */}
          <div>
            <h3 className="flex items-center text-sm font-semibold text-slate-800 mb-2">
              <ClipboardList className="w-4 h-4 text-slate-400 mr-2" />
              O que levar/fazer
            </h3>
            <ul className="space-y-2">
              {result.procedures.map((proc, idx) => (
                <li key={idx} className="flex items-start text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  {proc}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-xs text-slate-400 text-center">
        Triagem realizada com base no Protocolo Master de Integração - Araraquara
      </div>
    </div>
  );
};