export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  sessionId?: string;
  sessionExpires?: number;
}