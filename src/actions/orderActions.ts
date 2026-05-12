"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { AdminOrder } from "@/types";

const CheckoutSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  phoneNumber: z.string().min(10, "رقم الهاتف غير صالح"),
  addressName: z.string().optional().default("عنوان التوصيل"),
  latitude: z.number(),
  longitude: z.number(),
  addressText: z.string().min(5, "العنوان بالتفصيل مطلوب"),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number(),
      isNegotiable: z.boolean(),
    }),
  ),
  totalPrice: z.number(),
});

export async function submitOrder(data: z.infer<typeof CheckoutSchema>) {
  try {
    const validatedData = CheckoutSchema.parse(data);

    // Create or update customer
    const customer = await prisma.customer.upsert({
      where: { phoneNumber: validatedData.phoneNumber },
      update: { name: validatedData.name },
      create: {
        phoneNumber: validatedData.phoneNumber,
        name: validatedData.name,
      },
    });

    // Check if address already exists for this customer
    let address = await prisma.customerAddress.findFirst({
      where: {
        customerId: customer.id,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
      },
    });

    if (!address) {
      address = await prisma.customerAddress.create({
        data: {
          customerId: customer.id,
          addressName: validatedData.addressName,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          addressText: validatedData.addressText,
          isDefault: true,
        },
      });
    } else {
      // Update existing address text if it changed
      address = await prisma.customerAddress.update({
        where: { id: address.id },
        data: {
          addressText: validatedData.addressText,
          addressName: validatedData.addressName,
        },
      });
    }

    // Generate Order Number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        addressId: address.id,
        totalPrice: validatedData.totalPrice,
        status: "PENDING",
        paymentMethod: "cash_on_delivery",
        items: {
          create: validatedData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Format WhatsApp message
    let message = `*طلب جديد من تطبيق البدر* 🌟\n\n`;
    message += `*رقم الطلب:* ${orderNumber}\n`;
    message += `*الاسم:* ${customer.name}\n`;
    message += `*رقم الهاتف:* ${customer.phoneNumber}\n`;
    message += `*العنوان:* ${address.addressText}\n`;
    message += `*رابط الموقع:* https://maps.google.com/?q=${address.latitude},${address.longitude}\n\n`;
    message += `*المنتجات:*\n`;

    let hasNegotiable = false;

    order.items.forEach((item) => {
      const isNegotiableItem =
        validatedData.items.find((i) => i.productId === item.productId)
          ?.isNegotiable || false;
      if (isNegotiableItem) hasNegotiable = true;

      const priceText = isNegotiableItem
        ? "يحدد لاحقاً"
        : `${item.priceAtPurchase} ج.م`;
      message += `- ${item.product.name} | الكمية: ${item.quantity} | السعر: ${priceText}\n`;
    });

    message += `\n*الإجمالي:* ${hasNegotiable ? "السعر النهائي يحدد عبر الواتساب" : `${validatedData.totalPrice} ج.م`}\n`;

    const whatsappNumber =
      process.env.NEXT_PUBLIC_ADMIN_PHONE || "+201140922830";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    return { success: true, orderId: order.id, whatsappUrl };
  } catch (error) {
    console.error("Order submission failed:", error);
    return { success: false, error: "Failed to submit order" };
  }
}

export async function getOrders(status?: OrderStatus): Promise<AdminOrder[]> {
  try {
    const orders = await prisma.order.findMany({
      where: status ? { status } : {},
      include: {
        customer: true,
        address: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders.map((order) => {
      if (!order.customer) throw new Error(`Order ${order.id} has no customer`);

      return {
        ...order,
        totalPrice: Number(order.totalPrice),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        address: order.address
          ? {
              ...order.address,
              createdAt: order.address.createdAt.toISOString(),
              updatedAt: order.address.updatedAt.toISOString(),
            }
          : null,
        addressText: order.address?.addressText || null,
        latitude: Number(order.address?.latitude || 0),
        longitude: Number(order.address?.longitude || 0),
        customer: {
          ...order.customer,
          createdAt: order.customer.createdAt.toISOString(),
          updatedAt: order.customer.updatedAt.toISOString(),
        },
        items: order.items.map((item) => {
          if (!item.product)
            throw new Error(`OrderItem ${item.id} has no product`);
          return {
            ...item,
            priceAtPurchase: Number(item.priceAtPurchase),
            createdAt: item.createdAt.toISOString(),
            product: {
              ...item.product,
              price: Number(item.product.price),
              createdAt: item.product.createdAt.toISOString(),
              updatedAt: item.product.updatedAt.toISOString(),
            },
          };
        }),
      };
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export async function getDashboardStats() {
  try {
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING" },
    });

    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        status: { not: "CANCELLED" },
      },
    });

    const totalRevenue = Number(revenueResult._sum.totalPrice || 0);

    const activeProducts = await prisma.product.count({
      where: { isActive: true },
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    });

    return {
      totalOrders,
      pendingOrders,
      totalRevenue,
      activeProducts,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        totalPrice: Number(o.totalPrice),
        createdAt: o.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0,
      activeProducts: 0,
      recentOrders: [],
    };
  }
}

export async function updateOrderItemsPrices(orderId: string, items: { id: string; newPrice: number }[]) {
  try {
    await prisma.$transaction(
      items.map(item => 
        prisma.orderItem.update({
          where: { id: item.id },
          data: { priceAtPurchase: item.newPrice }
        })
      )
    );

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (updatedOrder) {
      const newTotal = updatedOrder.items.reduce((sum, item) => sum + (Number(item.priceAtPurchase) * item.quantity), 0);
      await prisma.order.update({
        where: { id: orderId },
        data: { totalPrice: newTotal }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update prices:", error);
    return { success: false, error: "Failed to update prices" };
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    if (status === "CONFIRMED" || status === "DELIVERED") {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (order?.items.some((item) => Number(item.priceAtPurchase) === 0)) {
        return { success: false, error: "لا يمكن تأكيد الطلب قبل تحديد أسعار جميع المنتجات (التي تباع بالطن)" };
      }
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return { success: true, order };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

export async function getChartData(
  period: "day" | "week" | "month" | "year" | "custom" = "month",
  customStart?: string,
  customEnd?: string,
) {
  try {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (period === "custom" && customStart) {
      startDate = new Date(customStart);
      startDate.setHours(0, 0, 0, 0);
      if (customEnd) {
        endDate = new Date(customEnd);
        endDate.setHours(23, 59, 59, 999);
      }
    } else {
      switch (period) {
        case "day":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { not: "CANCELLED" },
      },
      select: {
        createdAt: true,
        totalPrice: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Grouping logic based on period
    const dataMap = new Map<
      string,
      { date: string; orders: number; revenue: number }
    >();

    // We can't import date-fns easily if we are at the bottom and format is not imported.
    // We'll import it inside the action or at the top. Let's just use manual string formatting here to avoid import issues if date-fns format isn't available.

    orders.forEach((order) => {
      let key = "";
      const date = new Date(order.createdAt);

      if (period === "day") {
        key = `${date.getHours().toString().padStart(2, "0")}:00`;
      } else if (period === "week" || period === "month") {
        key = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      } else if (period === "year") {
        key = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
      }

      if (!dataMap.has(key)) {
        dataMap.set(key, { date: key, orders: 0, revenue: 0 });
      }

      const entry = dataMap.get(key)!;
      entry.orders += 1;
      entry.revenue += Number(order.totalPrice);
    });

    return {
      success: true,
      data: Array.from(dataMap.values()),
    };
  } catch (error) {
    console.error("Failed to fetch chart data:", error);
    return { success: false, data: [] };
  }
}
