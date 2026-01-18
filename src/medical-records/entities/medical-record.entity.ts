import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MedicalRecordDocument = HydratedDocument<MedicalRecord>;

@Schema({ _id: false })
export class VitalSigns {
  @Prop({ type: String, default: null })
  bloodPressure: string | null;

  @Prop({ type: Number, default: null })
  heartRate: number | null;

  @Prop({ type: Number, default: null })
  temperature: number | null;

  @Prop({ type: Number, default: null })
  respiratoryRate: number | null;

  @Prop({ type: Number, default: null })
  oxygenSaturation: number | null;

  @Prop({ type: Number, default: null })
  weight: number | null;

  @Prop({ type: Number, default: null })
  height: number | null;

  @Prop({ type: Number, default: null })
  bmi: number | null;
}

export const VitalSignsSchema = SchemaFactory.createForClass(VitalSigns);

@Schema({
  collection: 'medical-records',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class MedicalRecord {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Appointment', required: false, default: null })
  appointmentId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  staffCreatedId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  visitDate: Date;

  @Prop({ required: true })
  chiefComplaint: string;

  @Prop({ type: String, default: null })
  notes: string | null;

  @Prop({ type: String, required: true }) //for analytics like flu, fever
  diagnosis: string | null;

  @Prop({ type: VitalSignsSchema, default: null })
  vitalSigns: VitalSigns | null;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);