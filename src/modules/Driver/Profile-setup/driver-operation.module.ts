// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { JwtModule } from '@nestjs/jwt';
// import { DeviceToken, UserEntity, Otp } from 'src/models';
// import { EmailService } from 'src/common/email/email.service';
// import { DriverController } from './driver-operation.controller';
// import { DriverService } from './driver-operation.service';
// import { Driver } from 'src/models';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Driver, DeviceToken, UserEntity, Otp]),
//     JwtModule.register({
//       secret: process.env.JWT_SECRET, // ✅ Make sure this is defined
//       signOptions: { expiresIn: '1d' }, // optional
//     }), // add any required options here
//   ],
//   controllers: [DriverController],
//   providers: [DriverService, EmailService],
//   exports: [DriverService, EmailService], // optional: if other modules need this service
// })
// export class DriverProfileModule { }
