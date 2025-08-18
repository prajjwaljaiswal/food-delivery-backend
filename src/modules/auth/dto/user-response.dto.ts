// user-response.dto.ts

import { RoleEntity } from "src/models";

export class UserResponseDto {
  id: number;
  role: RoleEntity ;
  email: string;
  phone: string;
  status: boolean;
  country: string;
  role_id: number;
  zip_code: string;
  last_name: string;
  jwt_token: string;
  created_at: Date;
  updated_at: Date;
  first_name: string;
  is_verified: boolean;
  last_login_ip: string;
  device_tokens: [];
  profile_image: string;
  last_login_at: string;
  email_verified_at: string;
  verification_code: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
