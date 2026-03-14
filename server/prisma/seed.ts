import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Create Admin User
  const passwordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@coreinventory.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@coreinventory.com',
      passwordHash,
      role: 'Admin',
    },
  });
  console.log('Admin created:', admin.email);

  // 2. Create Warehouses
  const wh1 = await prisma.warehouse.upsert({
    where: { shortCode: 'WH-MAIN' },
    update: {},
    create: {
      name: 'Main Warehouse',
      shortCode: 'WH-MAIN',
      address: '123 Logistics Way, NY',
    },
  });

  const wh2 = await prisma.warehouse.upsert({
    where: { shortCode: 'WH-EAST' },
    update: {},
    create: {
      name: 'East Coast Center',
      shortCode: 'WH-EAST',
      address: '456 Supply Blvd, NJ',
    },
  });

  // 3. Create Locations
  const loc1 = await prisma.location.upsert({
    where: { warehouseId_shortCode: { warehouseId: wh1.id, shortCode: 'A1' } },
    update: {},
    create: {
      name: 'Shelf A1',
      shortCode: 'A1',
      warehouseId: wh1.id,
    },
  });

  const loc2 = await prisma.location.upsert({
    where: { warehouseId_shortCode: { warehouseId: wh1.id, shortCode: 'REC' } },
    update: {},
    create: {
      name: 'Receiving Area',
      shortCode: 'REC',
      warehouseId: wh1.id,
    },
  });

  const loc3 = await prisma.location.upsert({
    where: { warehouseId_shortCode: { warehouseId: wh2.id, shortCode: 'ST-01' } },
    update: {},
    create: {
      name: 'Storage 01',
      shortCode: 'ST-01',
      warehouseId: wh2.id,
    },
  });

  // 4. Create Products
  const p1 = await prisma.product.upsert({
    where: { sku: 'PROD-MAC-01' },
    update: {},
    create: {
      name: 'MacBook Pro M3',
      sku: 'PROD-MAC-01',
      unit: 'pcs',
      description: 'High performance laptop',
      minStockLevel: 5,
    },
  });

  const p2 = await prisma.product.upsert({
    where: { sku: 'PROD-IPH-15' },
    update: {},
    create: {
      name: 'iPhone 15 Pro',
      sku: 'PROD-IPH-15',
      unit: 'pcs',
      description: 'Latest apple smartphone',
      minStockLevel: 10,
    },
  });

  // 5. Initial Stock
  await prisma.stock.upsert({
    where: { productId_locationId: { productId: p1.id, locationId: loc1.id } },
    update: { onHand: 20 },
    create: { productId: p1.id, locationId: loc1.id, onHand: 20 },
  });

  await prisma.stock.upsert({
    where: { productId_locationId: { productId: p2.id, locationId: loc3.id } },
    update: { onHand: 50 },
    create: { productId: p2.id, locationId: loc3.id, onHand: 50 },
  });

  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
