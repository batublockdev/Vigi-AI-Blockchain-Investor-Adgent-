'use client';

import React from 'react';
import { Database, Key, CheckCircle, ShieldCheck, Tag } from 'lucide-react';

interface KnowledgeItem {
  id: number;
  category: string;
  key: string;
  value: string;
  created_at: string;
}

interface KnowledgeBaseViewProps {
  knowledge: KnowledgeItem[];
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ knowledge }) => {
  const byCategory: Record<string, KnowledgeItem[]> = {};
  for (const item of knowledge) {
    if (!byCategory[item.category]) {
      byCategory[item.category] = [];
    }
    byCategory[item.category].push(item);
  }

  const categoryTitles: Record<string, string> = {
    market: 'Datos de Mercado & Balances On-Chain',
    token: 'Tokens Verificados en Celo',
    aave: 'Aave V3 Protocol Status',
    strategy: 'Estrategias de Inversión',
    rule: 'Reglas Críticas de Seguridad',
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
      <div className="border-b border-slate-800/80 px-6 py-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="h-4 w-4 text-emerald-400" />
          Base de Conocimiento Dinámica del Agente (`knowledge`)
        </h2>
        <p className="text-xs text-slate-400">
          Memoria persistente en PostgreSQL con información del mercado y estado de contratos en Celo
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(byCategory).length === 0 ? (
          <div className="col-span-2 py-8 text-center text-slate-400">
            No hay información en la base de conocimiento actualmente.
          </div>
        ) : (
          Object.entries(byCategory).map(([cat, items]) => (
            <div
              key={cat}
              className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-3.5 w-3.5 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {categoryTitles[cat] || cat.toUpperCase()}
                </h3>
              </div>

              <div className="space-y-2.5">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] mb-1">
                      <span className="font-semibold text-emerald-400/90">{it.key}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(parseInt(it.created_at, 10)).toLocaleTimeString('es-CO')}
                      </span>
                    </div>
                    <div className="text-slate-300 font-sans leading-relaxed">
                      {it.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
