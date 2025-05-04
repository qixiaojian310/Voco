// In App.js in a new project

import * as React from 'react';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RegisterScreen from './Views/RegisterScreen';
import {KeyboardAvoidingView, StatusBar, View} from 'react-native';
import ReviewScreen from './Views/ReviewScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BackgroundView from './CoreComponents/BackgroundView';
import TabBar from './CoreComponents/TabBar';
import StatisticsScreen from './Views/StatisticsScreen';
import ProfileScreen from './Views/ProfileScreen';
import {Icon} from '@rneui/themed';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userStore from '../stores/UserStore';
import {observer} from 'mobx-react';
import WordbookScreen from './Views/WordbookScreen';
import NewWordbookScreen from './Views/NewWordbookScreen';
import notifee, { AndroidImportance} from '@notifee/react-native';


const RootStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();
function HomeTabs() {
  return (
    <MainTab.Navigator tabBar={props => <TabBar {...props} />}>
      <MainTab.Screen
        name="Book"
        component={WordbookScreen}
        options={{
          headerShown: false,
          tabBarIcon: props => (
            <Icon
              name="book"
              type="font-awesome"
              size={24}
              color={props.color}
            />
          ),
        }}
      />
      <MainTab.Screen
        name="Add"
        component={NewWordbookScreen}
        options={{
          headerShown: false,
          tabBarIcon: props => (
            <View
              style={{
                backgroundColor: '#fffff1',
                transform: 'scale(1.7)',
                borderRadius: 100,
              }}>
              <Icon
                name="plus"
                type="font-awesome"
                size={24}
                color={props.color}
                style={{paddingHorizontal:15,paddingVertical:13}}
              />
            </View>
          ),
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: props => (
            <Icon
              name="user"
              type="font-awesome"
              size={24}
              color={props.color}
            />
          ),
        }}
      />
    </MainTab.Navigator>
  );
}
function WordTabs() {
  return (
    <MainTab.Navigator tabBar={props => <TabBar {...props} />}>
      <MainTab.Screen
        name="Review"
        component={ReviewScreen}
        options={{
          headerShown: false,
          tabBarIcon: props => (
            <Icon
              name="flag-checkered"
              type="font-awesome"
              size={24}
              color={props.color}
            />
          ),
        }}
      />
      <MainTab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          headerShown: false,
          tabBarIcon: props => (
            <Icon
              name="area-chart"
              type="font-awesome"
              size={24}
              color={props.color}
            />
          ),
        }}
      />
    </MainTab.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff00',
    primary: '#866833',
    text: '#8f8f8f',
  },
};

const App = observer(() => {
  const [blur, setBlur] = React.useState(2);

  React.useEffect(() => {
    const userLoginWIthToken = async () => {
      const access_token = await AsyncStorage.getItem('access_token');
      if (access_token) {
        userStore.login();
      }
    };
    userLoginWIthToken();
  },[]);
  React.useEffect(() => {
    async function setupNotifications() {
      // Android 通道
      await notifee.createChannel({
        id: 'default',
        name: '默认通道',
        importance: AndroidImportance.HIGH,
      });

      // 请求通知权限（iOS + Android 13）
      await notifee.requestPermission();
    }
    setupNotifications();
  }, []);
  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={'padding'}
      keyboardVerticalOffset={0}>
      <BackgroundView blur={blur} />
      <StatusBar backgroundColor="transparent" hidden={true} />
      <NavigationContainer
        theme={navTheme}
        onStateChange={state => {
          const currentRoute = state!.routes[state!.index];
          if (currentRoute.name === 'Home') {
            setBlur(8);
          } else if (currentRoute.name === 'Register') {
            setBlur(2);
          }
        }}>
        <RootStack.Navigator>
          {userStore.isLoggedIn ? (
            userStore.selectBookId === -1 ? (
              <RootStack.Screen
                name="Home"
                options={{headerShown: false}}
                component={HomeTabs}
              />
            ) : (
              <RootStack.Screen
                name="Word"
                options={{headerShown: false}}
                component={WordTabs}
              />
            )
          ) : (
            <RootStack.Screen
              name="Register"
              options={{
                title: 'Register',
                headerShown: false,
              }}
              component={RegisterScreen}
            />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
      <Toast position="top" topOffset={20} />
    </KeyboardAvoidingView>
  );
});

export default App;
