import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SystemSettingsDocument = HydratedDocument<SystemSettings>;

@Schema({
  collection: 'system_settings',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class SystemSettings {

  @Prop({ required: true, unique: true, default: 'system_settings' })
  key: string;

  @Prop({ required: true })
  reservationLimit: number;

  created_at: Date;
  updated_at: Date;
}

export const SystemSettingsSchema = SchemaFactory.createForClass(SystemSettings);