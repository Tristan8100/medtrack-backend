import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PhoneVerificationDocument = HydratedDocument<PhoneVerification>;

@Schema({
  collection: 'phone_verifications',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, // AUTO timestamps
})
export class PhoneVerification {
  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  code: string;

  @Prop({ default: false })
  verified: boolean;

  // Declare for TypeScript only (optional)
  created_at: Date;
  updated_at: Date;
}

export const PhoneVerificationSchema = SchemaFactory.createForClass(PhoneVerification);
