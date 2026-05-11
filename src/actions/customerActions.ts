"use server";

import { prisma } from "@/lib/prisma";
import type { CustomerAddress } from "@prisma/client";

import { SerializedCustomer, SerializedAddress } from "@/types";

export async function getCustomerByPhone(phoneNumber: string): Promise<SerializedCustomer | null> {
  try {
    const customer = await prisma.customer.findUnique({
      where: { phoneNumber },
      include: {
        addresses: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) return null;

    return {
      ...customer,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      addresses: customer.addresses.map((addr: CustomerAddress) => ({
        ...addr,
        createdAt: addr.createdAt.toISOString(),
        updatedAt: addr.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return null;
  }
}

export async function createOrUpdateCustomer(name: string, phoneNumber: string) {
  try {
    const customer = await prisma.customer.upsert({
      where: { phoneNumber },
      update: { name },
      create: {
        phoneNumber,
        name,
      },
      include: {
        addresses: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const serializedCustomer: SerializedCustomer = {
      ...customer,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      addresses: customer.addresses.map(addr => ({
        ...addr,
        createdAt: addr.createdAt.toISOString(),
        updatedAt: addr.updatedAt.toISOString(),
      })),
    };

    return { success: true, customer: serializedCustomer };
  } catch (error) {
    console.error("Failed to create/update customer:", error);
    return { success: false, error: "Failed to save customer data" };
  }
}

export async function saveCustomerAddress(customerId: string, addressData: {
  addressName: string;
  latitude: number;
  longitude: number;
  addressText: string;
  isDefault?: boolean;
}) {
  try {
    // If setting as default, unset others
    if (addressData.isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.customerAddress.create({
      data: {
        customerId,
        ...addressData,
        isDefault: addressData.isDefault ?? false,
      },
    });

    const serializedAddress: SerializedAddress = {
      ...address,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    };

    return { success: true, address: serializedAddress };
  } catch (error) {
    console.error("Failed to save address:", error);
    return { success: false, error: "Failed to save address" };
  }
}

export async function getCustomerOrders(customerId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        customer: true,
        address: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const serializedOrders = orders.map(order => ({
      ...order,
      totalPrice: Number(order.totalPrice),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      addressText: order.address?.addressText || null,
      latitude: order.address?.latitude || 0,
      longitude: order.address?.longitude || 0,
      customer: {
        ...order.customer,
        createdAt: order.customer.createdAt.toISOString(),
        updatedAt: order.customer.updatedAt.toISOString(),
      },
      items: order.items.map(item => ({
        ...item,
        priceAtPurchase: Number(item.priceAtPurchase),
        createdAt: item.createdAt.toISOString(),
        product: {
          ...item.product,
          price: Number(item.product.price),
          createdAt: item.product.createdAt.toISOString(),
          updatedAt: item.product.updatedAt.toISOString(),
        }
      }))
    }));

    return { success: true, orders: serializedOrders };
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}
