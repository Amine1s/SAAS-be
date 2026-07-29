import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Product, Invoice, StoreActivity, ChartPoint, Warehouse, Supplier, Customer, Category, StockMovement } from './types.js';

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// تفعيل CORS للسماح لعنوان الفرونت اند بالاتصال بالسيرفر
app.use(cors());

// دعم قراءة بيانات JSON
app.use(express.json());

// تهيئة البيانات المؤقتة في الذاكرة لتكون ديناميكية وحية
let warehouses: Warehouse[] = [
  { id: 'WH-01', name: 'المستودع الرئيسي - الرياض', location: 'الرياض - حي الملز', capacity: 5000, description: 'مستودع السلع الأساسية والمكيفة' },
  { id: 'WH-02', name: 'مستودع المنطقة الغربية - جدة', location: 'جدة - المدينة الصناعية', capacity: 3000, description: 'مستودع المنتجات المستوردة والأحذية' }
];

let suppliers: Supplier[] = [
  { id: 'SUP-01', name: 'شركة المنسوجات الموحدة', company: 'المصنع السعودي للملابس', phone: '0501112222', email: 'info@unifiedtextiles.com' },
  { id: 'SUP-02', name: 'مؤسسة خطوات التقنية', company: 'شركة الاستيراد العالمية', phone: '0503334444', email: 'sales@techsteps.sa' }
];

let customers: Customer[] = [
  { id: 'CUST-01', name: 'أحمد مصطفى', phone: '0551112222', email: 'ahmed@gmail.com', taxNumber: '300012345600003' },
  { id: 'CUST-02', name: 'سارة عبد الرحمن', phone: '0553334444', email: 'sara@outlook.com', taxNumber: '' },
  { id: 'CUST-03', name: 'شركة الأمل للتجارة', phone: '0555556666', email: 'contact@alamal.com', taxNumber: '310987654300003' }
];

let categories: Category[] = [
  { id: 'CAT-01', name: 'رجالي', description: 'ملابس وأحذية وإكسسوارات رجالية تمتاز بالجودة العالية' },
  { id: 'CAT-02', name: 'نسائي', description: 'ملابس فخمة وفساتين سهرة وتصاميم عصرية للمناسبات' },
  { id: 'CAT-03', name: 'أحذية', description: 'أحذية رياضية ورسمية مريحة ومقاومة للماء' }
];

let stockMovements: StockMovement[] = [
  { id: 'MOV-01', type: 'in', productId: '1', productName: 'قميص بولو Ralph Lauren', quantity: 45, warehouseId: 'WH-01', warehouseName: 'المستودع الرئيسي - الرياض', notes: 'توريد دفعة إنتاج جديدة من المصنع', timestamp: '2026-06-10 09:00', recordedBy: 'خالد أحمد (مدير المستودع)' },
  { id: 'MOV-02', type: 'in', productId: '2', productName: 'بنطال جينز Levi\'s 511', quantity: 15, warehouseId: 'WH-01', warehouseName: 'المستودع الرئيسي - الرياض', notes: 'توريد ملابس من المورد الشريك', timestamp: '2026-06-10 10:15', recordedBy: 'خالد أحمد (مدير المستودع)' },
  { id: 'MOV-03', type: 'out', productId: '2', productName: 'بنطال جينز Levi\'s 511', quantity: 11, warehouseId: 'WH-01', warehouseName: 'المستودع الرئيسي - الرياض', notes: 'تلف شحنة أو تحويل فرعي', timestamp: '2026-06-11 11:30', recordedBy: 'خالد أحمد (مدير المستودع)' }
];

let products: Product[] = [
  { id: '1', name: 'قميص بولو Ralph Lauren', sku: 'PROD-001', price: 150.00, quantity: 45, description: 'رجالي | مقاس XL | اللون أزرق', category: 'رجالي', warehouseId: 'WH-01', supplierId: 'SUP-01' },
  { id: '2', name: 'بنطال جينز Levi\'s 511', sku: 'PROD-002', price: 220.00, quantity: 4, description: 'رجالي | مقاس 32 | اللون أسود', category: 'رجالي', warehouseId: 'WH-01', supplierId: 'SUP-01' },
  { id: '3', name: 'فستان شانيل Chanel حرير', sku: 'PROD-003', price: 450.00, quantity: 18, description: 'نسائي | مقاس M | اللون أحمر', category: 'نسائي', warehouseId: 'WH-02', supplierId: 'SUP-01' },
  { id: '4', name: 'حذاء نايكي Nike Air Max', sku: 'PROD-004', price: 300.00, quantity: 7, description: 'أحذية | مقاس 42 | اللون أبيض', category: 'أحذية', warehouseId: 'WH-02', supplierId: 'SUP-02' }
];

