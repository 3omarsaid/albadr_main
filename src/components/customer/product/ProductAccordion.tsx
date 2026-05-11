'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-zinc-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-right transition-colors hover:bg-zinc-50/50 rounded-lg"
      >
        <div className="flex items-center gap-3">
          <div className="text-emerald-600">{icon}</div>
          <span className="font-bold text-zinc-800">{title}</span>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-zinc-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-1 px-9 text-zinc-600 text-sm leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ProductAccordionProps {
  description: string;
  usageInstructions?: string;
  features?: string[];
}

export const ProductAccordion: React.FC<ProductAccordionProps> = ({
  description,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-4 pb-20">
      <AccordionItem
        title="وصف المنتج"
        icon={<Info className="w-5 h-5" />}
        isOpen={openIndex === 0}
        onToggle={() => setOpenIndex(openIndex === 0 ? null : 0)}
      >
        <p>{description}</p>
      </AccordionItem>

      <AccordionItem
        title="معلومات الشحن"
        icon={<Truck className="w-5 h-5" />}
        isOpen={openIndex === 2}
        onToggle={() => setOpenIndex(openIndex === 2 ? null : 2)}
      >
        <p>يتم الشحن خلال 2-5 أيام عمل بحد أقصى. خدمة التوصيل متاحة لجميع محافظات مصر مع ضمان سلامة وصول المنتج في أفضل حالة.</p>
      </AccordionItem>
    </div>
  );
};
