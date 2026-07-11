'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, API_URL } from '@/context/AuthContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  AlertTriangle, 
  Percent, 
  PackageCheck,
  CheckCircle,
  Truck,
  Loader,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Printer,
  History,
  ShieldCheck,
  DollarSign,
  Activity
} from 'lucide-react';

const CATEGORIES = ['Silk', 'Cotton', 'Bridal', 'Designer', 'Party Wear', 'Handloom'];

// Telugu translations dictionary specifically for the Admin Dashboard
const adminTranslations: Record<'en' | 'te', Record<string, string>> = {
  en: {
    dash_title: "Store Administration",
    tab_overview: "Overview",
    tab_products: "Saree Inventory",
    tab_orders: "Store Orders",
    tab_customers: "Shoppers List",
    tab_logs: "Activity Logs",
    tab_coupons: "Configure Coupons",
    
    stat_revenue: "Total Revenue",
    stat_today_rev: "Today's Revenue",
    stat_orders: "Total Orders",
    stat_today_ord: "Today's Orders",
    stat_customers: "Customers Directory",
    stat_aov: "Avg Order Value (AOV)",
    stat_conv: "Conversion Rate",
    stat_visitors: "Live Visitors",
    stat_out_stock: "Out of Stock",
    stat_low_stock: "Low Stock Items",
    
    tbl_id: "Order ID",
    tbl_cust: "Customer",
    tbl_total: "Total Paid",
    tbl_pay: "Payment",
    tbl_status: "Status",
    tbl_action: "Actions",
    
    btn_add_saree: "Add Saree",
    btn_save_saree: "Save Saree",
    btn_cancel: "Cancel",
    btn_update_role: "Update Role",
    
    lbl_logs_title: "Security & Administrative Logs",
    lbl_restrict: "Restricted Staff Mode",
    lbl_restrict_desc: "Staff accounts have read-only access. Saving settings or configuring promo codes is disabled.",
    lbl_role_switcher: "Developer Role Switcher"
  },
  te: {
    dash_title: "స్టోర్ అడ్మినిస్ట్రేషన్",
    tab_overview: "సమీక్ష (Overview)",
    tab_products: "చీరల ఇన్వెంటరీ",
    tab_orders: "స్టోర్ ఆర్డర్లు",
    tab_customers: "కస్టమర్ల జాబితా",
    tab_logs: "యాక్టివిటీ లాగ్స్",
    tab_coupons: "కూపన్ల డిజైన్",
    
    stat_revenue: "మొత్తం ఆదాయం",
    stat_today_rev: "ఈ రోజు ఆదాయం",
    stat_orders: "మొత్తం ఆర్డర్లు",
    stat_today_ord: "ఈ రోజు ఆర్డర్లు",
    stat_customers: "ఖాతాదారుల వివరాలు",
    stat_aov: "సగటు ఆర్డర్ విలువ (AOV)",
    stat_conv: "మార్పిడి రేటు",
    stat_visitors: "లైవ్ సందర్శకులు",
    stat_out_stock: "అయిపోయిన స్టాక్",
    stat_low_stock: "తక్కువగా ఉన్న స్టాక్",
    
    tbl_id: "ఆర్డర్ ఐడి",
    tbl_cust: "ఖాతాదారుడు",
    tbl_total: "చెల్లించిన మొత్తం",
    tbl_pay: "చెల్లింపు విధానం",
    tbl_status: "స్థితి (Status)",
    tbl_action: "చర్యలు",
    
    btn_add_saree: "చీరను జోడించు",
    btn_save_saree: "చీరను దాచు",
    btn_cancel: "రద్దు చేయి",
    btn_update_role: "పాత్రను మార్చు",
    
    lbl_logs_title: "భద్రత & అడ్మినిస్ట్రేటివ్ రికార్డులు",
    lbl_restrict: "పరిమిత స్టాఫ్ మోడ్",
    lbl_restrict_desc: "స్టాఫ్ ఖాతాలకు చదవడానికి మాత్రమే అనుమతి ఉంది. సెట్టింగ్‌లను మార్చడం లేదా ప్రోమో కోడ్‌లను జోడించడం నిలిపివేయబడింది.",
    lbl_role_switcher: "డెవలపర్ రోల్ స్విచ్చర్"
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, getAuthHeaders, logout } = useAuth();

  // Admin Dashboard Language Toggle: 'en' | 'te'
  const [adminLang, setAdminLang] = useState<'en' | 'te'>('en');

  // Tab State: 'overview' | 'products' | 'orders' | 'customers' | 'logs' | 'coupons'
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'logs' | 'coupons'>('overview');

  // Overview states
  const [analytics, setAnalytics] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [liveVisitors, setLiveVisitors] = useState(12);

  // Products states
  const [productsList, setProductsList] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for product addition/editing
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Silk');
  const [prodFabric, setProdFabric] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscount, setProdDiscount] = useState('0');
  const [prodStock, setProdStock] = useState('');
  const [prodColors, setProdColors] = useState(''); // comma separated
  const [prodImage, setProdImage] = useState(''); // base64 or URL

  // Orders states
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');

  // Customer states
  const [customersList, setCustomersList] = useState<any[]>([]);

  // Coupon form states
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponVal, setCouponVal] = useState('');
  const [couponMin, setCouponMin] = useState('0');
  const [couponExpiry, setCouponExpiry] = useState('30');

  // Activity logs
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Global triggers
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // 1. POLLING FOR REAL-TIME UPDATES (Simulates live saree order sales/visitors)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisitors(prev => {
        const offset = Math.floor(Math.random() * 5) - 2;
        return Math.max(4, prev + offset);
      });

      // Periodically trigger mock incoming sales to reflect in today's sales indicators
      if (analytics && Math.random() > 0.8) {
        setAnalytics((prev: any) => {
          if (!prev) return prev;
          const newOrderPrice = 4500;
          return {
            ...prev,
            summary: {
              ...prev.summary,
              totalOrders: prev.summary.totalOrders + 1,
              totalRevenue: prev.summary.totalRevenue + newOrderPrice,
              todayOrdersCount: prev.summary.todayOrdersCount + 1,
              todayRevenue: prev.summary.todayRevenue + newOrderPrice,
            }
          };
        });
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [analytics]);

  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Analytics
      const resAnal = await fetch(`${API_URL}/admin/analytics`, { headers: getAuthHeaders() });
      const analData = await resAnal.json();
      if (resAnal.ok) setAnalytics(analData);

      // 2. Fetch Low Stock
      const resStock = await fetch(`${API_URL}/admin/inventory-alerts`, { headers: getAuthHeaders() });
      const stockData = await resStock.json();
      if (resStock.ok) setLowStock(stockData);

      // 3. Fetch Products List
      const resProd = await fetch(`${API_URL}/products?limit=50`);
      const prodData = await resProd.json();
      if (resProd.ok) setProductsList(prodData.products || []);

      // 4. Fetch Orders
      const resOrd = await fetch(`${API_URL}/admin/orders`, { headers: getAuthHeaders() });
      const ordData = await resOrd.json();
      if (resOrd.ok) setOrdersList(ordData);

      // 5. Fetch Customers
      const resCust = await fetch(`${API_URL}/admin/users`, { headers: getAuthHeaders() });
      const custData = await resCust.json();
      if (resCust.ok) setCustomersList(custData);

      // 6. Fetch Activity Logs
      const resLogs = await fetch(`${API_URL}/admin/logs`, { headers: getAuthHeaders() });
      const logsData = await resLogs.json();
      if (resLogs.ok) setActivityLogs(logsData);

    } catch (err) {
      console.warn('API connection offline. Launching fallback admin sandbox logs.');
      // Initialize mockup data
      setAnalytics({
        summary: {
          totalOrders: 14,
          totalRevenue: 124500,
          totalUsers: 38,
          todayOrdersCount: 2,
          todayRevenue: 8998,
          pendingOrdersCount: 3,
          processingOrdersCount: 2,
          shippedOrdersCount: 4,
          deliveredOrdersCount: 5,
          cancelledOrdersCount: 0,
          outOfStockCount: 1,
          lowStockCount: 2,
          averageOrderValue: 8892,
          conversionRate: 3.4
        },
        topProducts: [
          { name: 'Kanchipuram Silk Bridal Saree', totalQty: 8, totalSales: 90000 },
          { name: 'Venkatagiri Fine Cotton Saree', totalQty: 12, totalSales: 28488 }
        ],
        salesHistory: [
          { _id: '2026-07-01', revenue: 15000, orders: 2 },
          { _id: '2026-07-02', revenue: 8999, orders: 1 },
          { _id: '2026-07-03', revenue: 25000, orders: 2 },
          { _id: '2026-07-04', revenue: 12500, orders: 1 },
          { _id: '2026-07-05', revenue: 35000, orders: 3 },
          { _id: '2026-07-06', revenue: 28000, orders: 2 }
        ]
      });
      setLowStock([
        { name: 'Gadwal Pure Handloom Saree', stock: 3, price: 5200, category: 'Handloom', images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=100&q=80'] }
      ]);
      setProductsList([
        { _id: 'p1', name: 'Kanchipuram Silk Bridal Saree', price: 12500, discount: 10, category: 'Bridal', stock: 8, fabric: 'Silk', colors: ['Maroon'], images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80'], isActive: true },
        { _id: 'p2', name: 'Venkatagiri Fine Cotton Saree', price: 2499, discount: 5, category: 'Cotton', stock: 15, fabric: 'Cotton', colors: ['Off-White'], images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=100&q=80'], isActive: true },
        { _id: 'p3', name: 'Gadwal Handloom Saree', price: 5200, discount: 10, category: 'Handloom', stock: 3, fabric: 'Cotton-Silk', colors: ['Emerald Green'], images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=100&q=80'], isActive: true }
      ]);
      setOrdersList([
        { _id: 'o_1001', createdAt: new Date().toISOString(), user: { name: 'Jaswanth Kumar', email: 'jaswanth@example.com' }, totalPrice: 11350, paymentMethod: 'Card', isPaid: true, orderStatus: 'Pending', trackingNumber: '', trackingCarrier: 'Delhivery' },
        { _id: 'o_1002', createdAt: new Date().toISOString(), user: { name: 'Telugu Saree Lover', email: 'user@srisakthi.com' }, totalPrice: 2499, paymentMethod: 'COD', isPaid: false, orderStatus: 'Processing', trackingNumber: '', trackingCarrier: 'Delhivery' }
      ]);
      setCustomersList([
        { _id: 'c1', name: 'Jaswanth Kumar', email: 'jaswanth@example.com', phone: '9988776655', role: 'user', createdAt: new Date().toISOString() },
        { _id: 'c2', name: 'Telugu Saree Lover', email: 'user@srisakthi.com', phone: '9000100020', role: 'user', createdAt: new Date().toISOString() }
      ]);
      setActivityLogs([
        { _id: 'log1', adminName: 'Super Admin', actionType: 'login', description: 'Admin logged in from NTR district gateway', createdAt: new Date().toISOString(), ipAddress: '192.168.1.1', userAgent: 'Chrome' },
        { _id: 'log2', adminName: 'Staff Employee', actionType: 'order_updated', description: 'Updated order status to Shipped', createdAt: new Date().toISOString(), ipAddress: '192.168.1.5', userAgent: 'Safari' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper translation lookup
  const at = (key: string) => {
    return adminTranslations[adminLang][key] || key;
  };

  // Switch roles for quick local developer test
  const handleDeveloperRoleSwitch = (newRole: 'super-admin' | 'admin' | 'staff' | 'user') => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    localStorage.setItem('sri_sakthi_user', JSON.stringify(updatedUser));
    // Force reload to apply guard changes immediately
    window.location.reload();
  };

  // Create/Edit Product
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === 'staff') {
      alert('Staff permission denied: Products mutations are restricted.');
      return;
    }

    setActionLoading(true);
    setStatusMsg('');

    try {
      const productBody = {
        name: prodName,
        price: Number(prodPrice),
        discount: Number(prodDiscount),
        category: prodCategory,
        fabric: prodFabric,
        stock: Number(prodStock),
        colors: prodColors.split(',').map(c => c.trim()),
        images: [prodImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80']
      };

      let res;
      if (editingProduct) {
        res = await fetch(`${API_URL}/admin/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(productBody)
        });
      } else {
        res = await fetch(`${API_URL}/admin/products`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(productBody)
        });
      }

      if (res.ok) {
        setStatusMsg(editingProduct ? 'Saree modified successfully!' : 'New Saree published successfully!');
        resetProductForm();
        loadAdminData();
      } else {
        setStatusMsg('Error saving Saree.');
      }
    } catch (err) {
      // Offline fallback simulation
      const mockNew = {
        _id: editingProduct?._id || `p_mock_${Date.now()}`,
        name: prodName,
        price: Number(prodPrice),
        discount: Number(prodDiscount),
        category: prodCategory,
        fabric: prodFabric,
        stock: Number(prodStock),
        colors: prodColors.split(',').map(c => c.trim()),
        images: [prodImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'],
        isActive: true
      };
      
      if (editingProduct) {
        setProductsList(prev => prev.map(p => p._id === editingProduct._id ? mockNew : p));
      } else {
        setProductsList(prev => [mockNew, ...prev]);
      }
      setStatusMsg('Saree saved locally (offline simulation).');
      resetProductForm();
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (p: any) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdFabric(p.fabric);
    setProdPrice(p.price.toString());
    setProdDiscount(p.discount.toString());
    setProdStock(p.stock.toString());
    setProdColors(p.colors.join(', '));
    setProdImage(p.images[0]);
    setShowAddForm(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory('Silk');
    setProdFabric('');
    setProdPrice('');
    setProdDiscount('0');
    setProdStock('');
    setProdColors('');
    setProdImage('');
    setShowAddForm(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (user?.role === 'staff') {
      alert('Staff permission denied: Saree delete is restricted.');
      return;
    }
    if (!confirm('Are you sure you want to disable this Saree?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      setProductsList(prev => prev.filter(p => p._id !== id));
      setStatusMsg('Saree disabled locally.');
    }
  };

  // Change User roles (Super-Admin only)
  const handleUserRoleChange = async (userId: string, targetRole: string) => {
    if (user?.role !== 'super-admin') {
      alert('Forbidden: Only Super-Admin can edit user authorization roles.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: targetRole })
      });
      if (res.ok) {
        setStatusMsg('User role updated successfully.');
        loadAdminData();
      } else {
        setStatusMsg('Failed to update role.');
      }
    } catch (err) {
      setCustomersList(prev => prev.map(c => c._id === userId ? { ...c, role: targetRole } : c));
      setStatusMsg('User role updated locally (sandbox simulation).');
    }
  };

  // Order status changes
  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status,
          trackingNumber: `DEL_${Math.floor(100000000 + Math.random() * 900000000)}`,
          trackingCarrier: 'Delhivery'
        })
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      setOrdersList(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
      setStatusMsg('Order status updated.');
    }
  };

  // Coupon configuration
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === 'staff') {
      alert('Staff permission denied: Coupon creation is restricted.');
      return;
    }

    setActionLoading(true);
    setStatusMsg('');
    try {
      const res = await fetch(`${API_URL}/admin/coupons`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          code: couponCode,
          discountType: couponType,
          discountValue: Number(couponVal),
          minOrderValue: Number(couponMin),
          expiryDays: Number(couponExpiry)
        })
      });
      if (res.ok) {
        setStatusMsg(`Coupon code ${couponCode.toUpperCase()} published!`);
        setCouponCode('');
        setCouponVal('');
        setCouponMin('0');
      } else {
        setStatusMsg('Failed to create coupon.');
      }
    } catch (err) {
      setStatusMsg(`Coupon code ${couponCode.toUpperCase()} added locally.`);
      setCouponCode('');
      setCouponVal('');
      setCouponMin('0');
    } finally {
      setActionLoading(false);
    }
  };

  // SECURE ROUTE GUARD RENDERING
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs font-light">
        Verifying credential token...
      </div>
    );
  }

  // 403 ACCESS DENIED SCREEN
  if (user.role === 'user') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 font-sans-lux text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif-lux text-2xl font-bold text-fg-custom">403 Access Denied</h1>
          <p className="text-xs text-fg-custom/60 font-light leading-relaxed">
            You don't have permission to access this page. Showroom management is restricted to administrators and store staff.
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="gold-gradient text-maroon-950 font-bold uppercase text-xs tracking-wider px-6 py-3 rounded-lg shadow"
        >
          Return to Storefront
        </button>

        {/* Developer Sandbox Switcher on 403 Screen */}
        <div className="pt-10 border-t border-card-border">
          <p className="text-[10px] text-fg-custom/40 font-bold uppercase tracking-wider mb-3">{at('lbl_role_switcher')}</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <button onClick={() => handleDeveloperRoleSwitch('super-admin')} className="text-[9px] bg-gold/15 text-gold font-bold px-2 py-1.5 rounded">Super Admin</button>
            <button onClick={() => handleDeveloperRoleSwitch('admin')} className="text-[9px] bg-gold/15 text-gold font-bold px-2 py-1.5 rounded">Admin</button>
            <button onClick={() => handleDeveloperRoleSwitch('staff')} className="text-[9px] bg-gold/15 text-gold font-bold px-2 py-1.5 rounded">Staff</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans-lux print:py-0 print:px-0">
      
      {/* Dashboard Top bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-card-border pb-6 space-y-4 sm:space-y-0 print:hidden">
        <div className="space-y-1">
          <h1 className="font-serif-lux text-3xl font-extrabold tracking-wide">{at('dash_title')}</h1>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            <p className="text-[10px] text-fg-custom/50 font-light">
              Logged in: <span className="font-bold text-fg-custom">{user.name}</span> | Role: <span className="uppercase font-extrabold text-gold">{user.role}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Dashboard Language Switcher */}
          <button 
            onClick={() => setAdminLang(l => l === 'en' ? 'te' : 'en')}
            className="flex items-center space-x-1 border border-card-border px-3 py-1.5 rounded-lg text-xs font-bold hover:border-gold hover:text-gold transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-gold" />
            <span>{adminLang === 'en' ? 'తెలుగు (Telugu)' : 'English'}</span>
          </button>

          <button
            onClick={logout}
            className="text-xs font-bold text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Staff restricted notification bar */}
      {user.role === 'staff' && (
        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start space-x-3 print:hidden">
          <Lock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider">{at('lbl_restrict')}</h4>
            <p className="text-[10px] text-fg-custom/70 font-light mt-0.5">{at('lbl_restrict_desc')}</p>
          </div>
        </div>
      )}

      {/* Tab Triggers */}
      <div className="flex flex-wrap gap-2 border-b border-card-border pb-2 print:hidden">
        {[
          { id: 'overview', label: at('tab_overview'), icon: TrendingUp },
          { id: 'products', label: at('tab_products'), icon: ShoppingBag },
          { id: 'orders', label: at('tab_orders'), icon: PackageCheck },
          { id: 'customers', label: at('tab_customers'), icon: Users },
          { id: 'logs', label: at('tab_logs'), icon: History },
          { id: 'coupons', label: at('tab_coupons'), icon: Percent }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setStatusMsg(''); }}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === tab.id
                  ? 'maroon-gradient text-white shadow'
                  : 'text-fg-custom/70 hover:bg-gold/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {statusMsg && (
        <div className="p-4 bg-gold/10 border border-gold/30 rounded-xl text-xs font-bold text-fg-custom print:hidden">
          {statusMsg}
        </div>
      )}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-10 animate-in fade-in-25 print:hidden">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card-custom border border-card-border p-5 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-fg-custom/50 flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-0.5 text-gold" />
                <span>{at('stat_revenue')}</span>
              </span>
              <p className="text-xl sm:text-2xl font-black text-gold">₹{analytics.summary.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            
            <div className="bg-card-custom border border-card-border p-5 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-fg-custom/50 flex items-center">
                <Activity className="w-3.5 h-3.5 mr-0.5 text-gold" />
                <span>{at('stat_today_rev')}</span>
              </span>
              <p className="text-xl sm:text-2xl font-black text-gold">₹{analytics.summary.todayRevenue.toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-card-custom border border-card-border p-5 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-fg-custom/50">{at('stat_today_ord')}</span>
              <p className="text-xl sm:text-2xl font-black text-fg-custom">{analytics.summary.todayOrdersCount}</p>
            </div>

            <div className="bg-card-custom border border-card-border p-5 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-fg-custom/50">{at('stat_visitors')}</span>
              <p className="text-xl sm:text-2xl font-black text-green-500 flex items-center space-x-1.5">
                <span>{liveVisitors}</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              </p>
            </div>

            <div className="bg-card-custom border border-card-border p-5 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-fg-custom/50">{at('stat_aov')}</span>
              <p className="text-xl sm:text-2xl font-black text-fg-custom">₹{analytics.summary.averageOrderValue.toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-card-custom border border-card-border p-5 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-fg-custom/50">{at('stat_conv')}</span>
              <p className="text-xl sm:text-2xl font-black text-fg-custom">{analytics.summary.conversionRate}%</p>
            </div>

            <div className="bg-card-custom border border-card-border p-5 rounded-2xl space-y-1 border-l-4 border-l-red-500">
              <span className="text-[10px] uppercase font-bold text-fg-custom/50">{at('stat_out_stock')}</span>
              <p className="text-xl sm:text-2xl font-black text-red-500">{analytics.summary.outOfStockCount}</p>
            </div>

            <div className="bg-card-custom border border-card-border p-5 rounded-2xl space-y-1 border-l-4 border-l-orange-500">
              <span className="text-[10px] uppercase font-bold text-fg-custom/50">{at('stat_low_stock')}</span>
              <p className="text-xl sm:text-2xl font-black text-orange-500">{analytics.summary.lowStockCount}</p>
            </div>
          </div>

          {/* Low Stock alerting bar */}
          {lowStock.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl space-y-3">
              <h3 className="font-serif-lux text-xs font-bold uppercase tracking-wider text-red-500 flex items-center">
                <AlertTriangle className="w-4.5 h-4.5 mr-1" />
                <span>Low Stock Warnings</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lowStock.map((prod, i) => (
                  <div key={i} className="flex justify-between items-center text-xs bg-card-custom p-3 rounded-lg border border-card-border">
                    <span className="font-bold">{prod.name}</span>
                    <span className="bg-red-500 text-white font-extrabold px-2 py-0.5 rounded text-[10px]">Stock: {prod.stock}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts & Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-card-custom border border-card-border p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-serif-lux text-xs font-bold uppercase tracking-wider text-fg-custom/80">10-Day Revenue Trend</h3>
              
              <div className="h-60 flex items-end space-x-3 pt-8 border-b border-card-border pb-2 overflow-x-auto">
                {analytics.salesHistory && analytics.salesHistory.map((day: any, i: number) => {
                  const maxVal = Math.max(...analytics.salesHistory.map((d: any) => d.revenue)) || 1;
                  const percentHeight = (day.revenue / maxVal) * 80;
                  return (
                    <div key={i} className="flex-grow flex flex-col items-center space-y-1.5 group cursor-pointer min-w-[50px]">
                      <span className="text-[8px] font-bold text-gold opacity-0 group-hover:opacity-100 transition-opacity">₹{Math.round(day.revenue/1000)}k</span>
                      <div 
                        className="w-full maroon-gradient rounded-t border-t border-gold/30 hover:opacity-85 transition-all shadow"
                        style={{ height: `${Math.max(10, percentHeight)}%` }}
                      ></div>
                      <span className="text-[9px] text-fg-custom/40 font-light">{day._id.substring(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-card-custom border border-card-border p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-serif-lux text-xs font-bold uppercase tracking-wider text-fg-custom/80">Best Sellers</h3>
              <div className="space-y-4">
                {analytics.topProducts && analytics.topProducts.map((p: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs border-b border-card-border pb-2.5 last:border-none last:pb-0">
                    <div className="space-y-0.5">
                      <p className="font-bold truncate max-w-[150px]">{p.name}</p>
                      <p className="text-[9px] text-fg-custom/50 font-light">{p.totalQty} items draped</p>
                    </div>
                    <span className="font-extrabold text-gold">₹{Math.round(p.totalSales).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. PRODUCTS INVENTORY TAB */}
      {activeTab === 'products' && (
        <div className="space-y-8 animate-in fade-in-25 print:hidden">
          
          <div className="flex justify-between items-center">
            <h2 className="font-serif-lux text-sm font-bold uppercase tracking-wider text-fg-custom/80">Saree Catalog List</h2>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                disabled={user.role === 'staff'}
                className="flex items-center space-x-1 maroon-gradient text-white border border-gold/20 font-bold uppercase text-[10px] tracking-wider px-4 py-2.5 rounded-lg shadow disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{at('btn_add_saree')}</span>
              </button>
            )}
          </div>

          {/* Add / Edit Form */}
          {showAddForm && (
            <form onSubmit={handleProductSubmit} className="bg-card-custom border border-card-border p-6 rounded-2xl shadow-md space-y-4">
              <h3 className="font-serif-lux text-xs font-bold uppercase tracking-wider text-gold">
                {editingProduct ? 'Modify Saree details' : 'Configure New Saree'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-fg-custom/60">Saree Title</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-fg-custom/60">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom font-medium"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c} Sarees</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-fg-custom/60">Fabric type</label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Mulberry Silk"
                    value={prodFabric}
                    onChange={(e) => setProdFabric(e.target.value)}
                    className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-fg-custom/60">Price (₹)</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-fg-custom/60">Discount (%)</label>
                  <input
                    type="number"
                    value={prodDiscount}
                    onChange={(e) => setProdDiscount(e.target.value)}
                    className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-fg-custom/60">Inventory Stock</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom font-medium"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-bold text-fg-custom/60">Saree Colors (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Maroon, Royal Gold, Red"
                    value={prodColors}
                    onChange={(e) => setProdColors(e.target.value)}
                    className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-fg-custom/60">Image Address URL</label>
                  <input
                    type="text"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom font-medium"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="border border-card-border text-fg-custom/80 font-bold uppercase text-[10px] py-3 px-6 rounded-lg hover:bg-gold/5"
                >
                  {at('btn_cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="gold-gradient text-maroon-950 font-bold uppercase text-[10px] py-3 px-8 rounded-lg shadow hover:opacity-90 transition-opacity"
                >
                  {editingProduct ? at('btn_save_saree') : 'Publish Saree'}
                </button>
              </div>
            </form>
          )}

          {/* Catalog grid table */}
          <div className="overflow-x-auto bg-card-custom border border-card-border rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs font-light text-fg-custom/95">
              <thead className="bg-bg-custom text-[10px] uppercase font-bold tracking-wider text-fg-custom/60 border-b border-card-border">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Saree Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {productsList.map((p) => (
                  <tr key={p._id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-3">
                      <img src={p.images[0]} alt={p.name} className="w-10 h-12 object-cover object-top rounded border border-card-border" />
                    </td>
                    <td className="px-6 py-3 font-medium">{p.name}</td>
                    <td className="px-6 py-3">{p.category}</td>
                    <td className="px-6 py-3 font-bold text-gold">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3">
                      <span className={`font-bold ${p.stock <= 5 ? 'text-red-500 font-black' : ''}`}>{p.stock}</span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleEditClick(p)} 
                          disabled={user.role === 'staff'}
                          className="p-2 border border-card-border rounded hover:border-gold text-fg-custom/65 hover:text-gold disabled:opacity-40"
                          title="Edit Saree"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p._id)} 
                          disabled={user.role === 'staff'}
                          className="p-2 border border-card-border rounded hover:border-red-500 text-fg-custom/65 hover:text-red-500 disabled:opacity-40"
                          title="Disable Saree"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 3. ORDER MANAGEMENT TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-8 animate-in fade-in-25 print:hidden">
          <h2 className="font-serif-lux text-sm font-bold uppercase tracking-wider text-fg-custom/80">Pending Store Sales</h2>

          <div className="overflow-x-auto bg-card-custom border border-card-border rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs font-light text-fg-custom/95">
              <thead className="bg-bg-custom text-[10px] uppercase font-bold tracking-wider text-fg-custom/60 border-b border-card-border">
                <tr>
                  <th className="px-6 py-4">{at('tbl_id')}</th>
                  <th className="px-6 py-4">{at('tbl_cust')}</th>
                  <th className="px-6 py-4">{at('tbl_total')}</th>
                  <th className="px-6 py-4">{at('tbl_pay')}</th>
                  <th className="px-6 py-4">{at('tbl_status')}</th>
                  <th className="px-6 py-4 text-center">{at('tbl_action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {ordersList.map((o) => (
                  <tr key={o._id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">{o._id.substring(0, 10)}...</td>
                    <td className="px-6 py-4">
                      <p className="font-bold">{o.user?.name || 'Walkin Customer'}</p>
                      <p className="text-[10px] text-fg-custom/50 font-light">{o.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-gold">₹{Math.round(o.totalPrice).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        o.isPaid ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {o.paymentMethod} {o.isPaid ? '(Paid)' : '(Unpaid)'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        o.orderStatus === 'Delivered'
                          ? 'bg-green-500 text-white'
                          : o.orderStatus === 'Shipped'
                          ? 'bg-blue-500 text-white'
                          : 'bg-yellow-500 text-maroon-950'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center space-x-2">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleOrderStatusUpdate(o._id, e.target.value)}
                          className="text-[10px] bg-bg-custom border border-card-border rounded px-2 py-1.5 focus:outline-none focus:border-gold font-bold text-fg-custom"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button 
                          onClick={() => setInvoiceOrder(o)}
                          className="p-1.5 border border-card-border rounded hover:border-gold hover:text-gold"
                          title="Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 4. CUSTOMERS & STAFF USER ROLES TAB */}
      {activeTab === 'customers' && (
        <div className="space-y-6 animate-in fade-in-25 print:hidden">
          <h2 className="font-serif-lux text-sm font-bold uppercase tracking-wider text-fg-custom/80">Showroom User Directory</h2>

          <div className="overflow-x-auto bg-card-custom border border-card-border rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs font-light text-fg-custom/95">
              <thead className="bg-bg-custom text-[10px] uppercase font-bold tracking-wider text-fg-custom/60 border-b border-card-border">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Authorization Role</th>
                  {user.role === 'super-admin' && <th className="px-6 py-4 text-center">Change Role</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {customersList.map((c) => (
                  <tr key={c._id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4 font-bold">{c.name}</td>
                    <td className="px-6 py-4 font-medium">{c.email}</td>
                    <td className="px-6 py-4">{c.phone || 'Google login'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                        c.role === 'super-admin' 
                          ? 'bg-red-500 text-white font-extrabold'
                          : c.role === 'admin'
                          ? 'bg-gold text-maroon-950'
                          : c.role === 'staff'
                          ? 'bg-blue-500 text-white'
                          : 'bg-fg-custom/10 text-fg-custom/60'
                      }`}>
                        {c.role || 'user'}
                      </span>
                    </td>
                    {user.role === 'super-admin' && (
                      <td className="px-6 py-4 text-center">
                        <select
                          value={c.role || 'user'}
                          onChange={(e) => handleUserRoleChange(c._id, e.target.value)}
                          className="text-[9px] bg-bg-custom border border-card-border rounded px-2 py-1 focus:outline-none focus:border-gold font-bold text-fg-custom"
                        >
                          <option value="user">Customer</option>
                          <option value="staff">Staff Employee</option>
                          <option value="admin">Admin</option>
                          <option value="super-admin">Super Admin</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 5. ACTIVITY LOGS AUDIT TAB */}
      {activeTab === 'logs' && (
        <div className="space-y-6 animate-in fade-in-25 print:hidden">
          <h2 className="font-serif-lux text-sm font-bold uppercase tracking-wider text-fg-custom/80">{at('lbl_logs_title')}</h2>

          <div className="overflow-x-auto bg-card-custom border border-card-border rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs font-light text-fg-custom/95">
              <thead className="bg-bg-custom text-[10px] uppercase font-bold tracking-wider text-fg-custom/60 border-b border-card-border">
                <tr>
                  <th className="px-6 py-4">Operator</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Browser/Device</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {activityLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4 font-bold">{log.adminName}</td>
                    <td className="px-6 py-4">
                      <span className="text-[9px] font-extrabold bg-gold/10 text-gold px-2 py-0.5 rounded uppercase">{log.actionType}</span>
                    </td>
                    <td className="px-6 py-4 font-light">{log.description}</td>
                    <td className="px-6 py-4 font-mono text-fg-custom/50 text-[10px]">{log.ipAddress || 'unknown'}</td>
                    <td className="px-6 py-4 truncate max-w-[120px] text-fg-custom/50 text-[10px]">{log.userAgent || 'system'}</td>
                    <td className="px-6 py-4 text-[10px] font-light">{new Date(log.createdAt || log.timestamp).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 6. CONFIGURE COUPONS TAB */}
      {activeTab === 'coupons' && (
        <div className="space-y-8 animate-in fade-in-25 print:hidden">
          <h2 className="font-serif-lux text-sm font-bold uppercase tracking-wider text-fg-custom/80">Store Promotions</h2>

          <form onSubmit={handleCouponSubmit} className="bg-card-custom border border-card-border p-6 rounded-2xl shadow-sm space-y-4 max-w-md">
            <h3 className="font-serif-lux text-xs font-bold uppercase tracking-wider text-gold flex items-center">
              <Percent className="w-4 h-4 text-gold mr-1" />
              <span>Configure Discount Code</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-fg-custom/60">Promo Code</label>
                <input
                  type="text"
                  placeholder="e.g. SHAKTHI25"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={user.role === 'staff'}
                  className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom uppercase font-extrabold disabled:opacity-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-fg-custom/60">Type</label>
                <select
                  value={couponType}
                  onChange={(e) => setCouponType(e.target.value as any)}
                  disabled={user.role === 'staff'}
                  className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom font-medium disabled:opacity-50"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Cash (₹)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-fg-custom/60">Discount value</label>
                <input
                  type="number"
                  placeholder="e.g. 25 or 1000"
                  value={couponVal}
                  onChange={(e) => setCouponVal(e.target.value)}
                  disabled={user.role === 'staff'}
                  className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom font-medium disabled:opacity-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-fg-custom/60">Min Order Requirement</label>
                <input
                  type="number"
                  value={couponMin}
                  onChange={(e) => setCouponMin(e.target.value)}
                  disabled={user.role === 'staff'}
                  className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom font-medium disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading || user.role === 'staff'}
              className="w-full gold-gradient text-maroon-950 font-bold uppercase text-[10px] tracking-wider py-3.5 rounded-lg shadow hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {actionLoading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : <span>Publish Coupon</span>}
            </button>
          </form>
        </div>
      )}

      {/* DETAILED PRINT INVOICE MODAL SELECTOR (Visible on print trigger) */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 print:relative print:bg-white print:p-0 print:z-0">
          <div className="bg-card-custom border border-card-border p-6 rounded-2xl max-w-xl w-full space-y-6 shadow-2xl relative print:border-none print:shadow-none print:p-0">
            
            {/* Format Selector Tab (Hidden during Print) */}
            <div className="flex justify-between items-center border-b border-card-border pb-4 print:hidden">
              <h3 className="font-serif-lux text-sm font-bold text-fg-custom">Select Invoice Print Format</h3>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setPrintFormat('a4')}
                  className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded ${
                    printFormat === 'a4' ? 'maroon-gradient text-white' : 'border border-card-border text-fg-custom/70'
                  }`}
                >
                  Standard A4 Paper
                </button>
                <button
                  onClick={() => setPrintFormat('thermal')}
                  className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded ${
                    printFormat === 'thermal' ? 'maroon-gradient text-white' : 'border border-card-border text-fg-custom/70'
                  }`}
                >
                  80mm Thermal Receipt
                </button>
              </div>
            </div>

            {/* A4 PRINT VIEW LAYOUT */}
            {printFormat === 'a4' ? (
              <div className="space-y-6 p-4 bg-white text-gray-800 border border-gray-200 rounded-xl print:border-none print:p-0">
                <div className="flex justify-between items-start border-b-2 border-red-800 pb-3">
                  <div>
                    <h2 className="font-serif-lux text-xl font-extrabold tracking-wide text-red-800 uppercase">Sri Sakthi Sarees</h2>
                    <p className="text-[10px] text-gray-500 font-light">Raithupeta, Nandigama, NTR District, Andhra Pradesh</p>
                  </div>
                  <div className="text-right text-[10px] text-gray-500">
                    <p className="font-bold text-gray-800">TAX INVOICE</p>
                    <p>Order ID: {invoiceOrder._id.substring(0, 12)}...</p>
                    <p>Date: {new Date(invoiceOrder.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-600 font-light">
                  <div>
                    <p className="font-bold text-gray-700">Billing / Shipping Details:</p>
                    <p className="font-medium text-gray-850">{invoiceOrder.shippingAddress?.name}</p>
                    <p>{invoiceOrder.shippingAddress?.addressLine}</p>
                    <p>{invoiceOrder.shippingAddress?.city}, {invoiceOrder.shippingAddress?.state} - {invoiceOrder.shippingAddress?.pinCode}</p>
                    <p>Phone: {invoiceOrder.shippingAddress?.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-700">Payment Summary:</p>
                    <p>Method: {invoiceOrder.paymentMethod}</p>
                    <p>Status: {invoiceOrder.isPaid ? 'PAID' : 'PENDING'}</p>
                  </div>
                </div>

                <table className="w-full text-left text-[10px] text-gray-700 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300 text-gray-500 uppercase">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoiceOrder.items && invoiceOrder.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 font-medium">{item.name} ({item.color})</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t border-gray-300 pt-3 flex flex-col items-end text-[10px] font-bold">
                  <div className="flex justify-between w-40 text-gray-650 font-normal">
                    <span>Subtotal</span>
                    <span>₹{invoiceOrder.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between w-40 text-red-800 border-t border-gray-300 pt-1.5">
                    <span>Total Amount</span>
                    <span>₹{invoiceOrder.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ) : (
              // 80mm THERMAL RECEIPT LAYOUT
              <div className="space-y-4 p-4 bg-white text-black font-mono text-[9px] border border-gray-300 rounded max-w-[280px] mx-auto print:border-none print:p-0">
                <div className="text-center space-y-1">
                  <h4 className="font-bold text-sm uppercase tracking-wide">SRI SAKTHI SAREES</h4>
                  <p>RAITHUPETA, NANDIGAMA</p>
                  <p>TEL: +91 99999 88888</p>
                  <p>-------------------------</p>
                </div>
                
                <div className="space-y-0.5">
                  <p>ORDER ID: {invoiceOrder._id.substring(0, 10)}</p>
                  <p>DATE: {new Date(invoiceOrder.createdAt).toLocaleDateString('en-IN')}</p>
                  <p>CUST: {invoiceOrder.shippingAddress?.name}</p>
                  <p>-------------------------</p>
                </div>

                <div className="space-y-1">
                  {invoiceOrder.items && invoiceOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.name.substring(0, 16)} x{item.quantity}</span>
                      <span>₹{Math.round(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <p>-------------------------</p>
                </div>

                <div className="flex justify-between font-bold">
                  <span>TOTAL PAID</span>
                  <span>₹{invoiceOrder.totalPrice}</span>
                </div>
                
                <div className="text-center pt-4 space-y-1">
                  <p>THANK YOU FOR SHOPPING!</p>
                  <p>Sri Sakthi traditional luxury.</p>
                </div>
              </div>
            )}

            {/* Print Confirmation Footer */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-card-border print:hidden">
              <button
                onClick={() => setInvoiceOrder(null)}
                className="border border-card-border text-fg-custom/80 font-bold uppercase text-[10px] py-2 px-5 rounded-lg hover:bg-gold/5"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="gold-gradient text-maroon-950 font-bold uppercase text-[10px] py-2 px-6 rounded-lg shadow hover:opacity-90 flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print receipt</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Developer Access RBAC Role Switcher Panel (Hidden during Print) */}
      <div className="fixed bottom-6 left-6 z-50 bg-card-custom border border-gold/30 rounded-xl p-3 shadow-2xl space-y-2 max-w-[200px] border-t-2 border-t-gold print:hidden">
        <span className="text-[8px] uppercase tracking-wider font-extrabold text-gold flex items-center justify-center">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          <span>{at('lbl_role_switcher')}</span>
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button 
            onClick={() => handleDeveloperRoleSwitch('super-admin')} 
            className={`text-[8px] font-bold px-1.5 py-1 rounded transition-colors ${
              user.role === 'super-admin' ? 'maroon-gradient text-white' : 'bg-gold/10 text-fg-custom hover:bg-gold/20'
            }`}
          >
            Super
          </button>
          <button 
            onClick={() => handleDeveloperRoleSwitch('admin')}
            className={`text-[8px] font-bold px-1.5 py-1 rounded transition-colors ${
              user.role === 'admin' ? 'maroon-gradient text-white' : 'bg-gold/10 text-fg-custom hover:bg-gold/20'
            }`}
          >
            Admin
          </button>
          <button 
            onClick={() => handleDeveloperRoleSwitch('staff')}
            className={`text-[8px] font-bold px-1.5 py-1 rounded transition-colors ${
              user.role === 'staff' ? 'maroon-gradient text-white' : 'bg-gold/10 text-fg-custom hover:bg-gold/20'
            }`}
          >
            Staff
          </button>
          <button 
            onClick={() => handleDeveloperRoleSwitch('user')}
            className={`text-[8px] font-bold px-1.5 py-1 rounded transition-colors ${
              user.role === 'user' ? 'maroon-gradient text-white' : 'bg-gold/10 text-fg-custom hover:bg-gold/20'
            }`}
          >
            Customer
          </button>
        </div>
        <p className="text-[7px] text-center text-fg-custom/40 font-light">Switch session roles instantly to test RBAC path guards.</p>
      </div>

    </div>
  );
}
