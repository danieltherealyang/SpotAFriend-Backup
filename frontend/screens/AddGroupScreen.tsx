import {
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

import React, { ReactNode, useEffect, useState } from "react";
import { default as theme } from "../theme.json";

import { Text, useThemeColor, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";
import { faker } from "@faker-js/faker";
import { useLinkProps } from "@react-navigation/native";

import { AddUserGroup } from "../firebase/library";
import { useContext } from "react";
import { UserContext } from "../components/UserContext.js";

function Back(props: any) {
  return (
    <TouchableOpacity onPress={() => BackHandler(props)}>
      <Image
        style={{
          resizeMode: "contain",
          height: 40,
          width: 40,
        }}
        source={require("../assets/images/icon.png")}
      />
    </TouchableOpacity>
  );
}

function BackHandler(props: any) {
  props.navigate("Group");
  return;
}

function JoinButton(props: any) {
  return (
    <TouchableOpacity onPress={async () => {await AddUserGroup(props.user, props.groupname); props.navigation.navigate("Group");}}>
      <Text style={styles.textStyle}>join group</Text>
    </TouchableOpacity>
  );
}

function JoinGroupHandler(props: any) {
  const groupname = props.groupname;
  const user = props.user;
  AddUserGroup(user, groupname);
}

export default function AddGroupScreen({
  navigation,
}: RootTabScreenProps<"Home">) {
  const [modalVisible, setModalVisible] = useState(false);

  const [group, setGroup] = useState("");
  const { user } = useContext(UserContext);

  return (
    <View style={styles.container}>
      <View
        style={{
          height: 55,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginTop: "10%",
          paddingHorizontal: 15,
          width: "90%",
          backgroundColor: "transparent",
        }}
      >
        <Back {...navigation} />
      </View>
      <View style={styles.container}>
        <View style={{ height: "30%" }}></View>
        <Text style={styles.textStyleslay}>create or join a group</Text>
        <View style={styles.searchbar}>
          <TextInput
            placeholderTextColor={"#689689"}
            placeholder="group name"
            keyboardType="default"
            onChangeText={(group) => setGroup(group)}
            style={{ fontSize: 17, width: 310, height: 25, }}
          />
        </View>
        <View style={styles.GroupContainer}>
          <View style={{ height: "5%" }}></View>
          <View style={styles.box2}>
            <JoinButton
              groupname={group}
              user={user}
              navigation={navigation}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3DAC9"
  },
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3DAC9",
  },
  box: {
    backgroundColor: "#F4D58D",
    borderColor: "#689689",
    borderWidth: 2,
    borderRadius: 30,
    marginBottom: "5%",
    paddingHorizontal: "5%",
    paddingVertical: "5%",
    marginHorizontal: "5%",
  },
  box2: {
    backgroundColor: "#F4D58D",
    borderColor: "#689689",
    borderWidth: 2,
    borderRadius: 17,
    marginBottom: "5%",
    paddingHorizontal: "2%",
    paddingVertical: "2%",
    marginHorizontal: "2%",
    alignItems: "center",
    width: 330,
    alignSelf: "center",
  },
  GroupContainer: {
    backgroundColor: theme["color-background"],
    width: 330,
    height: "100%",
  },
  buttonClose: {
    backgroundColor: "transparent",
    height: "auto",
  },
  textStyle: {
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#689689",
    backgroundColor: "transparent",
  },
  textStyleslay: {
    fontSize: 22,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#689689",
    backgroundColor: "transparent",
  },
  names: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#689689",
    marginTop: "5%",
  },
  names2: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#fff",
    marginTop: "5%",
  },
  dismiss: {
    fontSize: 16,
    fontStyle: "italic",
    textDecorationLine: "underline",
    color: "#fff",
    marginTop: "4%",
  },
  modalContainer: {
    backgroundColor: "transparent",
    margin: "5%",
    height: 400,
    alignItems: "center",
  },
  addgroup: {
    backgroundColor: "#BF0603",
    height: 40,
    width: 40,
    borderRadius: 15,
    justifyContent: "center",
  },
  groupImage: {
    alignSelf: "center",
    height: 100,
    width: 100,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#689689",
  },
  targetImage: {
    alignSelf: "center",
    height: 140,
    width: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "#BF0603",
    margin: "5%",
  },
  searchbar: {
    backgroundColor: theme["color-button-fill-white"],
    borderWidth: 2,
    borderColor: "#689689",
    borderRadius: 15,
    width: 330,
    height: 45,
    alignContent: "center",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "5%",
  },
  pfp: {
    alignSelf: "center",
    height: 180,
    width: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: "#689689",
    marginBottom: "5%",
  },
});
