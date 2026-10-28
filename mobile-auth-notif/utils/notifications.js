import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowAlert: true,
  }),
});

export async function tampilkanNotifikasiLokal(title, body, data = {}) {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (e) {
      console.warn('Channel error:', e?.message);
    }
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: null,
  });
}

export async function getExpoPushToken() {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (channelError) {
      console.warn('Gagal membuat notification channel (Expo Go limitation):', channelError?.message);
    }
  }

  try {
    const current = await Notifications.getPermissionsAsync();
    let status = current.status;

    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }

    if (status !== 'granted') {
      throw new Error('Izin notifikasi tidak diberikan');
    }
  } catch (permError) {
    console.warn('Izin notifikasi:', permError?.message);
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (projectId) {
    try {
      const result = await Notifications.getExpoPushTokenAsync({ projectId });
      if (result?.data) {
        return result.data;
      }
    } catch (e) {
      console.warn('Gagal mengambil Expo Push Token resmi:', e.message);
    }
  }

  // Jika projectId belum dikonfigurasi di app.json atau gagal di Expo Go,
  // gunakan format ExponentPushToken simulasi agar pendaftaran ke database MySQL berhasil
  const fallbackToken = `ExponentPushToken[DEV_${Math.random().toString(36).substring(2, 10)}]`;
  return fallbackToken;
}
