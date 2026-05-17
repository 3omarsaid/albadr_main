"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export const WhatsAppButton = () => {
  const whatsappNumber = "+201094920744";
  const message = encodeURIComponent(
    "مرحباً البدر، أود الاستفسار عن منتجاتكم.",
  );

  return (
    <div>
      <motion.a
        href={`https://wa.me/${whatsappNumber}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1 }}
        whileTap={{ scale: 0.8 }}
        className="fixed top-4 left-7 z-10000 bg-[#25D366] text-white p-2 rounded-full shadow-2xl shadow-[#25D366]/40 cursor-pointer"
      >
        <div className="relative flex items-center gap-1">
          <div className="z-10000  text-white p-2 rounded-full shadow-2xl shadow-[#25D366]/40 cursor-pointer">
            <span className="text-xs">راسلنا واتساب</span>
          </div>
          <MessageCircle className="w-4 h-4" />
          <motion.span
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-white rounded-full -z-10"
          />
        </div>
      </motion.a>
    </div>
  );
};
