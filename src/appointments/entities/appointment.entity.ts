import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({
  collection: 'appointments',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })//nullable to reference staff only, future use probably
  staffId: Types.ObjectId | null;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ 
    type: String, 
    enum: ['pending', 'scheduled', 'completed', 'cancelled', 'no-show', 'declined', 'late'], 
    default: 'pending' 
  })
  status: string;

  @Prop({ required: true })
  chiefComplaint: string;

  @Prop({ type: String, default: null })
  notes: string | null;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);