import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: 'users',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ 
    type: String, 
    enum: ['patient', 'doctor', 'admin', 'staff'], 
    default: 'patient' 
  })
  role: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ type: Date, default: null })
  email_verified_at: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
// ELOQUENT - LARAVEL
// Virtual: User has many Appointments (as patient)
UserSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'patientId',
});

// Virtual: User has many Appointments (as staff)
UserSchema.virtual('assignedAppointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'staffId',
});

// Virtual: User has many Medical Records (as patient)
UserSchema.virtual('medicalRecords', {
  ref: 'MedicalRecord',
  localField: '_id',
  foreignField: 'patientId',
});

// Virtual: User has many Medical Records (as creator/staff)
UserSchema.virtual('createdMedicalRecords', {
  ref: 'MedicalRecord',
  localField: '_id',
  foreignField: 'staffCreatedId',
});