import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('auth_error', (error) => {
      console.error('Socket authentication error:', error);
    });

    // Listen for order events
    socket.on('order', (data) => {
      console.log('Order event received:', data);
    });
  }
  return socket;
};

export const joinBranchRoom = (branchId: string) => {
  if (!socket?.connected) {
    socket = initializeSocket();
  }
  socket.emit('join_user_branch', branchId);
};

export const leaveBranchRoom = (branchId: string) => {
  if (socket?.connected) {
    socket.emit('leave_branch', branchId);
  }
};

export const joinRestaurantRoom = (token: string) => {
  if (!socket?.connected) {
    socket = initializeSocket();
  }
  socket.emit('join_restaurant', { token });
};

export const subscribeToOrderUpdates = (callback: (data: any) => void) => {
  if (!socket?.connected) {
    socket = initializeSocket();
  }

  // Listen for the 'order' event that backend emits
  socket.on('order', (data) => {
    if (data.type === 'order_status_changed') {
      callback({
        orderId: data.orderId,
        status: data.newStatus,
        message: data.message
      });
    }
  });

  return () => {
    socket?.off('order');
  };
};

export const acknowledgeNotification = (data: { 
  notificationId: string; 
  branchId: string; 
  userId: string; 
}) => {
  if (socket?.connected) {
    socket.emit('notification_received', data);
  }
};

export const trackNotificationClick = (data: { 
  notificationId: string; 
  branchId: string; 
  userId: string; 
}) => {
  if (socket?.connected) {
    socket.emit('notification_clicked', data);
  }
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
  }
}; 