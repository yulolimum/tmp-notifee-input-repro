/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import notifee, {
  AndroidChannel,
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  EventType,
  IOSNotificationCategory,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import React, {useEffect} from 'react';
import {Button, SafeAreaView} from 'react-native';

export enum NotificationType {
  GameReview,
}

export enum NotificationCategory {
  WriteReview = 'write-review',
  GoToReview = 'go-to-review',
}

export enum NotificationChannel {
  Default = 'default',
}

export enum NotificationPressAction {
  Default = 'default',
  SubmitReview = 'submit-review',
}

const androidChannels: AndroidChannel[] = [
  {
    id: NotificationChannel.Default,
    name: 'Default',
    description: 'General app notifications.',
    importance: AndroidImportance.HIGH,
    badge: false,
  },
];

const iosCategories: IOSNotificationCategory[] = [
  {
    id: NotificationCategory.WriteReview,
    actions: [
      {
        id: NotificationPressAction.SubmitReview,
        title: 'Review Game',
        input: {
          placeholderText: 'Type your review...',
          buttonText: 'Submit',
        },
      },
    ],
  },
  {
    id: NotificationCategory.GoToReview,
    actions: [
      {
        id: NotificationPressAction.SubmitReview,
        title: 'Review Game',
      },
    ],
  },
];

export async function setupNotifications() {
  const permission = await notifee.requestPermission();

  if (permission.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
    await notifee.setNotificationCategories(iosCategories);
    await notifee.createChannels(androidChannels);

    const settings = await notifee.getNotificationSettings();

    if (settings.android.alarm !== AndroidNotificationSetting.ENABLED) {
      await notifee.openAlarmPermissionSettings();
    }
  }
}

function App(): React.JSX.Element {
  useEffect(() => {
    return notifee.onForegroundEvent(async ({type}) => {
      console.log('Foreground Event', EventType[type]);
    });
  }, []);

  useEffect(() => {
    notifee.getInitialNotification().then(_n => {
      console.log('Initial Notification Event');
    });
  }, []);

  function showNotification(
    shouldSchedule: boolean,
    shouldIncludeInput?: true | undefined,
  ) {
    const trigger: TimestampTrigger = shouldSchedule
      ? {
          type: TriggerType.TIMESTAMP,
          timestamp: Date.now() + 5000,
        }
      : (undefined as unknown as TimestampTrigger);

    const notificationFn = shouldSchedule
      ? notifee.createTriggerNotification
      : notifee.displayNotification;

    notificationFn(
      {
        title: 'Please Review: Mario',
        body: 'Looks like you enjoyed this game! Please leave a review!',
        data: {
          notificationType: NotificationType.GameReview,
          gameId: 1234,
          gameName: 'Mario',
        },
        ios: {
          categoryId: shouldIncludeInput
            ? NotificationCategory.WriteReview
            : NotificationCategory.GoToReview,
        },
        android: {
          channelId: NotificationChannel.Default,
          actions: [
            {
              title: 'Review Game',
              input: shouldIncludeInput,
              pressAction: {
                id: NotificationPressAction.SubmitReview,
              },
            },
          ],
        },
      },
      trigger,
    );
  }

  return (
    <SafeAreaView style={{gap: 20}}>
      <Button
        onPress={() => showNotification(false, undefined)}
        title="Show Notification"
      />
      <Button
        onPress={() => showNotification(true, undefined)}
        title="Schedule Notification"
      />
      <Button
        onPress={() => showNotification(false, true)}
        title="Show Notification w/ Input"
      />
      <Button
        onPress={() => showNotification(true, true)}
        title="Schedule Notification w/ Input"
      />
    </SafeAreaView>
  );
}
export default App;
