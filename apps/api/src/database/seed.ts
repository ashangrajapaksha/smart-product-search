import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { Product } from '../models/product.model';

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-product-search';

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected.');

  const dataPath = path.join(__dirname, 'products.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const products = JSON.parse(raw);

  console.log(`Seeding ${products.length} products...`);

  // Upsert each product by its id field so re-running is safe
  const ops = products.map((p: Record<string, unknown>) => ({
    updateOne: {
      filter: { id: p.id },
      update: { $set: p },
      upsert: true,
    },
  }));

  const result = await Product.bulkWrite(ops);
  console.log(`Done. Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`);

  await mongoose.disconnect();
  console.log('Disconnected.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
