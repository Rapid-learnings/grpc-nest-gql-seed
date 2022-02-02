import { Document } from 'mongoose';

export interface JwtPayload extends Document {
  email: string;
}
