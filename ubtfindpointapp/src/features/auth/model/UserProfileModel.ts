export type UserProfile = {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  faculty: string;
  phoneNumber: string;
  bio: string;
  profilePictureUrl: string;
  createdAt?: string;
  lastLogin?: string | null;
  isActive: boolean;
  profileUpdatedAt?: string | null;
};
