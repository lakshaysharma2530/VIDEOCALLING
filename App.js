import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ZoomVideoSdkProvider } from '@zoom/react-native-videosdk';
import VideoCallScreen from './VideoCall';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <ZoomVideoSdkProvider
      config={{
        // appGroupId: '{Your Apple Group ID here}',
        domain: 'zoom.us',
        enableLog: true,
      }}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={VideoCallScreen} />
       {/* <Stack.Screen name="Details" component={DetailsScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
    </ZoomVideoSdkProvider>
  );
}

export default App;
