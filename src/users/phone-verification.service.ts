import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TwilioService {
  private readonly phoneSmsApiKey = process.env.PHONE_SMS_API;

  async sendSMS(to: string, message: string) {
    const formatted =
      to.startsWith('+63')
        ? to.slice(1)
        : to.startsWith('63')
        ? to
        : to.startsWith('0')
        ? '63' + to.slice(1)
        : to;

      console.log(formatted);

    const payload = {
      api_token: this.phoneSmsApiKey,
      phone_number: formatted,
      message: message,
    };

    const response = await axios.post(
      'https://sms.iprogtech.com/api/v1/sms_messages',
      payload,
      { headers: { 'Content-Type': 'application/json' } },
    );

    if (response.data?.status !== 200) {
      console.log('HITT');
      console.log('Z MESSAGE',response.data.message);
      throw new BadRequestException(response.data.message || 'SMS sending failedddddd');
    }

    console.log("RESS",response.data?.statusCode);

    console.log(response.data);
    return response.data;
  }
}