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
    console.log('Seeding database...');

    if (isCli) {
      // Only do a destructive wipe if developer explicitly runs `node backend/seed.js` via CLI
      await User.deleteMany();
      await Event.deleteMany();
      await Registration.deleteMany();
    }

    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const userPassword = await bcrypt.hash('User@123', 10);

    // Ensure demo admin and users exist without touching or deleting real registered users
    let adminUser = await User.findOne({ email: 'admin@eventhub.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@eventhub.com',
        phone: '+1 555-0199',
        password: adminPassword,
        role: 'admin',
        createdAt: new Date('2026-01-10')
      });
    }

    let demoUser = await User.findOne({ email: 'user@eventhub.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Johnson',
        email: 'user@eventhub.com',
        phone: '+1 555-0144',
        password: userPassword,
        role: 'user',
        createdAt: new Date('2026-02-01')
      });
    }

    let userSarah = await User.findOne({ email: 'sarah.w@example.com' });
    if (!userSarah) {
      userSarah = await User.create({
        name: 'Sarah Williams',
        email: 'sarah.w@example.com',
        phone: '+1 555-0177',
        password: userPassword,
        role: 'user',
        createdAt: new Date('2026-02-15')
      });
    }

    let userMichael = await User.findOne({ email: 'mchen@example.com' });
    if (!userMichael) {
      userMichael = await User.create({
        name: 'Michael Chen',
        email: 'mchen@example.com',
        phone: '+1 555-0288',
        password: userPassword,
        role: 'user',
        createdAt: new Date('2026-03-01')
      });
    }

    const now = new Date();
    const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

    const eventsData = [
      {
        title: 'National Coding Hackathon 2026',
        shortDescription: 'Build cool tech projects over a 48-hour weekend sprint. Free food, stickers, and cash prizes for the top teams.',
        description: 'Our annual flagship hackathon is back! Form a team of up to 4 members or join solo and get matched on day one. We have mentors from local startups helping you build web apps, AI tools, and mobile solutions. Cloud credits, meals, and snacks are provided throughout the weekend.',
        category: 'Hackathons',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        date: addDays(14),
        startTime: '09:00 AM',
        endTime: '06:00 PM',
        venue: 'Engineering Block 3, Main Auditorium',
        organizerName: 'Campus Tech Club',
        organizerEmail: 'hackathon@campustech.org',
        totalSeats: 200,
        availableSeats: 197,
        registrationDeadline: addDays(10),
        isFeatured: true,
        status: 'upcoming'
      },
      {
        title: 'Introduction to Generative AI & LLMs',
        shortDescription: 'Hands-on seminar on using open source language models, prompt engineering, and building retrieval apps.',
        description: 'An interactive seminar breaking down how modern language models work under the hood. We will walk through building a simple Q&A assistant with Python, LangChain, and Ollama running locally. Perfect for beginners and intermediate developers.',
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        date: addDays(25),
        startTime: '10:00 AM',
        endTime: '04:00 PM',
        venue: 'Computer Science Lab 2',
        organizerName: 'AI Student Chapter',
        organizerEmail: 'contact@aistudents.edu',
        totalSeats: 120,
        availableSeats: 118,
        registrationDeadline: addDays(20),
        isFeatured: true,
        status: 'upcoming'
      },
      {
        title: 'Full Stack React & Node.js Workshop',
        shortDescription: 'Build and deploy a full stack web application from scratch with React, Express, and MongoDB.',
        description: 'A 4-hour hands-on workshop where we build a working web app together. We will cover REST APIs, JWT authentication, React state management, and deploying on cloud platforms. Bring your laptop with Node.js and VS Code installed!',
        category: 'Workshops',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
        date: addDays(7),
        startTime: '11:00 AM',
        endTime: '03:30 PM',
        venue: 'Seminar Hall B, Innovation Center',
        organizerName: 'Web Developers Guild',
        organizerEmail: 'workshops@webguild.dev',
        totalSeats: 70,
        availableSeats: 68,
        registrationDeadline: addDays(5),
        isFeatured: true,
        status: 'upcoming'
      },
      {
        title: 'Annual Cultural Fest - Kaleidoscope',
        shortDescription: '3 days of live music, dance showcases, street theatre, art exhibitions, and food stalls.',
        description: 'The biggest student celebration of the year! Enjoy live performances from indie college bands, competitive dance battles, photography galleries, and delicious street food stalls. Entry is free for all registered students.',
        category: 'Cultural Events',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        date: addDays(30),
        startTime: '04:00 PM',
        endTime: '10:00 PM',
        venue: 'Open Air Amphitheatre',
        organizerName: 'Student Union Council',
        organizerEmail: 'council@studentunion.edu',
        totalSeats: 500,
        availableSeats: 497,
        registrationDeadline: addDays(28),
        isFeatured: true,
        status: 'upcoming'
      },
      {
        title: 'Student Startup Pitch & Networking Night',
        shortDescription: 'Pitch your project or idea to alumni founders and angel investors. Great chance to find co-founders.',
        description: 'Looking to build a startup or find like-minded teammates? Pitch your project in a 3-minute lightning talk, or just come listen and network over pizza. Several alumni mentors will be present to give candid feedback.',
        category: 'Business',
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
        date: addDays(18),
        startTime: '05:00 PM',
        endTime: '08:00 PM',
        venue: 'Student Activity Center, Room 101',
        organizerName: 'E-Cell',
        organizerEmail: 'ecell@campusstartups.org',
        totalSeats: 100,
        availableSeats: 98,
        registrationDeadline: addDays(14),
        isFeatured: true,
        status: 'upcoming'
      },
      {
        title: 'Acoustic & Indie Music Night',
        shortDescription: 'An evening of live acoustic performances by campus bands, solo singers, and beatboxers.',
        description: 'Relax and unwind with unplugged music sets. We have 8 student bands lined up playing indie rock, pop covers, and original acoustic tracks. Refreshments will be served.',
        category: 'Music',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        date: addDays(21),
        startTime: '06:30 PM',
        endTime: '09:30 PM',
        venue: 'Music Club Lounge',
        organizerName: 'Music Society',
        organizerEmail: 'music@campusculture.org',
        totalSeats: 150,
        availableSeats: 148,
        registrationDeadline: addDays(19),
        isFeatured: false,
        status: 'upcoming'
      },
      {
        title: 'UI/UX Design with Figma: From Wireframe to Prototype',
        shortDescription: 'Learn design fundamentals, component variants, auto-layout, and prototyping in Figma.',
        description: 'Good software starts with good design. In this hands-on workshop, you will learn practical Figma workflows: grid systems, color palettes, interactive components, and creating clickable prototypes for mobile apps.',
        category: 'Workshops',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
        date: addDays(9),
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        venue: 'Design Studio, Architecture Wing',
        organizerName: 'Designers Collective',
        organizerEmail: 'design@campusclub.org',
        totalSeats: 50,
        availableSeats: 48,
        registrationDeadline: addDays(7),
        isFeatured: false,
        status: 'upcoming'
      },
      {
        title: 'Inter-Department Football & Gaming Tournament',
        shortDescription: 'Compete for the department trophy in 7-a-side football and campus FIFA/Valorant brackets.',
        description: 'Gather your department friends and enter the weekend sports cup! Football matches run on the main turf during the day, followed by esports finals in the evening auditorium. Trophies and medals for winners.',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
        date: addDays(35),
        startTime: '08:30 AM',
        endTime: '07:00 PM',
        venue: 'University Sports Ground & Gaming Lab',
        organizerName: 'Sports Committee',
        organizerEmail: 'sports@universitysports.edu',
        totalSeats: 300,
        availableSeats: 299,
        registrationDeadline: addDays(30),
        isFeatured: false,
        status: 'upcoming'
      },
      {
        title: 'Competitive Programming: Graphs & Trees Masterclass',
        shortDescription: 'Solve interview-level graph problems: BFS/DFS, Dijkstra, tree traversals, and dynamic programming.',
        description: 'Prepare for software engineering coding rounds. We will solve 6 classic LeetCode Medium/Hard problems on graphs and trees with live code explanations and time complexity tips.',
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        date: addDays(12),
        startTime: '03:00 PM',
        endTime: '06:00 PM',
        venue: 'Lecture Hall 4',
        organizerName: 'Coding Club',
        organizerEmail: 'algo@codingclub.org',
        totalSeats: 90,
        availableSeats: 89,
        registrationDeadline: addDays(10),
        isFeatured: false,
        status: 'upcoming'
      },
      {
        title: 'Clean Energy & Smart Hardware Exhibition',
        shortDescription: 'Student IoT and renewable energy hardware projects showcase with live demonstrations.',
        description: 'See innovative student hardware projects in action: solar trackers, EV battery monitors, and smart home IoT devices built by electrical and mechanical engineering students.',
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
        date: addDays(40),
        startTime: '10:00 AM',
        endTime: '04:00 PM',
        venue: 'Robotics Workshop Hall',
        organizerName: 'Hardware Innovators Society',
        organizerEmail: 'hardware@campusinnovations.org',
        totalSeats: 200,
        availableSeats: 200,
        registrationDeadline: addDays(36),
        isFeatured: false,
        status: 'upcoming'
      }
    ];

    const existingEventsCount = await Event.countDocuments();
    let createdEvents = [];

    if (existingEventsCount === 0 || isCli) {
      createdEvents = await Event.insertMany(eventsData);
    } else {
      createdEvents = await Event.find().sort({ createdAt: 1 }).limit(10);
    }

    const existingRegCount = await Registration.countDocuments();
    let insertedRegsCount = 0;

    if ((existingRegCount === 0 || isCli) && createdEvents.length >= 7) {
      const registrationsData = [
        {
          user: demoUser._id,
          event: createdEvents[0]._id,
          participantName: demoUser.name,
          email: demoUser.email,
          phone: demoUser.phone,
          registrationStatus: 'confirmed',
          registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          user: demoUser._id,
          event: createdEvents[1]._id,
          participantName: demoUser.name,
          email: demoUser.email,
          phone: demoUser.phone,
          registrationStatus: 'confirmed',
          registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          user: userSarah._id,
          event: createdEvents[0]._id,
          participantName: userSarah.name,
          email: userSarah.email,
          phone: userSarah.phone,
          registrationStatus: 'confirmed',
          registeredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        {
          user: userSarah._id,
          event: createdEvents[2]._id,
          participantName: userSarah.name,
          email: userSarah.email,
          phone: userSarah.phone,
          registrationStatus: 'confirmed',
          registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          user: userMichael._id,
          event: createdEvents[0]._id,
          participantName: userMichael.name,
          email: userMichael.email,
          phone: userMichael.phone,
          registrationStatus: 'confirmed',
          registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          user: userMichael._id,
          event: createdEvents[3]._id,
          participantName: userMichael.name,
          email: userMichael.email,
          phone: userMichael.phone,
          registrationStatus: 'confirmed',
          registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          user: userMichael._id,
          event: createdEvents[4]._id,
          participantName: userMichael.name,
          email: userMichael.email,
          phone: userMichael.phone,
          registrationStatus: 'confirmed',
          registeredAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        },
        {
          user: demoUser._id,
          event: createdEvents[6]._id,
          participantName: demoUser.name,
          email: demoUser.email,
          phone: demoUser.phone,
          registrationStatus: 'cancelled',
          registeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      ];

      const res = await Registration.insertMany(registrationsData);
      insertedRegsCount = res.length;
    }

    console.log('Seeding finished successfully.');
    if (isCli) {
      process.exit(0);
    }
    return {
      success: true,
      eventsCount: createdEvents.length,
      registrationsCount: insertedRegsCount
    };
  } catch (error) {
    console.error('Seeding error:', error.message);
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
