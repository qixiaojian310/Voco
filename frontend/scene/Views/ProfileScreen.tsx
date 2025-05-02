import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button} from '@rneui/base';
import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useRef} from 'react';
import userStore from '../../stores/UserStore';
import {Avatar} from '@rneui/themed';
import {useFocusEffect} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import {Picker} from '@react-native-picker/picker';

function ProfileScreen() {
  const [userInfo, setUserInfo] = React.useState<any>(null);

  const logoutHandler = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('userInfo');
    userStore.logout();
  };

  const initInfo = async () => {
    const userInfoJSON = await AsyncStorage.getItem('userInfo');
    if (userInfoJSON) {
      const userInfo = JSON.parse(userInfoJSON);
      console.log(userInfo);
      setUserInfo(userInfo);
    }
  };
  const onDateChangeHandler = (date: Date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const decimalTime = hour + minute / 60;
    setUserInfo((prev: any) => ({...prev, reminder_time: decimalTime})); // 22.5 格式返回
  };

  React.useEffect(() => {
    if (userInfo) {
      AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
  }, [userInfo]);

  useFocusEffect(
    React.useCallback(() => {
      initInfo();
    }, []),
  );

  const convertHourNumberToDate = (hourNumber: number): Date => {
    const hours = Math.floor(hourNumber);
    const minutes = Math.round((hourNumber - hours) * 60);

    const now = new Date();
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
        <View style={styles.settingPanel}>
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
              style={{flex: 1}}
              ref={pickerRef}
              selectedValue={userInfo.daily_goal}
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
        </View>
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
    backgroundColor: '#8684ec6d',
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
  settingPanel: {
    flex: 1,
    padding: 10,
  },
});
export default ProfileScreen;
