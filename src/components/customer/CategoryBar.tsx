'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Droplets, ShieldCheck, Grid } from 'lucide-react';

const categories = [
  { id: 'all', name: 'الكل', icon: Grid },
  { id: 'organic', name: 'سماد عضوي', icon: Leaf },
  { id: 'soil', name: 'محسنات التربة', icon: Droplets },
  { id: 'natural', name: 'مبيدات طبيعية', icon: ShieldCheck },
];

export const CategoryBar = () => {
  const [active, setActive] = React.useState('all');

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-6 px-4">
      <div className="flex space-x-4 rtl:space-x-reverse min-w-max">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = active === category.id;

          return (
            <motion.button
              key={category.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActive(category.id)}
              className={`
                flex items-center space-x-3 rtl:space-x-reverse px-6 py-3 rounded-full border-2 transition-all
                ${isActive 
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white border-border text-muted-foreground hover:border-primary/50'}
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary'}`} />
              <span className="font-sans font-medium text-lg whitespace-nowrap">
                {category.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
