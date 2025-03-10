import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Appbar, Text, Surface, TouchableRipple, ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import notifee, { TriggerType, AndroidImportance } from '@notifee/react-native';
import { fonts } from '../../constants/fonts';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const NotificationItem = ({ notification, onPress }) => (
  <TouchableRipple onPress={onPress}>
    <Surface style={[
      styles.notificationCard,
      notification.read && styles.readNotification
    ]}>
      <View style={styles.iconContainer}>
        <Icon
          name={notification.type === 'expired' ? 'alert-circle' : 'clock-alert'}
          size={24}
          color={notification.read ? colors.disabled : colors.primary}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[
          styles.title,
          notification.read && styles.readText
        ]}>{notification.message}</Text>
        <Text style={styles.timestamp}>
          {moment(notification.createdAt.toDate()).fromNow()}
        </Text>
      </View>
    </Surface>
  </TouchableRipple>
);

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const userId = auth().currentUser?.uid;

  // Schedule test notification
  const scheduleTestNotification = async () => {
    try {
      // Create channel if not exists
      const channelId = await notifee.createChannel({
        id: 'test_channel',
        name: 'Test Channel',
        importance: AndroidImportance.HIGH,
      });

      // Create trigger for 3 minutes from now
      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + 3 * 60 * 1000, // 3 minutes
      };

      // Create the notification
      await notifee.createTriggerNotification(
        {
          title: 'Test Notification',
          body: 'This is a test notification scheduled for 3 minutes!',
          android: {
            channelId,
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
          },
        },
        trigger,
      );

      // Show confirmation
      console.log('Test notification scheduled for 3 minutes from now');
    } catch (error) {
      console.error('Error scheduling test notification:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const snapshot = await firestore()
        .collection('notifications')
        .where('userId', '==', userId)
        .where('notified', '==', true) // Only show notifications that have been sent
        .orderBy('createdAt', 'desc')
        .get();

      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    const batch = firestore().batch();
    const unreadNotifications = notifications.filter(n => !n.read);

    unreadNotifications.forEach(notification => {
      const notificationRef = firestore()
        .collection('notifications')
        .doc(notification.id);
      batch.update(notificationRef, { read: true });
    });

    try {
      await batch.commit();
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, [userId, notifications]);

  // Handle notification press
  const handleNotificationPress = async (notification) => {
    // Mark single notification as read
    if (!notification.read) {
      try {
        await firestore()
          .collection('notifications')
          .doc(notification.id)
          .update({ read: true });

        // Update local state
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type
    if (notification.type === 'expired') {
      navigation.navigate('Expired');
    } else {
      navigation.navigate('Home');
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId, fetchNotifications]);

  // Mark all as read when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      markAllAsRead();
    });

    return unsubscribe;
  }, [navigation, notifications, markAllAsRead]);

  const renderItem = ({ item }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleNotificationPress(item)}
    />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bell-off-outline" size={64} color={colors.disabled} />
      <Text style={styles.emptyText}>No notifications yet</Text>
    </View>
  );

  const ListHeaderComponent = () => (
    <Button 
      mode="contained"
      onPress={scheduleTestNotification}
      style={styles.testButton}
    >
      Schedule Test Notification (3min)
    </Button>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Notifications" />
        {notifications.some(n => !n.read) && (
          <Appbar.Action icon="check-all" onPress={markAllAsRead} />
        )}
      </Appbar.Header>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        // ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  testButton: {
    margin: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  readNotification: {
    backgroundColor: colors.background,
    elevation: 0,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  readText: {
    color: colors.disabled,
    fontFamily: fonts.regular,
  },
  timestamp: {
    fontSize: 12,
    color: colors.disabled,
    marginTop: 4,
    fontFamily: fonts.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.disabled,
    fontFamily: fonts.regular,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default NotificationsScreen; 