let invoices: Invoice[] = [
  {
    id: 'INV-2026-01',
    customerName: 'أحمد مصطفى',
    invoiceDate: '2026-06-10',
    status: 'paid',
    items: [
      { productId: '1', name: 'قميص بولو Ralph Lauren', quantity: 1, price: 150.00 },
      { productId: '2', name: 'بنطال جينز Levi\'s 511', quantity: 1, price: 220.00 }
    ],
    totalAmount: 370.00,
    amountPaid: 425.50,
    paymentMethod: 'بطاقة ائتمان / مدى'
  },
  {
    id: 'INV-2026-02',
    customerName: 'سارة عبد الرحمن',
    invoiceDate: '2026-06-10',
    status: 'paid',
    items: [
      { productId: '3', name: 'فستان شانيل Chanel حرير', quantity: 1, price: 450.00 }
    ],
    totalAmount: 450.00,
    amountPaid: 517.50,
    paymentMethod: 'نقداً (كاش)'
  }
];

let activities: StoreActivity[] = [
  { id: '1', type: 'add_invoice', message: 'إصدار فاتورة مبيعات رقم INV-2026-02 للمشترية سارة عبد الرحمن بقيمة 517.50 ر.س شاملة الضريبة.', timestamp: 'قبل ساعة', meta: 'INV-2026-02' },
  { id: '2', type: 'add_product', message: 'إضافة صنف منتج جديد "حذاء نايكي Nike Air Max" بالرمز SKU الحالي PROD-004 ومخزون 7 قطع.', timestamp: 'قبل 4 ساعات', meta: 'PROD-004' },
  { id: '3', type: 'stock_update', message: 'تحديث مخزون "بنطال جينز Levi\'s 511" يدوياً إلى 4 قطع.', timestamp: 'قبل يوم واحد', meta: 'PROD-002' },
  { id: '4', type: 'add_invoice', message: 'إصدار فاتورة مبيعات رقم INV-2026-01 للعميل أحمد مصطفى بمبلغ 425.50 ر.س.', timestamp: 'قبل يومين', meta: 'INV-2026-01' },
  { id: '5', type: 'system', message: 'تم إقران مستودع المتاجر السحابية وإدارة الأرصدة والفوترة بنجاح.', timestamp: 'منذ أسبوع', meta: 'SYSTEM-START' }
];

let weeklyChartPoints: ChartPoint[] = [
  { label: 'السبت', sales: 950, invoices: 3 },
  { label: 'الأحد', sales: 1320, invoices: 5 },
  { label: 'الأثنين', sales: 1850, invoices: 8 },
  { label: 'الثلاثاء', sales: 1100, invoices: 4 },
  { label: 'الأربعاء', sales: 2400, invoices: 11 },
  { label: 'الخميس', sales: 3100, invoices: 14 },
  { label: 'الجمعة', sales: 2150, invoices: 9 },
];

let monthlyChartPoints: ChartPoint[] = [
  { label: 'يناير', sales: 18500, invoices: 72 },
  { label: 'فبراير', sales: 21400, invoices: 94 },
  { label: 'مارس', sales: 29800, invoices: 115 },
  { label: 'أبريل', sales: 24200, invoices: 88 },
  { label: 'مايو', sales: 34900, invoices: 142 },
  { label: 'يونيو', sales: 28800, invoices: 120 },
  { label: 'يوليو', sales: 0, invoices: 0 },
  { label: 'أغسطس', sales: 0, invoices: 0 },
  { label: 'سبتمبر', sales: 0, invoices: 0 },
  { label: 'أكتوبر', sales: 0, invoices: 0 },
  { label: 'نوفمبر', sales: 0, invoices: 0 },
  { label: 'ديسمبر', sales: 0, invoices: 0 },
];

