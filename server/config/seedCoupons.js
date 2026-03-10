const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();
const Coupon = require('../models/Coupon');

const seedCoupons = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Coupon.deleteMany({});

  await Coupon.insertMany([
    { code: 'UCAB10',  discount: 10, maxDiscount: 30,  minFare: 50,  usageLimit: 500 },
    { code: 'UCAB20',  discount: 20, maxDiscount: 60,  minFare: 100, usageLimit: 200 },
    { code: 'FIRST50', discount: 50, maxDiscount: 100, minFare: 80,  usageLimit: 1   },
    { code: 'SAVE15',  discount: 15, maxDiscount: 45,  minFare: 70,  usageLimit: 300 },
    { code: 'VIT25',   discount: 25, maxDiscount: 75,  minFare: 120, usageLimit: 100 },
  ]);

  console.log('✅ Coupons seeded!');
  console.log('Codes: UCAB10, UCAB20, FIRST50, SAVE15, VIT25');
  process.exit();
};

seedCoupons().catch(console.error);