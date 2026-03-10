import { http } from "@/lib/http";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
};

export type MeResponse = Record<string, unknown>;

export async function login(req: LoginRequest): Promise<LoginResponse> {
  return http<LoginResponse>("/auth/login", { method: "POST", body: req });
}

export async function me(token: string): Promise<MeResponse> {
  return http<MeResponse>("/me", { method: "GET", token });
}
