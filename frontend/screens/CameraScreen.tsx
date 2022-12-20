import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../components/UserContext";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  _Text,
  ImageBackground
} from "react-native";
import { Camera } from "expo-camera";
import { RootStackScreenProps } from "../types";
import { storage } from "../firebase/index.js";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { db } from "../firebase/index";
import {
  getDatabase,
  onValue,
  ref as dbref,
  set,
  update,
} from "firebase/database";
import { useNavigation } from "@react-navigation/native";

import { Emitter } from '../event/index';

export default function App({ navigation }: RootStackScreenProps<"Modal">) {
  let nav = useNavigation();
  let camera: Camera;

  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<any>(null);

  const { user } = useContext(UserContext);

  Emitter.addListener('ResetCamera', () => {
    setPreviewVisible(false);
    setCapturedImage(null);
  });
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
    return() => {Emitter.removeListener('ResetCamera');};
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const __takePicture = async () => {
    if (!camera) return;
    const photo = await camera.takePictureAsync();
    setPreviewVisible(true);
    setCapturedImage(photo);
  };

  const __retakePicture = () => {
    setCapturedImage(null);
    setPreviewVisible(false);
  };

  const __uploadPicture = () => {
    nav.navigate("Post", { URI: capturedImage.uri });
  };

  const CameraPreview = ({ photo }: any) => {
    return (
      <View style={styles.preview}>
        <ImageBackground
          source={{ uri: photo && photo.uri }}
          style={{ flex: 1, width: "100%", height: "100%" }}
        >
          <View style={styles.row2}>
            <TouchableOpacity onPress={__retakePicture} style={styles.retake}>
              <Text style={styles.text}>cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={__uploadPicture} style={styles.retake}>
              <Text style={styles.text}>upload</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {previewVisible && capturedImage ? (
        <CameraPreview photo={capturedImage} retakePicture={__retakePicture} />
      ) : (
        <Camera
          style={{ flex: 1 }}
          ref={(r) => {
            camera = r;
          }}
        >
          <View style={styles.row}>
            <TouchableOpacity style={styles.ring} onPress={__takePicture}>
              <View
                style={styles.takepic}
              />
            </TouchableOpacity>
          </View>
        </Camera>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderTopWidth: 40,
    borderColor: "#E3DAC9",
  },
  preview: {
    backgroundColor: "transparent",
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    color: "#083D77",
    fontStyle: "italic",
    fontWeight: "bold",
    fontSize: 18,
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 0,
    padding: 20,
    backgroundColor: "transparent",
  },
  row2: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 0,
    padding: 20,
    backgroundColor: "transparent",
  },
  retake: {
    padding: 15,
    width: 130,
    alignItems: "center",
    borderRadius: 50,
    borderColor: "#083D77",
    borderWidth: 2,
    backgroundColor: "#00AFB5",
  },
  takepic: {
    width: 48,
    height: 48,
    bottom: 0,
    borderRadius: 48,
    borderWidth: 2,
    backgroundColor: "#00AFB5",
  },
  ring: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: "#00AFB5",
  },
  pictureContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
    flexDirection: "row",
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderTopWidth: 40,
    borderColor: "#F4D58D",
  },
  lowersection: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    width: "100%",
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#F4D58D",
    justifyContent: "center",
    borderColor: "#F4D58D",
  },
  picborder: {},
});
