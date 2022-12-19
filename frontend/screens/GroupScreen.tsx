import {
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  Pressable,
} from "react-native";

import React, { ReactNode, useEffect, useState } from "react";

import { GetGroupMembers } from "../firebase/library";
import { useContext } from "react";
import { UserContext } from "../components/UserContext.js";

import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";
import { faker } from "@faker-js/faker";

import {
  set,
  update,
  ref,
  get,
  child,
  remove,
  push,
  onValue,
} from "firebase/database";
import { db } from "../firebase/index.js";

interface Group {
  members: string[];
  group: string;
}

function PopulateArray(user: any, groupData: Group[]) {
  // const [testArray, setTest] = useState([]);
  // var getGroupMembers = async () => {
  //   await GetGroupMembers('danielsgroup').then((value) => setTest(value));
  // };

  // useEffect(() => {
  //   getGroupMembers();
  // },[]);
  // Get groups
  if (user.groups == null){
    return;
  }
  var groupArray = user.groups; //list of groups for each user

  var getGroupMembers = async (group: string, setState: Function) => {
    await GetGroupMembers(group).then((members) => {
      setState(members);
      console.log(members);
    });
  };

  var pushMembers = async (groupname: string) => {
    var [array, setArray] = useState([]);
    useEffect(() => {getGroupMembers(groupname, setArray);}, []);
    const temp: Group = {
      group: groupname,
      members: array,
    };
    groupData.push(temp);
  };

  for (var groupname of groupArray) {
    pushMembers(groupname);
  }
}

const GroupCard = (props: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const GROUPNAME = props.group;
  const members = props.members;
  const targetRef = ref(db, "groups/" + GROUPNAME + "/target");
  let target = "";
  onValue(targetRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.user) {
        target = data.user;
      }
      if (data.timestamp + 1) {
        const d = new Date();
        let time = d.getTime();
        if ((time - data.timestamp) > 24 * 60 * 60 * 1000) {
          var newtarget = members[Math.floor(Math.random() * members.length)];
          if (newtarget != undefined){
            set(targetRef, {
              user: newtarget,
              timestamp: time,
            });
          }
        }
      }
    }
  })
  let imageURL = "";
  const userRef = ref(db, "users/" + target);
  onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.profilePhotoRef) {
        imageURL = data.profilePhotoRef;
      }
    }
  });
  const memberString = members.join(", ");
  const uri = imageURL ? imageURL : null;
  return (
    <View style={{ backgroundColor: "transparent" }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("The selected group is closed");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.openCard}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{GROUPNAME}</Text>
            <View style={styles.tags2}>
              <Text style={styles.tagsText}>
                {GROUPNAME}'s target of the day
              </Text>
            </View>
            <Image style={styles.targetImage} source={{ uri: uri }} />
            <View style={{ backgroundColor: "transparent" }}>
              <Text style={styles.modalText}>today's target: {target}</Text>
              <Text style={styles.names}>all members: {memberString}</Text>
            </View>
            <Pressable style={styles.addButtonSlayIngrid}>
              <Text style={styles.title}>leave this group</Text>
            </Pressable>

            <Pressable
              style={styles.buttonClose}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.dismiss}>dismiss</Text>
            </Pressable>
          </View>
        </View>
        {/* button below */}
      </Modal>
      <View style={styles.box}>
        <Pressable
          style={styles.groupOpen}
          onPress={() => setModalVisible(true)}
        >
          <Image style={styles.groupImage} source={{ uri: uri }} />
          <View
            style={{
              margin: "5%",
              backgroundColor: "transparent",
            }}
          >
            <Text style={styles.textStyle}>{GROUPNAME}</Text>
            <View style={styles.tags}>
              <Text style={styles.tagsText}>target not spotted</Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

function AddGroup(props: any) {
  return (
    <TouchableOpacity
      style={styles.addgroup}
      onPress={() => AddGroupHandler(props)}
    >
      <Image
        style={{
          resizeMode: "contain",
          height: 25,
          width: 25,
          alignSelf: "center",
        }}
        source={require("../assets/images/groups.png")}
      />
    </TouchableOpacity>
  );
}

function AddGroupHandler(props: any) {
  props.navigate("AddGroup");
  return;
}

function Logo() {
  return (
    <Image
      style={{
        resizeMode: "contain",
        height: 40,
        width: 40,
        marginTop: 50,
      }}
      source={require("../assets/images/icon.png")}
    />
  );
}

export default function GroupScreen({
  navigation,
}: RootTabScreenProps<"Group">) {
  const { user } = useContext(UserContext);

  const groupData: Group[] = [];
  PopulateArray(user, groupData);
  // console.log(groupData);

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
        <Logo></Logo>
        <AddGroup {...navigation} />
      </View>

      <ScrollView
        style={{
          width: "90%",
          backgroundColor: "#E3DAC9",
          marginTop: "10%",
        }}
      >
        {!groupData.length && <Text>You are not part of any groups!</Text>}
        {groupData.map((arrayItem, index) => {
          return (
            <GroupCard key={index} members={arrayItem.members} group={arrayItem.group} />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3DAC9",
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
    paddingLeft: "5%",
    paddingRight: "30%",
    paddingVertical: "5%",
  },
  groupOpen: {
    width: "100%",
    flexDirection: "row",
  },
  openCard: {
    height: "60%",
    width: "90%",
    marginTop: "30%",
    alignSelf: "center",
    backgroundColor: "#00AFB5",
    borderRadius: 30,
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
  },
  modalText: {
    fontSize: 20,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#fff",
  },
  names: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#fff",
    marginTop: "10%",
  },
  dismiss: {
    fontSize: 16,
    fontStyle: "italic",
    textDecorationLine: "underline",
    color: "#fff",
    marginTop: "10%",
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
  tags: {
    borderWidth: 1,
    borderColor: "#BF0603",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: "5%",
    paddingVertical: 1,
    backgroundColor: "rgba(0,0,0,0)",
    borderRadius: 20,
    marginBottom: 5,
    width: 140,
  },
  addButtonSlayIngrid: {
    width: "70%",
    borderColor: "#689689",
    alignItems: "center",
    alignContent: "center",
    borderWidth: 2,
    padding: 5,
    borderRadius: 17,
    backgroundColor: "#F4D58D",
    marginTop: "20%",
  },
  tags2: {
    borderWidth: 2,
    borderColor: "#BF0603",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: "2%",
    paddingVertical: 1,
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 5,
    width: 240,
  },
  tagsText: {
    fontStyle: "italic",
    color: "#BF0603",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#689689",
  },
});
