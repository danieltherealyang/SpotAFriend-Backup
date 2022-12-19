import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Button,
  Pressable,
  Image,
  ScrollView,
} from "react-native";

import { Text, View } from "../components/Themed";
import { default as theme } from "../theme.json";
import {
  AddFriend,
  GetFriendsList,
  RemoveFriend,
  SearchFriend,
} from "../firebase/library";
import { useContext } from "react";
import { UserContext } from "../components/UserContext";
import { RootTabScreenProps } from "../types";

export default function FriendsScreen({
  navigation,
}: RootTabScreenProps<"Friends">) {
  // const { cancel } = route.params;
  const { user } = useContext(UserContext);
  var [friendsList, setList] = useState([]);
  console.log(friendsList);
  var getList = async () => {
    await GetFriendsList(user).then((value) => setList(value));
  };

  useEffect(() => {
    getList();
  }, []);

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
        <SettingsButton {...navigation} />
      </View>
      <Header navigation={navigation} updateList={async () => await getList()}/>
      <Divider />
      <FriendList
        // cancel={cancel}
        navigation={navigation}
        friends={friendsList}
        user={user}
        updateList={async () => await getList()}
      />
    </View>
  );
}

function SettingsButton(props: any) {
  return (
    <TouchableOpacity
      style={styles.settings}
      onPress={() => SettingsHandler(props)}
    >
      <Image
        style={{
          resizeMode: "contain",
          height: 30,
          width: 30,
          alignSelf: "center",
        }}
        source={require("../assets/images/settings.png")}
      />
    </TouchableOpacity>
  );
}

function SettingsHandler(props: any) {
  props.navigate("Settings");
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

function FriendList(props: any) {
  var friendlist = props.friends.map((friend: any, index: any) => (
    <Friend
      key={index}
      name={friend}
      removeHandler={async () => {
        await RemoveFriend(props.user, index);
        props.navigation.navigate("Friends", {
          cancel: props.cancel,
        });
        props.updateList();
      }}
    />
  ));
  return <ScrollView style={styles.friendlist}>{friendlist}</ScrollView>;
}

function Friend(props: any) {
  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        padding: 10,
      }}
    >
      <View style={styles.addButtonSlay}>
        <Text style={styles.title}>{props.name}</Text>
      </View>
      <TouchableOpacity
        onPress={props.removeHandler}
        style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}
      >
        <Text
          style={{
            paddingRight: "5%",
            color: "white",
            textDecorationLine: "underline",
            fontStyle: "italic",
            fontSize: 15,
          }}
        >
          remove
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function FriendPrompt(props: any) {
  // visible, friendName, addHandler
  const display = props.visible;
  var row;
  if (display) {
    row = (
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          padding: 10,
        }}
      >
        <View style={styles.addButtonSlayIngrid}>
          <Text style={styles.title}>{props.friendName}</Text>
        </View>
        <TouchableOpacity
          onPress={props.addHandler}
          style={styles.addButtonSlayIngrid2}
        >
          <Text style={styles.titleslay}>add</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    row = <View></View>;
  }
  return row;
}

function Header(props: any) {
  const { user } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [friendName, setFriendName] = useState("");
  const [friendFound, setFriendFound] = useState(false);
  var searchFriend = async (input: string) => {
    setFriendName(input);
    const promise = await SearchFriend(user, input);
    const value = promise;
    setFriendFound(value);
  };

  const [statusMessage, setStatus] = useState("");

  return (
    <View style={styles.header}>
      <View style={styles.addButton2}>
        <Text style={styles.title2}>{user.username}'s friends</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setShowModal(!showModal);
        }}
      >
        <Text style={styles.title}>add</Text>
      </TouchableOpacity>
      <Modal animationType={"slide"} transparent={true} visible={showModal}>
        <View
          style={{
            alignItems: "center",
            height: "80%",
            width: "100%",
            marginTop: "35%",
          }}
        >
          <View
            style={{
              alignSelf: "center",
              alignItems: "center",
              width: "90%",
              height: "75%",
              marginTop: "10%",
              backgroundColor: "#00AFB5",
              borderRadius: 30,
            }}
          >
            <View style={{ paddingTop: "10%" }}>
              <SearchBar
                inputHandle={(text: any) => {
                  setSearchText(text);
                  setFriendFound(false);
                  setStatus("");
                }}
                searchHandler={() => {
                  searchFriend(searchText);
                }}
              />
            </View>
            <FriendPrompt
              visible={
                friendName == searchText && searchText != "" && friendFound
              }
              friendName={friendName}
              addHandler={async () => {
                var val = await AddFriend(user, friendName, setStatus);
                if (val)
                  props.navigation.navigate("Friends", {
                    cancel: props.cancel,
                  });
                setShowModal(!showModal);
                props.updateList();
              }}
            />
            <Text style={{ color: "#BF0603" }}>{statusMessage}</Text>
            <Pressable onPress={() => setShowModal(!showModal)}>
              <Text style={styles.dismiss}>dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
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

