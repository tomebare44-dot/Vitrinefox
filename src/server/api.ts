import express, { type Request, type Response, type NextFunction } from 'express';
import { StorageEngine } from './storage.ts';

export const apiRouter = express.Router();
const storage = StorageEngine.getInstance();

// Auth Middleware for Admin Routes
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-session-token'];
  const cookies = req.headers.cookie;

  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1].trim();
  } else if (typeof customHeader === 'string') {
    token = customHeader.trim();
  } else if (cookies) {
    const match = cookies.match(/fox_session=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token || !storage.validateSession(token)) {
    return res.status(401).json({
      error: 'Acesso não autorizado. Sessão inválida ou expirada. Faça login novamente.',
    });
  }

  // Token valid, proceed
  next();
}

// ---------------- PUBLIC ROUTES ----------------

// Get complete store state for public view
apiRouter.get('/public/store', (req, res) => {
  try {
    const settings = storage.getSettings();
    const categories = storage.getActiveCategories();
    const products = storage.getProducts({
      publishedOnly: true,
      categoryId: (req.query.category as string) || undefined,
      search: (req.query.search as string) || undefined,
      sortBy: (req.query.sort as any) || 'recent',
    });

    // Compute published count per category for public badges
    const categoryCounts: Record<string, number> = {};
    const allPublished = storage.getProducts({ publishedOnly: true });
    allPublished.forEach((p) => {
      if (p.categoryId) {
        categoryCounts[p.categoryId] = (categoryCounts[p.categoryId] || 0) + 1;
      }
    });

    const categoriesWithCount = categories.map((c) => ({
      ...c,
      count: categoryCounts[c.id] || 0,
    }));

    res.json({
      settings,
      categories: categoriesWithCount,
      products,
      totalPublished: allPublished.length,
    });
  } catch (error: any) {
    console.error('Error fetching public store:', error);
    res.status(500).json({ error: 'Erro ao carregar os dados da vitrine.' });
  }
});

// Filter products public
apiRouter.get('/public/products', (req, res) => {
  try {
    const products = storage.getProducts({
      publishedOnly: true,
      categoryId: (req.query.category as string) || undefined,
      search: (req.query.search as string) || undefined,
      sortBy: (req.query.sort as any) || 'recent',
    });
    res.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
});

// ---------------- AUTH ROUTES ----------------

apiRouter.post('/auth/login', (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Por favor, informe a senha.' });
    }

    const authResult = storage.authenticate(password);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error || 'Senha incorreta.' });
    }

    // Set HTTP cookie for security
    res.cookie('fox_session', authResult.token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      success: true,
      token: authResult.token,
      message: 'Autenticado com sucesso!',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro no servidor durante a autenticação.' });
  }
});

apiRouter.post('/auth/logout', (req, res) => {
  const token =
    (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]) ||
    (req.headers['x-session-token'] as string) ||
    undefined;

  storage.logout(token);
  res.clearCookie('fox_session');
  res.json({ success: true, message: 'Sessão encerrada.' });
});

apiRouter.get('/auth/verify', (req, res) => {
  const token =
    (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]) ||
    (req.headers['x-session-token'] as string);

  const isValid = storage.validateSession(token);
  res.json({ authenticated: isValid });
});

// ---------------- ADMIN PROTECTED ROUTES ----------------

// Dashboard metrics
apiRouter.get('/admin/dashboard', requireAdminAuth, (_req, res) => {
  try {
    const stats = storage.getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao carregar estatísticas.' });
  }
});

// Manage products
apiRouter.get('/admin/products', requireAdminAuth, (req, res) => {
  try {
    const products = storage.getProducts({
      publishedOnly: false,
      categoryId: (req.query.category as string) || undefined,
      search: (req.query.search as string) || undefined,
      sortBy: (req.query.sort as any) || 'recent',
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar produtos administrativos.' });
  }
});

apiRouter.post('/admin/products', requireAdminAuth, (req, res) => {
  try {
    const product = storage.createProduct(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao criar produto.' });
  }
});

apiRouter.put('/admin/products/:id', requireAdminAuth, (req, res) => {
  try {
    const product = storage.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao atualizar produto.' });
  }
});

apiRouter.delete('/admin/products/:id', requireAdminAuth, (req, res) => {
  try {
    storage.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Produto excluído com sucesso.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao excluir produto.' });
  }
});

apiRouter.patch('/admin/products/:id/toggle-publish', requireAdminAuth, (req, res) => {
  try {
    const prod = storage.getProductById(req.params.id);
    if (!prod) return res.status(404).json({ error: 'Produto não encontrado.' });
    const updated = storage.updateProduct(req.params.id, { isPublished: !prod.isPublished });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao alterar visibilidade.' });
  }
});

apiRouter.patch('/admin/products/:id/stock', requireAdminAuth, (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || isNaN(Number(stock))) {
      return res.status(400).json({ error: 'Estoque inválido.' });
    }
    const updated = storage.updateProduct(req.params.id, { stock: Number(stock) });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao alterar estoque.' });
  }
});

// Manage categories
apiRouter.get('/admin/categories', requireAdminAuth, (_req, res) => {
  try {
    const categories = storage.getCategories();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar categorias.' });
  }
});

apiRouter.post('/admin/categories', requireAdminAuth, (req, res) => {
  try {
    const category = storage.createCategory(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao criar categoria.' });
  }
});

apiRouter.put('/admin/categories/:id', requireAdminAuth, (req, res) => {
  try {
    const category = storage.updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao atualizar categoria.' });
  }
});

apiRouter.delete('/admin/categories/:id', requireAdminAuth, (req, res) => {
  try {
    const { reassignCategoryId } = req.body || {};
    storage.deleteCategory(req.params.id, reassignCategoryId);
    res.json({ success: true, message: 'Categoria excluída com sucesso.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao excluir categoria.' });
  }
});

// Manage store settings
apiRouter.get('/admin/settings', requireAdminAuth, (_req, res) => {
  try {
    const settings = storage.getSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao carregar configurações.' });
  }
});

apiRouter.put('/admin/settings', requireAdminAuth, (req, res) => {
  try {
    const updated = storage.updateSettings(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao salvar configurações.' });
  }
});

// Change admin password
apiRouter.post('/admin/change-password', requireAdminAuth, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Informe a senha atual e a nova senha.' });
    }
    const result = storage.changePassword(currentPassword, newPassword);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, message: 'Senha alterada com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao alterar senha.' });
  }
});

// Upload image
apiRouter.post('/admin/upload-image', requireAdminAuth, (req, res) => {
  try {
    const { base64Data, filename } = req.body || {};
    if (!base64Data) {
      return res.status(400).json({ error: 'Nenhum dado de imagem fornecido.' });
    }
    const url = storage.saveUploadedImage(base64Data, filename);
    res.json({ success: true, url });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro no envio da imagem.' });
  }
});

// Reset demo catalog
apiRouter.post('/admin/reset-demo', requireAdminAuth, (_req, res) => {
  try {
    storage.resetToDemo();
    res.json({ success: true, message: 'Catálogo restaurado para valores iniciais.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao restaurar catálogo.' });
  }
});
