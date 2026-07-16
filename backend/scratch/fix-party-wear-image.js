const mongoose = require('mongoose');
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/srisakthisarees';

mongoose.connect(MONGODB_URI).then(async () => {
  const result = await mongoose.connection.db.collection('products').updateMany(
    { images: { $regex: 'encrypted-tbn', $options: 'i' } },
    { $set: { 'images.$[elem]': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' } },
    { arrayFilters: [{ 'elem': { $regex: 'encrypted-tbn', $options: 'i' } }] }
  );
  console.log('Fixed', result.modifiedCount, 'product(s) with broken image URLs in MongoDB.');
  await mongoose.disconnect();
}).catch(e => {
  console.error('DB connection failed (OK if no MongoDB):', e.message);
  process.exit(0);
});
