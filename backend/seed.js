const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

const seedData = async (isCli = false) => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri);
    }
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Event.deleteMany();
    await Registration.deleteMany();
    console.log('Cleaned existing collections.');

    // 1. Create Admin and Demo User
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const userPassword = await bcrypt.hash('User@123', 10);
    const sarahPassword = await bcrypt.hash('User@123', 10);

    const users = await User.insertMany([
      {
        name: 'EventHub Administrator',
        email: 'admin@eventhub.com',
        phone: '+1 555-0199',
        password: adminPassword,
        role: 'admin',
        createdAt: new Date('2026-01-10')
      },
      {
        name: 'Alex Johnson',
        email: 'user@eventhub.com',
        phone: '+1 555-0144',
        password: userPassword,
        role: 'user',
        createdAt: new Date('2026-02-01')
      },
      {
        name: 'Sarah Williams',
        email: 'sarah.w@example.com',
        phone: '+1 555-0177',
        password: sarahPassword,
        role: 'user',
        createdAt: new Date('2026-02-15')
      },
      {
        name: 'Michael Chen',
        email: 'mchen@example.com',
        phone: '+1 555-0288',
        password: userPassword,
        role: 'user',
        createdAt: new Date('2026-03-01')
      }
    ]);

    const adminUser = users[0];
    const demoUser = users[1];
    const userSarah = users[2];
    const userMichael = users[3];

    console.log('Created Users: Admin & 3 Users.');

    // 2. Create Events (10 diverse, realistic events)
    const now = new Date();
    const addDays = (days) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return d;
    };

    const eventsData = [
      {
        title: 'National Coding Hackathon 2026',
        shortDescription: '48-hour intense coding marathon with real-world industry challenges and cash prizes.',
        description: 'Join over 500 developers, designers, and innovators at the National Coding Hackathon 2026. Build innovative solutions for healthcare, sustainability, and fintech. Mentors from top tech enterprises will guide teams through workshops and pitch sessions. Food, swag, and cloud credits provided for all participants.',
        category: 'Hackathons',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        date: addDays(14),
        startTime: '09:00 AM',
        endTime: '06:00 PM',
        venue: 'Grand Innovation Arena, Silicon Boulevard, Tech Hub',
        organizerName: 'TechVanguard Foundation',
        organizerEmail: 'hackathon@techvanguard.org',
        totalSeats: 250,
        availableSeats: 247,
        registrationDeadline: addDays(10),
        isFeatured: true,
        status: 'upcoming'
      },
      {
        title: 'Global AI & Machine Learning Summit',
        shortDescription: 'Explore generative AI frontiers, LLM deployment, and modern neural architectures.',
        description: 'The premier AI conference bringing together researchers, data scientists, and engineering leaders. Keynotes from industry pioneers on Foundation Models, RAG pipelines, Autonomous Agents, and Ethical AI. Includes interactive demo pods and high-impact networking lounges.',
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        date: addDays(25),
        startTime: '10:00 AM',
        endTime: '05:30 PM',
        venue: 'Metropolitan Convention Center, Auditorium A',
        organizerName: 'AI Horizons Institute',
        organizerEmail: 'summit@aihorizons.io',
        totalSeats: 350,
        availableSeats: 348,
        registrationDeadline: addDays(20),
        isFeatured: true,
        status: 'upcoming'
      },
      {
        title: 'Full Stack Modern Web Engineering Masterclass',
        shortDescription: 'Hands-on intensive masterclass on React 19, Node.js microservices, and modern state architecture.',
        description: 'A deep-dive workshop for intermediate to senior developers looking to level up their architecture skills. We will build, benchmark, and deploy a distributed scalable application using React, Vite, Node, and MongoDB with production performance optimizations and security best practices.',
        category: 'Workshops',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
        date: addDays(7),
        startTime: '11:00 AM',
        endTime: '04:00 PM',
        venue: 'DevLaunch Campus, Studio 4',
        organizerName: 'FullStack Guild',
        organizerEmail: 'workshops@fullstackguild.dev',
        totalSeats: 80,
        availableSeats: 78,
        registrationDeadline: addDays(5),
        isFeatured: true,
        status: 'upcoming'
      },
      {
        title: 'Annual Inter-College Cultural Fest "Kaleidoscope"',
        shortDescription: 'Three days of vibrant music, drama, dance showcases, fashion shows, and art installations.',
        description: 'Kaleidoscope is the most anticipated cultural celebration of the season. Featuring live performances from headline indie artists, competitive collegiate dance battles, street play theatre, culinary stalls, and digital media exhibitions. Celebrate art, creativity, and student passion.',
        category: 'Cultural Events',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        date: addDays(30),
        startTime: '04:00 PM',
        endTime: '11:00 PM',
        venue: 'University Central Amphitheatre',
        organizerName: 'Student Union Council',
        organizerEmail: 'kaleidoscope@university.edu',
        totalSeats: 600,
        availableSeats: 597,
        registrationDeadline: addDays(28),
        isFeatured: true,
        status: 'upcoming'
      },
      {
        title: 'Tech Founders & Angel Investors Summit',
        shortDescription: 'Connect with top venture capitalists, pitch your seed idea, and learn scaling tactics.',
        description: 'An exclusive assembly designed for early-stage startup founders, operators, and active angel investors. Featuring pitch sessions, fundraising teardowns, roundtable strategy lunches, and legal advisory clinics for high-growth tech entrepreneurs.',
        category: 'Business',
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
        date: addDays(18),
        startTime: '09:30 AM',
        endTime: '05:00 PM',
        venue: 'Starlight Financial Center, 32nd Floor Ballroom',
        organizerName: 'VentureCatalyst Network',
        organizerEmail: 'connect@venturecatalyst.co',
        totalSeats: 150,
        availableSeats: 148,
        registrationDeadline: addDays(14),
        isFeatured: true,
        status: 'upcoming'
      },
      {
        title: 'Symphonic Nights: Classical & Electronic Fusion',
        shortDescription: 'An electrifying sensory experience blending classical orchestral arrangement with ambient electronic soundscapes.',
        description: 'Immerse your senses in a one-of-a-kind musical spectacle. The Metropolitan Youth Philharmonic collaborates with world-renowned synthesizer artists and light sculptors to reimagine modern symphonic masterpieces in surround acoustic audio.',
        category: 'Music',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        date: addDays(21),
        startTime: '07:30 PM',
        endTime: '10:30 PM',
        venue: 'Aria Concert Hall, Downtown Cultural District',
        organizerName: 'Harmonic Arts Foundation',
        organizerEmail: 'boxoffice@harmonicarts.org',
        totalSeats: 400,
        availableSeats: 398,
        registrationDeadline: addDays(19),
        isFeatured: false,
        status: 'upcoming'
      },
      {
        title: 'UI/UX Design Systems Workshop 2026',
        shortDescription: 'Learn to build scalable design tokens, accessible components, and seamless developer handoff.',
        description: 'Learn modern Figma component architectures, design tokens with style-dictionary, WCAG 2.2 accessibility compliance, and streamlined Figma-to-code pipelines. Perfect for product designers and frontend developers seeking design system mastery.',
        category: 'Workshops',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
        date: addDays(9),
        startTime: '01:00 PM',
        endTime: '06:00 PM',
        venue: 'Creativity Loft, 4th Avenue Creative Quarter',
        organizerName: 'DesignCraft Collective',
        organizerEmail: 'hello@designcraft.studio',
        totalSeats: 60,
        availableSeats: 58,
        registrationDeadline: addDays(7),
        isFeatured: false,
        status: 'upcoming'
      },
      {
        title: 'Inter-University Esports & Sports Championship',
        shortDescription: 'Multi-day athletics and competitive esports tournament featuring soccer, basketball, and Valorant.',
        description: 'Watch the highest level of collegiate athleticism and esports excellence. Teams from 24 universities battle for trophies, scholarships, and glory across outdoor sports and staged gaming arenas with live shoutcasting.',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
        date: addDays(40),
        startTime: '08:00 AM',
        endTime: '08:00 PM',
        venue: 'Olympic Sports Complex & Esports Arena',
        organizerName: 'Collegiate Athletics League',
        organizerEmail: 'championship@collegiatesports.org',
        totalSeats: 800,
        availableSeats: 799,
        registrationDeadline: addDays(35),
        isFeatured: false,
        status: 'upcoming'
      },
      {
        title: 'Competitive Programming Masterclass & Mock Contest',
        shortDescription: 'Master graph algorithms, dynamic programming, and data structures for ACM-ICPC and tech interviews.',
        description: 'Sharpen your competitive coding skills under the guidance of International Grandmasters. Solve challenging problems on advanced tree algorithms, combinatorics, and dynamic programming with live leaderboard feedback.',
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        date: addDays(12),
        startTime: '02:00 PM',
        endTime: '06:30 PM',
        venue: 'Science Block, Lab 3, Institute of Technology',
        organizerName: 'Algorithmic Society',
        organizerEmail: 'info@algosoc.org',
        totalSeats: 120,
        availableSeats: 119,
        registrationDeadline: addDays(10),
        isFeatured: false,
        status: 'upcoming'
      },
      {
        title: 'Global Sustainable Tech & Green Energy Expo',
        shortDescription: 'Showcasing breakthroughs in clean energy, battery innovations, smart grid IoT, and carbon capture.',
        description: 'Explore the technologies driving decarbonization and green energy independence. Network with policy leaders, climate tech startup innovators, and university researchers deploying next-gen solutions globally.',
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
        date: addDays(45),
        startTime: '09:00 AM',
        endTime: '06:00 PM',
        venue: 'EcoPlaza Exhibition Center',
        organizerName: 'CleanTech Global Initiative',
        organizerEmail: 'expo@cleantechglobal.org',
        totalSeats: 500,
        availableSeats: 500,
        registrationDeadline: addDays(42),
        isFeatured: false,
        status: 'upcoming'
      }
    ];

    const createdEvents = await Event.insertMany(eventsData);
    console.log(`Created ${createdEvents.length} events across all categories.`);

    // 3. Create Sample Registrations for Demo Users
    const registrationsData = [
      {
        user: demoUser._id,
        event: createdEvents[0]._id, // Hackathon
        participantName: demoUser.name,
        email: demoUser.email,
        phone: demoUser.phone,
        registrationStatus: 'confirmed',
        registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        user: demoUser._id,
        event: createdEvents[1]._id, // AI Summit
        participantName: demoUser.name,
        email: demoUser.email,
        phone: demoUser.phone,
        registrationStatus: 'confirmed',
        registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        user: userSarah._id,
        event: createdEvents[0]._id, // Hackathon
        participantName: userSarah.name,
        email: userSarah.email,
        phone: userSarah.phone,
        registrationStatus: 'confirmed',
        registeredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        user: userSarah._id,
        event: createdEvents[2]._id, // Full Stack Masterclass
        participantName: userSarah.name,
        email: userSarah.email,
        phone: userSarah.phone,
        registrationStatus: 'confirmed',
        registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        user: userMichael._id,
        event: createdEvents[0]._id, // Hackathon
        participantName: userMichael.name,
        email: userMichael.email,
        phone: userMichael.phone,
        registrationStatus: 'confirmed',
        registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        user: userMichael._id,
        event: createdEvents[3]._id, // Cultural Fest
        participantName: userMichael.name,
        email: userMichael.email,
        phone: userMichael.phone,
        registrationStatus: 'confirmed',
        registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        user: userMichael._id,
        event: createdEvents[4]._id, // Founders Summit
        participantName: userMichael.name,
        email: userMichael.email,
        phone: userMichael.phone,
        registrationStatus: 'confirmed',
        registeredAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        user: demoUser._id,
        event: createdEvents[6]._id, // UI/UX Workshop
        participantName: demoUser.name,
        email: demoUser.email,
        phone: demoUser.phone,
        registrationStatus: 'cancelled',
        registeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    await Registration.insertMany(registrationsData);
    console.log(`Created ${registrationsData.length} sample registrations.`);

    console.log('Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('Admin Account: admin@eventhub.com / Admin@123');
    console.log('User Account:  user@eventhub.com  / User@123');
    console.log('----------------------------------------------------');

    if (isCli) {
      process.exit(0);
    }
    return {
      success: true,
      eventsCount: createdEvents.length,
      usersCount: users.length,
      registrationsCount: registrationsData.length
    };
  } catch (error) {
    console.error('Error during database seeding:', error);
    if (isCli) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
