import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@brilliance.com' },
    update: {},
    create: {
      email: 'admin@brilliance.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create locations
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { id: 'location-1' },
      update: {},
      create: {
        id: 'location-1',
        name: 'Brilliance Lisboa Centro',
        address: 'Rua Augusta 123',
        city: 'Lisboa',
        country: 'Portugal',
        postalCode: '1100-053',
        capacity: 10,
        lat: 38.7223,
        lng: -9.1393,
        isActive: true,
      },
    }),
    prisma.location.upsert({
      where: { id: 'location-2' },
      update: {},
      create: {
        id: 'location-2',
        name: 'Brilliance Porto',
        address: 'Rua de Santa Catarina 456',
        city: 'Porto',
        country: 'Portugal',
        postalCode: '4000-442',
        capacity: 8,
        lat: 41.1579,
        lng: -8.6291,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${locations.length} locations created`);

  // Create sample availability slots (next 7 days)
  const today = new Date();
  const slots = [];

  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const times = ['10:00', '14:00', '16:00'];

    for (const time of times) {
      // Presencial slots for both locations
      for (const location of locations) {
        slots.push({
          locationId: location.id,
          date,
          time,
          duration: 60,
          type: 'PRESENCIAL' as const,
          status: 'AVAILABLE' as const,
        });
      }

      // Online slots (no location)
      slots.push({
        date,
        time,
        duration: 60,
        type: 'ONLINE' as const,
        status: 'AVAILABLE' as const,
      });
    }
  }

  // SQLite does not support createMany
  console.log('⏳ Creating slots one by one (SQLite)...');
  await Promise.all(
    slots.map((slot) =>
      prisma.availabilitySlot.create({
        data: slot,
      })
    )
  );
  console.log(`✅ ${slots.length} availability slots created`);

  console.log('🎉 Database seed completed successfully!');
  console.log('');
  console.log('📝 Admin credentials:');
  console.log('   Email: admin@brilliance.com');
  console.log('   Password: admin123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
