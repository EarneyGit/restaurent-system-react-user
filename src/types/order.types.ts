import { Check, ChefHat, MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import React from "react";

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export type OrderStatusType = `${OrderStatus}`;

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatusType;
  message?: string;
}

export interface OrderStatusStep {
  status: OrderStatusType;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const ORDER_STATUS_STEPS: OrderStatusStep[] = [
  {
    status: OrderStatus.PENDING,
    label: "Order Pending",
    description: "We've received your order and it's being reviewed",
    icon: Clock
  },
  {
    status: OrderStatus.PROCESSING,
    label: "Processing",
    description: "Our chefs are preparing your delicious meal",
    icon: ChefHat
  },
  {
    status: OrderStatus.COMPLETED,
    label: "Completed",
    description: "Your order has been completed. Enjoy!",
    icon: CheckCircle2
  }
];

export const getStatusColor = (status: OrderStatusType): string => {
  switch (status) {
    case OrderStatus.COMPLETED:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.PROCESSING:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    case OrderStatus.PENDING:
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusIcon = (status: OrderStatusType) => {
  switch (status) {
    case OrderStatus.COMPLETED:
      return CheckCircle2;
    case OrderStatus.PROCESSING:
      return Clock;
    case OrderStatus.CANCELLED:
      return AlertCircle;
    case OrderStatus.PENDING:
      return Clock;
    default:
      return null;
  }
}; 