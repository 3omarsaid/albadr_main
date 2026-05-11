import React from 'react';
import { BottomNav } from '@/components/customer/BottomNav';
import { WhatsAppButton } from '@/components/customer/WhatsAppButton';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BottomNav />
      <WhatsAppButton />
    </>
  );
}
