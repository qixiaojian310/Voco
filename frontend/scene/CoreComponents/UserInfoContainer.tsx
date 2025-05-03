import {Button, Input, Icon} from '@rneui/themed';
import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useMemo} from 'react';
import {useState} from 'react';
import {signin, signup} from '../../request/authorization';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userStore from '../../stores/UserStore';

function UserInfoContainer() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const signupHandler = async () => {
    // TODO: signup
    const res = await signup({
      username: username,
      password: password,
    });
    console.log(res);

    if (typeof res === 'number') {
      Toast.show({
        text1: 'Signup Failed',
        type: 'error',
      });
    } else {
      Toast.show({
        text1: `User ${res.username} Signup Success`,
        type: 'success',
      });
      userStore.login();
    }
  };

  const signinHandler = async () => {
    const res = await signin({
      username: username,
      password: password,
    });

    if (typeof res === 'number') {
      Toast.show({
        text1: 'Signin Failed',
        type: 'error',
      });
    } else {
      Toast.show({
        text1: 'Signin Success',
        type: 'success',
      });
      userStore.login();
    }
  };

  const passwordErrorMessage = useMemo(() => {
    if (repeatPassword !== password && isSignup) {
      return 'Your password is not same';
    } else {
      return undefined;
    }
  }, [repeatPassword, password, isSignup]);
  const usernameErrorMessage = useMemo(() => {
    if (username.length < 4 && isSignup) {
      return 'Your username is too short';
    } else {
      return undefined;
    }
  }, [username, isSignup]);

  useEffect(()=>{
    const userLoginWIthToken = async () => {
      const access_token = await AsyncStorage.getItem('access_token');
      if (access_token) {
        userStore.login();
      }else{
        userStore.logout();
      }
    };
    userLoginWIthToken();
  });
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
      <View style={styles.controllerBox}>
        <Input
          placeholder="Account"
          leftIcon={
            <Icon name="user" type="font-awesome" size={24} color="#cbcbcb" />
          }
          inputStyle={{fontSize: 12, height: 50, color: '#ffffff'}}
          label={<Text style={{color: '#ffffff'}}>Account</Text>}
          onChangeText={text => setUsername(text)}
          errorMessage={usernameErrorMessage}
          renderErrorMessage={false}
        />
        <Input
          placeholder="Password"
          leftIcon={
            <Icon name="lock" type="font-awesome" size={24} color="#cbcbcb" />
          }
          label={<Text style={{color: '#ffffff'}}>Password</Text>}
          secureTextEntry={true}
          errorMessage={passwordErrorMessage}
          renderErrorMessage={false}
          errorStyle={{color: '#b43027'}}
          inputStyle={{fontSize: 12, height: 50, color: '#ffffff'}}
          onChangeText={text => setPassword(text)}
        />
        {isSignup && (
          <Input
            placeholder="Repeat Password"
            leftIcon={
              <Icon name="lock" type="font-awesome" size={24} color="#cbcbcb" />
            }
            label={<Text style={{color: '#ffffff'}}>Password</Text>}
            secureTextEntry={true}
            renderErrorMessage={false}
            errorStyle={{color: '#b43027'}}
            inputStyle={{fontSize: 12, height: 50, color: '#ffffff'}}
            onChangeText={text => setRepeatPassword(text)}
          />
        )}
        <View
          style={{
            height: 50,
            justifyContent: 'flex-end',
            flexDirection: 'row',
          }}>
          <Button
            titleStyle={{fontSize: 12}}
            title={isSignup ? 'Back to Login' : 'Register Account'}
            type="clear"
            onPress={() => setIsSignup(!isSignup)}
          />
        </View>
        {isSignup ? (
          <Button title="Create Voco" onPress={signupHandler} />
        ) : (
          <Button title="Start Voco" onPress={signinHandler} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controllerBox: {
    width: 300,
    backgroundColor: '#000000be',
    borderRadius: 10,
    padding: 20,
  },
});
export default UserInfoContainer;
