import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from 'src/appointments/entities/appointment.entity';
import { MedicalRecord, MedicalRecordDocument } from 'src/medical-records/entities/medical-record.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
        @InjectModel(MedicalRecord.name) private medicalRecordModel: Model<MedicalRecordDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async hello(): Promise<string> {
        return 'hello';
    }

    // Daily/Weekly/Monthly appointment counts
    async getAppointmentCounts(period: 'day' | 'week' | 'month' = 'week', limit: number = 30) {
        const groupFormat = {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            week: { $dateToString: { format: '%Y-W%V', date: '$date' } },
            month: { $dateToString: { format: '%Y-%m', date: '$date' } }
        };

        const results = await this.appointmentModel.aggregate([
            {
                $group: {
                    _id: groupFormat[period],
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: limit }
        ]);

        return results.map(r => ({
            period: r._id,
            count: r.count
        }));
    }

    // Appointments by status
    async getAppointmentsByStatus() {
        const results = await this.appointmentModel.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const total = results.reduce((sum, r) => sum + r.count, 0);

        return {
            breakdown: results.map(r => ({
                status: r._id,
                count: r.count,
                percentage: total > 0 ? ((r.count / total) * 100).toFixed(2) : '0.00'
            })),
            total
        };
    }

    // No-show rate percentage
    async getNoShowRate(startDate?: Date, endDate?: Date) {
        const match: any = {};
        
        if (startDate || endDate) {
            match.date = {};
            if (startDate) match.date.$gte = startDate;
            if (endDate) match.date.$lte = endDate;
        }

        const results = await this.appointmentModel.aggregate([
            ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    noShows: {
                        $sum: { $cond: [{ $eq: ['$status', 'no-show'] }, 1, 0] }
                    }
                }
            }
        ]);

        if (results.length === 0) {
            return { noShowRate: 0, totalAppointments: 0, noShows: 0 };
        }

        const { total, noShows } = results[0];
        const noShowRate = total > 0 ? ((noShows / total) * 100).toFixed(2) : '0.00';

        return {
            noShowRate: parseFloat(noShowRate),
            totalAppointments: total,
            noShows
        };
    }

    // Average appointments per day/week
    async getAverageAppointments(period: 'day' | 'week' = 'day', lookbackDays: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - lookbackDays);

        const results = await this.appointmentModel.aggregate([
            {
                $match: {
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: period === 'day' 
                        ? { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
                        : { $dateToString: { format: '%Y-W%V', date: '$date' } },
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalAppointments = results.reduce((sum, r) => sum + r.count, 0);
        const periodCount = results.length;
        const average = periodCount > 0 ? (totalAppointments / periodCount).toFixed(2) : '0.00';

        return {
            period,
            lookbackDays,
            average: parseFloat(average),
            totalAppointments,
            periodsCounted: periodCount
        };
    }

    // Diagnosis distribution (for pie charts)
    async getDiagnosisDistribution(limit: number = 10) {
        const results = await this.medicalRecordModel.aggregate([
            {
                $match: {
                    diagnosis: { $nin: [null, ''] }
                }
            },
            {
                $group: {
                    _id: '$diagnosis',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        const total = results.reduce((sum, r) => sum + r.count, 0);

        return {
            distribution: results.map(r => ({
                diagnosis: r._id,
                count: r.count,
                percentage: total > 0 ? ((r.count / total) * 100).toFixed(2) : '0.00'
            })),
            total,
            topCount: limit
        };
    }

    //Combined dashboard summary - 1 api call
    async getDashboardSummary() {
        const [
            statusBreakdown,
            noShowRate,
            averagePerDay,
            topDiagnoses,
            recentCounts
        ] = await Promise.all([
            this.getAppointmentsByStatus(),
            this.getNoShowRate(),
            this.getAverageAppointments('day', 30),
            this.getDiagnosisDistribution(5),
            this.getAppointmentCounts('day', 7)
        ]);

        return {
            appointments: {
                statusBreakdown,
                noShowRate,
                averagePerDay,
                last7Days: recentCounts
            },
            diagnoses: topDiagnoses
        };
    }
}