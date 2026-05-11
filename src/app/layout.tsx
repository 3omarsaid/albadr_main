import type { Metadata } from "next";
import "./globals.css";
import { Toaster as HotToaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
import { WelcomeModal } from "@/components/customer/WelcomeModal";

export const metadata: Metadata = {
  title: "البدر | Bio-AgriTech",
  description: "منصة البدر للأسمدة العضوية والمخصبات الحيوية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        {children}
        <WelcomeModal />
        <HotToaster position="top-center" />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