function updateChartStatistics(amount: number, countChange: number, isRefund: boolean = false) {
  const currentDay = new Date().getDay();
  const dayNames = ['الأحد', 'الأثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const todayLabel = dayNames[currentDay];

  const currentMonth = new Date().getMonth();
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const thisMonthLabel = monthNames[currentMonth];

  const dayIndex = weeklyChartPoints.findIndex(p => p.label === todayLabel);
  if (dayIndex !== -1) {
    if (isRefund) {
      weeklyChartPoints[dayIndex].sales = Math.max(0, weeklyChartPoints[dayIndex].sales - amount);
      weeklyChartPoints[dayIndex].invoices = Math.max(0, weeklyChartPoints[dayIndex].invoices - countChange);
    } else {
      weeklyChartPoints[dayIndex].sales += amount;
      weeklyChartPoints[dayIndex].invoices += countChange;
    }
  }

  const monthIndex = monthlyChartPoints.findIndex(p => p.label === thisMonthLabel);
  if (monthIndex !== -1) {
    if (isRefund) {
      monthlyChartPoints[monthIndex].sales = Math.max(0, monthlyChartPoints[monthIndex].sales - amount);
      monthlyChartPoints[monthIndex].invoices = Math.max(0, monthlyChartPoints[monthIndex].invoices - countChange);
    } else {
      monthlyChartPoints[monthIndex].sales += amount;
      monthlyChartPoints[monthIndex].invoices += countChange;
    }
  }
}

// -------------------------------------------------------------
// مسارات واجهة برمجة التطبيقات (API API Routes)
// -------------------------------------------------------------

// مسار فحص الحالة والترحيب
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'SaaS Inventory System API is online and fully functional!' });
});

app.get('/api/products', (req: Request, res: Response) => {
  res.json({ success: true, products });
});

