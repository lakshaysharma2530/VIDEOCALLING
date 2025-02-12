import React, { useRef, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { EventType, VideoAspect, ZoomVideoSdkUser, ZoomView, useZoom } from "@zoom/react-native-videosdk";
import axios from 'axios';
import MuteButtons from './Mutebuttons';
import { styles } from './Styles';

const VideoCallScreen = () => {
  const zoom = useZoom();
  const listeners = useRef([]); // Manage event listeners
  const [users, setUsersInSession] = useState([]); // Users in the session
  const [isInSession, setIsInSession] = useState(false); // Session status
  const [isAudioMuted, setIsAudioMuted] = useState(true); // Audio mute status
  const [isVideoMuted, setIsVideoMuted] = useState(true); // Video mute status

  // Variables for session configuration
  const sessionName = "Lakshay"; // Replace with dynamic value if needed
  const role = 1; // Role: 1 = Host, 0 = Attendee

  // Fetch Zoom SDK token from your backend
  const fetchToken = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.59:1951/api/v1/activity/get-zoom-token/${sessionName}/${role}`
      );
      return response.data.token;
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch Zoom token');
      console.error('Error fetching token:', error);
      return null;
    }
  };

  // Initialize Event Listeners
  const setupListeners = async () => {
    const sessionJoin = zoom.addListener(EventType.onSessionJoin, async () => {
      const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
      const remoteUsers = await zoom.session.getRemoteUsers();
      setUsersInSession([mySelf, ...remoteUsers]);
      setIsInSession(true);
    });
    listeners.current.push(sessionJoin);

    const userJoin = zoom.addListener(EventType.onUserJoin, async (event) => {
      const { remoteUsers } = event;
      const mySelf = await zoom.session.getMySelf();
      const remote = remoteUsers.map((user) => new ZoomVideoSdkUser(user));
      setUsersInSession([mySelf, ...remote]);
    });
    listeners.current.push(userJoin);

    const userLeave = zoom.addListener(EventType.onUserLeave, async (event) => {
      const { remoteUsers } = event;
      const mySelf = await zoom.session.getMySelf();
      const remote = remoteUsers.map((user) => new ZoomVideoSdkUser(user));
      setUsersInSession([mySelf, ...remote]);
    });
    listeners.current.push(userLeave);

    const userVideo = zoom.addListener(EventType.onUserVideoStatusChanged, async (event) => {
      const { changedUsers } = event;
      const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
      const match = changedUsers.find((user) => user.userId === mySelf.userId);
      if (match) {
        const on = await mySelf.videoStatus.isOn();
        setIsVideoMuted(!on);
      }
    });
    listeners.current.push(userVideo);

    const userAudio = zoom.addListener(EventType.onUserAudioStatusChanged, async (event) => {
      const { changedUsers } = event;
      const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
      const match = changedUsers.find((user) => user.userId === mySelf.userId);
      if (match) {
        const muted = await mySelf.audioStatus.isMuted();
        setIsAudioMuted(muted);
      }
    });
    listeners.current.push(userAudio);

    const sessionLeave = zoom.addListener(EventType.onSessionLeave, () => {
      setIsInSession(false);
      setUsersInSession([]);
    });
    listeners.current.push(sessionLeave);
  };

  // Join the Zoom session
  const joinSession = async () => {
    try {
      const token = await fetchToken(); // Fetch token
      if (!token) {
        console.error("Failed to fetch token");
        return; // Exit if token is invalid
      }

      await zoom.joinSession({
        sessionName,
        sessionPassword: "",
        userName: "test", // Replace with your username
        sessionIdleTimeoutMins: 10,
        token,
        audioOptions: { connect: true, mute: true, autoAdjustSpeakerVolume: false },
        videoOptions: { localVideoOn: true },
      });
      await setupListeners(); // Set up event listeners
      console.log("Joined session successfully!");
    } catch (error) {
      console.error("Error joining session:", error);
      Alert.alert("Error", "Unable to join the session. Please try again.");
    }
  };

  // Leave the Zoom session
  const leaveSession = () => {
    zoom.leaveSession(false);
    setIsInSession(false);
    listeners.current.forEach((listener) => listener.remove());
    listeners.current = [];
  };

  return isInSession ? (
    <View style={styles.container}>
      {users.map((user) => (
        <View style={styles.container} key={user.userId}>
          <ZoomView
            style={styles.container}
            userId={user.userId}
            fullScreen
            videoAspect={VideoAspect.PanAndScan}
          />
        </View>
      ))}
      <Button title="Leave Session" color={"#f01040"} onPress={leaveSession} />
      <MuteButtons isAudioMuted={isAudioMuted} isVideoMuted={isVideoMuted} />
    </View>
  ) : (
    <View style={styles.container}>
      <Text style={styles.heading}>Zoom Video SDK</Text>
      <Text style={styles.heading}>React Native Quickstart</Text>
      <View style={styles.spacer} />
      <Button title="Join Session" onPress={joinSession} />
    </View>
  );
};

export default VideoCallScreen;
