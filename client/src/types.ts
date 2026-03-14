export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  loginId: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  uom: string;
  description?: string;
  active: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  warehouseId: string;
  type: 'internal' | 'view' | 'supplier' | 'customer' | 'inventory';
}

export interface Stock {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
}

export type OperationType = 'receipt' | 'delivery' | 'internal' | 'adjustment';
export type OperationStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';

export interface Operation {
  id: string;
  reference: string;
  type: OperationType;
  status: OperationStatus;
  sourceLocationId?: string;
  destLocationId?: string;
  contact?: string;
  scheduledDate?: string;
  responsibleUid?: string;
  createdAt: string;
}

export interface OperationItem {
  id: string;
  operationId: string;
  productId: string;
  quantity: number;
}

export interface MoveHistory {
  id: string;
  operationId: string;
  productId: string;
  fromLocationId?: string;
  toLocationId?: string;
  quantity: number;
  timestamp: string;
}
