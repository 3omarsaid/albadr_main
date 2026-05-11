import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Clear existing data in correct order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customerAddress.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();

  // Product 1: سماد عضوي سائل بلس
  await prisma.product.create({
    data: {
      name: "سماد عضوي سائل بلس",
      description:
        "سماد عضوي سائل بلس بتركيبة متطورة تحتوي على العناصر الكبرى والصغرى اللازمة لنمو النبات. مستخلص من مصادر طبيعية 100% لضمان إنتاجية عالية وجودة ثمار ممتازة.",
      category: "سماد عضوي",
      images: [
        "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop",
      ],
      unit: "جركن",
      price: 500,
      isActive: true,
    },
  });

  // Product 2: نيتروجين خام (جملة)
  await prisma.product.create({
    data: {
      name: "نيتروجين خام (جملة)",
      description:
        "نيتروجين عالي التركيز مخصص للطلبات الكبيرة والمزارع الكبرى. يتم توفيره بنظام الجملة لضمان أفضل سعر وأعلى جودة. السعر المذكور مبدئي وقابل للتفاوض حسب الكمية.",
      category: "كيماويات زراعية",
      images: [
        "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=800&auto=format&fit=crop",
      ],
      unit: "طن",
      price: 0, // 0 means negotiable
      isActive: true,
    },
  });

  // Product 3: محسن تربة صلب
  await prisma.product.create({
    data: {
      name: "محسن تربة صلب",
      description:
        "محسن تربة صلب يعمل على تحسين الخواص الفيزيائية والكيميائية للتربة، مما يزيد من قدرتها على الاحتفاظ بالمياه والعناصر الغذائية. مثالي للأراضي الرملية والجديدة.",
      category: "محسنات التربة",
      images: [
        "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop",
      ],
      unit: "شيكارة",
      price: 200,
      isActive: true,
    },
  });

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
