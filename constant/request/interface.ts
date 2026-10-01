import { ProgramMode } from "./type";

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInSuccess {
  ok: true;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "tutor" | "student";
    createdAt: string;
  };
}

export interface SignInFailure {
  ok: false;
  error: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "tutor" | "student";
  createdAt: string;
  tutorId?: string |null;
}

export interface VerifyOtpPayload {
  otpToken: string;
  code: string;
}

export interface Program {
  id: string;
  label: string;
  category: string;
  mode?: ProgramMode;
  price: number;
  duration: string;
  durationInDays: number;
  description: string;
  students?: number;
  active: boolean;
}

export interface ProgramsResponse {
  ok: boolean;
  programs: Program[];
  error?: string;
}

export interface ProgramResponse {
  ok: boolean;
  program: Program;
  error?: string;
}

export interface DeleteProgramResponse {
  ok: boolean;
  message: string;
  error?: string;
}


export interface ScheduleSlot {
  _id: string
  day: string
  startTime: string
  endTime: string
}