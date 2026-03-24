import { apiClient } from "../axios";
import type { User } from "@/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupFirmCredentials {
  firmName: string;
  subdomain: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface SignupIndividualCredentials {
  name: string;
  email: string;
  password: string;
}

export interface SignupClientCredentials {
  name: string;
  email: string;
  password: string;
  inviteToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
  token?: string;
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>("/auth/login", credentials),

  signupFirm: (credentials: SignupFirmCredentials) =>
    apiClient.post<AuthResponse>("/auth/signup/firm", credentials),

  signupIndividual: (credentials: SignupIndividualCredentials) =>
    apiClient.post<AuthResponse>("/auth/signup/individual", credentials),

  signupClient: (credentials: SignupClientCredentials) =>
    apiClient.post<AuthResponse>("/auth/signup/client", credentials),

  forgotPassword: (email: string) =>
    apiClient.post<{ message?: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<{ message?: string }>("/auth/reset-password", {
      token,
      newPassword,
    }),
};