function SearchBar(props: any) {
  return (
    <View style={styles.searchbar}>
      <TextInput
        placeholder="add friends"
        keyboardType="default"
        style={{ flex: 1 }}
        placeholderTextColor="grey"
        onChangeText={(text) => props.inputHandle(text)}
      />
      <TouchableOpacity
        style={{ alignSelf: "center" }}
        onPress={props.searchHandler}
      >
        <Image
          style={{
            resizeMode: "contain",
            height: 30,
            width: 30,
          }}
          source={require("../assets/images/search.png")}
        />
      </TouchableOpacity>
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
  row: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#E3DAC9",
  },
  header: {
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: "5%",
    backgroundColor: "#E3DAC9",
  },
  friendlist: {
    backgroundColor: "#083D77",
    width: "90%",
    borderTopStartRadius: 30,
    borderTopEndRadius: 30,
    marginTop: "7%",
    padding: "4%",
    paddingBottom: "100%",
  },
  openCard: {
    height: "60%",
    width: "90%",
    marginTop: "30%",
    alignSelf: "center",
    backgroundColor: "#00AFB5",
    borderRadius: 30,
  },
  addButton: {
    width: "30%",
    borderColor: "#689689",
    alignItems: "center",
    alignContent: "center",
    borderWidth: 2,
    padding: 5,
    borderRadius: 17,
    backgroundColor: "#F4D58D",
  },
  addButtonSlay: {
    width: "70%",
    borderColor: "#689689",
    alignItems: "center",
    alignContent: "center",
    borderWidth: 2,
    padding: 5,
    borderRadius: 17,
    backgroundColor: "#F4D58D",
  },
  addButtonSlayIngrid: {
    width: "70%",
    borderColor: "#689689",
    alignItems: "center",
    alignContent: "center",
    borderWidth: 2,
    padding: 5,
    borderRadius: 10,
    backgroundColor: "#F4D58D",
  },
  addButtonSlayIngrid2: {
    width: "29%",
    borderColor: "#BF0603",
    alignItems: "center",
    alignContent: "center",
    borderWidth: 2,
    padding: 5,
    borderRadius: 10,
    backgroundColor: "#BF0603",
  },
  addButton2: {
    flexDirection: "row",
    backgroundColor: "#E3DAC9",
  },
  divider: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3DAC9",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#689689",
  },
  titleslay: {
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "white",
  },
  title2: {
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#689689",
  },
  separator: {
    marginVertical: 1,
    height: 1,
    width: "100%",
    backgroundColor: "transparent",
  },
  settings: {
    backgroundColor: "#083D77",
    height: 40,
    width: 40,
    borderRadius: 15,
    justifyContent: "center",
  },
  modalcontainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
  },
  modal: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#00ff00",
    padding: 100,
  },
  text: {
    color: "#3f2949",
    marginTop: 10,
  },
  dismiss: {
    fontSize: 16,
    fontStyle: "italic",
    textDecorationLine: "underline",
    color: "white",
  },
  searchbar: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#00AFB5",
    borderRadius: 15,
    width: 330,
    height: 40,
    paddingLeft: 10,
    paddingRight: 10,
    alignContent: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
