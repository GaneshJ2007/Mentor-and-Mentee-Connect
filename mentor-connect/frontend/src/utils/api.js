import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mc_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mc_token');
      localStorage.removeItem('mc_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getMentors: () => api.get('/auth/mentors'),
};

// ── Mentee ────────────────────────────────────────────────────
export const menteeAPI = {
  getProfile: () => api.get('/mentee/profile'),
  updateProfile: (data) => api.put('/mentee/profile', data),
  saveFullProfile: (data) => api.post('/mentee/profile/full', data),
  updateInternalExams: (data) => api.put('/mentee/academics/internal', data),
  updateSemesterExams: (data) => api.put('/mentee/academics/semester', data),
  updateCertifications: (data) => api.put('/mentee/achievements/certifications', data),
  updateCourses: (data) => api.put('/mentee/achievements/courses', data),
  updateActivities: (data) => api.put('/mentee/achievements/activities', data),
};

// ── Mentor ────────────────────────────────────────────────────
export const mentorAPI = {
  getDashboard: () => api.get('/mentor/dashboard'),
  getMenteeDetails: (id) => api.get(`/mentor/mentee/${id}`),
  getMenteePdfData: (id) => api.get(`/mentor/mentee/${id}/pdf-data`),
  assignMentee: (menteeId) => api.post('/mentor/assign-mentee', { menteeId }),
};

export default api;
