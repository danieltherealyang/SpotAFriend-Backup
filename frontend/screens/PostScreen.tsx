import React, { useState, useContext } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { Text, View } from "../components/Themed";
import { UserContext } from "../components/UserContext";

import { default as theme } from "../theme.json";
import { RootStackScreenProps } from "../types";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { db } from "../firebase/index";
import {
  getDatabase,
  onValue,
  ref as dbref,
  set,
  update,
} from "firebase/database";

import { Emitter } from '../event/index';

export default function PostScreen({
  navigation,
  route,
}: RootStackScreenProps<"Root">) {
  const { URI } = route.params;
  const storage = getStorage();
  // const eventEmitter = new NativeEventEmitter();
  const reset = () => {Emitter.emit('ResetCamera', {});};

  // const [image, setImage] = useState("");
  const { user } = useContext(UserContext);
  const username = user.username;
  const groups = user.groups;
  let pickedGroup = "";
  let pickedTag = "";

  function Picture() {
    return <Image style={{ height: 200, width: 200 }} source={{ uri: URI }} />;
  }
  async function uploadImageAsync() {
    if (pickedGroup === "" || pickedTag === "") {
      alert("Please select a group and a tag");
      return;
    }
    const fileRef = ref(
      storage,
      "dailyphotos/" +
        user.username +
        "_" +
        pickedGroup +
        "_" +
        pickedTag +
        ".jpg"
    );
    const img = await fetch(URI); //to string necessary?
    const bytes = await img.blob();
    const result = await uploadBytesResumable(fileRef, bytes);

    let imageURL = (await getDownloadURL(fileRef)).toString();
    console.log(imageURL);
    //set(dbref(db, "groups/" + pickedGroup + "/users/" + username + "/"), { tag: pickedTag });
    update(dbref(db, "users/" + user.username), { dailyPhotoRef: imageURL });
  }

  function PostButton() {
    return (
      <TouchableOpacity
        style={styles.PostButtonStyling}
        onPress={() => PostHandler(reset)}
      >
        <Text style={styles.PostButtonTextStyling}>post</Text>
      </TouchableOpacity>
    );
  }

  function CancelButton() {
    return (
      <TouchableOpacity
        style={styles.CancelButtonStyling}
        onPress={() => CancelHandler()}
      >
        <Text style={styles.CancelButtonTextStyling}>cancel</Text>
      </TouchableOpacity>
    );
  }

  function CancelHandler() {
    navigation.navigate("Root", { screen: "Home" });
    return;
  }

  function PostHandler(reset: any) {
    uploadImageAsync();
    reset();
    navigation.navigate("Root", { screen: "Home" });
    return;
  }

  function getGroups() {
    const { user } = useContext(UserContext);
    const groups = user.groups;

    let groupslist = groups ? [{ label: groups[0], value: groups[0] }] : [];
    for (let i = 1; i < groupslist.length; i++) {
      var obj = { label: groups[i], value: groups[i].toString() };
      groupslist.push(obj);
    }
    return groupslist;
  }

  function GroupSelection() {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState(getGroups());

    return (
      <DropDownPicker
        multiple={false}
        dropDownDirection="TOP"
        placeholder="select your group"
        badgeColors={"#689689"}
        listItemLabelStyle={{
          color: "#689689",
        }}
        selectedItemLabelStyle={{
          color: "#689689",
        }}
        dropDownContainerStyle={{
          borderColor: "#689689",
          borderWidth: 2,
          borderRadius: 15,
          backgroundColor: theme["color-button-fill-white"],
        }}
        placeholderStyle={{
          color: "#689689",
        }}
        onChangeValue={(value) => {
          if (value != null) {
            pickedGroup = value.toString();
          }
        }}
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        style={{
          borderRadius: 15,
          borderColor: "#689689",
          borderWidth: 2,
          backgroundColor: theme["color-button-fill-white"],
        }}
      />
    );
  }

  function getTags() {
    let tags = [
      { label: "friend", value: "friend" },
      { label: "enemy", value: "enemy" },
      { label: "acquaintance", value: "acquaintance" },
    ];
    return tags;
  }

  function TagSelection() {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState(getTags());

    return (
      <DropDownPicker
        multiple={false}
        min={0}
        max={10}
        dropDownDirection="TOP"
        placeholder="select your tag"
        badgeColors={"#689689"}
        listItemLabelStyle={{
          color: "#689689",
        }}
        selectedItemLabelStyle={{
          color: "#689689",
        }}
        dropDownContainerStyle={{
          borderColor: "#689689",
          borderWidth: 2,
          borderRadius: 15,
          backgroundColor: theme["color-button-fill-white"],
        }}
        placeholderStyle={{
          color: "#689689",
        }}
        onChangeValue={(value) => {
          if (value != null) {
            pickedTag = value.toString();
          }
          console.log(pickedTag);
        }}
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        style={{
          borderRadius: 15,
          borderColor: "#689689",
          borderWidth: 2,
          backgroundColor: theme["color-button-fill-white"],
        }}
      />
    );
  }
  return (
    <View>
      <View style={styles.PictureContainer}>
        <Picture />
      </View>
      <View style={styles.GroupContainer}>
        <GroupSelection />
      </View>
      <View style={styles.TagContainer}>
        <TagSelection />
      </View>
      <View style={styles.ButtonContainer}>
        <View style={styles.row}>
          <CancelButton />
          <PostButton />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  PictureContainer: {
    backgroundColor: theme["color-background"],
    width: "100%",
    height: "65%",
    alignItems: "center",
    justifyContent: "center",
  },
  GroupContainer: {
    backgroundColor: theme["color-background"],
    width: "90%",
    height: "10%",
    alignSelf: "center",
  },
  TagContainer: {
    backgroundColor: theme["color-background"],
    width: "90%",
    height: "10%",
    alignSelf: "center",
  },
  ButtonContainer: {
    backgroundColor: theme["color-background"],
    width: "100%",
    height: "10%",
  },
  PostButtonStyling: {
    padding: 20,
    width: "30%",
    backgroundColor: theme["color-button-fill-blue"],
    borderColor: theme["color-button-fill-blue"],
    borderWidth: 2,
    borderRadius: 50,
  },
  CancelButtonStyling: {
    padding: 20,
    width: "30%",
    backgroundColor: theme["color-button-fill-white"],
    borderColor: theme["color-button-fill-blue"],
    borderWidth: 2,
    borderRadius: 50,
  },
  PostButtonTextStyling: {
    textAlign: "center",
  },
  CancelButtonTextStyling: {
    textAlign: "center",
    color: theme["color-button-fill-blue"],
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 0,
    padding: 0,
    backgroundColor: "transparent",
  },
});
