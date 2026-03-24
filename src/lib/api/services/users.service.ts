import { apiClient } from "../axios";
import type { User } from "@/types";

export const usersService = {
  getMe: () => apiClient.get<User>("/users/me"),
};
