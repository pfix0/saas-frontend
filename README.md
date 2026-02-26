<div align="center">

# ساس — Frontend

**منصة تجارة إلكترونية سحابية**

[![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white)](https://saas-frontend-omega.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_14-000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[🔗 الموقع الحي](https://saas-frontend-omega.vercel.app) · [📦 Backend Repo](https://github.com/pfix0/saas-backend)

</div>

---

## 📋 نبذة

الواجهة الأمامية لمنصة **ساس** — منصة تجارة إلكترونية SaaS تمكّن أي تاجر من إطلاق متجر احترافي خلال دقائق. مبنية بـ Next.js 14 وتعمل على Vercel، وتتصل بـ [Backend API](https://github.com/pfix0/saas-backend) على Railway.

## 🏗️ المعمارية

```
المتصفح → Vercel (Next.js Frontend) → Railway (Express API + PostgreSQL)
```

| الطبقة | التقنية | الموقع |
|--------|---------|--------|
| Frontend | Next.js 14 + Tailwind CSS | **Vercel** |
| Backend API | Express.js + TypeScript | **Railway** |
| Database | PostgreSQL | **Railway** |
| الربط | `next.config.js` rewrites | `/api/*` → Railway |

## 🔗 الروابط

| الصفحة | الرابط |
|--------|--------|
| 🏠 الرئيسية | https://saas-frontend-omega.vercel.app |
| 📝 التسجيل | https://saas-frontend-omega.vercel.app/register |
| 🔐 الدخول | https://saas-frontend-omega.vercel.app/login |
| 📊 لوحة التحكم | https://saas-frontend-omega.vercel.app/dashboard |

## ⚡ التقنيات

- **Next.js 14** — App Router + SSR
- **TypeScript** — Type-safe
- **Tailwind CSS** — Utility-first styling + RTL
- **Zustand** — State management (auth, cart, ui)
- **Zod** — Validation
- **Material Icons Outlined** — الأيقونات
- **Tajawal + IBM Plex Sans Arabic** — الخطوط

## 📂 هيكل المشروع

```
saas-frontend/
├── app/
│   ├── layout.tsx              # Root layout + AuthProvider
│   ├── page.tsx                # الصفحة الرئيسية (Landing)
│   ├── login/
│   │   ├── layout.tsx          # Auth split layout
│   │   └── page.tsx            # صفحة تسجيل الدخول
│   ├── register/
│   │   ├── layout.tsx          # Auth split layout
│   │   └── page.tsx            # صفحة التسجيل (٢ خطوات)
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout (Sidebar + Topbar)
│   │   ├── page.tsx            # الرئيسية (إحصائيات + آخر الطلبات)
│   │   ├── products/page.tsx   # قائمة المنتجات (جدول + فلاتر)
│   │   ├── products/new/       # إضافة منتج جديد
│   │   ├── products/[id]/edit/ # تعديل منتج
│   │   └── categories/page.tsx # إدارة التصنيفات
│   └── store/
│       └── [store]/page.tsx    # واجهة المتجر العامة
├── components/
│   ├── auth/
│   │   ├── AuthLayout.tsx      # تصميم مشترك (براندنج + نموذج)
│   │   └── AuthProvider.tsx    # يجلب بيانات المستخدم عند التحميل
│   ├── dashboard/
│   │   ├── Sidebar.tsx         # Sidebar تفاعلي (active route + mobile)
│   │   ├── Topbar.tsx          # شريط علوي (بحث + إشعارات + مستخدم)
│   │   └── ProductForm.tsx     # نموذج منتج مشترك (إضافة/تعديل)
│   └── ui/
│       ├── Button.tsx          # زر
│       ├── Input.tsx           # حقل إدخال
│       └── Badge.tsx           # شارة
├── stores/
│   ├── auth.ts                 # مصادقة (register/login/logout)
│   ├── cart.ts                 # سلة التسوق
│   └── ui.ts                   # حالة الواجهة
├── lib/
│   ├── api.ts                  # API client → Railway
│   ├── types.ts                # TypeScript types
│   └── utils/index.ts          # أدوات مساعدة
├── styles/globals.css          # Tailwind + Brand tokens
├── middleware.ts               # حماية صفحات الداشبورد
├── next.config.js              # Rewrites: /api/* → Railway
├── tailwind.config.ts          # ألوان ساس + خطوط
└── vercel.json                 # إعدادات Vercel
```

## 🚀 التثبيت والتشغيل

### المتطلبات

- **Node.js** 18+ (مُوصى: 20+)
- **npm** 9+
- [saas-backend](https://github.com/pfix0/saas-backend) شغّال (محلي أو على Railway)

### ١. استنساخ المشروع

```bash
git clone https://github.com/pfix0/saas-frontend.git
cd saas-frontend
```

### ٢. تثبيت الحزم

```bash
npm install
```

### ٣. إعداد متغيرات البيئة

```bash
cp .env.example .env.local
```

عدّل `.env.local`:

```env
# رابط الـ Backend API
# محلي:
NEXT_PUBLIC_API_URL=http://localhost:4000

# أو Railway (production):
# NEXT_PUBLIC_API_URL=https://saas-backend-production-xxxx.up.railway.app
```

### ٤. تشغيل محلي

```bash
npm run dev
```

افتح http://localhost:3000

### ٥. البناء

```bash
npm run build
npm start
```

## 🌐 النشر على Vercel

المشروع مربوط بـ GitHub — كل push على `main` يُنشر تلقائيًا.

### متغيرات البيئة في Vercel

| المتغير | القيمة | مطلوب |
|---------|--------|-------|
| `NEXT_PUBLIC_API_URL` | رابط Railway backend | ✅ |

### النشر يدوي

```bash
npm i -g vercel
vercel --prod
```

## 🎨 الهوية البصرية

| العنصر | القيمة |
|--------|--------|
| اللون الأساسي (Burgundy) | `#660033` |
| اللون الثانوي (Grey) | `#666666` |
| خط العناوين | Tajawal |
| خط النصوص | IBM Plex Sans Arabic |
| الأيقونات | Material Icons Outlined |
| الاتجاه | RTL (يمين لليسار) |

## 📡 اتصال الـ API

الـ Frontend **لا يتصل مباشرة** بالـ Backend. بدلاً من ذلك:

1. الـ Frontend يستدعي `/api/*`
2. `next.config.js` يحوّل الطلبات لـ Railway:

```javascript
// next.config.js
async rewrites() {
  return [{
    source: '/api/:path*',
    destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
  }];
}
```

هذا يتجنب مشاكل CORS ويبسّط الاتصال.

## 📝 سجل التحديثات

### المحادثة ٣ب — لوحة تحكم المنصة 🛡️ (فبراير ٢٠٢٦)
- ✅ منظومة أدوار كاملة (RBAC): مؤسس, مدير, مشرف, دعم فني, محاسب, موظف
- ✅ /admin/login — صفحة دخول المنصة (تصميم داكن)
- ✅ /admin — لوحة تحكم ديناميكية حسب الدور
- ✅ /admin/tenants — إدارة المتاجر (بحث + فلاتر + حالة + باقة + حذف)
- ✅ /admin/merchants — قائمة التجار
- ✅ /admin/staff — إدارة طاقم المنصة (إضافة + تعديل الدور + تعطيل + حذف)
- ✅ /admin/finance — المالية (إيرادات + تقارير شهرية)
- ✅ تنقل ديناميكي: كل دور يشوف صفحاته فقط
- ✅ Middleware يحمي /admin/* routes

### المحادثة ٣ — لوحة التحكم + المنتجات 📦 (فبراير ٢٠٢٦)
- ✅ Sidebar تفاعلي (active route, mobile drawer, شارة المتجر)
- ✅ Topbar (بحث, إشعارات, قائمة المستخدم + تسجيل خروج)
- ✅ لوحة التحكم ديناميكية (إحصائيات API, آخر الطلبات, إجراءات سريعة)
- ✅ قائمة المنتجات (جدول + بحث + فلاتر حالة/تصنيف + pagination + حذف)
- ✅ إضافة منتج جديد (نموذج كامل: تسعير, مخزون, وسوم, تصنيف, هامش ربح)
- ✅ تعديل منتج (نفس النموذج مع تحميل البيانات)
- ✅ إدارة التصنيفات (إضافة, تعديل inline, حذف مع تأكيد)
- ✅ Products Zustand store (CRUD كامل + فلاتر + pagination)
- ✅ تصميم متجاوب (desktop table + mobile cards)

### المحادثة ٢ — نظام المصادقة 🔐 (فبراير ٢٠٢٦)
- ✅ صفحة تسجيل تاجر جديد (٢ خطوات: بيانات → اسم المتجر)
- ✅ صفحة تسجيل دخول مع validation كاملة
- ✅ Split layout (براندنج + نموذج)
- ✅ Zustand auth store كامل (register/login/logout/fetchProfile)
- ✅ Middleware حماية صفحات الداشبورد
- ✅ AuthProvider يغلف التطبيق
- ✅ مؤشر قوة كلمة المرور + معاينة رابط المتجر

### المحادثة ١ — إعداد المشروع 🏗️ (فبراير ٢٠٢٦)
- ✅ Next.js 14 + Tailwind CSS + RTL
- ✅ هيكل المشروع الكامل
- ✅ مكونات UI أساسية (Button, Input, Badge)
- ✅ API client + Types
- ✅ ربط مع Railway backend
- ✅ الصفحة الرئيسية (Landing Page)
- ✅ صفحات placeholder (dashboard, login, register)
- ✅ النشر على Vercel

## 🗺️ خطة البناء

| # | المحادثة | الحالة |
|---|----------|--------|
| 1 | إعداد المشروع + قاعدة البيانات | ✅ مكتمل |
| 2 | نظام المصادقة + تسجيل التاجر | ✅ مكتمل |
| 3 | لوحة التحكم + إدارة المنتجات | ✅ مكتمل |
| 4 | واجهة المتجر (Storefront) | 🔜 التالي |
| 5 | السلة + Checkout | ✅ مكتمل |
| 6-8 | إدارة الطلبات + العملاء + حسابي | ⏳ قادم |
| 9-11 | الدفع (SADAD/SkipCash) + الشحن (Aramex/DHL) | ⏳ قادم |
| 12-15 | تقارير + تسويق + إعدادات + ثيمات | ⏳ قادم |
| 16-18 | الأمان + النشر النهائي + Landing Page | ⏳ قادم |

---

<div align="center">

**ساس** · منصتك تبدأ من هنا

</div>

### ميزة: الدخول كتاجر (Impersonation) 🔑

| | |
|---|---|
| **من يقدر** | مؤسس، مدير، مشرف، دعم فني |
| **كيف** | المتاجر → ⋮ → "دخول كتاجر" → اختيار حساب → يفتح لوحة التاجر |
| **التنبيه** | بانر أصفر أعلى الصفحة يبين إنك في وضع الدعم |
| **الخروج** | زر "العودة للوحة الإدارة" يمسح الجلسة ويرجعك |

---

### المحادثة ٥ — السلة + Checkout 🛒 (فبراير ٢٠٢٦)

| الصفحة | المسار | الوصف |
|-------|-------|------|
| Checkout | `/store/[slug]/checkout` | ٣ خطوات: بيانات → توصيل → تأكيد |
| تأكيد الطلب | `/store/[slug]/order/[orderNumber]` | ملخص الطلب بعد الشراء |

- ✅ صفحة Checkout بـ ٣ خطوات (Step indicator + تنقل)
- ✅ Step 1: بيانات العميل (اسم + جوال قطري + إيميل) + عنوان التوصيل (مدن قطر)
- ✅ Step 2: طريقة الشحن (أرامكس/DHL/استلام) + الدفع (COD) + كوبون خصم
- ✅ Step 3: مراجعة كاملة + تأكيد الطلب
- ✅ صفحة تأكيد الطلب (رقم الطلب + المنتجات + الملخص المالي + طباعة)
- ✅ Mobile-first + bottom sticky summary
- ✅ ربط كامل مع Backend API

### المحادثة ٤ — واجهة المتجر (Storefront) 🛒 (فبراير ٢٠٢٦)

| الصفحة | الرابط | الوصف |
|--------|--------|-------|
| الرئيسية | `/store/[slug]` | Hero + تصنيفات + منتجات مميزة |
| المنتجات | `/store/[slug]/products` | بحث + فلتر تصنيف + ترتيب + pagination |
| تفاصيل المنتج | `/store/[slug]/product/[slug]` | صور + سعر + خصم + مخزون + أضف للسلة |
| السلة | `/store/[slug]/cart` | كميات + حذف + ملخص الطلب |

**مثال حي:** https://saas-frontend-omega.vercel.app/store/demo-store

- ✅ Cart Store (Zustand) مع localStorage persistence
- ✅ Cart Drawer (يفتح من الجنب لما تضيف منتج)
- ✅ تصميم نظيف + responsive + RTL
- ✅ 404 page للمتاجر غير الموجودة
