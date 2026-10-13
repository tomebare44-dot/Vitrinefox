import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Link,
  DollarSign,
  Percent,
  Layers,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Product, Category } from '../../types.ts';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any, saveAndAddAnother?: boolean) => Promise<boolean>;
  productToEdit?: Product | null;
  categories: Category[];
  authToken: string;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  categories,
  authToken,
}) => {
  const [name, setName] = useState('');
  const [stock, setStock] = useState<number | string>(10);
  const [originalPrice, setOriginalPrice] = useState<number | string>('');
  const [discountPercent, setDiscountPercent] = useState<number | string>(0);
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [isPublished, setIsPublished] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState(false);

  // Sync state when editing or opening
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setStock(productToEdit.stock);
      setOriginalPrice(productToEdit.originalPrice ?? '');
      setDiscountPercent(productToEdit.discountPercent ?? 0);
      setAffiliateUrl(productToEdit.affiliateUrl);
      setCategoryId(productToEdit.categoryId || '');
      setIsPublished(productToEdit.isPublished);
      setImageUrl(productToEdit.imageUrl);
      setImagePreview(productToEdit.imageUrl);
      setDescription(productToEdit.description || '');
      setUrlMode(false);
    } else {
      // Defaults for new product
      setName('');
      setStock(10);
      setOriginalPrice('');
      setDiscountPercent(0);
      setAffiliateUrl('');
      setCategoryId('');
      setIsPublished(true);
      setImageUrl('');
      setImagePreview(null);
      setDescription('');
      setUrlMode(false);
    }
    setFormError(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Real-time calculated promo price
  const calcPromoPrice = () => {
    const orig = Number(originalPrice);
    const disc = Number(discountPercent);
    if (!orig || orig <= 0) return null;
    if (!disc || disc <= 0) return orig;
    const res = orig * (1 - disc / 100);
    return Math.max(0, Math.round(res * 100) / 100);
  };

  const calculatedPromo = calcPromoPrice();

  // Image Upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Por favor, selecione um arquivo de imagem válido (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setFormError('A imagem selecionada ultrapassa o limite de 8MB.');
      return;
    }

    setIsUploading(true);
    setFormError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        setImagePreview(base64Data);

        // Upload to server persistent storage
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            base64Data,
            filename: file.name,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erro ao enviar imagem ao servidor.');
        }

        setImageUrl(data.url);
      } catch (err: any) {
        setFormError(err.message || 'Falha no envio da imagem.');
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      setFormError('Erro ao ler arquivo da imagem.');
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (saveAndAddAnother = false) => {
    setFormError(null);

    // Validations
    if (!name.trim()) {
      setFormError('O nome do produto é obrigatório.');
      return;
    }

    if (name.trim().length > 250) {
      setFormError('O nome do produto não pode exceder 250 caracteres.');
      return;
    }

    const stockNum = Math.floor(Number(stock));
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('O estoque deve ser um número inteiro igual ou superior a zero.');
      return;
    }

    const origPriceNum = originalPrice !== '' ? Number(originalPrice) : null;
    if (origPriceNum !== null && (isNaN(origPriceNum) || origPriceNum < 0)) {
      setFormError('O preço original deve ser um número positivo.');
      return;
    }

    const discNum = Number(discountPercent);
    if (isNaN(discNum) || discNum < 0 || discNum > 100) {
      setFormError('O desconto deve estar entre 0% e 100%.');
      return;
    }

    const trimmedUrl = affiliateUrl.trim();
    if (!trimmedUrl || (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://'))) {
      setFormError('O link de afiliado da Shopee deve ser uma URL válida (iniciando com https:// ou http://).');
      return;
    }

    const finalImage = imageUrl.trim() || imagePreview;
    if (!finalImage) {
      setFormError('A foto do produto é obrigatória.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        stock: stockNum,
        originalPrice: origPriceNum,
        discountPercent: discNum,
        affiliateUrl: trimmedUrl,
        categoryId: categoryId || null,
        isPublished,
        imageUrl: finalImage,
        description: description.trim(),
      };

      const success = await onSave(payload, saveAndAddAnother);

      if (success) {
        if (saveAndAddAnother) {
          // Reset fields for the next one
          setName('');
          setStock(10);
          setOriginalPrice('');
          setDiscountPercent(0);
          setAffiliateUrl('');
          setCategoryId('');
          setImageUrl('');
          setImagePreview(null);
          setDescription('');
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {productToEdit ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <p className="text-xs text-slate-400">
                Preencha os dados e o link de afiliado da Shopee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 font-medium">{formError}</div>
            </div>
          )}

          {/* Product Name */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nome do Produto <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{name.length}/250</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Fone de Ouvido Bluetooth Sem Fio TWS..."
              maxLength={250}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Image Upload Block */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Foto do Produto <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setUrlMode(!urlMode)}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
              >
                {urlMode ? 'Usar upload de arquivo' : 'Usar link de imagem (URL)'}
              </button>
            </div>

            {urlMode ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://... (URL pública da imagem)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Upload Trigger Area */}
                <label className="flex-1 w-full flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-orange-50/20 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-orange-600 text-sm font-semibold">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processando imagem...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        Clique para selecionar ou tirar foto
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5">
                        JPEG, PNG, WEBP (Máx. 8MB) — Salva de forma permanente
                      </span>
                    </div>
                  )}
                </label>

                {/* Preview Box */}
                {imagePreview && (
                  <div className="relative w-28 h-28 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt="Prévia"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageUrl('');
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600"
                      title="Remover imagem"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pricing and Stock Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Original Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preço Original (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Discount Percent */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Desconto (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estoque <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-[10px] text-slate-400">0 = Esgotado</span>
            </div>
          </div>

          {/* Automatic Promotional Price calculation preview */}
          {calculatedPromo !== null && Number(discountPercent) > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
              <span className="text-amber-800 font-medium">
                Cálculo automático de oferta:
              </span>
              <span className="font-extrabold text-amber-900 text-sm">
                R$ {calculatedPromo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                <span className="text-xs text-amber-700 font-semibold ml-1">
                  (-{discountPercent}%)
                </span>
              </span>
            </div>
          )}

          {/* Shopee Affiliate Link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Link de Afiliado Shopee <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                placeholder="https://shopee.com.br/... ou link encurtado oficial"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              O link será aberto com segurança em uma nova aba para o visitante.
            </p>
          </div>

          {/* Category & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Sem categoria (Geral)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status na Vitrine
              </label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between border transition-all ${
                  isPublished
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isPublished ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                  <span>{isPublished ? 'Publicado (Visível a todos)' : 'Oculto (Somente no Painel)'}</span>
                </div>
                <span className="text-xs uppercase font-extrabold">{isPublished ? 'ATIVO' : 'OCULTO'}</span>
              </button>
            </div>
          </div>

          {/* Optional Short Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Destaque / Descrição curta (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Entrega rápida, bateria de longa duração, mais de 10.000 avaliações..."
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>

          {!productToEdit && (
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold shadow-2xs transition-colors"
            >
              Salvar e Adicionar Outro
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Salvar Produto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
