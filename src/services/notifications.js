import notifee, { AndroidImportance, EventType, TriggerType } from '@notifee/react-native';
import firestore from '@react-native-firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHANNEL_ID = 'expiry_notifications';
const LAST_CHECK_KEY = '@last_notification_check';

// Create notification channel for Android
async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Expiry Notifications',
      description: 'Notifications for product expiry alerts',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  }
}

// Request notification permissions
export async function requestNotificationPermission() {
  try {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= 1; // 1 = AUTHORIZED
  } catch (error) {
    console.error('Failed to get notification permission:', error);
    return false;
  }
}

async function checkExpiringProducts(userId) {
  try {
    // Get products
    const snapshot = await firestore()
      .collection('products')
      .where('userId', '==', userId)
      .get();

    // Get existing notifications to check for duplicates
    const existingNotifications = await firestore()
      .collection('notifications')
      .where('userId', '==', userId)
      .where('notified', '==', true)
      .get();

    // Create a Set of product IDs that have already been notified
    const notifiedProductIds = new Set(
      existingNotifications.docs.map(doc => doc.data().productId)
    );

    for (const doc of snapshot.docs) {
      const product = doc.data();
      const expiryDate = new Date(product.expiryDate.toDate());
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      // Check if product is expiring soon or expired and hasn't been notified
      if (daysUntilExpiry <= product.reminderDays && !notifiedProductIds.has(doc.id)) {
        const isExpired = daysUntilExpiry <= 0;
        const message = isExpired
          ? `Your ${product.name} has expired!`
          : `Your ${product.name} will expire in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}!`;

        // Create notification in Firestore with notified flag
        const notificationRef = await firestore().collection('notifications').add({
          userId,
          productId: doc.id,
          type: isExpired ? 'expired' : 'reminder',
          message,
          createdAt: firestore.FieldValue.serverTimestamp(),
          read: false,
          notified: true // Add this flag
        });

        // Display local notification
        await notifee.displayNotification({
          id: `${isExpired ? 'expired' : 'reminder'}_${doc.id}`,
          title: 'ShelfAware Alert',
          body: message,
          android: {
            channelId: CHANNEL_ID,
            pressAction: {
              id: 'default',
            },
          },
          ios: {
            categoryId: 'expiry',
          },
        });

        // Add to notified set to prevent duplicates in this batch
        notifiedProductIds.add(doc.id);
      }
    }
  } catch (error) {
    console.error('Error checking products:', error);
  }
}

// Setup periodic background check using Notifee triggers
async function setupBackgroundCheck(userId) {
  try {
    // Cancel any existing triggers
    const triggers = await notifee.getTriggerNotifications();
    for (const trigger of triggers) {
      await notifee.cancelTriggerNotification(trigger.notification.id);
    }

    // Create a new trigger that runs every 24 hours
    const trigger = {
      type: TriggerType.INTERVAL,
      interval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    };

    // Create a trigger notification
    await notifee.createTriggerNotification(
      {
        title: 'Background Check',
        body: 'Checking for expiring products...',
        android: {
          channelId: CHANNEL_ID,
        },
      },
      trigger,
    );

    // Store the user ID for background tasks
    await AsyncStorage.setItem('userId', userId);

  } catch (error) {
    console.error('Error setting up background check:', error);
  }
}

// Handle notification press
export function setupNotificationPressHandler(navigation) {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      if (detail.notification) {
        const notificationId = detail.notification.id;
        if (notificationId.startsWith('expired_')) {
          navigation.navigate('Expired');
        } else {
          navigation.navigate('Home');
        }
      }
    }
  });
}

// Handle background events
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.TRIGGER) {
    // Retrieve stored user ID
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      await checkExpiringProducts(userId);
    }
  }
});

// Initialize notifications
export async function initializeNotifications(userId, navigation) {
  try {
    // Request permissions
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return null;
    }

    // Create notification channel
    await createNotificationChannel();

    // Setup background check
    await setupBackgroundCheck(userId);

    // Check for expiring products immediately
    await checkExpiringProducts(userId);

    // Setup notification press handler
    const unsubscribePress = setupNotificationPressHandler(navigation);

    // Return cleanup function
    return () => {
      unsubscribePress();
      notifee.cancelTriggerNotifications();
    };
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return null;
  }
} 