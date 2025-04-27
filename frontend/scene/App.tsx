// In App.js in a new project

import * as React from 'react';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RegisterScreen from './Views/RegisterScreen';
import {KeyboardAvoidingView, StatusBar} from 'react-native';
import ReviewScreen from './Views/ReviewScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BackgroundView from './CoreComponents/BackgroundView';
import TabBar from './CoreComponents/TabBar';
import StatisticsScreen from './Views/StatisticsScreen';
import ProfileScreen from './Views/ProfileScreen';
import { Icon } from '@rneui/themed';

const RootStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();
function HomeTabs() {
  return (
    <MainTab.Navigator tabBar={props => <TabBar {...props} />}>
      <MainTab.Screen
        name="Review"
        component={ReviewScreen}
        options={{
          headerShown: false,
          tabBarIcon: props => (
            <Icon name="book" size={24} color={props.color} />
          ),
          tabBarLabelStyle: {
            marginBottom: 10,
          },
        }}
      />
      <MainTab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          headerShown: false,
          tabBarIcon: props => (
            <Icon name="area-chart" size={24} color={props.color} />
          ),
          tabBarLabelStyle: {
            marginBottom: 10,
          },
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: props => (
            <Icon name="user" type='font-awesome' size={24} color={props.color} />
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
    background: '#ffffff40',
  },
};

export default function App() {
  const [blur, setBlur] = React.useState(2);
  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={'padding'}
      keyboardVerticalOffset={-50}>
      <BackgroundView blur={blur} />
      <StatusBar backgroundColor="transparent" hidden={true} />
      <NavigationContainer
        theme={navTheme}
        onStateChange={state => {
          const currentRoute = state!.routes[state!.index];
          if (currentRoute.name === 'Home') {
            setBlur(8);
          } else if(currentRoute.name === 'Register'){
            setBlur(2);
          }
        }}>
        <RootStack.Navigator>
          <RootStack.Screen
            name="Register"
            options={{
              title: 'Register',
              headerShown: false,
            }}
            component={RegisterScreen}
          />
          <RootStack.Screen
            name="Home"
            options={{headerShown: false}}
            component={HomeTabs}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </KeyboardAvoidingView>
  );
}
