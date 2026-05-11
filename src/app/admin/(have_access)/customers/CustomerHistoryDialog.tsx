"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminOrder, STATUS_MAP } from "@/types";
import { getCustomerOrders } from "@/actions/customerActions";
import { OrderDetailsDialog } from "../orders/OrderDetailsDialog";

interface CustomerHistoryDialogProps {
  customerId: string;
  customerName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerHistoryDialog({
  customerId,
  customerName,
  isOpen,
  onOpenChange,
}: CustomerHistoryDialogProps) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && customerId) {
      const fetchOrders = async () => {
        setLoading(true);
        const result = await getCustomerOrders(customerId);
        if (result.success && result.orders) {
          setOrders(result.orders as unknown as AdminOrder[]);
        }
        setLoading(false);
      };
      fetchOrders();
    }
  }, [isOpen, customerId]);

  const handleOrderUpdated = (updatedOrder: AdminOrder) => {
    setOrders(orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    if (selectedOrder?.id === updatedOrder.id) {
      setSelectedOrder(updatedOrder);
    }
  };

  const openOrderDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className="w-[95vw] max-w-lg md:max-w-4xl max-h-[90vh] overflow-y-auto"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-950">
              سجل طلبات العميل: {customerName}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : (
              <div className="bg-white rounded-[32px] shadow-sm border border-zinc-100">
                <div className="w-full overflow-x-auto pb-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-zinc-50/50 border-b-zinc-100">
                        <TableHead className="text-right px-8 font-bold py-5 text-zinc-500">
                          رقم الطلب
                        </TableHead>
                        <TableHead className="text-right font-bold text-zinc-500">
                          التاريخ
                        </TableHead>
                        <TableHead className="text-right font-bold text-zinc-500">
                          المبلغ
                        </TableHead>
                        <TableHead className="text-right font-bold text-zinc-500">
                          الحالة
                        </TableHead>
                        <TableHead className="text-right px-8 font-bold text-zinc-500">
                          الإجراءات
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-20 text-zinc-400 font-medium"
                          >
                            لا توجد طلبات سابقة لهذا العميل
                          </TableCell>
                        </TableRow>
                      ) : (
                        orders.map((order) => (
                          <TableRow
                            key={order.id}
                            className="hover:bg-zinc-50/50 transition-colors border-b-zinc-50"
                          >
                            <TableCell className="px-8 font-black text-emerald-900">
                              {order.orderNumber}
                            </TableCell>
                            <TableCell className="text-zinc-500 text-sm font-medium">
                              {format(
                                new Date(order.createdAt),
                                "dd MMMM yyyy | HH:mm",
                                { locale: ar },
                              )}
                            </TableCell>
                            <TableCell className="font-black text-emerald-700 text-lg">
                              {order.totalPrice.toLocaleString()}{" "}
                              <span className="text-xs text-emerald-600/70">
                                ج.م
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  "inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold shadow-sm",
                                  STATUS_MAP[
                                    order.status as keyof typeof STATUS_MAP
                                  ].color,
                                )}
                              >
                                {
                                  STATUS_MAP[
                                    order.status as keyof typeof STATUS_MAP
                                  ].label
                                }
                              </span>
                            </TableCell>
                            <TableCell className="px-8">
                              <Button
                                onClick={() => openOrderDetails(order)}
                                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all active:scale-90"
                              >
                                <Eye className="w-5 h-5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={isOrderDetailsOpen}
        onOpenChange={setIsOrderDetailsOpen}
        onOrderUpdated={handleOrderUpdated}
      />
    </>
  );
}
