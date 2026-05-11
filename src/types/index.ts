import type { OrderStatus } from '@prisma/client';
export type { OrderStatus };

export interface CustomerAddress<T = Date> {
  id: string;
  customerId: string;
  addressName: string;
  latitude: number;
  longitude: number;
  addressText: string | null;
  isDefault: boolean;
  createdAt: T;
  updatedAt: T;
}

export interface Customer<T = Date> {
  id: string;
  phoneNumber: string;
  name: string;
  createdAt: T;
  updatedAt: T;
  addresses?: CustomerAddress<T>[];
}

export interface Product<T = Date> {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  unit: string;
  price: number;
  isActive: boolean;
  createdAt: T;
  updatedAt: T;
}

export interface CartItem {
  productId: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderItem<T = Date> {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  createdAt: T;
  product?: Product<T>;
}

export interface Order<T = Date> {
  id: string;
  orderNumber: string;
  customerId: string;
  addressId: string;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: T;
  updatedAt: T;
  items?: OrderItem<T>[];
  customer?: Customer<T> | null;
  address?: CustomerAddress<T> | null;
}

// Convenient types for serialized data (from Server Actions)
export type SerializedProduct = Product<string>;
export type SerializedAddress = CustomerAddress<string>;
export type SerializedCustomer = Customer<string>;

export interface SerializedOrderItem extends OrderItem<string> {
  product?: SerializedProduct;
}

export interface SerializedOrder extends Order<string> {
  items: SerializedOrderItem[];
  customer?: SerializedCustomer | null;
  address?: SerializedAddress | null;
}

export interface AdminOrderItem extends SerializedOrderItem {
  product: SerializedProduct;
}

export interface AdminOrder extends SerializedOrder {
  addressText: string | null;
  latitude: number;
  longitude: number;
  customer: SerializedCustomer;
  items: AdminOrderItem[];
}

export const STATUS_MAP = {
  'PENDING': { label: 'قيد الانتظار', color: 'bg-amber-100 text-amber-700' },
  'CONFIRMED': { label: 'تم التأكيد', color: 'bg-blue-100 text-blue-700' },
  'DELIVERED': { label: 'تم التوصيل', color: 'bg-emerald-100 text-emerald-700' },
  'CANCELLED': { label: 'ملغي', color: 'bg-rose-100 text-rose-700' },
} as const;
