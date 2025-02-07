import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useZoom } from '@zoom/react-native-videosdk';
import axios from 'axios';

const VideoCallScreen = () => {
  const zoom = useZoom();
  const [isInSession, setIsInSession] = useState(false);
  const sessionName="Lakshay"
  const role=1

  const fetchToken = async () => {
    try {
      // Fetching the token from a dummy API endpoint
      const response = await axios.get(`http://192.168.1.44:1951/api/v1/activity/get-zoom-token/${sessionName}/${role}`);
      const { token } = response.data;
      console.log(token)
      return token;
    } catch (error) {
      console.error('Error fetching token:', error);
      Alert.alert('Error', 'Failed to fetch token');
      return null;
    }
  };

  const joinSession = async () => {
    const token = await fetchToken();
    if (token) {
      try {
        await zoom.joinSession({
          sessionName: sessionName,
        //   sessionPassword: '',
          userName: 'Demo User',
          token: token,
          sessionIdleTimeoutMins: 10,
          audioOptions: { connect: true, mute: true, autoAdjustSpeakerVolume: false },
          videoOptions: { localVideoOn: true },
        });
        setIsInSession(true);
      } catch (error) {
        console.error('Failed to join session:', error);
        Alert.alert('Error', 'Failed to join session');
      }
    }
  };

  const leaveSession = () => {
    zoom.leaveSession(false);
    setIsInSession(false);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {isInSession ? (
        <>
          <Text>Video Call is active</Text>
          <Button title="Leave Call" onPress={leaveSession} />
        </>
      ) : (
        <Button title="Join Call" onPress={joinSession} />
      )}
    </View>
  );
};

export default VideoCallScreen;
