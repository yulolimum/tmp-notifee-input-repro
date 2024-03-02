/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import notifee, {EventType} from '@notifee/react-native';
import {setupNotifications} from './App';

setupNotifications();

notifee.onBackgroundEvent(async ({type}) => {
  console.log('Background Event:', EventType[type]);
});

AppRegistry.registerComponent(appName, () => App);
