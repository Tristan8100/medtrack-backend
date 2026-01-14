import { HttpException } from "@nestjs/common";

export interface ResponseType {
    status: HttpException['status'];
    message: string;
    origin: string;
    data: any;
    error?: string;
}