import axiosInstance from './axios';

/**
 * Notification Service (Frontend)
 * Provides access to the in-app notification endpoints.
 */

// Get latest notifications (default: 20)
export const getNotifications = async (limit = 20) => {
    const response = await axiosInstance.get(`/notifications?limit=${limit}`);
    return response.data;
};

// Get unread notification count
export const getUnreadCount = async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
};

// Mark a single notification as read
export const markAsRead = async (id) => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
    const response = await axiosInstance.patch('/notifications/mark-all-read');
    return response.data;
};

export default {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
};
