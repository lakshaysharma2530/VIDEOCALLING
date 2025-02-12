import { useZoom } from "@zoom/react-native-videosdk";
import { Button, View } from "react-native";
import { styles } from "./Styles";

const MuteButtons = ({ isAudioMuted, isVideoMuted }) => {
    const zoom = useZoom();
    const onPressAudio = async () => {
      const mySelf = await zoom.session.getMySelf();
      const muted = await mySelf.audioStatus.isMuted();
      muted
        ? await zoom.audioHelper.unmuteAudio(mySelf.userId)
        : await zoom.audioHelper.muteAudio(mySelf.userId);
    };
    const onPressVideo = async () => {
        const mySelf = await zoom.session.getMySelf();
        const videoOn = await mySelf.videoStatus.isOn();
        videoOn ? await zoom.videoHelper.stopVideo() : await zoom.videoHelper.startVideo();
      };
      return (
        <View style={styles.buttonHolder}>
          <Button title={isAudioMuted ? "Unmute Audio" : "Mute Audio"} onPress={onPressAudio} />
          <View style={styles.spacer} />
          <Button title={isVideoMuted ? "Unmute Video" : "Mute Video"} onPress={onPressVideo} />
        </View>
      );
    };
    export default MuteButtons;