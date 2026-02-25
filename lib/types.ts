/**
 * ساس — Database Types
 * 
 * TypeScript interfaces matching the PostgreSQL schema.
 */

// ═══ Enums ═══

export type TenantPlan = 'basic' | 'growth' | 'pro';
export type TenantStatus = 'active' | 'suspended' | 'trial';
export type MerchantRole = 'owner' | 'admin' | 'staff';
export type ProductType = 'physical' | 'digital';
export type ProductStatus = 'active' | 'draft' | 'archived';
export type OrderStatus = 'new' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentGateway = 'sadad' | 'skipcash' | 'cod';
export type ShippingCarrier = 'aramex' | 'dhl';
export type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'failed';
export type CouponType = 'percentage' | 'fixed';

// ═══ Base ═══

export interface BaseModel {
  id: string;
  created_at: string;
  updated_at?: string;
}

// ═══ Tenant (المتجر) ═══

export interface Tenant extends BaseModel {
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  domain?: string;
  currency: string;
  language: string;
  timezone: string;
  country: string;
  phone?: string;
  email?: string;
  plan: TenantPlan;
  status: TenantStatus;
  trial_ends_at?: string;
  theme: string;
  theme_config: Record<string, any>;
  meta: Record<string, any>;
}

// ═══ Merchant (التاجر) ═══

export interface Merchant extends BaseModel {
  tenant_id: string;
  name: string;
  email: string;
  phone?: string;
  password_hash: string;
  role: MerchantRole;
  permissions: string[];
  avatar_url?: string;
  status: string;
  last_login_at?: string;
}

// Safe merchant (without password)
export type SafeMerchant = Omit<Merchant, 'password_hash'>;

// ═══ Category (التصنيف) ═══

export interface Category extends BaseModel {
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  status: string;
  meta: Record<string, any>;
}

// ═══ Product (المنتج) ═══

export interface Product extends BaseModel {
  tenant_id: string;
  category_id?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  sale_price?: number;
  cost_price?: number;
  sku?: string;
  barcode?: string;
  quantity: number;
  weight?: number;
  type: ProductType;
  status: ProductStatus;
  is_featured: boolean;
  tags: string[];
  meta: Record<string, any>;
  views_count: number;
  sales_count: number;
  // Relations (loaded separately)
  images?: ProductImage[];
  options?: ProductOption[];
  variants?: ProductVariant[];
  category?: Category;
}

export interface ProductImage extends BaseModel {
  product_id: string;
  url: string;
  alt_text?: string;
  sort_order: number;
  is_main: boolean;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  display_type: 'dropdown' | 'color' | 'button';
  values: any[];
  sort_order: number;
}

export interface ProductVariant extends BaseModel {
  product_id: string;
  sku?: string;
  price?: number;
  sale_price?: number;
  quantity: number;
  weight?: number;
  option_values: Record<string, string>;
  image_url?: string;
  status: string;
}

// ═══ Customer (العميل) ═══

export interface Customer extends BaseModel {
  tenant_id: string;
  name?: string;
  phone?: string;
  email?: string;
  status: string;
  notes?: string;
  orders_count: number;
  total_spent: number;
  last_order_at?: string;
  meta: Record<string, any>;
}

// ═══ Address (العنوان) ═══

export interface Address extends BaseModel {
  customer_id: string;
  label: string;
  name?: string;
  phone?: string;
  country: string;
  city?: string;
  area?: string;
  street?: string;
  building?: string;
  floor_number?: string;
  apartment?: string;
  postal_code?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

// ═══ Order (الطلب) ═══

export interface Order extends BaseModel {
  tenant_id: string;
  customer_id?: string;
  order_number: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  status: OrderStatus;
  payment_method?: PaymentGateway;
  payment_status: PaymentStatus;
  shipping_method?: string;
  shipping_address?: Record<string, any>;
  coupon_code?: string;
  customer_notes?: string;
  admin_notes?: string;
  meta: Record<string, any>;
  // Relations
  items?: OrderItem[];
  customer?: Customer;
  status_history?: OrderStatusHistory[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  name: string;
  sku?: string;
  image_url?: string;
  options: Record<string, string>;
  price: number;
  quantity: number;
  total: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  note?: string;
  changed_by?: string;
  created_at: string;
}

// ═══ Payment (المعاملة) ═══

export interface Payment extends BaseModel {
  tenant_id: string;
  order_id: string;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  status: string;
  transaction_id?: string;
  gateway_response: Record<string, any>;
  refund_amount?: number;
  refund_reason?: string;
  paid_at?: string;
}

// ═══ Shipment (الشحنة) ═══

export interface Shipment extends BaseModel {
  tenant_id: string;
  order_id: string;
  carrier: ShippingCarrier;
  tracking_number?: string;
  label_url?: string;
  status: ShipmentStatus;
  estimated_delivery?: string;
  shipping_cost?: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  carrier_response: Record<string, any>;
  shipped_at?: string;
  delivered_at?: string;
}

// ═══ Coupon (الكوبون) ═══

export interface Coupon extends BaseModel {
  tenant_id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order: number;
  max_discount?: number;
  max_uses?: number;
  used_count: number;
  applies_to: 'all' | 'products' | 'categories';
  product_ids: string[];
  category_ids: string[];
  status: string;
  starts_at: string;
  expires_at?: string;
}

// ═══ Page (صفحة ثابتة) ═══

export interface Page extends BaseModel {
  tenant_id: string;
  title: string;
  slug: string;
  content?: string;
  status: 'published' | 'draft';
  sort_order: number;
  meta: Record<string, any>;
}

// ═══ Review (التقييم) ═══

export interface Review {
  id: string;
  tenant_id: string;
  product_id: string;
  customer_id?: string;
  rating: number;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// ═══ API Response Types ═══

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ═══ Auth Types ═══

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  merchantId: string;
  tenantId: string;
  role: MerchantRole;
  email: string;
}
