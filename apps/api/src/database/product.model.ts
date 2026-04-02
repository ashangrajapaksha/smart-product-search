import mongoose, { Schema } from 'mongoose';
import type { IProduct } from '@nx-react-nestjs-ts-boilerplate/shared';

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    rating: { type: Number, required: true },
  },
  { _id: true }
);

// Text index for full-text search — weighted to prioritise name matches
ProductSchema.index(
  { name: 'text', description: 'text', tags: 'text', category: 'text' },
  { weights: { name: 10, tags: 5, category: 3, description: 1 } }
);

export { IProduct };
export const Product = mongoose.model<IProduct>('Product', ProductSchema);
