const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const dotenv   = require('dotenv');
dotenv.config();

const User = require('../models/User');

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'admin@ucab.com' });
  if (existing) {
    console.log('✅ Admin already exists');
    process.exit();
  }

  const hashed = await bcrypt.hash('admin123', 10);
  await User.create({
    name:     'Ucab Admin',
    email:    'admin@ucab.com',
    password: hashed,
    phone:    '0000000000',
    role:     'admin'
  });

  console.log('✅ Admin created → admin@ucab.com / admin123');
  process.exit();
};

seedAdmin().catch(console.error);