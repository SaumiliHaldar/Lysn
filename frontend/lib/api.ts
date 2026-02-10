const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new ApiError(error.message || 'An error occurred', res.status);
  }

  return res.json();
}

async function postForm(endpoint: string, data: Record<string, string | undefined>) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });

    return fetchAPI(endpoint, {
        method: 'POST',
        body: formData,
    });
}

export const api = {
  auth: {
    getMe: () => fetchAPI('/auth/me', { headers: { 'Content-Type': 'application/json' } }),
    logout: () => fetchAPI('/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
    
    // Auth Page Methods
    requestOtp: (email: string, name?: string) => postForm('/auth/otp/request', { email, name }),
    verifyOtp: (email: string, otp: string, name?: string) => postForm('/auth/otp/verify', { email, otp, name }),
    login: (email: string, password: string) => postForm('/auth/login', { email, password }),
    
    requestPasswordReset: (email: string) => postForm('/auth/password/reset', { email }),
    verifyPasswordReset: (email: string, otp: string, newPassword?: string) => 
        postForm('/auth/password/reset/verify', { email, otp, new_password: newPassword }),
        
    setPassword: (oldPassword: string, newPassword: string) => 
        postForm('/auth/set-password', { old_password: oldPassword, new_password: newPassword }),

    googleLoginUrl: (origin?: string) => `${API_URL}/auth/google/login${origin ? `?origin=${encodeURIComponent(origin)}` : ''}`,
  },
  audio: {
    list: () => fetchAPI('/audios_list', { headers: { 'Content-Type': 'application/json' } }),
    getUrl: (id: string) => `${API_URL}/audio/${id}`,
    delete: (id: string) => fetchAPI(`/audio/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }),
  },
  pdf: {
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${API_URL}/pdf/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new ApiError(error.message || 'Upload failed', res.status);
      }

      return res.json();
    }
  }
};
