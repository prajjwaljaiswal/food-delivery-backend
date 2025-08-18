import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from 'src/models';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {}

  async findAll(): Promise<Payment[]> {
    return this.paymentRepo.find({ relations: ['order'] });
  }

  async findOne(id: number): Promise<Payment | null> {
    return this.paymentRepo.findOne({
      where: { id },
      relations: ['order'],
    });
  }
}
