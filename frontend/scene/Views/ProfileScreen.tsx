import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button} from '@rneui/base';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo, useRef} from 'react';
import userStore from '../../stores/UserStore';
import {Avatar, Switch} from '@rneui/themed';
import {useFocusEffect} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import {Picker} from '@react-native-picker/picker';
import {set_streak_day, set_user_setting} from '../../request/authorization';
import Toast from 'react-native-toast-message';
import {Calendar} from 'react-native-calendars';
import {ScrollView} from 'react-native';
import {Dimensions} from 'react-native';
import {Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import notifee, {
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

function ProfileScreen() {
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [settingPanelWidth, setSettingPanelWidth] = React.useState(0);
  const [streakDaysJSON, setStreakDaysJSON] = React.useState<string>('[]');
  const [notification, setNotification] = React.useState<boolean>(false);

  const animation = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [animation]);

  const animatedStyle = {
    opacity: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    }),
  };

  const logoutHandler = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('userInfo');
    userStore.logout();
  };

  const initInfo = async () => {
    const userInfoJSON = await AsyncStorage.getItem('userInfo');
    setNotification(await AsyncStorage.getItem('notification') === 'true');
    if (userInfoJSON) {
      const userInfo = JSON.parse(userInfoJSON);
      setStreakDaysJSON(userInfo.streak_days);
      setUserInfo(userInfo);
    }
  };
  const onDateChangeHandler = (date: Date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const decimalTime = hour + minute / 60;
    setUserInfo((prev: any) => ({...prev, reminder_time: decimalTime})); // 22.5 格式返回
  };

  const markedDates = useMemo(() => {
    //同步到设置JSON里面
    const markedDatesArr = JSON.parse(streakDaysJSON);
    const markedDatesObj = markedDatesArr.reduce((acc: any, date: string) => {
      acc[date] = {selected: true, marked: true, selectedColor: 'blue'};
      return acc;
    }, {});
    return markedDatesObj;
  }, [streakDaysJSON]);

  const onStreakDayPress = () => {
    const dateString = new Date(Date.now() + 8 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    setStreakDaysJSON(prev => {
      const prevObj = JSON.parse(prev); // 是个日期字符串数组
      let updated;
      if (prevObj.includes(dateString)) {
        updated = prevObj.filter((date: string) => date !== dateString);
      } else {
        updated = [...prevObj, dateString];
      }
      return JSON.stringify(updated);
    });
  };

  React.useEffect(() => {
    async function updatestreakDays() {
      const res = await set_streak_day(streakDaysJSON);
      if (res === true) {
        setUserInfo((prev: any) => ({...prev, streak_days: streakDaysJSON}));
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Streak day updated',
          position: 'top',
          visibilityTime: 1000,
          autoHide: true,
          topOffset: 30,
        });
      } else if (typeof res === 'number') {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Streak day updated failed',
          position: 'top',
          visibilityTime: 1000,
          autoHide: true,
          topOffset: 30,
        });
      }
    }
    updatestreakDays();
  }, [streakDaysJSON]);

  React.useEffect(() => {
    async function updateUserInfo() {
      if (userInfo) {
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        const res = await set_user_setting(userInfo);
        if (res === true) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Setting updated',
            position: 'top',
            visibilityTime: 1000,
            autoHide: true,
            topOffset: 30,
          });
        } else if (typeof res === 'number') {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Setting updated failed',
            position: 'top',
            visibilityTime: 1000,
            autoHide: true,
            topOffset: 30,
          });
        }
      }
    }
    updateUserInfo();
  }, [userInfo]);

  useFocusEffect(
    React.useCallback(() => {
      initInfo();
      setSettingPanelWidth(Dimensions.get('window').width - 60);
    }, []),
  );

  const convertHourNumberToDate = (hourNumber: number): Date => {
    const hours = Math.floor(hourNumber);
    const minutes = Math.round((hourNumber - hours) * 60);

    const now = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1); // 前进到“明天”

    // 创建 Date 对象，使用明天的年/月/日 + 指定时分
    return new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate(),
      hours,
      minutes,
    );
  };

  const pickerRef = useRef<any>(null);
  async function sendNotification() {
    await notifee.displayNotification({
      title: 'Cancel Notification',
      body: 'You have cancel notification',
      android: {
        channelId: 'default',
        smallIcon: 'ic_launcher', // 默认图标
      },
    });
  }
  async function cancelDailyReminder() {
    await notifee.cancelNotification('daily-review');
    // 或取消全部：await notifee.cancelAllNotifications();
    await sendNotification();
  }

  async function scheduleDailyReminder() {
    const userInfoJSON = await AsyncStorage.getItem('userInfo');
    const userInfo = userInfoJSON ? JSON.parse(userInfoJSON) : null;
    if (!userInfo) {
      return;
    }
    const date = new Date();
    date.setHours(
      userInfo.reminder_time ? Math.floor(userInfo.reminder_time) : 10,
    );
    date.setMinutes(
      userInfo.reminder_time ? (userInfo.reminder_time % 1) * 60 : 0,
    );
    date.setSeconds(0);

    if (date < new Date()) {
      date.setMinutes(new Date().getMinutes() + 1);
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id: 'daily-review', // 自定义 ID，方便取消
        title: '记得复习单词 📘',
        body: `Time is ${new Date().toISOString()}, it's time to study`,
        android: {
          channelId: 'default',
        },
      },
      trigger,
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#f1f1f1c6'}}>
      <View style={styles.toolbar} />
      {userInfo && (
        <View style={styles.userInfo}>
          <Avatar
            size={64}
            title={userInfo.username.substring(0, 2)}
            containerStyle={{backgroundColor: '#767676', borderRadius: 10}}
          />
          <Text style={styles.username}>{userInfo.username}</Text>
        </View>
      )}
      {userInfo && (
        <ScrollView style={styles.settingPanel}>
          <Text style={{fontSize: 18}}>Setting Panel</Text>
          <View style={styles.settingItem}>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>Remind Time</Text>
            <View style={{transform: [{scale: 0.7}]}}>
              <DatePicker
                mode="time"
                locale="zh_CN"
                date={convertHourNumberToDate(userInfo.reminder_time)}
                onDateChange={onDateChangeHandler}
                minuteInterval={30}
                style={{height: 120, padding: 0, margin: 0}}
              />
            </View>
          </View>
          <View style={styles.settingItem}>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>Daily Goal</Text>
            <Picker
              mode="dropdown"
              style={{width: 120, textAlign: 'right'}}
              ref={pickerRef}
              selectedValue={userInfo.daily_goal.toString()}
              onValueChange={itemValue =>
                setUserInfo({
                  ...userInfo,
                  daily_goal: itemValue,
                })
              }>
              <Picker.Item label="10" value="10" />
              <Picker.Item label="20" value="20" />
              <Picker.Item label="30" value="30" />
              <Picker.Item label="40" value="40" />
              <Picker.Item label="50" value="50" />
              <Picker.Item label="60" value="60" />
              <Picker.Item label="70" value="70" />
              <Picker.Item label="80" value="80" />
              <Picker.Item label="90" value="90" />
              <Picker.Item label="100" value="100" />
            </Picker>
          </View>
          <View style={styles.settingItem}>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>Notification</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Switch
                value={notification}
                onValueChange={async value => {
                  setNotification(value);
                  await AsyncStorage.setItem('notification', value.toString());
                  if (value) {
                    await scheduleDailyReminder();
                    Toast.show({
                      type: 'success',
                      text1: 'Start Notification',
                      position: 'top',
                      visibilityTime: 1500,
                      topOffset: 30,
                    });
                  } else {
                    await cancelDailyReminder();
                  }
                }}
              />
            </View>
          </View>

          {Object.keys(markedDates).includes(
            new Date(Date.now() + 8 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10),
          ) ? (
            <View style={styles.datePickerItem}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>Streak Day</Text>
              <Calendar
                markingType={'multi-dot'}
                initialDate={new Date(
                  Date.now() + 8 * 60 * 60 * 1000,
                ).toDateString()}
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 10,
                  width: settingPanelWidth,
                }}
                theme={{
                  backgroundColor: '#ffffff72',
                  calendarBackground: '#ffffff0',
                  textSectionTitleColor: '#92a1ae',
                  textSectionTitleDisabledColor: '#d9e1e8',
                  selectedDayBackgroundColor: '#00adf5',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#00adf5',
                  dayTextColor: '#2d4150',
                  textDisabledColor: '#92a1ae',
                  dotColor: '#00adf5',
                  selectedDotColor: '#ffffff',
                  arrowColor: 'orange',
                  disabledArrowColor: '#d9e1e8',
                  monthTextColor: 'blue',
                  indicatorColor: 'blue',
                  textDayFontFamily: 'monospace',
                  textMonthFontFamily: 'monospace',
                  textDayHeaderFontFamily: 'monospace',
                  textDayFontWeight: '300',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '300',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 16,
                }}
                markedDates={markedDates}
              />
            </View>
          ) : (
            <TouchableOpacity onPress={onStreakDayPress}>
              <Animated.View style={[styles.streakDaysPanel, animatedStyle]}>
                <LinearGradient
                  colors={['#7F7FD5', '#86A8E7', '#91EAE4']} // 你可以换成你喜欢的渐变色
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.gradientPanel}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#7a5c7a',
                    }}>
                    Record Your Activity!
                  </Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
      <Button
        title="Logout"
        onPress={() => {
          logoutHandler();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#c0c0c099',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    boxSizing: 'content-box',
  },
  userInfo: {
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 20,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    boxShadow: '0 0 10 1 #858585',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingItem: {
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    boxShadow: '0 0 10 1 #858585',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerItem: {
    padding: 10,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    gap: 10,
    flexDirection: 'column',
    boxShadow: '0 0 10 1 #858585',
    marginBottom: 50,
  },
  settingPanel: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 100,
  },

  gradientPanel: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  streakDaysPanel: {
    height: 100,
    margin: 10,
    borderRadius: 10,
  },
});
export default ProfileScreen;
