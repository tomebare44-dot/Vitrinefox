import React, { useState } from 'react';
import { ExternalLink, Check, Share2, Tag, AlertCircle } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  buttonText?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  categoryName,
  buttonText = 'Ver oferta',
}) => {
  const [copied, setCopied] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.discountPercent > 0 && product.promoPrice !== null;

  // Format currency in BRL
  const formatBRL = (val: number | null) => {
    if (val === null || val === undefined) return '';
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(product.affiliateUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      className={`group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 overflow-hidden product-card-shadow transition-all ${
        isOutOfStock ? 'opacity-85' : ''
      }`}
    >
      {/* Image Container with aspect ratio */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isOutOfStock ? 'grayscale-40' : ''
          }`}
          onError={(e) => {
            // Fallback image if broken
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-2.5 sm:left-2.5 sm:right-2.5 flex items-start justify-between pointer-events-none gap-1">
          {hasDiscount && (
            <div className="pointer-events-auto bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[9px] sm:text-xs font-extrabold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg shadow-xs flex items-center">
              <span>-{product.discountPercent}%</span>
              <span className="hidden sm:inline sm:ml-0.5">OFF</span>
            </div>
          )}

          {isOutOfStock ? (
            <div className="pointer-events-auto ml-auto bg-slate-900/90 text-white text-[9px] sm:text-[11px] font-semibold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md backdrop-blur-xs">
              Esgotado
            </div>
          ) : product.stock <= 5 ? (
            <div className="pointer-events-auto ml-auto bg-amber-500/90 text-white text-[9px] sm:text-[11px] font-semibold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md backdrop-blur-xs">
              {product.stock} un.
            </div>
          ) : null}
        </div>

        {/* Share Button Overlay */}
        <button
          onClick={handleShare}
          className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-orange-600 shadow-sm transition-all hover:scale-105 opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Copiar link da oferta"
          aria-label="Copiar link da oferta"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Content Section */}
      <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata Header */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 mb-1 font-medium truncate">
            {categoryName ? (
              <span className="text-slate-600 truncate max-w-[80px] sm:max-w-none">
                {categoryName}
              </span>
            ) : (
              <span className="text-slate-400">Oferta</span>
            )}
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>
              {isOutOfStock ? (
                <span className="text-red-500 font-semibold">0 un.</span>
              ) : (
                <span className="text-emerald-600 font-semibold">{product.stock} un.</span>
              )}
            </span>
          </div>

          {/* Product Title */}
          <h3
            className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight min-h-[26px] sm:min-h-[32px]"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Price & CTA Block */}
        <div className="mt-2 pt-1.5 sm:pt-2 border-t border-slate-100 flex flex-col gap-1.5 sm:gap-2.5">
          <div className="flex flex-col">
            {hasDiscount && product.originalPrice && (
              <span className="text-[9px] sm:text-[11px] text-slate-400 line-through font-medium leading-none">
                {formatBRL(product.originalPrice)}
              </span>
            )}

            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs sm:text-sm md:text-base lg:text-lg font-black text-slate-900 tracking-tight leading-none">
                {formatBRL(hasDiscount ? product.promoPrice : (product.originalPrice || 0))}
              </span>
            </div>
          </div>

          {/* Shopee Affiliate CTA */}
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-1.5 sm:py-2 px-1.5 sm:px-3 rounded-lg sm:rounded-xl bg-slate-100 text-slate-400 text-[10px] sm:text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1 select-none"
            >
              <AlertCircle className="w-3 h-3 text-slate-400" />
              <span>Esgotado</span>
            </button>
          ) : (
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 sm:py-2 px-1.5 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:scale-[0.98] text-white text-[10px] sm:text-xs font-bold shadow-xs flex items-center justify-center gap-1 transition-all"
            >
              <span>{buttonText}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
};
