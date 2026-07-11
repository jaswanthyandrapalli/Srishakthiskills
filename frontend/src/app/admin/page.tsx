'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, API_URL } from '@/context/AuthContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Percent, 
  PackageCheck,
  CheckCircle,
  Truck,
  Loader,
  Lock,
  Globe,
  Printer,
  History,
  ShieldCheck,
  DollarSign,
  Activity,
  Layers,
  ArrowRight,
  UserCheck,
  MapPin,
  Calendar,
  X,
  CreditCard,
  Eye,
  FileImage,
  Inbox
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
    stat_products: "Total Products",
    stat_pending_ord: "Pending Orders",
    stat_delivered_ord: "Delivered Orders",
    stat_cancelled_ord: "Cancelled Orders",
    
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
    stat_products: "మొత్తం చీరలు",
    stat_pending_ord: "పెండింగ్ ఆర్డర్లు",
    stat_delivered_ord: "పంపిణీ చేసిన ఆర్డర్లు",
    stat_cancelled_ord: "రద్దయిన ఆర్డర్లు",
    
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
  const { user, loading: authLoading, getAuthHeaders, logout } = useAuth();
  const currentRole = user?.role || '';

  // Admin Dashboard Language Toggle: 'en' | 'te'
  const [adminLang, setAdminLang] = useState<'en' | 'te'>('en');

  // Tab State: 'overview' | 'products' | 'orders' | 'customers' | 'logs' | 'coupons'
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'logs' | 'coupons'>('overview');

  // Period filter for charts: 'daily' | 'weekly' | 'monthly' | 'yearly'
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  // Overview / Analytics states
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
  const [imagePreview, setImagePreview] = useState('');

  // Orders states
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');

  // Customer states
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<any>(null);

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

  // Sidebar visibility on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1. ROUTE GUARD: Redirect normal users to the home page if they try to access admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=admin');
      } else if ((user.role as any) !== 'admin' && (user.role as any) !== 'super-admin' && (user.role as any) !== 'staff') {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  // Polling for live visitors simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisitors(prev => {
        const offset = Math.floor(Math.random() * 5) - 2;
        return Math.max(4, prev + offset);
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all initial data
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super-admin' || user.role === 'staff')) {
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
      const resProd = await fetch(`${API_URL}/products?limit=100`);
      const prodData = await resProd.json();
      if (resProd.ok) setProductsList(prodData.products || []);

      // 4. Fetch Orders
      const resOrd = await fetch(`${API_URL}/admin/orders`, { headers: getAuthHeaders() });
      const ordData = await resOrd.json();
      if (resOrd.ok) setOrdersList(ordData);

      // 5. Fetch Customers (now aggregates spending & order count)
      const resCust = await fetch(`${API_URL}/admin/users`, { headers: getAuthHeaders() });
      const custData = await resCust.json();
      if (resCust.ok) setCustomersList(custData);

      // 6. Fetch Activity Logs
      const resLogs = await fetch(`${API_URL}/admin/logs`, { headers: getAuthHeaders() });
      const logsData = await resLogs.json();
      if (resLogs.ok) setActivityLogs(logsData);

    } catch (err) {
      console.warn('API connection offline. Launching fallback mock sandbox.');
      // Initialize mockup data
      const mockDaily = [
        { _id: '2026-07-07', revenue: 12500, orders: 2 },
        { _id: '2026-07-08', revenue: 8900, orders: 1 },
        { _id: '2026-07-09', revenue: 25000, orders: 3 },
        { _id: '2026-07-10', revenue: 15400, orders: 2 },
        { _id: '2026-07-11', revenue: 21998, orders: 3 }
      ];
      setAnalytics({
        summary: {
          totalOrders: 18,
          totalRevenue: 183800,
          totalUsers: 42,
          totalProducts: 15,
          todayOrdersCount: 3,
          todayRevenue: 21998,
          pendingOrdersCount: 4,
          processingOrdersCount: 3,
          shippedOrdersCount: 5,
          deliveredOrdersCount: 6,
          cancelledOrdersCount: 0,
          outOfStockCount: 2,
          lowStockCount: 3,
          averageOrderValue: 10211,
          conversionRate: 3.6
        },
        topProducts: [
          { name: 'Kanchipuram Silk Bridal Saree', totalQty: 10, totalSales: 125000 },
          { name: 'Venkatagiri Fine Cotton Saree', totalQty: 14, totalSales: 34986 }
        ],
        salesHistory: mockDaily,
        charts: {
          daily: mockDaily,
          weekly: [
            { _id: '2026-W26', revenue: 45000, orders: 4 },
            { _id: '2026-W27', revenue: 58000, orders: 6 },
            { _id: '2026-W28', revenue: 80800, orders: 8 }
          ],
          monthly: [
            { _id: '2026-05', revenue: 65000, orders: 6 },
            { _id: '2026-06', revenue: 95000, orders: 9 },
            { _id: '2026-07', revenue: 23800, orders: 3 }
          ],
          yearly: [
            { _id: '2025', revenue: 420000, orders: 40 },
            { _id: '2026', revenue: 183800, orders: 18 }
          ]
        }
      });
      setLowStock([
        { name: 'Gadwal Pure Handloom Saree', stock: 3, price: 5200, category: 'Handloom', images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=100&q=80'] }
      ]);
      setProductsList([
        { _id: 'p1', name: 'Kanchipuram Silk Bridal Saree', price: 12500, discount: 10, category: 'Bridal', stock: 8, fabric: 'Silk', colors: ['Maroon', 'Gold'], images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80'], isActive: true },
        { _id: 'p2', name: 'Venkatagiri Fine Cotton Saree', price: 2499, discount: 5, category: 'Cotton', stock: 15, fabric: 'Cotton', colors: ['Off-White'], images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=100&q=80'], isActive: true },
        { _id: 'p3', name: 'Gadwal Handloom Saree', price: 5200, discount: 10, category: 'Handloom', stock: 3, fabric: 'Cotton-Silk', colors: ['Emerald Green'], images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=100&q=80'], isActive: true }
      ]);
      setOrdersList([
        { _id: 'o_1001', createdAt: new Date().toISOString(), user: { name: 'Jaswanth Kumar', email: 'jaswanth@example.com', phone: '9988776655' }, shippingAddress: { name: 'Jaswanth Kumar', addressLine: '12-4, Raithupeta', city: 'Nandigama', state: 'Andhra Pradesh', pinCode: '521185', phone: '9988776655' }, items: [{ name: 'Kanchipuram Silk Bridal Saree', price: 11250, quantity: 1, color: 'Maroon' }], totalPrice: 11350, paymentMethod: 'Card', isPaid: true, orderStatus: 'Pending', trackingNumber: '', trackingCarrier: 'Delhivery' },
        { _id: 'o_1002', createdAt: new Date().toISOString(), user: { name: 'Telugu Saree Lover', email: 'user@srisakthi.com', phone: '9000100020' }, shippingAddress: { name: 'Telugu Saree Lover', addressLine: 'Main Bazar', city: 'Vijayawada', state: 'Andhra Pradesh', pinCode: '520001', phone: '9000100020' }, items: [{ name: 'Venkatagiri Fine Cotton Saree', price: 2374, quantity: 1, color: 'Off-White' }], totalPrice: 2474, paymentMethod: 'COD', isPaid: false, orderStatus: 'Processing', trackingNumber: '', trackingCarrier: 'Delhivery' }
      ]);
      setCustomersList([
        { _id: 'c1', name: 'Jaswanth Kumar', email: 'jaswanth@example.com', phone: '9988776655', role: 'user', createdAt: new Date().toISOString(), orderCount: 2, totalSpent: 22600, orderHistory: [{ _id: 'o_1001', createdAt: new Date().toISOString(), totalPrice: 11300, orderStatus: 'Delivered', isPaid: true }] },
        { _id: 'c2', name: 'Telugu Saree Lover', email: 'user@srisakthi.com', phone: '9000100020', role: 'user', createdAt: new Date().toISOString(), orderCount: 1, totalSpent: 0, orderHistory: [{ _id: 'o_1002', createdAt: new Date().toISOString(), totalPrice: 2474, orderStatus: 'Processing', isPaid: false }] }
      ]);
      setActivityLogs([
        { _id: 'log1', adminName: 'Super Admin', actionType: 'login', description: 'Admin logged in from NTR district gateway', createdAt: new Date().toISOString(), ipAddress: '192.168.1.1', userAgent: 'Chrome' },
        { _id: 'log2', adminName: 'Staff Employee', actionType: 'order_updated', description: 'Updated order status to Shipped', createdAt: new Date().toISOString(), ipAddress: '192.168.1.5', userAgent: 'Safari' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const at = (key: string) => {
    return adminTranslations[adminLang][key] || key;
  };

  const handleDeveloperRoleSwitch = (newRole: 'super-admin' | 'admin' | 'staff' | 'user') => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    localStorage.setItem('sri_sakthi_user', JSON.stringify(updatedUser));
    window.location.reload();
  };

  // Base64 file reader trigger
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProdImage(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create/Edit Product
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === 'staff') {
      alert('Staff permission denied: Product modification is restricted.');
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
        images: prodImage ? [prodImage] : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80']
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
        images: [imagePreview || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'],
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
    setImagePreview(p.images[0]);
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
    setImagePreview('');
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

  // Helper to fetch chart data safely
  const getChartData = () => {
    if (analytics?.charts) {
      return analytics.charts[chartPeriod] || [];
    }
    return analytics?.salesHistory || [];
  };

  if (authLoading || loading && !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3 font-sans-lux">
        <Loader className="w-8 h-8 text-gold animate-spin" />
        <p className="text-xs uppercase tracking-widest gold-text-gradient font-bold animate-pulse">Loading Administrative Portal...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin' && user.role !== 'staff')) {
    return null; // Route guard is redirecting
  }

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-bg-custom text-fg-custom font-sans-lux flex flex-col md:flex-row relative">
      
      {/* 📱 MOBILE NAVIGATION HEADER */}
      <div className="md:hidden flex justify-between items-center bg-card-custom border-b border-card-border p-4 sticky top-0 z-40 print:hidden">
        <h2 className="font-serif-lux text-md font-bold gold-text-gradient">Sri Sakthi Admin</h2>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 border border-card-border rounded text-gold"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

      {/* 🧭 SIDEBAR NAVIGATION PANEL */}
      <aside className={`w-full md:w-64 bg-card-custom border-r border-card-border flex flex-col justify-between py-6 md:sticky md:top-20 md:h-[calc(100vh-80px)] z-30 transition-transform duration-200 print:hidden ${
        sidebarOpen ? 'block' : 'hidden md:flex'
      }`}>
        <div className="space-y-6">
          <div className="px-6 hidden md:block">
            <h2 className="font-serif-lux text-lg font-extrabold gold-text-gradient tracking-wider uppercase">Sri Sakthi Sarees</h2>
            <p className="text-[8px] text-fg-custom/40 uppercase tracking-widest font-light">Showroom Control Deck</p>
          </div>

          <nav className="space-y-1.5 px-3">
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
                  onClick={() => { 
                    setActiveTab(tab.id as any); 
                    setStatusMsg(''); 
                    setSidebarOpen(false); 
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? 'maroon-gradient text-white shadow-lg border border-gold/15'
                      : 'text-fg-custom/75 hover:bg-gold/10 hover:text-gold'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="px-6 border-t border-card-border pt-4 mt-6 text-center space-y-3">
          <div className="text-left">
            <p className="text-[9px] uppercase font-bold text-fg-custom/50">Active Operator</p>
            <p className="text-xs font-bold truncate">{user.name}</p>
            <span className="text-[9px] bg-gold/15 text-gold font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">{user.role}</span>
          </div>

          <div className="flex gap-2 justify-between">
            <button 
              onClick={() => setAdminLang(l => l === 'en' ? 'te' : 'en')}
              className="flex-grow flex items-center justify-center space-x-1 border border-card-border py-1.5 rounded-lg text-[9px] font-bold hover:border-gold hover:text-gold transition-colors cursor-pointer"
            >
              <Globe className="w-3 h-3 text-gold" />
              <span>{adminLang === 'en' ? 'తెలుగు' : 'EN'}</span>
            </button>
            <button
              onClick={logout}
              className="flex-grow text-[9px] font-bold text-red-500 border border-red-500/20 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* 🖥️ MAIN CONTENT FRAME */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-8 print:p-0 print:m-0">
        
        {/* Top notification for staff */}
        {user.role === 'staff' && (
          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start space-x-3 print:hidden">
            <Lock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider">{at('lbl_restrict')}</h4>
              <p className="text-[10px] text-fg-custom/70 font-light mt-0.5">{at('lbl_restrict_desc')}</p>
            </div>
          </div>
        )}

        {statusMsg && (
          <div className="p-4 bg-gold/10 border border-gold/30 rounded-xl text-xs font-bold text-fg-custom print:hidden flex justify-between items-center">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg('')} className="p-0.5 text-fg-custom/40 hover:text-fg-custom">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 📊 1. OVERVIEW TAB */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-10 animate-in fade-in-25 duration-200 print:hidden">
            
            {/* 10 Dashboard Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              
              <div className="bg-card-custom border border-card-border p-4.5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[9px] uppercase font-bold text-fg-custom/50 flex items-center">
                  <DollarSign className="w-3.5 h-3.5 mr-0.5 text-gold" />
                  <span>{at('stat_revenue')}</span>
                </span>
                <p className="text-lg sm:text-xl font-black text-gold">₹{analytics.summary.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              
              <div className="bg-card-custom border border-card-border p-4.5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[9px] uppercase font-bold text-fg-custom/50 flex items-center">
                  <Activity className="w-3.5 h-3.5 mr-0.5 text-gold" />
                  <span>{at('stat_today_rev')}</span>
                </span>
                <p className="text-lg sm:text-xl font-black text-gold">₹{analytics.summary.todayRevenue.toLocaleString('en-IN')}</p>
              </div>

              <div className="bg-card-custom border border-card-border p-4.5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[9px] uppercase font-bold text-fg-custom/50 flex items-center">
                  <PackageCheck className="w-3.5 h-3.5 mr-0.5 text-fg-custom/40" />
                  <span>{at('stat_orders')}</span>
                </span>
                <p className="text-lg sm:text-xl font-black text-fg-custom">{analytics.summary.totalOrders}</p>
              </div>

              <div className="bg-card-custom border border-card-border p-4.5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[9px] uppercase font-bold text-fg-custom/50">Today's Orders</span>
                <p className="text-lg sm:text-xl font-black text-fg-custom">{analytics.summary.todayOrdersCount}</p>
              </div>

              <div className="bg-card-custom border border-card-border p-4.5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[9px] uppercase font-bold text-fg-custom/50 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-0.5 text-fg-custom/40" />
                  <span>Customers</span>
                </span>
                <p className="text-lg sm:text-xl font-black text-fg-custom">{analytics.summary.totalUsers}</p>
              </div>

              <div className="bg-card-custom border border-card-border p-4.5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[9px] uppercase font-bold text-fg-custom/50">Pending Orders</span>
                <p className="text-lg sm:text-xl font-black text-yellow-500">{analytics.summary.pendingOrdersCount}</p>
              </div>

              <div className="bg-card-custom border border-card-border p-4.5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[9px] uppercase font-bold text-fg-custom/50">Delivered Orders</span>
                <p className="text-lg sm:text-xl font-black text-green-500">{analytics.summary.deliveredOrdersCount}</p>
              </div>

              <div className="bg-card-custom border border-card-border p-4.5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[9px] uppercase font-bold text-fg-custom/50">Cancelled Orders</span>
                <p className="text-lg sm:text-xl font-black text-red-500">{analytics.summary.cancelledOrdersCount}</p>
              </div>

              <div className="bg-card-custom border border-card-border p-4.5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[9px] uppercase font-bold text-fg-custom/50">Total Products</span>
                <p className="text-lg sm:text-xl font-black text-fg-custom">{analytics.summary.totalProducts || productsList.length}</p>
              </div>

              <div className="bg-card-custom border border-card-border p-4.5 rounded-2xl shadow-sm space-y-1 border-l-4 border-l-orange-500">
                <span className="text-[9px] uppercase font-bold text-fg-custom/50">Low Stock</span>
                <p className="text-lg sm:text-xl font-black text-orange-550">{analytics.summary.lowStockCount}</p>
              </div>
            </div>

            {/* Low & Out of stock warning banner */}
            {lowStock.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl space-y-3">
                <h3 className="font-serif-lux text-xs font-bold uppercase tracking-wider text-red-500 flex items-center">
                  <AlertTriangle className="w-4.5 h-4.5 mr-1.5" />
                  <span>Inventory Warnings (Low/Out of Stock)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {lowStock.map((prod, i) => (
                    <div key={i} className="flex justify-between items-center text-xs bg-card-custom p-3 rounded-lg border border-card-border">
                      <span className="font-bold truncate max-w-[140px]">{prod.name}</span>
                      <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] ${
                        prod.stock === 0 ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                      }`}>
                        {prod.stock === 0 ? 'OUT OF STOCK' : `Stock: ${prod.stock}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Charts & Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sales Period Chart */}
              <div className="lg:col-span-2 bg-card-custom border border-card-border p-6 rounded-2xl shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif-lux text-xs font-bold uppercase tracking-wider text-fg-custom/80">Revenue Analytics</h3>
                  
                  {/* Period Switcher tabs */}
                  <div className="flex bg-bg-custom p-1 rounded-lg border border-card-border">
                    {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setChartPeriod(period as any)}
                        className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded transition-all cursor-pointer ${
                          chartPeriod === period ? 'maroon-gradient text-white' : 'text-fg-custom/50 hover:text-fg-custom'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                
                {chartData && chartData.length > 0 ? (
                  <div className="h-60 flex items-end space-x-3 pt-8 border-b border-card-border pb-2 overflow-x-auto scrollbar-thin">
                    {chartData.map((bucket: any, i: number) => {
                      const maxVal = Math.max(...chartData.map((d: any) => d.revenue)) || 1;
                      const percentHeight = (bucket.revenue / maxVal) * 80;
                      return (
                        <div key={i} className="flex-grow flex flex-col items-center space-y-1.5 group cursor-pointer min-w-[60px]">
                          <span className="text-[8px] font-bold text-gold opacity-0 group-hover:opacity-100 transition-opacity">₹{Math.round(bucket.revenue).toLocaleString('en-IN')}</span>
                          <div 
                            className="w-full maroon-gradient rounded-t border-t border-gold/30 hover:opacity-85 transition-all shadow"
                            style={{ height: `${Math.max(10, percentHeight)}%` }}
                          ></div>
                          <span className="text-[9px] text-fg-custom/40 font-light truncate max-w-full">{bucket._id}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-60 flex items-center justify-center text-xs text-fg-custom/40">
                    No sales data logged for this period
                  </div>
                )}
              </div>

              {/* Best Sellers */}
              <div className="bg-card-custom border border-card-border p-6 rounded-2xl shadow-sm space-y-6">
                <h3 className="font-serif-lux text-xs font-bold uppercase tracking-wider text-fg-custom/80">Best Sellers</h3>
                <div className="space-y-4">
                  {analytics.topProducts && analytics.topProducts.length > 0 ? (
                    analytics.topProducts.map((p: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-xs border-b border-card-border pb-3.5 last:border-none last:pb-0">
                        <div className="space-y-0.5">
                          <p className="font-bold truncate max-w-[160px]">{p.name}</p>
                          <p className="text-[9px] text-fg-custom/50 font-light">{p.totalQty} items draped</p>
                        </div>
                        <span className="font-extrabold text-gold">₹{Math.round(p.totalSales).toLocaleString('en-IN')}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-xs text-fg-custom/45">No items ordered yet</div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 🛍️ 2. PRODUCTS INVENTORY TAB */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-in fade-in-25 duration-200 print:hidden">
            
            <div className="flex justify-between items-center">
              <h2 className="font-serif-lux text-sm font-bold uppercase tracking-wider text-fg-custom/80">Saree Catalog List</h2>
              {!showAddForm && (
                <button
                  onClick={() => { setShowAddForm(true); resetProductForm(); }}
                  disabled={user.role === 'staff'}
                  className="flex items-center space-x-1.5 maroon-gradient text-white border border-gold/20 font-bold uppercase text-[10px] tracking-wider px-4 py-2.5 rounded-lg shadow disabled:opacity-50 cursor-pointer hover:opacity-95"
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
                    <label className="text-[9px] uppercase font-bold text-fg-custom/60 flex items-center space-x-1">
                      <FileImage className="w-3.5 h-3.5 text-gold" />
                      <span>Select Saree Image</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2 focus:outline-none focus:border-gold text-fg-custom file:mr-2 file:py-1.5 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-gold/15 file:text-gold hover:file:bg-gold/25"
                    />
                  </div>
                </div>

                {imagePreview && (
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-bold text-fg-custom/50">Image Preview</p>
                    <img src={imagePreview} alt="Preview" className="w-16 h-20 object-cover object-top rounded border border-card-border shadow-md" />
                  </div>
                )}

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="border border-card-border text-fg-custom/80 font-bold uppercase text-[10px] py-3 px-6 rounded-lg hover:bg-gold/5 cursor-pointer"
                  >
                    {at('btn_cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="gold-gradient text-maroon-950 font-bold uppercase text-[10px] py-3 px-8 rounded-lg shadow hover:opacity-90 transition-opacity cursor-pointer"
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
                      <td className="px-6 py-3 font-bold text-gold">
                        ₹{p.price.toLocaleString('en-IN')}
                        {p.discount > 0 && <span className="text-[9px] text-red-500 font-extrabold ml-1.5">-{p.discount}%</span>}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`font-bold ${p.stock <= 5 ? 'text-red-550 font-black' : ''}`}>{p.stock}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleEditClick(p)} 
                            disabled={user.role === 'staff'}
                            className="p-2 border border-card-border rounded hover:border-gold text-fg-custom/65 hover:text-gold disabled:opacity-40 cursor-pointer"
                            title="Edit Saree"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p._id)} 
                            disabled={user.role === 'staff'}
                            className="p-2 border border-card-border rounded hover:border-red-500 text-fg-custom/65 hover:text-red-500 disabled:opacity-40 cursor-pointer"
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

        {/* ========================================================================= */}
        {/* 📦 3. ORDER MANAGEMENT TAB */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-in fade-in-25 duration-200 print:hidden">
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
                      <td className="px-6 py-4 font-mono font-medium">{o._id.substring(0, 12)}...</td>
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
                            : o.orderStatus === 'Cancelled'
                            ? 'bg-red-500 text-white'
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
                            onClick={() => setSelectedOrderDetail(o)}
                            className="p-1.5 border border-card-border rounded hover:border-gold hover:text-gold cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setInvoiceOrder(o)}
                            className="p-1.5 border border-card-border rounded hover:border-gold hover:text-gold cursor-pointer"
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

        {/* ========================================================================= */}
        {/* 👥 4. CUSTOMERS & STAFF USER ROLES TAB */}
        {/* ========================================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in-25 duration-200 print:hidden">
            <h2 className="font-serif-lux text-sm font-bold uppercase tracking-wider text-fg-custom/80">Shoppers Directory</h2>

            <div className="overflow-x-auto bg-card-custom border border-card-border rounded-2xl shadow-sm">
              <table className="w-full text-left text-xs font-light text-fg-custom/95">
                <thead className="bg-bg-custom text-[10px] uppercase font-bold tracking-wider text-fg-custom/60 border-b border-card-border">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Total Spending</th>
                    <th className="px-6 py-4">Order Count</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {customersList.map((c) => (
                    <tr key={c._id} className="hover:bg-gold/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold">{c.name}</p>
                        <p className="text-[9px] text-fg-custom/40 font-light">{c.phone || 'Google sign'}</p>
                      </td>
                      <td className="px-6 py-4 font-medium">{c.email}</td>
                      <td className="px-6 py-4 font-extrabold text-gold">₹{Math.round(c.totalSpent || 0).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 font-bold">{c.orderCount || 0} orders</td>
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
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            onClick={() => setSelectedCustomerDetail(c)}
                            className="text-[10px] border border-card-border rounded px-2.5 py-1.5 hover:border-gold hover:text-gold font-bold cursor-pointer transition-colors"
                          >
                            Profile Details
                          </button>
                          {user.role === 'super-admin' && (
                            <select
                              value={c.role || 'user'}
                              onChange={(e) => handleUserRoleChange(c._id, e.target.value)}
                              className="text-[9px] bg-bg-custom border border-card-border rounded px-1 py-1 focus:outline-none focus:border-gold font-bold text-fg-custom"
                            >
                              <option value="user">Customer</option>
                              <option value="staff">Staff</option>
                              <option value="admin">Admin</option>
                              <option value="super-admin">Super Admin</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 📜 5. ACTIVITY LOGS AUDIT TAB */}
        {/* ========================================================================= */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-in fade-in-25 duration-200 print:hidden">
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

        {/* ========================================================================= */}
        {/* 🎟️ 6. CONFIGURE COUPONS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'coupons' && (
          <div className="space-y-8 animate-in fade-in-25 duration-200 print:hidden">
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
                className="w-full gold-gradient text-maroon-950 font-bold uppercase text-[10px] tracking-wider py-3.5 rounded-lg shadow hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : <span>Publish Coupon</span>}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 🔍 DETAILED ORDER INFO MODAL */}
      {/* ========================================================================= */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-card-custom border border-card-border p-6 rounded-2xl max-w-2xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-card-border pb-3.5">
              <h3 className="font-serif-lux text-md font-bold gold-text-gradient uppercase">Order Details Sheet</h3>
              <button 
                onClick={() => setSelectedOrderDetail(null)}
                className="p-1 hover:bg-gold/10 rounded-lg text-fg-custom/60 hover:text-gold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-fg-custom/80 font-light leading-relaxed">
              <div className="space-y-2.5 bg-bg-custom p-4 rounded-xl border border-card-border">
                <p className="font-bold text-[10px] uppercase text-gold tracking-wide flex items-center">
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  <span>Customer Contact</span>
                </p>
                <p><strong>Name:</strong> {selectedOrderDetail.user?.name || 'Walkin Customer'}</p>
                <p><strong>Email:</strong> {selectedOrderDetail.user?.email}</p>
                <p><strong>Phone:</strong> {selectedOrderDetail.user?.phone || 'Not provided'}</p>
                <p className="pt-2 border-t border-card-border/40 font-bold text-[10px] uppercase text-gold tracking-wide flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  <span>Order Summary</span>
                </p>
                <p><strong>Ordered Date:</strong> {new Date(selectedOrderDetail.createdAt).toLocaleString('en-IN')}</p>
                <p><strong>Order Status:</strong> <span className="font-bold text-gold uppercase">{selectedOrderDetail.orderStatus}</span></p>
              </div>

              <div className="space-y-2.5 bg-bg-custom p-4 rounded-xl border border-card-border">
                <p className="font-bold text-[10px] uppercase text-gold tracking-wide flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  <span>Delivery Address</span>
                </p>
                <p><strong>Recipient Name:</strong> {selectedOrderDetail.shippingAddress?.name}</p>
                <p><strong>Address Line:</strong> {selectedOrderDetail.shippingAddress?.addressLine}</p>
                <p><strong>City/State:</strong> {selectedOrderDetail.shippingAddress?.city}, {selectedOrderDetail.shippingAddress?.state}</p>
                <p><strong>Pin Code:</strong> {selectedOrderDetail.shippingAddress?.pinCode}</p>
                <p><strong>Phone:</strong> {selectedOrderDetail.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Product details table inside order */}
            <div className="space-y-3.5">
              <p className="font-bold text-[10px] uppercase text-gold tracking-wide">Ordered Sarees</p>
              <div className="overflow-x-auto border border-card-border rounded-xl bg-bg-custom">
                <table className="w-full text-left text-xs font-light text-fg-custom">
                  <thead className="bg-card-custom/60 text-[9px] uppercase font-bold text-fg-custom/60 border-b border-card-border">
                    <tr>
                      <th className="px-4 py-2.5">Saree Image</th>
                      <th className="px-4 py-2.5">Name (Color)</th>
                      <th className="px-4 py-2.5 text-center">Qty</th>
                      <th className="px-4 py-2.5 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/40">
                    {selectedOrderDetail.items && selectedOrderDetail.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">
                          <img src={item.image} alt={item.name} className="w-7 h-9 object-cover rounded border border-card-border" />
                        </td>
                        <td className="px-4 py-2 font-medium">{item.name} ({item.color})</td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-right font-extrabold text-gold">₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-bg-custom p-4 rounded-xl border border-card-border gap-4">
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-[10px] uppercase text-gold tracking-wide flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-1" />
                  <span>Payment Information</span>
                </p>
                <p><strong>Method:</strong> {selectedOrderDetail.paymentMethod}</p>
                <p><strong>Paid Status:</strong> <span className={selectedOrderDetail.isPaid ? 'text-green-500 font-bold' : 'text-orange-500 font-bold'}>
                  {selectedOrderDetail.isPaid ? 'Paid' : 'Unpaid'}
                </span></p>
                {selectedOrderDetail.paymentResult && (
                  <>
                    <p className="text-[10px] text-fg-custom/50"><strong>Transaction ID:</strong> {selectedOrderDetail.paymentResult.id}</p>
                    <p className="text-[10px] text-fg-custom/50"><strong>Gateway Status:</strong> {selectedOrderDetail.paymentResult.status}</p>
                  </>
                )}
              </div>

              <div className="text-right space-y-1 self-end sm:self-auto">
                <p className="text-[10px] uppercase text-fg-custom/50">Total order amount</p>
                <p className="text-xl font-black text-gold">₹{Math.round(selectedOrderDetail.totalPrice).toLocaleString('en-IN')}</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 👥 CUSTOMER DETAIL DIALOG PROFILE */}
      {/* ========================================================================= */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-card-custom border border-card-border p-6 rounded-2xl max-w-xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-card-border pb-3.5">
              <h3 className="font-serif-lux text-md font-bold gold-text-gradient uppercase">Shopper Profile</h3>
              <button 
                onClick={() => setSelectedCustomerDetail(null)}
                className="p-1 hover:bg-gold/10 rounded-lg text-fg-custom/60 hover:text-gold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-bg-custom p-4 rounded-xl border border-card-border font-light">
                <p><strong>Name:</strong> {selectedCustomerDetail.name}</p>
                <p><strong>Email:</strong> {selectedCustomerDetail.email}</p>
                <p><strong>Phone:</strong> {selectedCustomerDetail.phone || 'Google login'}</p>
                <p><strong>Registered Date:</strong> {new Date(selectedCustomerDetail.createdAt).toLocaleDateString('en-IN')}</p>
                <p><strong>Total Spending:</strong> <span className="font-extrabold text-gold">₹{Math.round(selectedCustomerDetail.totalSpent || 0).toLocaleString('en-IN')}</span></p>
                <p><strong>Orders Checked:</strong> {selectedCustomerDetail.orderCount || 0} orders</p>
              </div>

              {/* Shopper order history */}
              <div className="space-y-3.5">
                <p className="font-bold text-[10px] uppercase text-gold tracking-wide">Purchase History</p>
                
                {selectedCustomerDetail.orderHistory && selectedCustomerDetail.orderHistory.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomerDetail.orderHistory.map((h: any) => (
                      <div key={h._id} className="flex justify-between items-center bg-bg-custom/40 border border-card-border p-3 rounded-lg text-xs">
                        <div>
                          <p className="font-mono font-medium">{h._id.substring(0, 10)}...</p>
                          <p className="text-[9px] text-fg-custom/40 font-light">{new Date(h.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            h.orderStatus === 'Delivered' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-600'
                          }`}>{h.orderStatus}</span>
                          <span className="font-bold text-gold">₹{Math.round(h.totalPrice).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-fg-custom/40 flex items-center justify-center space-x-1.5">
                    <Inbox className="w-4.5 h-4.5 text-fg-custom/30" />
                    <span>No purchase records logged</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🖨️ DETAILED PRINT INVOICE MODAL SELECTOR (Visible on print trigger) */}
      {/* ========================================================================= */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 print:relative print:bg-white print:p-0 print:z-0">
          <div className="bg-card-custom border border-card-border p-6 rounded-2xl max-w-xl w-full space-y-6 shadow-2xl relative print:border-none print:shadow-none print:p-0">
            
            {/* Format Selector Tab (Hidden during Print) */}
            <div className="flex justify-between items-center border-b border-card-border pb-4 print:hidden">
              <h3 className="font-serif-lux text-sm font-bold text-fg-custom">Select Invoice Print Format</h3>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setPrintFormat('a4')}
                  className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded cursor-pointer ${
                    printFormat === 'a4' ? 'maroon-gradient text-white' : 'border border-card-border text-fg-custom/70'
                  }`}
                >
                  Standard A4 Paper
                </button>
                <button
                  onClick={() => setPrintFormat('thermal')}
                  className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded cursor-pointer ${
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
                className="border border-card-border text-fg-custom/80 font-bold uppercase text-[10px] py-2 px-5 rounded-lg hover:bg-gold/5 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="gold-gradient text-maroon-950 font-bold uppercase text-[10px] py-2 px-6 rounded-lg shadow hover:opacity-90 flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print receipt</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Developer Access RBAC Role Switcher Panel */}
      <div className="fixed bottom-6 right-6 z-50 bg-card-custom border border-gold/30 rounded-xl p-3 shadow-2xl space-y-2 max-w-[200px] border-t-2 border-t-gold print:hidden">
        <span className="text-[8px] uppercase tracking-wider font-extrabold text-gold flex items-center justify-center">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          <span>{at('lbl_role_switcher')}</span>
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button 
            onClick={() => handleDeveloperRoleSwitch('super-admin')} 
            className={`text-[8px] font-bold px-1.5 py-1 rounded transition-colors cursor-pointer ${
              user.role === 'super-admin' ? 'maroon-gradient text-white' : 'bg-gold/10 text-fg-custom hover:bg-gold/20'
            }`}
          >
            Super
          </button>
          <button 
            onClick={() => handleDeveloperRoleSwitch('admin')}
            className={`text-[8px] font-bold px-1.5 py-1 rounded transition-colors cursor-pointer ${
              user.role === 'admin' ? 'maroon-gradient text-white' : 'bg-gold/10 text-fg-custom hover:bg-gold/20'
            }`}
          >
            Admin
          </button>
          <button 
            onClick={() => handleDeveloperRoleSwitch('staff')}
            className={`text-[8px] font-bold px-1.5 py-1 rounded transition-colors cursor-pointer ${
              user.role === 'staff' ? 'maroon-gradient text-white' : 'bg-gold/10 text-fg-custom hover:bg-gold/20'
            }`}
          >
            Staff
          </button>
          <button 
            onClick={() => handleDeveloperRoleSwitch('user')}
            className={`text-[8px] font-bold px-1.5 py-1 rounded transition-colors cursor-pointer ${
              currentRole === 'user' ? 'maroon-gradient text-white' : 'bg-gold/10 text-fg-custom hover:bg-gold/20'
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
