import { HttpException } from "@nestjs/common";

export interface ResponseType {
    status: HttpException['status'];
    message: string;
    origin: string;
    data: any;
    error?: string;
}


export type StatusType =
  | 'pending'
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no-show'
  | 'declined'
  | 'late';

// Forbidden transitions for each current status
export const INVALID_TRANSITIONS: Record<StatusType, StatusType[]> = {
  pending: ['completed', 'no-show', 'late'], //cannot jump to these
  scheduled: ['pending', 'cancelled'], //cannot go back to pending, cannot jump to completed
  completed: ['pending', 'scheduled', 'cancelled', 'no-show', 'declined', 'late'], //completed is final
  cancelled: ['pending', 'scheduled', 'completed', 'no-show', 'declined', 'late'], //cancelled is final
  'no-show': ['pending', 'scheduled', 'completed', 'cancelled', 'declined', 'late'], //no-show is final
  declined: ['pending', 'scheduled', 'completed', 'cancelled', 'no-show', 'late'], //declined is final
  late: ['pending', 'scheduled', 'completed', 'cancelled', 'no-show', 'declined'], //late cannot revert
};

