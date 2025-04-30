import Reactotron, { networking, asyncStorage } from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Reactotron.setAsyncStorageHandler(AsyncStorage).use(networking()).use(asyncStorage())
  .configure({
    name: 'Voco',
  })
  .useReactNative({
    asyncStorage: false, // there are more options to the async storage.
    networking: {
      ignoreUrls: /symbolicate/,
    },
    editor: false, // there are more options to editor
    errors: { veto: (stackFrame) => false }, // or turn it off with false
    overlay: false, // just turning off overlay
  })
  .connect();
