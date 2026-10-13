import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  MessageCircle,
  Instagram,
  Send,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Percent,
} from 'lucide-react';
import { FoxLogo } from './FoxLogo.tsx';
import { ProductCard } from './ProductCard.tsx';
import { Product, Category, StoreSettings, SortOption } from '../types.ts';

interface PublicStoreProps {
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  onSecretTrigger: () => void;
  onRefreshData?: () => void;
}

export const PublicStore: React.FC<PublicStoreProps> = ({
  settings,
  categories,
  products,
  onSecretTrigger,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Category map for quick lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Filter and sort products client-side for ultra-responsive experience
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.isPublished);

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => {
          const priceA = a.promoPrice ?? a.originalPrice ?? 0;
          const priceB = b.promoPrice ?? b.originalPrice ?? 0;
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        result.sort((a, b) => {
          const priceA = a.promoPrice ?? a.originalPrice ?? 0;
          const priceB = b.promoPrice ?? b.originalPrice ?? 0;
          return priceB - priceA;
        });
        break;
      case 'discount_desc':
        result.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [products, selectedCategory, searchTerm, sortBy]);

  // Count per category
  const activeProductsCount = products.filter((p) => p.isPublished).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 1. Top Announcement Bar */}
      {settings.isAnnouncementActive && showAnnouncement && settings.announcementText && (
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center relative">
          <span>{settings.announcementText}</span>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="absolute right-3 p-1 text-white/80 hover:text-white"
            title="Fechar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Header / Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4">
            {/* Logo with 15-click secret entrance */}
            <FoxLogo onSecretTrigger={onSecretTrigger} />

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por nome ou produto..."
                  className="w-full pl-10 pr-9 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-orange-500 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Social Channels & Contact */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {settings.whatsappUrl && (
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 flex items-center gap-1.5 transition-colors"
                  title="Grupo VIP de Ofertas WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Grupo VIP</span>
                </a>
              )}

              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-600 hover:text-pink-600 hover:bg-slate-100 transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}

              {settings.telegramUrl && (
                <a
                  href={settings.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition-colors"
                  title="Canal Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="mt-3 md:hidden">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar ofertas..."
                className="w-full pl-10 pr-9 py-2 bg-slate-100 focus:bg-white border border-transparent focus:border-orange-500 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 3. Hero Promotional Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/60 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col items-start">
              {settings.heroBadgeText && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-bold tracking-wide uppercase mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>{settings.heroBadgeText}</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                {settings.heroTitle}
              </h1>

              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {settings.heroSubtitle}
              </p>

              {/* Trust Badges */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>Links Oficiais Shopee</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Cupons de Frete Grátis</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                  <Percent className="w-4 h-4 text-amber-600" />
                  <span>Descontos de até 70%</span>
                </div>
              </div>
            </div>

            {/* Featured Hero Banner Image */}
            {settings.heroBannerUrl && (
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-16/9 lg:aspect-4/3">
                  <img
                    src={settings.heroBannerUrl}
                    alt="Destaque Shopee"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-orange-400">
                      Seleção da Semana
                    </span>
                    <p className="text-sm font-semibold text-white/95 mt-0.5">
                      Achados testados com entrega rápida e garantia Shopee
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Filter Tabs and Controls */}
      <section className="sticky top-[69px] z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Segmented Tabs (Horizontal Scrollable) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Todas ({activeProductsCount})
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.productCount !== undefined && cat.productCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        selectedCategory === cat.id ? 'bg-orange-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat.productCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center justify-between md:justify-end gap-3 self-end md:self-auto w-full md:w-auto">
              <span className="text-xs text-slate-500 font-medium">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'oferta' : 'ofertas'}
              </span>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <label htmlFor="sort-select" className="sr-only">Ordenar por</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="discount_desc">Maior Desconto (%)</option>
                  <option value="price_asc">Menor Preço (R$)</option>
                  <option value="price_desc">Maior Preço (R$)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Product Grid */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-5 sm:py-8 flex-1 w-full">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={product.categoryId ? categoryMap.get(product.categoryId) : undefined}
                buttonText={settings.offerButtonText}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-orange-100/70 text-orange-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Nenhuma oferta encontrada
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Não encontramos produtos para os critérios de busca selecionados. Tente ajustar o termo de pesquisa ou a categoria.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar filtros e busca</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 6. Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5">
              <div className="inline-block" onClick={onSecretTrigger}>
                <FoxLogo size="sm" showTagline={false} className="brightness-125" />
              </div>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed max-w-sm">
                {settings.tagline || 'Sua vitrine confiável de promoções, cupons e achadinhos verificados da Shopee.'}
              </p>
              <div className="mt-4 flex items-center gap-3 text-slate-400 text-xs">
                <span>© {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.</span>
              </div>
            </div>

            <div className="md:col-span-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Aviso Legal & Transparência
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Esta página participa do Programa de Afiliados da Shopee. Todos os produtos e compras são processados diretamente na plataforma oficial da Shopee com segurança e proteção ao comprador. Preços e cupons sujeitos a alterações pelo vendedor.
              </p>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Canais de Ofertas
              </h4>
              <div className="flex flex-col gap-2 text-xs">
                {settings.whatsappUrl && (
                  <a
                    href={settings.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Grupo de Descontos no WhatsApp</span>
                  </a>
                )}
                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-pink-400 flex items-center gap-1.5 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <span>Instagram Oficial</span>
                  </a>
                )}
                {settings.telegramUrl && (
                  <a
                    href={settings.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-sky-400 flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-500" />
                    <span>Canal no Telegram</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
