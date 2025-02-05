import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Text, Surface, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';

const DUMMY_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Milk is expiring soon',
    message: 'Your milk will expire in 2 days',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    read: false,
  },
  {
    id: '2',
    title: 'Bread has expired',
    message: 'Your bread has expired',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
  },
];

const NotificationItem = ({ notification }) => (
  <TouchableRipple onPress={() => {}}>
    <Surface style={[
      styles.notificationCard,
      notification.read && styles.readNotification
    ]}>
      <View style={styles.iconContainer}>
        <Icon
          name={notification.read ? 'bell-outline' : 'bell'}
          size={24}
          color={notification.read ? colors.disabled : colors.primary}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.timestamp}>
          {new Date(notification.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </Surface>
  </TouchableRipple>
);

const NotificationsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Notifications" />
        <Appbar.Action icon="check-all" onPress={() => {}} />
      </Appbar.Header>

      <ScrollView>
        {DUMMY_NOTIFICATIONS.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    fontWeight: 'bold',
    color: colors.text,
  },
  message: {
    fontSize: 14,
    color: colors.disabled,
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.disabled,
    marginTop: 8,
  },
});

export default NotificationsScreen; 