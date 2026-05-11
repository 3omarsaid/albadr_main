'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const HeroBanner = () => {
  return (
    <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-3xl mx-auto max-w-7xl mt-4">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero_banner_background.png"
          alt="Bio-AgriTech Hero"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-transparent rtl:bg-gradient-to-l" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-8 md:px-16 text-white z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-right"
        >
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 leading-tight">
            أسمدة عضوية<br />
            طبيعية 100%
          </h1>
          <p className="text-lg md:text-xl font-sans mb-8 text-white/90">
            نمو صحي لمحاصيلك، تربة غنية للمستقبل. 
            اكتشف مجموعة البدر المتكاملة من المخصبات الحيوية.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-xl rounded-xl transition-all hover:scale-105"
          >
            تسوق الآن
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
