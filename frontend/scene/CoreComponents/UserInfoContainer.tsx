import {Button, Input} from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import {StyleSheet, Text, View} from 'react-native';
import {useState} from 'react';
import { useNavigation } from '@react-navigation/native';

function UserInfoContainer() {
  const [isRegister, setIsRegister] = useState(false);
  const navigation = useNavigation<any>();
  const register = () => {
    navigation.navigate('Home');
  };
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
          leftIcon={<Icon name="user" size={24} color="#424242" />}
          inputStyle={{fontSize: 12, height: 50}}
          label={<Text style={{color: '#000000'}}>Account</Text>}
        />
        <Input
          placeholder="Password"
          leftIcon={<Icon name="lock" size={24} color="#424242" />}
          label={<Text style={{color: '#000000'}}>Password</Text>}
          secureTextEntry={true}
          inputStyle={{fontSize: 12, height: 50}}
        />
        {isRegister && (
          <Input
            placeholder="Repeat Password"
            leftIcon={<Icon name="lock" size={24} color="#424242" />}
            label={<Text style={{color: '#000000'}}>Password</Text>}
            secureTextEntry={true}
            inputStyle={{fontSize: 10}}
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
            title={isRegister ? 'Back to Login' : 'Register Account'}
            type="clear"
            onPress={() => setIsRegister(!isRegister)}
          />
        </View>
        <Button title="Register" onPress={register}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controllerBox: {
    width: 300,
    backgroundColor: '#ffffffbf',
    borderRadius: 10,
    padding: 20,
  },
});
export default UserInfoContainer;
