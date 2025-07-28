export enum RoleEnum {
  Admin = "admin",
  Teacher = "teacher",
}

export interface CreateUserModel {
  username: string;
  password: string;
  role?: RoleEnum;
  created_at?: string;
}

export interface UserModel {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  role: RoleEnum;
  created_at: string;
}

export interface UserSettingProfileModel {
  email: string;
  phone: string;
}

export interface ResponseUserSettingProfileModel {
  email: string;
  phone: string;
}

export interface NewPassword {
  password: string;
  new_password: string;
}

export interface ResponseNewPassword {
  message: string;
}

export type User = {
  id: number;
  username: string;
  created_at: string;
}