import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { useContext, useState } from "react";
import { Text, View } from "../components/Themed";
import { RootStackParamList } from "../types";
import { UserContext } from "../components/UserContext";
import { storage } from "../firebase/index";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { db } from "../firebase/index";
import CachedImage from "react-native-expo-cached-image";

import {
  getDatabase,
  onValue,
  ref as dbref,
  set,
  update,
} from "firebase/database";

//remeber to add profile photo later
export default function ProfileScreen({
  navigation,
}: RootStackParamList<"Root">) {
  const storageRef = ref(storage, "profilephotos");
  const [image, setImage] = useState("");
  const { user } = useContext(UserContext);
  const username = user.username;
  let imageURL = "";
  const cancelFunction = () => navigation.navigate("Profile");
  const userRef = dbref(db, "users/" + username);
  if (userRef)
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.profilePhotoRef) {
        imageURL = data.profilePhotoRef;
      }
    });
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      // update photo as needed
      imageURL = (await uploadImageAsync(result.assets[0].uri, username)).toString();
      console.log(imageURL);
      update(dbref(db, "users/" + username), { profilePhotoRef: imageURL });
    }
    setImage(imageURL);
  };

  return (
    <View style={styles.container}>
      {imageURL === "" ? null : (
        <View>
          <CachedImage style={styles.targetImage} source={{ uri: imageURL }} />
        </View>
      )}
      <TouchableOpacity style={styles.row} onPress={async () => await pickImage()}>
        <View style={styles.label}>
          <Text
            style={{
              color: "#689689",
              fontSize: 17,
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            edit photo
          </Text>
        </View>
      </TouchableOpacity>
      <InfoView
        username={user.username}
        email={user.email}
        usernameHandler={() =>
          navigation.navigate("EditInfo", {
            name: "username",
            cancel: cancelFunction,
            attrib: "username",
            initial: user.username,
          })
        }
        emailHandler={() =>
          navigation.navigate("EditInfo", {
            name: "email",
            cancel: cancelFunction,
            attrib: "email",
            initial: user.email,
          })
        }
      />
    </View>
  );
}

async function uploadImageAsync(uri: any, username: any) {
  const fileRef = ref(storage, "profilephotos/" + username);
  const img = await fetch(uri);
  const bytes = await img.blob();
  const result = await uploadBytesResumable(fileRef, bytes);
  return await getDownloadURL(fileRef);
}

function InfoView(props: any) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E3DAC9",
      }}
    >
      <Divider />
      <RowButton
        label="username:"
        data={props.username}
        onPress={props.usernameHandler}
      />
      <Divider />
      <RowButton
        label="email:"
        data={props.email}
        onPress={props.emailHandler}
      />
      <Divider />
    </View>
  );
}

function RowButton(props: any) {
  return (
    <TouchableOpacity style={styles.row} onPress={props.onPress}>
      <View style={styles.label}>
        <Text
          style={{
            color: "#689689",
            fontSize: 17,
            fontStyle: "italic",
            fontWeight: "bold",
          }}
        >
          {props.label}
        </Text>
      </View>
      <View style={styles.data}>
        <Text
          style={{
            color: "#689689",
            fontSize: 17,
            fontStyle: "italic",
          }}
        >
          {props.data}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function Divider() {
  return (
    <View style={styles.divider}>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", //can change to flex-start if need to push to top
    backgroundColor: "#E3DAC9",
  },
  label: {
    width: "30%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#F4D58D",
  },
  data: {
    width: "70%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#F4D58D",
  },
  row: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#F4D58D",
    borderWidth: 2,
    borderRadius: 20,
    borderColor: "#689689",
    marginBottom: "5%",
    alignContent: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3DAC9",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 1,
    height: 1,
    width: "85%",
    backgroundColor: "#E3DAC9",
  },
  targetImage: {
    alignSelf: "center",
    height: 180,
    width: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: "#689689",
    margin: "5%",
  },
});
