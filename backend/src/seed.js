import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Seed Database Lagu Rohani
  const songs = [
    { number: 1, title: "O Tuhan, Bukalah Mulutku", lyrics: "O Tuhan, bukalah mulutku\nsupaya mulutku memberitakan pujian kepada-Mu\n\nAku mau memuji Engkau seumur hidupku\ndan menyanyikan mazmur bagi-Mu selama aku masih ada", songBook: "Pustaka Lagu", author: "Traditional" },
    { number: 2, title: "Mari Berlomba", lyrics: "Mari berlomba, berlomba dalam iman\nBerlomba dalam kesalehan\n\nMari berlomba, berlomba dalam kasih\nBerlomba dalam pengharapan", songBook: "Pustaka Lagu", author: "Traditional" },
    { number: 3, title: "Haleluya, Pujilah Tuhan", lyrics: "Haleluya, pujilah Tuhan, hai segala bangsa\nPujilah Dia, hai segala suku\n\nSebab kasih setia-Nya besar atas kita\ndan kebenaran-Nya untuk selama-lamanya", songBook: "Pustaka Lagu", author: "Traditional" },
    { number: 4, title: "Yesus Kawan yang Sejati", lyrics: "Yesus kawan yang sejati\ntiada tara kasih-Nya\nIa selalu beserta kita\ntak pernah meninggalkan kita", songBook: "Pustaka Lagu", author: "Traditional" },
    { number: 5, title: "Ku Cinta Kau Tuhan", lyrics: "Ku cinta Kau Tuhan\ndengan segenap hati\nku cinta Kau Tuhan\ndengan segenap jiwaku", songBook: "Pustaka Lagu", author: "Traditional" },
    { number: 6, title: "Bapa Yang Kekal", lyrics: "Bapa yang kekal, kami memuji Engkau\nSeluruh bumi menyembahMu\n\nKami bersyukur atas kasih setiaMu\nyang baru setiap pagi", songBook: "Pustaka Lagu", author: "Traditional" },
    { number: 7, title: "Yesus Kekasih Jiwaku", lyrics: "Yesus kekasih jiwaku\nizinkan aku dekat padaMu\n\nJangan tinggalkan aku sendiri\nkarena hanya Engkau penghiburku", songBook: "Pustaka Lagu", author: "Traditional" },
    { number: 8, title: "Kumulia NamaMu", lyrics: "Kumulia namaMu, ya Tuhanku\nkumulia namaMu slama-lamanya\n\nSebab Engkau layak menerima segala pujian\ndan hormat dan kemuliaan", songBook: "Pustaka Lagu", author: "Traditional" },
    { number: 9, title: "S'perti Rusa Rindu SungaiMu", lyrics: "Seperti rusa rindu sungaiMu\njiwaku rindu kepadaMu\n\nHatiku haus akan hadiratMu\nTuhan, aku merindukanMu", songBook: "Pustaka Lagu", author: "Traditional" },
    { number: 10, title: "Bilamana Hatiku", lyrics: "Bilamana hatiku bersungut-sungut\nIngatlah kasih setiaMu Tuhan\n\nEngkaulah kekuatan dan perisaiku\ndi dalam namaMu aku percaya", songBook: "Pustaka Lagu", author: "Traditional" }
  ];
  
  for (const song of songs) {
    await prisma.song.upsert({
      where: { number: song.number },
      update: song,
      create: song
    });
  }
  
  console.log(`✅ Seeded ${songs.length} songs`);
  
  // Seed Church Calendar
  const churchDays = [
    { 
      id: "advent_1_2024",
      name: "Advent 1", 
      date: new Date("2024-12-01"), 
      description: "Awal masa Advent, minggu pertama persiapan Natal", 
      color: "Ungu" 
    },
    { 
      id: "natal_2024",
      name: "Natal", 
      date: new Date("2024-12-25"), 
      description: "Hari Kelahiran Yesus Kristus", 
      color: "Putih" 
    },
    { 
      id: "paskah_2025",
      name: "Paskah", 
      date: new Date("2025-04-20"), 
      description: "Kebangkitan Yesus Kristus", 
      color: "Putih" 
    },
    { 
      id: "pentakosta_2025",
      name: "Pentakosta", 
      date: new Date("2025-06-08"), 
      description: "Turunnya Roh Kudus", 
      color: "Merah" 
    }
  ];
  
  for (const day of churchDays) {
    await prisma.churchCalendar.upsert({
      where: { id: day.id },
      update: day,
      create: day
    });
  }
  
  console.log(`✅ Seeded ${churchDays.length} church calendar events`);

  // Seed Default Admin User
  const adminEmail = "admin@smartworship.com";
  const hashedPassword = await import('bcryptjs').then(m => m.default.hash("admin123", 10));
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin Smart Worship",
      email: adminEmail,
      password: hashedPassword
    }
  });

  console.log(`✅ Seeded default admin user: ${adminEmail}`);
  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });