import { create } from "zustand";
import { persist } from "zustand/middleware";

import { SerializedCustomer, SerializedAddress } from "@/types";

interface CustomerStore {
  customer: SerializedCustomer | null;
  isInitialized: boolean;
  setCustomer: (customer: SerializedCustomer | null) => void;
  setInitialized: (initialized: boolean) => void;
  addAddress: (address: SerializedAddress) => void;
  updateAddress: (address: SerializedAddress) => void;
  logout: () => void;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      customer: null,
      isInitialized: false,
      setCustomer: (customer) => set({ customer, isInitialized: true }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      addAddress: (address) =>
        set((state) => ({
          customer: state.customer
            ? {
                ...state.customer,
                addresses: [...(state.customer.addresses || []), address],
              }
            : null,
        })),
      updateAddress: (updatedAddress) =>
        set((state) => ({
          customer: state.customer
            ? {
                ...state.customer,
                addresses: (state.customer.addresses || []).map((addr) =>
                  addr.id === updatedAddress.id ? updatedAddress : addr
                ),
              }
            : null,
        })),
      logout: () => set({ customer: null, isInitialized: true }),
    }),
    {
      name: "badr-customer-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.setInitialized(true);
      },
    }
  )
);
