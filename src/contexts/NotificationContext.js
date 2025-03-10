import React, { createContext, useState, useContext, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const NotificationContext = createContext({
  unreadCount: 0,
  setUnreadCount: () => {},
  refreshUnreadCount: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = auth().currentUser?.uid;

  const refreshUnreadCount = async () => {
    if (!userId) return;

    try {
      const snapshot = await firestore()
        .collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .where('notified', '==', true)
        .get();

      setUnreadCount(snapshot.size);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Listen for notification changes
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestore()
      .collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .where('notified', '==', true)
      .onSnapshot(snapshot => {
        setUnreadCount(snapshot.size);
      }, error => {
        console.error('Error in notification listener:', error);
      });

    return () => unsubscribe();
  }, [userId]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext); 