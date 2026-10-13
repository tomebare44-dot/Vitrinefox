import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface Product {
  id: string;
  name: string;
  originalPrice: number | null;
  discountPercent: number;
  promoPrice: number | null;
  stock: number;
  affiliateUrl: string;
  categoryId: string | null;
  isPublished: boolean;
  imageUrl: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl: string | null;
  heroBadgeText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl: string | null;
  whatsappUrl: string;
  instagramUrl: string;
  telegramUrl: string;
  offerButtonText: string;
  announcementText: string;
  isAnnouncementActive: boolean;
}

export interface AdminAuth {
  salt: string;
  hash: string;
  updatedAt: string;
}

export interface Session {
  token: string;
  createdAt: string;
  expiresAt: number; // timestamp in ms
}

export interface DatabaseSchema {
  version: number;
  auth: AdminAuth;
  sessions: Session[];
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  failedAttempts: {
    count: number;
    lastAttempt: number;
    lockedUntil: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'vitrinefox.json');

// Helper to hash password securely using PBKDF2
export function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 100000, 64, 'sha512').toString('hex');
  return { salt: generatedSalt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const computed = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(expectedHash));
}

// Ensure data directories exist
export function initStorageDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// Initial seed data
const DEFAULT_INITIAL_DATA: DatabaseSchema = {
  version: 1,
  auth: {
    ...hashPassword(process.env.ADMIN_INITIAL_PASSWORD || 'felipe123'),
    updatedAt: new Date().toISOString(),
  },
  sessions: [],
  settings: {
    storeName: 'VitrineFox',
    tagline: 'Os melhores achadinhos e cupons verificados da Shopee',
    logoUrl: null,
    heroBadgeText: '🔥 Ofertas Selecionadas Diariamente',
    heroTitle: 'Achadinhos e Ofertas Imperdíveis na Shopee',
    heroSubtitle: 'Economize tempo e dinheiro com produtos testados, avaliados e com os maiores descontos da semana.',
    heroBannerUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80',
    whatsappUrl: 'https://wa.me/?text=Confira%20essas%20ofertas%20no%20VitrineFox!',
    instagramUrl: 'https://instagram.com',
    telegramUrl: 'https://t.me',
    offerButtonText: 'Ver oferta',
    announcementText: '🎉 Frete Grátis e Cupons Exclusivos disponíveis hoje na Shopee!',
    isAnnouncementActive: true,
  },
  categories: [
    {
      id: 'cat-tech',
      name: 'Eletrônicos & Tech',
      description: 'Fones, smartwatches, carregadores e acessórios inteligentes',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cat-home',
      name: 'Casa & Decoração',
      description: 'Achados práticos para facilitar a rotina e decorar seu espaço',
      imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cat-beauty',
      name: 'Beleza & Cuidados',
      description: 'Skincare, organizadores e itens de autocuidado mais bem avaliados',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cat-kitchen',
      name: 'Cozinha Criativa',
      description: 'Utensílios inovadores e práticos para transformar o preparo de refeições',
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  products: [
    {
      id: 'prod-1',
      name: 'Fone de Ouvido Bluetooth Sem Fio com Cancelamento de Ruído TWS',
      originalPrice: 149.9,
      discountPercent: 42,
      promoPrice: 86.94,
      stock: 18,
      affiliateUrl: 'https://shopee.com.br',
      categoryId: 'cat-tech',
      isPublished: true,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      description: 'Autonomia de até 28 horas com case carregador, conexão Bluetooth 5.3 ultra estável e som com graves reforçados.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-2',
      name: 'Umidificador de Ar Ultrassônico & Luminária LED RGB 300ml',
      originalPrice: 89.9,
      discountPercent: 35,
      promoPrice: 58.44,
      stock: 24,
      affiliateUrl: 'https://shopee.com.br',
      categoryId: 'cat-home',
      isPublished: true,
      imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
      description: 'Silencioso, melhora a qualidade do ar em quartos com ar condicionado e decora com 7 cores relaxantes.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-3',
      name: 'Mini Processador e Triturador Elétrico de Alimentos USB sem Fio',
      originalPrice: 65.0,
      discountPercent: 30,
      promoPrice: 45.5,
      stock: 35,
      affiliateUrl: 'https://shopee.com.br',
      categoryId: 'cat-kitchen',
      isPublished: true,
      imageUrl: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=800&q=80',
      description: 'Lâminas de aço inoxidável em 3 camadas, tritura alho, cebola e temperos em apenas 10 segundos com um toque.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-4',
      name: 'Relógio Smartwatch Esportivo com Monitor Cardíaco e Oxímetro',
      originalPrice: 199.0,
      discountPercent: 50,
      promoPrice: 99.5,
      stock: 12,
      affiliateUrl: 'https://shopee.com.br',
      categoryId: 'cat-tech',
      isPublished: true,
      imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
      description: 'Resistente à água IP68, notificações de WhatsApp e chamadas, bateria com até 7 dias de duração.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-5',
      name: 'Organizador Giratório 360° Multiuso para Maquiagem e Cosméticos',
      originalPrice: 110.0,
      discountPercent: 28,
      promoPrice: 79.2,
      stock: 15,
      affiliateUrl: 'https://shopee.com.br',
      categoryId: 'cat-beauty',
      isPublished: true,
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      description: 'Bandejas ajustáveis com rotação suave e silenciosa, comporta até 30 pincéis e 20 frascos de produtos.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-6',
      name: 'Lâmpada LED com Sensor de Presença Magnética Recarregável USB',
      originalPrice: 49.9,
      discountPercent: 0,
      promoPrice: 49.9,
      stock: 0, // Esgotado para demonstrar comportamento exigido
      affiliateUrl: 'https://shopee.com.br',
      categoryId: 'cat-home',
      isPublished: true,
      imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
      description: 'Fixação magnética sem fios para armários, closet e escadas. Acendimento automático com alcance de 3 metros.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  failedAttempts: {
    count: 0,
    lastAttempt: 0,
    lockedUntil: 0,
  },
};

export class StorageEngine {
  private static instance: StorageEngine;
  private db: DatabaseSchema;

  private constructor() {
    initStorageDirectories();
    this.db = this.loadDatabase();
  }

  public static getInstance(): StorageEngine {
    if (!StorageEngine.instance) {
      StorageEngine.instance = new StorageEngine();
    }
    return StorageEngine.instance;
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Clean expired sessions on boot
        const now = Date.now();
        parsed.sessions = (parsed.sessions || []).filter((s: Session) => s.expiresAt > now);
        return parsed;
      }
    } catch (err) {
      console.error('Error loading database file, initializing defaults:', err);
    }

    // If file doesn't exist or is invalid, persist defaults
    this.persist(DEFAULT_INITIAL_DATA);
    return DEFAULT_INITIAL_DATA;
  }

  private persist(data: DatabaseSchema) {
    initStorageDirectories();
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempFile, serialized, 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  private save() {
    this.persist(this.db);
  }

  // AUTHENTICATION & SESSIONS
  public checkRateLimit(): { isLocked: boolean; remainingSeconds: number } {
    const now = Date.now();
    if (this.db.failedAttempts.lockedUntil > now) {
      const remainingSeconds = Math.ceil((this.db.failedAttempts.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSeconds };
    }
    return { isLocked: false, remainingSeconds: 0 };
  }

  public registerFailedAttempt(): { isLocked: boolean; remainingSeconds: number } {
    const now = Date.now();
    // If last attempt was more than 10 minutes ago, reset count
    if (now - this.db.failedAttempts.lastAttempt > 10 * 60 * 1000) {
      this.db.failedAttempts.count = 1;
    } else {
      this.db.failedAttempts.count += 1;
    }
    this.db.failedAttempts.lastAttempt = now;

    // Lock if 5 or more failed attempts
    if (this.db.failedAttempts.count >= 5) {
      this.db.failedAttempts.lockedUntil = now + 15 * 60 * 1000; // 15 minutes lockout
      this.save();
      return { isLocked: true, remainingSeconds: 15 * 60 };
    }

    this.save();
    return { isLocked: false, remainingSeconds: 0 };
  }

  public resetFailedAttempts() {
    this.db.failedAttempts = {
      count: 0,
      lastAttempt: 0,
      lockedUntil: 0,
    };
    this.save();
  }

  public authenticate(password: string): { success: boolean; token?: string; error?: string } {
    const rateCheck = this.checkRateLimit();
    if (rateCheck.isLocked) {
      return {
        success: false,
        error: `Muitas tentativas incorretas. Tente novamente em ${rateCheck.remainingSeconds} segundos.`,
      };
    }

    const isValid = verifyPassword(password, this.db.auth.salt, this.db.auth.hash);
    if (!isValid) {
      const lockStatus = this.registerFailedAttempt();
      if (lockStatus.isLocked) {
        return {
          success: false,
          error: `Muitas tentativas incorretas. Acesso bloqueado por 15 minutos.`,
        };
      }
      return {
        success: false,
        error: 'Senha incorreta. Verifique e tente novamente.',
      };
    }

    this.resetFailedAttempts();

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const session: Session = {
      token,
      createdAt: new Date().toISOString(),
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
    };

    this.db.sessions.push(session);
    this.save();

    return { success: true, token };
  }

  public validateSession(token: string | undefined): boolean {
    if (!token) return false;
    const now = Date.now();
    const sessionIndex = this.db.sessions.findIndex((s) => s.token === token);
    if (sessionIndex === -1) return false;

    if (this.db.sessions[sessionIndex].expiresAt < now) {
      this.db.sessions.splice(sessionIndex, 1);
      this.save();
      return false;
    }

    return true;
  }

  public logout(token: string | undefined) {
    if (!token) return;
    this.db.sessions = this.db.sessions.filter((s) => s.token !== token);
    this.save();
  }

  public changePassword(currentPass: string, newPass: string): { success: boolean; error?: string } {
    if (!verifyPassword(currentPass, this.db.auth.salt, this.db.auth.hash)) {
      return { success: false, error: 'Senha atual incorreta.' };
    }
    if (!newPass || newPass.trim().length < 6) {
      return { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    const newHashed = hashPassword(newPass.trim());
    this.db.auth = {
      salt: newHashed.salt,
      hash: newHashed.hash,
      updatedAt: new Date().toISOString(),
    };
    // Invalidate all other sessions except current if wanted, or all
    this.save();
    return { success: true };
  }

  // STORE SETTINGS
  public getSettings(): StoreSettings {
    return { ...this.db.settings };
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.db.settings = {
      ...this.db.settings,
      ...updates,
      storeName: updates.storeName ? updates.storeName.trim() : this.db.settings.storeName,
    };
    this.save();
    return this.getSettings();
  }

  // CATEGORIES
  public getCategories(): (Category & { productCount: number })[] {
    return this.db.categories.map((cat) => {
      const productCount = this.db.products.filter((p) => p.categoryId === cat.id).length;
      return {
        ...cat,
        productCount,
      };
    });
  }

  public getActiveCategories(): Category[] {
    return this.db.categories.filter((cat) => cat.isActive);
  }

  public getCategoryById(id: string): Category | undefined {
    return this.db.categories.find((c) => c.id === id);
  }

  public createCategory(data: { name: string; description?: string; imageUrl?: string | null; isActive?: boolean }): Category {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new Error('O nome da categoria é obrigatório.');
    }

    // Check duplicate name
    const exists = this.db.categories.some(
      (c) => c.name.toLowerCase().trim() === trimmedName.toLowerCase()
    );
    if (exists) {
      throw new Error('Já existe uma categoria com este nome.');
    }

    const newCategory: Category = {
      id: `cat-${crypto.randomUUID().slice(0, 8)}`,
      name: trimmedName,
      description: data.description ? data.description.trim() : '',
      imageUrl: data.imageUrl || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.categories.push(newCategory);
    this.save();
    return newCategory;
  }

  public updateCategory(
    id: string,
    data: { name?: string; description?: string; imageUrl?: string | null; isActive?: boolean }
  ): Category {
    const cat = this.db.categories.find((c) => c.id === id);
    if (!cat) {
      throw new Error('Categoria não encontrada.');
    }

    if (data.name !== undefined) {
      const trimmed = data.name.trim();
      if (!trimmed) throw new Error('O nome da categoria não pode estar em branco.');
      const exists = this.db.categories.some(
        (c) => c.id !== id && c.name.toLowerCase().trim() === trimmed.toLowerCase()
      );
      if (exists) throw new Error('Já existe outra categoria com este nome.');
      cat.name = trimmed;
    }

    if (data.description !== undefined) {
      cat.description = data.description.trim();
    }
    if (data.imageUrl !== undefined) {
      cat.imageUrl = data.imageUrl;
    }
    if (data.isActive !== undefined) {
      cat.isActive = data.isActive;
    }

    cat.updatedAt = new Date().toISOString();
    this.save();
    return cat;
  }

  public deleteCategory(id: string, reassignCategoryId?: string | null): boolean {
    const index = this.db.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Categoria não encontrada.');
    }

    // Reassign or unbind products associated with this category
    const targetCatId = reassignCategoryId && reassignCategoryId !== id ? reassignCategoryId : null;
    this.db.products.forEach((p) => {
      if (p.categoryId === id) {
        p.categoryId = targetCatId;
        p.updatedAt = new Date().toISOString();
      }
    });

    this.db.categories.splice(index, 1);
    this.save();
    return true;
  }

  // PRODUCTS
  public calculatePromoPrice(originalPrice: number | null, discountPercent: number): number | null {
    if (originalPrice === null || originalPrice <= 0) return null;
    if (discountPercent <= 0) return originalPrice;
    if (discountPercent >= 100) return 0;
    const calculated = originalPrice * (1 - discountPercent / 100);
    return Math.round(calculated * 100) / 100;
  }

  public getProducts(options?: {
    publishedOnly?: boolean;
    search?: string;
    categoryId?: string;
    sortBy?: 'recent' | 'price_asc' | 'price_desc' | 'discount_desc';
  }): Product[] {
    let list = [...this.db.products];

    if (options?.publishedOnly) {
      list = list.filter((p) => p.isPublished);
    }

    if (options?.categoryId && options.categoryId !== 'all') {
      list = list.filter((p) => p.categoryId === options.categoryId);
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (options?.sortBy) {
      switch (options.sortBy) {
        case 'price_asc':
          list.sort((a, b) => {
            const priceA = a.promoPrice ?? a.originalPrice ?? 0;
            const priceB = b.promoPrice ?? b.originalPrice ?? 0;
            return priceA - priceB;
          });
          break;
        case 'price_desc':
          list.sort((a, b) => {
            const priceA = a.promoPrice ?? a.originalPrice ?? 0;
            const priceB = b.promoPrice ?? b.originalPrice ?? 0;
            return priceB - priceA;
          });
          break;
        case 'discount_desc':
          list.sort((a, b) => b.discountPercent - a.discountPercent);
          break;
        case 'recent':
        default:
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }

  public getProductById(id: string): Product | undefined {
    return this.db.products.find((p) => p.id === id);
  }

  public createProduct(data: {
    name: string;
    originalPrice?: number | null;
    discountPercent?: number;
    stock: number;
    affiliateUrl: string;
    categoryId?: string | null;
    isPublished?: boolean;
    imageUrl: string;
    description?: string;
  }): Product {
    const trimmedName = data.name ? data.name.trim() : '';
    if (!trimmedName) {
      throw new Error('O nome do produto é obrigatório.');
    }
    if (trimmedName.length > 250) {
      throw new Error('O nome do produto deve ter no máximo 250 caracteres.');
    }

    const stock = Math.max(0, Math.floor(Number(data.stock) || 0));
    const discount = Math.min(100, Math.max(0, Math.floor(Number(data.discountPercent) || 0)));
    const originalPrice =
      data.originalPrice !== null && data.originalPrice !== undefined
        ? Math.max(0, Math.round(Number(data.originalPrice) * 100) / 100)
        : null;

    const promoPrice = this.calculatePromoPrice(originalPrice, discount);

    const affiliateUrl = (data.affiliateUrl || '').trim();
    if (!affiliateUrl || (!affiliateUrl.startsWith('http://') && !affiliateUrl.startsWith('https://'))) {
      throw new Error('O link de afiliado da Shopee deve ser uma URL válida começando com http:// ou https://');
    }

    if (!data.imageUrl || !data.imageUrl.trim()) {
      throw new Error('A imagem do produto é obrigatória.');
    }

    const newProduct: Product = {
      id: `prod-${crypto.randomUUID().slice(0, 8)}`,
      name: trimmedName,
      originalPrice,
      discountPercent: discount,
      promoPrice,
      stock,
      affiliateUrl,
      categoryId: data.categoryId || null,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      imageUrl: data.imageUrl.trim(),
      description: data.description ? data.description.trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  public updateProduct(
    id: string,
    data: Partial<{
      name: string;
      originalPrice: number | null;
      discountPercent: number;
      stock: number;
      affiliateUrl: string;
      categoryId: string | null;
      isPublished: boolean;
      imageUrl: string;
      description: string;
    }>
  ): Product {
    const prod = this.db.products.find((p) => p.id === id);
    if (!prod) {
      throw new Error('Produto não encontrado.');
    }

    if (data.name !== undefined) {
      const trimmed = data.name.trim();
      if (!trimmed) throw new Error('O nome do produto não pode estar em branco.');
      if (trimmed.length > 250) throw new Error('O nome deve ter no máximo 250 caracteres.');
      prod.name = trimmed;
    }

    if (data.stock !== undefined) {
      prod.stock = Math.max(0, Math.floor(Number(data.stock) || 0));
    }

    if (data.originalPrice !== undefined) {
      prod.originalPrice =
        data.originalPrice !== null
          ? Math.max(0, Math.round(Number(data.originalPrice) * 100) / 100)
          : null;
    }

    if (data.discountPercent !== undefined) {
      prod.discountPercent = Math.min(100, Math.max(0, Math.floor(Number(data.discountPercent) || 0)));
    }

    // Recalculate promotional price
    prod.promoPrice = this.calculatePromoPrice(prod.originalPrice, prod.discountPercent);

    if (data.affiliateUrl !== undefined) {
      const url = data.affiliateUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('O link de afiliado deve ser uma URL válida (http:// ou https://)');
      }
      prod.affiliateUrl = url;
    }

    if (data.categoryId !== undefined) {
      prod.categoryId = data.categoryId || null;
    }

    if (data.isPublished !== undefined) {
      prod.isPublished = Boolean(data.isPublished);
    }

    if (data.imageUrl !== undefined && data.imageUrl.trim()) {
      prod.imageUrl = data.imageUrl.trim();
    }

    if (data.description !== undefined) {
      prod.description = data.description.trim();
    }

    prod.updatedAt = new Date().toISOString();
    this.save();
    return prod;
  }

  public deleteProduct(id: string): boolean {
    const index = this.db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Produto não encontrado.');
    }
    this.db.products.splice(index, 1);
    this.save();
    return true;
  }

  public getDashboardStats() {
    const total = this.db.products.length;
    const published = this.db.products.filter((p) => p.isPublished).length;
    const hidden = total - published;
    const outOfStock = this.db.products.filter((p) => p.stock === 0).length;
    const discounted = this.db.products.filter((p) => p.discountPercent > 0).length;
    const totalCategories = this.db.categories.length;

    return {
      totalProducts: total,
      publishedProducts: published,
      hiddenProducts: hidden,
      outOfStockProducts: outOfStock,
      discountedProducts: discounted,
      totalCategories,
    };
  }

  // IMAGE STORAGE
  public saveUploadedImage(base64Data: string, originalFileName?: string): string {
    initStorageDirectories();
    // Parse data URL: data:image/png;base64,.....
    const match = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'jpg';

    if (match) {
      const type = match[1].toLowerCase();
      if (type.includes('png')) ext = 'png';
      else if (type.includes('webp')) ext = 'webp';
      else if (type.includes('gif')) ext = 'gif';
      else ext = 'jpg';

      buffer = Buffer.from(match[2], 'base64');
    } else {
      // Raw base64 or fallback
      buffer = Buffer.from(base64Data, 'base64');
    }

    if (buffer.length > 8 * 1024 * 1024) {
      throw new Error('A imagem não pode ultrapassar 8MB.');
    }

    const filename = `fox_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const targetPath = path.resolve(UPLOADS_DIR, filename);
    fs.writeFileSync(targetPath, buffer);

    return `/uploads/${filename}`;
  }

  public resetToDemo(): void {
    this.db.categories = DEFAULT_INITIAL_DATA.categories;
    this.db.products = DEFAULT_INITIAL_DATA.products;
    this.db.settings = DEFAULT_INITIAL_DATA.settings;
    this.save();
  }
}
