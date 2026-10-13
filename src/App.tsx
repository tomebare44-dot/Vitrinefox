import React, { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import { PublicStore } from './components/PublicStore.tsx';
import { SecretLoginModal } from './components/SecretLoginModal.tsx';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AdminProducts } from './components/admin/AdminProducts.tsx';
import { AdminCategories } from './components/admin/AdminCategories.tsx';
import { AdminCustomization } from './components/admin/AdminCustomization.tsx';
import { AdminSecurity } from './components/admin/AdminSecurity.tsx';
import { ProductFormModal } from './components/admin/ProductFormModal.tsx';
import {
  Product,
  Category,
  StoreSettings,
  DashboardStats,
  ToastMessage,
} from './types.ts';

export default function App() {
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('fox_admin_token');
  });

  const [secretModalOpen, setSecretModalOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Store & Catalog State
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Modal & Edit State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Fetch Public Store Data
  const fetchPublicStore = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await fetch('/api/public/store');
      if (!res.ok) throw new Error('Não foi possível carregar os dados da vitrine.');
      const data = await res.json();
      setSettings(data.settings);
      setCategories(data.categories || []);
      setProducts(data.products || []);
    } catch (err: any) {
      console.error(err);
      setLoadError(err.message || 'Erro de conexão.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Admin Data (Stats, all products, categories)
  const fetchAdminData = useCallback(async (token: string) => {
    try {
      const [statsRes, prodsRes, catsRes] = await Promise.all([
        fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/products', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/categories', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.status === 401 || prodsRes.status === 401) {
        // Token expired
        localStorage.removeItem('fox_admin_token');
        setAuthToken(null);
        setView('store');
        showToast('Sessão expirada. Faça login novamente.', 'error');
        return;
      }

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setDashboardStats(stats);
      }
      if (prodsRes.ok) {
        const prods = await prodsRes.json();
        setAdminProducts(prods);
      }
      if (catsRes.ok) {
        const cats = await catsRes.json();
        setCategories(cats);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }, [showToast]);

  // Initial Load
  useEffect(() => {
    fetchPublicStore();

    // Verify existing token
    if (authToken) {
      fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.authenticated) {
            fetchAdminData(authToken);
          } else {
            localStorage.removeItem('fox_admin_token');
            setAuthToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('fox_admin_token');
          setAuthToken(null);
        });
    }
  }, [fetchPublicStore, fetchAdminData, authToken]);

  // Handle 15 Clicks Secret Trigger on FoxLogo
  const handleSecretTrigger = () => {
    if (authToken) {
      // Already authenticated -> switch directly to admin dashboard
      setView('admin');
      fetchAdminData(authToken);
      showToast('Acesso administrativo confirmado!', 'info');
    } else {
      // Prompt secret login modal
      setSecretModalOpen(true);
    }
  };

  // Login Success
  const handleLoginSuccess = (token: string) => {
    setAuthToken(token);
    setView('admin');
    fetchAdminData(token);
    showToast('Bem-vindo ao painel do proprietário!', 'success');
  };

  // Logout
  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('fox_admin_token');
    setAuthToken(null);
    setView('store');
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  // Product save handler
  const handleSaveProduct = async (productData: any, saveAndAddAnother = false): Promise<boolean> => {
    if (!authToken) return false;

    try {
      const isEditing = Boolean(productToEdit);
      const url = isEditing
        ? `/api/admin/products/${productToEdit?.id}`
        : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar produto.');
      }

      showToast(
        isEditing ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!',
        'success'
      );

      // Refresh public store and admin state
      await fetchPublicStore();
      await fetchAdminData(authToken);

      if (!saveAndAddAnother) {
        setProductModalOpen(false);
        setProductToEdit(null);
      }

      return true;
    } catch (err: any) {
      showToast(err.message || 'Falha ao salvar produto.', 'error');
      return false;
    }
  };

  // Open Create Product Modal
  const handleOpenCreateModal = () => {
    setProductToEdit(null);
    setProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditModal = (prod: Product) => {
    setProductToEdit(prod);
    setProductModalOpen(true);
  };

  // Handle Tab navigation inside Admin
  const handleNavigateTab = (tab: AdminTab | 'create_product') => {
    if (tab === 'create_product') {
      handleOpenCreateModal();
    } else {
      setAdminTab(tab);
    }
  };

  // Render Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <span className="text-sm font-bold text-slate-800 tracking-tight">
            Carregando VitrineFox...
          </span>
          <span className="text-xs text-slate-500">Buscando as melhores ofertas da Shopee</span>
        </div>
      </div>
    );
  }

  // Render Connection Error with Retry
  if (loadError && !settings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Erro ao carregar a vitrine</h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">{loadError}</p>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchPublicStore();
            }}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* View Switch: Public Showcase vs Secret Admin Dashboard */}
      {view === 'admin' && authToken ? (
        <AdminLayout
          activeTab={adminTab}
          onSelectTab={setAdminTab}
          onLogout={handleLogout}
          onViewStore={() => setView('store')}
        >
          {adminTab === 'dashboard' && dashboardStats && (
            <AdminDashboard
              stats={dashboardStats}
              products={adminProducts}
              categories={categories}
              onNavigateTab={handleNavigateTab}
              onOpenEditModal={handleOpenEditModal}
            />
          )}

          {adminTab === 'products' && (
            <AdminProducts
              products={adminProducts}
              categories={categories}
              authToken={authToken}
              onOpenCreateModal={handleOpenCreateModal}
              onOpenEditModal={handleOpenEditModal}
              onRefresh={() => {
                fetchAdminData(authToken);
                fetchPublicStore();
              }}
              showToast={showToast}
            />
          )}

          {adminTab === 'create_product' && (
            <AdminProducts
              products={adminProducts}
              categories={categories}
              authToken={authToken}
              onOpenCreateModal={handleOpenCreateModal}
              onOpenEditModal={handleOpenEditModal}
              onRefresh={() => {
                fetchAdminData(authToken);
                fetchPublicStore();
              }}
              showToast={showToast}
            />
          )}

          {adminTab === 'categories' && (
            <AdminCategories
              categories={categories}
              authToken={authToken}
              onRefresh={() => {
                fetchAdminData(authToken);
                fetchPublicStore();
              }}
              showToast={showToast}
            />
          )}

          {adminTab === 'customization' && settings && (
            <AdminCustomization
              settings={settings}
              authToken={authToken}
              onRefresh={() => {
                fetchPublicStore();
                fetchAdminData(authToken);
              }}
              showToast={showToast}
            />
          )}

          {adminTab === 'security' && (
            <AdminSecurity
              authToken={authToken}
              showToast={showToast}
              onRefresh={() => {
                fetchPublicStore();
                fetchAdminData(authToken);
              }}
            />
          )}
        </AdminLayout>
      ) : (
        /* Public Storefront */
        settings && (
          <PublicStore
            settings={settings}
            categories={categories}
            products={products}
            onSecretTrigger={handleSecretTrigger}
            onRefreshData={fetchPublicStore}
          />
        )
      )}

      {/* Secret Login Modal (Triggered after 15 clicks on FoxLogo) */}
      <SecretLoginModal
        isOpen={secretModalOpen}
        onClose={() => setSecretModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Product Form Modal (Add / Edit) */}
      {authToken && (
        <ProductFormModal
          isOpen={productModalOpen}
          onClose={() => {
            setProductModalOpen(false);
            setProductToEdit(null);
          }}
          onSave={handleSaveProduct}
          productToEdit={productToEdit}
          categories={categories}
          authToken={authToken}
        />
      )}

      {/* Global Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${
                isSuccess
                  ? 'bg-slate-900/95 text-white border-slate-800'
                  : isError
                  ? 'bg-red-950/95 text-white border-red-800'
                  : 'bg-slate-900/95 text-white border-slate-800'
              }`}
            >
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
              {isError && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />}
              <span className="text-xs font-semibold leading-relaxed flex-1">{toast.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
