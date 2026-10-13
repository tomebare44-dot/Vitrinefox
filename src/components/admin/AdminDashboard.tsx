import React from 'react';
import {
  Package,
  Eye,
  EyeOff,
  AlertTriangle,
  Percent,
  FolderTree,
  Plus,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react';
import { DashboardStats, Product, Category } from '../../types.ts';

interface AdminDashboardProps {
  stats: DashboardStats;
  products: Product[];
  categories: Category[];
  onNavigateTab: (tab: 'products' | 'categories' | 'customization' | 'create_product') => void;
  onOpenEditModal: (product: Product) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  products,
  categories,
  onNavigateTab,
  onOpenEditModal,
}) => {
  const formatBRL = (val: number | null) => {
    if (val === null || val === undefined) return '—';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const statCards = [
    {
      label: 'Total de Produtos',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      label: 'Produtos Publicados',
      value: stats.publishedProducts,
      icon: Eye,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Produtos Ocultos',
      value: stats.hiddenProducts,
      icon: EyeOff,
      color: 'text-slate-600 bg-slate-100 border-slate-200',
    },
    {
      label: 'Sem Estoque (Esgotados)',
      value: stats.outOfStockProducts,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      label: 'Com Desconto Ativo',
      value: stats.discountedProducts,
      icon: Percent,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    {
      label: 'Categorias Cadastradas',
      value: stats.totalCategories,
      icon: FolderTree,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ];

  // Recently updated products
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 tracking-wider uppercase">
            Visão Geral em Tempo Real
          </span>
          <h2 className="text-xl font-extrabold text-white mt-0.5">
            Painel de Controle VitrineFox
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Acompanhe o status do catálogo, disponibilidade de estoque e ofertas publicadas na sua vitrine Shopee.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('create_product')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Produto</span>
          </button>
          <button
            onClick={() => onNavigateTab('categories')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Gerenciar Categorias</span>
          </button>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight line-clamp-1">
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-lg border ${card.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inventory & Out of Stock Warning */}
      {stats.outOfStockProducts > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Atenção ao Estoque
              </h4>
              <p className="text-xs text-amber-800">
                Existem {stats.outOfStockProducts} produtos marcados como <strong>Esgotados</strong> na vitrine. Visitantes verão o botão desabilitado.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="px-3 py-1.5 bg-amber-200/70 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
          >
            Ver catálogo
          </button>
        </div>
      )}

      {/* Recent Catalog Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Últimos Produtos Atualizados</h3>
            <span className="text-[11px] text-slate-500">Acesse para editar preços ou fotos</span>
          </div>

          <button
            onClick={() => onNavigateTab('products')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>Ver todos ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => onOpenEditModal(p)}
              className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/75 p-2 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>Estoque: {p.stock} un.</span>
                    <span aria-hidden="true">·</span>
                    <span className={p.isPublished ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                      {p.isPublished ? 'Publicado' : 'Oculto'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-extrabold text-slate-900">
                  {formatBRL(p.promoPrice ?? p.originalPrice)}
                </span>
                {p.discountPercent > 0 && (
                  <span className="block text-[10px] font-bold text-orange-600">
                    -{p.discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
