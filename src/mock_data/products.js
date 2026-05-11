export const mockProducts = [
  {
    id: "prod-1",
    name: "سماد عضوي سائل بلس",
    description:
      "سماد عضوي طبيعي 100% مستخلص من مواد نباتية وحيوانية، يساعد على تحسين خواص التربة وزيادة الإنتاجية.",
    category: "سماد عضوي",
    images: [
      "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=800&auto=format&fit=crop",
    ],
    unit: "جركن",
    price: 450,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "prod-2",
    name: "نيتروجين خام (جملة)",
    description: "نيتروجين عالي التركيز مخصص للطلبات الكبيرة والمزارع الكبرى. يتم توفيره بنظام الجملة لضمان أفضل سعر وأعلى جودة.",
    category: "كيماويات زراعية",
    images: [
      "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=800&auto=format&fit=crop",
    ],
    unit: "طن",
    price: 0, // Negotiable
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "prod-3",
    name: "محسن تربة صلب",
    description: "محسن تربة صلب يعمل على تحسين الخواص الفيزيائية والكيميائية للتربة.",
    category: "محسنات التربة",
    images: [
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop",
    ],
    unit: "شيكارة",
    price: 200,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];