app.post('/api/products', (req: Request, res: Response) => {
  const { name, sku, price, quantity, description, category, warehouseId, supplierId } = req.body;

  if (!name || !sku || price === undefined || quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: 'جميع الحقول الأساسية مطلوبة.'
    });
  }

  if (products.some(p => p.sku.toUpperCase() === sku.trim().toUpperCase())) {
    return res.status(409).json({
      success: false,
      message: 'خطأ: رمز SKU مسجل مسبقاً لصنف آخر.'
    });
  }

  const newProduct: Product = {
    id: (products.length + 1).toString(),
    name: name.trim(),
    sku: sku.trim().toUpperCase(),
    price: Number(price),
    quantity: Number(quantity),
    description: description?.trim() || 'لا يوجد وصف تفصيلي.',
    category: category || 'رجالي',
    warehouseId: warehouseId || 'WH-01',
    supplierId: supplierId || 'SUP-01'
  };

  products = [newProduct, ...products];

  if (newProduct.quantity > 0) {
    const wh = warehouses.find(w => w.id === newProduct.warehouseId);
    const whName = wh ? wh.name : 'المستودع الرئيسي';
    const newMov: StockMovement = {
      id: `MOV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      type: 'in',
      productId: newProduct.id,
      productName: newProduct.name,
      quantity: newProduct.quantity,
      warehouseId: newProduct.warehouseId || 'WH-01',
      warehouseName: whName,
      notes: 'الرصيد الابتدائي الافتتاحي للصنف الجديد',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      recordedBy: 'مدير النظام'
    };
    stockMovements = [newMov, ...stockMovements];
  }

  res.status(201).json({ success: true, product: newProduct });
});

app.patch('/api/products/:id/stock', (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || isNaN(quantity) || Number(quantity) < 0) {
    return res.status(400).json({
      success: false,
      message: 'الرجاء توفير كمية صحيحة للمنتج.'
    });
  }

  const prodIndex = products.findIndex(p => p.id === id);
  if (prodIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'المنتج غير موجود.'
    });
  }

  products[prodIndex].quantity = Number(quantity);
  res.json({ success: true, product: products[prodIndex] });
});

app.get('/api/invoices', (req: Request, res: Response) => {
  res.json({ success: true, invoices });
});

app.post('/api/invoices', (req: Request, res: Response) => {
  const { customerName, status, items, totalAmount, amountPaid, paymentMethod } = req.body;

  if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'بيانات الفاتورة والعميل والمنتجات المشتراة مطلوبة.'
    });
  }

  let stockError = false;
  let errMessage = '';
  
  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (!prod || prod.quantity < item.quantity) {
      errMessage = `المخزون غير كافٍ للمنتج "${prod?.name || 'مجهول'}". المتوفر هو: ${prod?.quantity || 0}`;
      stockError = true;
      break;
    }
  }

  if (stockError) {
    return res.status(400).json({ success: false, message: errMessage });
  }

  items.forEach(item => {
    const prodIndex = products.findIndex(p => p.id === item.productId);
    if (prodIndex !== -1) {
      const prod = products[prodIndex];
      prod.quantity = Math.max(0, prod.quantity - item.quantity);

      const wh = warehouses.find(w => w.id === prod.warehouseId);
      const whName = wh ? wh.name : 'المستودع الرئيسي';
      const newMov: StockMovement = {
        id: `MOV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        type: 'out',
        productId: prod.id,
        productName: prod.name,
        quantity: item.quantity,
        warehouseId: prod.warehouseId || 'WH-01',
        warehouseName: whName,
        notes: `صرف مبيعات للفاتورة INV-2026-0${invoices.length + 1}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        recordedBy: 'محاسب النظام'
      };
      stockMovements = [newMov, ...stockMovements];
    }
  });

  const newInvoice = {
    id: `INV-2026-0${invoices.length + 1}`,
    customerName: customerName.trim(),
    invoiceDate: new Date().toISOString().split('T')[0],
    status: status || 'paid',
    items,
    totalAmount: Number(totalAmount),
    amountPaid: Number(amountPaid),
    paymentMethod: paymentMethod || 'بطاقة ائتمان / مدى'
  };

  invoices = [newInvoice, ...invoices];

  if (newInvoice.status !== 'refunded') {
    updateChartStatistics(Number((newInvoice.totalAmount * 1.15).toFixed(2)), 1, false);
  }

  res.status(201).json({ success: true, invoice: newInvoice });
});

app.patch('/api/invoices/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, amountPaid } = req.body;

  const invoiceIndex = invoices.findIndex(inv => inv.id === id);
  if (invoiceIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'الفاتورة غير موجودة.'
    });
  }

  const previousInvoice = invoices[invoiceIndex];

  if (previousInvoice.status !== 'refunded' && status === 'refunded') {
    updateChartStatistics(Number((previousInvoice.totalAmount * 1.15).toFixed(2)), 1, true);
  }

  invoices[invoiceIndex] = {
    ...invoices[invoiceIndex],
    status: status,
    amountPaid: amountPaid !== undefined ? Number(amountPaid) : invoices[invoiceIndex].amountPaid
  };

  res.json({ success: true, invoice: invoices[invoiceIndex] });
});

app.get('/api/activities', (req: Request, res: Response) => {
  res.json({ success: true, activities });
});

app.post('/api/activities', (req: Request, res: Response) => {
  const { type, message, meta } = req.body;

  if (!type || !message) {
    return res.status(400).json({
      success: false,
      message: 'الرجاء توفير تفاصيل النشاط.'
    });
  }

  const formattedTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  const newActivity = {
    id: Math.random().toString(36).substring(2, 9),
    type,
    message,
    timestamp: formattedTime,
    meta
  };

  activities = [newActivity, ...activities];
  res.status(201).json({ success: true, activity: newActivity });
});

app.get('/api/charts', (req: Request, res: Response) => {
  res.json({
    success: true,
    weekly: weeklyChartPoints,
    monthly: monthlyChartPoints
  });
});

app.get('/api/warehouses', (req: Request, res: Response) => {
  res.json({ success: true, warehouses });
});

app.post('/api/warehouses', (req: Request, res: Response) => {
  const { name, location, capacity, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'اسم المستودع مطلوب.' });
  }
  const newWH: Warehouse = {
    id: `WH-${(warehouses.length + 1).toString().padStart(2, '0')}`,
    name: name.trim(),
    location: location?.trim() || 'غير محدد',
    capacity: Number(capacity) || 1000,
    description: description?.trim() || ''
  };
  warehouses.push(newWH);
  res.status(201).json({ success: true, warehouse: newWH });
});

app.get('/api/suppliers', (req: Request, res: Response) => {
  res.json({ success: true, suppliers });
});

app.post('/api/suppliers', (req: Request, res: Response) => {
  const { name, company, phone, email } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'اسم المورد مطلوب.' });
  }
  const newSupplier: Supplier = {
    id: `SUP-${(suppliers.length + 1).toString().padStart(2, '0')}`,
    name: name.trim(),
    company: company?.trim() || '',
    phone: phone?.trim() || '',
    email: email?.trim() || ''
  };
  suppliers.push(newSupplier);
  res.status(201).json({ success: true, supplier: newSupplier });
});

app.get('/api/customers', (req: Request, res: Response) => {
  res.json({ success: true, customers });
});

app.post('/api/customers', (req: Request, res: Response) => {
  const { name, phone, email, taxNumber } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'اسم العميل مطلوب.' });
  }
  const newCustomer: Customer = {
    id: `CUST-${(customers.length + 1).toString().padStart(2, '0')}`,
    name: name.trim(),
    phone: phone?.trim() || '',
    email: email?.trim() || '',
    taxNumber: taxNumber?.trim() || ''
  };
  customers.push(newCustomer);
  res.status(201).json({ success: true, customer: newCustomer });
});

app.get('/api/categories', (req: Request, res: Response) => {
  res.json({ success: true, categories });
});

app.post('/api/categories', (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'اسم التصنيف مطلوب.' });
  }
  const newCat: Category = {
    id: `CAT-${(categories.length + 1).toString().padStart(2, '0')}`,
    name: name.trim(),
    description: description?.trim() || ''
  };
  categories.push(newCat);
  res.status(201).json({ success: true, category: newCat });
});

app.get('/api/stock-movements', (req: Request, res: Response) => {
  res.json({ success: true, stockMovements });
});

app.post('/api/stock-movements', (req: Request, res: Response) => {
  const { type, productId, quantity, warehouseId, notes, recordedBy } = req.body;
  if (!type || !productId || quantity === undefined || !warehouseId) {
    return res.status(400).json({ success: false, message: 'معطيات حركة المخزون ناقصة.' });
  }

  const prod = products.find(p => p.id === productId);
  if (!prod) {
    return res.status(404).json({ success: false, message: 'المنتج غير موجود.' });
  }

  const wh = warehouses.find(w => w.id === warehouseId);
  if (!wh) {
    return res.status(404).json({ success: false, message: 'المستودع غير موجود.' });
  }

  const qtyNum = Number(quantity);
  if (type === 'out' && prod.quantity < qtyNum) {
    return res.status(400).json({ success: false, message: 'الكمية المطلوبة للصرف غير متوفرة بالكامل بالمخزن.' });
  }

  if (type === 'in') {
    prod.quantity += qtyNum;
  } else {
    prod.quantity -= qtyNum;
  }

  const newMov: StockMovement = {
    id: `MOV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    type,
    productId,
    productName: prod.name,
    quantity: qtyNum,
    warehouseId,
    warehouseName: wh.name,
    notes: notes || '',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    recordedBy: recordedBy || 'مدير النظام'
  };

  stockMovements = [newMov, ...stockMovements];

  const formattedTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  const actMsg = type === 'in' 
    ? `توريد شحنة منتج "${prod.name}" بمقدار ${qtyNum} وحدة إلى "${wh.name}".`
    : `صرف/إخراج منتج "${prod.name}" بمقدار ${qtyNum} وحدة من "${wh.name}".`;
  
  const newActivity = {
    id: Math.random().toString(36).substring(2, 9),
    type: 'stock_update' as const,
    message: actMsg,
    timestamp: formattedTime,
    meta: newMov.id
  };
  activities = [newActivity, ...activities];

  res.status(201).json({ success: true, movement: newMov, product: prod });
});

// start the server only if running on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Backend Server] Standalone API Server running on port ${PORT}`);
  });
}

export default app;
