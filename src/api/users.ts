import { apiClient } from './client';
import {
  UserProfileOut,
  ProfileUpdateInput,
  DriverPreferencesResponse,
  UserOut,
} from '../types/auth';

export const usersApi = {
  // GET /profile/me
  getMyProfile: async (): Promise<UserProfileOut> => {
    const response = await apiClient.get<UserProfileOut>('/profile/me');
    return response.data;
  },

  // PUT /profile/me
  updateMyProfile: async (input: ProfileUpdateInput): Promise<UserProfileOut> => {
    const response = await apiClient.put<UserProfileOut>('/profile/me', input);
    return response.data;
  },

  // PUT /driver/preferences
  updateDriverPreferences: async (
    input: Partial<DriverPreferencesResponse>
  ): Promise<DriverPreferencesResponse> => {
    const response = await apiClient.put<DriverPreferencesResponse>('/driver/preferences', input);
    return response.data;
  },

  // POST /profile/me/photo (multipart)
  uploadProfilePhoto: async (uri: string, mimeType = 'image/jpeg'): Promise<UserProfileOut> => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'profile.jpg';
    // @ts-ignore - React Native FormData accepts uri
    formData.append('file', {
      uri,
      name: filename,
      type: mimeType,
    });

    const response = await apiClient.post<UserProfileOut>('/profile/me/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // POST /profile/driver/license-photo (multipart)
  uploadDriverLicense: async (
    uri: string,
    licenseNumber?: string,
    licenseExpiryDate?: string, // YYYY-MM-DD
    mimeType = 'image/jpeg'
  ): Promise<UserProfileOut> => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'license.jpg';
    // @ts-ignore
    formData.append('file', {
      uri,
      name: filename,
      type: mimeType,
    });

    if (licenseNumber) {
      formData.append('license_number', licenseNumber);
    }
    if (licenseExpiryDate) {
      formData.append('license_expiry_date', licenseExpiryDate);
    }

    const response = await apiClient.post<UserProfileOut>('/profile/driver/license-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // GET /users/{id}
  getUserById: async (userId: string): Promise<UserOut> => {
    const response = await apiClient.get<UserOut>(`/users/${userId}`);
    return response.data;
  },

  // DELETE /users/{id}
  deleteAccount: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },
};
