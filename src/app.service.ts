import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Food Ordering Backend is running 🚀';
  }
}
