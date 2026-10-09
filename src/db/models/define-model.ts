import mongoose, { type Model, type Schema } from "mongoose";

// mongoose 9: InferSchemaType agota la memoria de tsc durante `next build`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineModel(name: string, schema: Schema): Model<any> {
  const existing = mongoose.models[name];
  if (existing) {
    mongoose.deleteModel(name);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mongoose.model(name, schema) as unknown as Model<any>;
}
