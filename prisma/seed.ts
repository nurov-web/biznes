import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@businesspilot.tj";
  const phone = "+992900000000";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Demo user already exists");
    return;
  }
  const user = await prisma.user.create({
    data: {
      firstName: "Али",
      lastName: "Каримов",
      email,
      phone,
      passwordHash: await hash("Demo12345!", 12),
      phoneVerified: true,
      offerAccepted: true,
      role: "owner",
    },
  });
  const business = await prisma.business.create({
    data: {
      ownerId: user.id,
      name: "Компютер Маркет",
      type: "trade",
      city: "Душанбе",
      yearsOpen: 2,
      employees: 3,
      channel: "both",
      competitors: "TezKhor, Somon computer shops",
      audience: "ҷавонон ва офисҳо",
      onboardingDone: true,
    },
  });
  await prisma.product.createMany({
    data: [
      {
        businessId: business.id,
        category: "Ноутбук",
        brand: "Asus",
        model: "VivoBook 15",
        buyPriceMin: 2500,
        buyPriceMax: 3000,
        sellPriceMin: 3200,
        sellPriceMax: 3800,
        quantity: 15,
        condition: "new",
      },
      {
        businessId: business.id,
        category: "Лавозимот",
        brand: "Kingston",
        model: "SSD 1TB",
        buyPriceMin: 420,
        buyPriceMax: 480,
        sellPriceMin: 590,
        sellPriceMax: 650,
        quantity: 2,
        condition: "new",
      },
    ],
  });
  await prisma.customer.create({
    data: {
      businessId: business.id,
      name: "Зафар",
      phone: "+992901111111",
      tags: "vip",
      notes: "Харидори доимӣ",
    },
  });
  await prisma.financeEntry.create({
    data: {
      businessId: business.id,
      type: "income",
      amount: 3500,
      category: "sales",
      note: "VivoBook",
    },
  });
  console.log("Seeded demo@businesspilot.tj / Demo12345!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
