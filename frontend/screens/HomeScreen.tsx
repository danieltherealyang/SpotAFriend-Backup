import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image
} from "react-native";

import React, { useEffect, useState, useContext } from "react";
import { SearchFriend } from "../firebase/library";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { UserContext } from "../components/UserContext";
import { GetGroupMembers } from "../firebase/library";
import { db } from "../firebase/index";
import { get, ref as dbref } from "firebase/database";
import CachedImage from "react-native-expo-cached-image";

const Card = (props: any) => {
  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <CachedImage style={styles.pfp} source={{ uri: props.pfp }} />
        <View style={styles.captionBox}>
          <Text style={styles.postTitle}>
            <Text style={styles.postTitleName}>{props.person1} </Text>
            spotted their target
          </Text>
        </View>
      </View>
      <CachedImage style={styles.postImage} source={{ uri: props.pic }} />
      <View style={styles.tagsLikes}>
        <View style={styles.tagsContainer}>
          <View style={styles.tags}>
            <Text style={styles.tagsText}>{props.tag1}</Text>
          </View>
        </View>
        <View style={styles.likesContainer}>
          <Text style={styles.postTitle}>♡</Text>
        </View>
      </View>
    </View>
  );
};

function SearchBar(props: any) {
  return (
    <View style={styles.searchbar}>
      <TextInput
        placeholder="search tags"
        keyboardType="default"
        style={{ width: "80%" }}
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

function Logo(props: any) {
  return (
    <TouchableOpacity
      onPress={() => props.function()}
    >
      <Image
        style={{
          resizeMode: "contain",
          height: 40,
          width: 40,
          marginTop: 50,
        }}
        source={require("../assets/images/icon.png")}
      />
    </TouchableOpacity>
  );
}
interface Person {
  person1: string;
  tag1: string;
  pfp: string;
  pic: string;
}

async function PopulateArray(user: any) {
  console.log("PopulateArray");
  let groupMembers: Person[] = [];
  var groupArray = user.groups;

  async function getImage(userName: string, groupName: string, tag: string) {
    const storage = getStorage();
    let imageURL;

    const fileRef = ref(
      storage,
      "dailyphotos/" + userName + "_" + groupName + "_" + tag + ".jpg"
    );
    imageURL = (await getDownloadURL(fileRef));
    return imageURL;
  }
  
  for (const groupName of groupArray) {
    console.log("groupName: " + groupName);
    const members = await GetGroupMembers(groupName);
    for (const member of members) {
      console.log("member: " + member);
      const dailyRef = dbref(db, "groups/" + groupName + "/tags/" + member);
      //get tag
      let tag: string = await get(dailyRef).then((snapshot) => 
        (snapshot.exists()) ? snapshot.val() : ""
      );
      if (!tag)
        continue;
      let image: string = await getImage(member, groupName, tag);
      const userRef = dbref(db, "users/" + member);
      let pfpImage: string = await get(userRef).then((snapshot) => {
        const data = (snapshot.exists()) ? snapshot.val() : null;
        return (data && data.profilePhotoRef) ? data.profilePhotoRef : "";});
      const person: Person = {
        person1: member,
        tag1: tag,
        pfp: pfpImage,
        pic: image
      };
      groupMembers.push(person);
    }
  }
  return groupMembers;
}

export default function HomeScreen({ navigation }: RootTabScreenProps<"Home">) {
  const { user } = useContext(UserContext);
  const [searchText, setSearchText] = useState("");
  const [friendFound, setFriendFound] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [statusMessage, setStatus] = useState("");

  var [postData, setPostData] = React.useState<Person[]>();
  var reloadFunction = async () => {
    console.log("reloadFunction");
    const data = await PopulateArray(user);
    const dataValue = data;
    return dataValue;
  };

  const reload = async () => {
    console.log("reload");
    setPostData(await reloadFunction());
  };

  useEffect(() => {
    reload();
  }, []);

  var searchFriend = async (input: string) => {
    setFriendName(input);
    const promise = await SearchFriend(user, input);
    const value = promise;
    setFriendFound(value);
  };

  const [text,setText] = useState(); 

  //console.log("FROM SEARCH???" + text);


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
        <Logo function={() => reload()}></Logo>
        <SettingsButton {...navigation} />
      </View>
      <View style={{ paddingTop: "5%" }}>
        <SearchBar
          inputHandle={(text: any) => {
            setText(text);
            setFriendFound(false);
            setStatus("");
          }}
          searchHandler={() => {
            searchFriend(searchText);
          }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
        }}
        style={styles.body}
      >
        {postData?.map((note: any, index: number) => {
          if (text == undefined || text == "" || text == note.tag1){
          return (
            <Card
              key={index}
              person1={note.person1}
              pic={note.pic}
              pfp={note.pfp}
              tag1={note.tag1}
            />
          );
        }
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
  postTitle: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#fff",
  },
  postTitleName: {
    fontWeight: "bold",
    color: "#fff",
  },
  body: {
    backgroundColor: "#083D77",
    width: "90%",
    borderTopStartRadius: 30,
    borderTopEndRadius: 30,
    marginTop: "5%",
    padding: "4%",
    paddingBottom: "100%",
  },
  post: {
    backgroundColor: "#00AFB5",
    width: "100%",
    borderRadius: 30,
    margin: "5%",
    height: "auto",
    alignItems: "center",
    paddingBottom: 20,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0)",
    width: "90%",
    marginTop: "5%",
  },
  pfp: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#fff",
  },
  captionBox: {
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0)",
    width: "75%",
  },
  postImage: {
    width: "90%",
    height: 300,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#F4D58D",
    marginTop: 15,
  },
  tagsLikes: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0)",
    width: "90%",
    paddingTop: 10,
    height: "auto",
  },
  tagsContainer: {
    flexDirection: "column",
    backgroundColor: "rgba(0,0,0,0)",
    justifyContent: "space-between",
  },
  tags: {
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 1,
    backgroundColor: "rgba(0,0,0,0)",
    borderRadius: 20,
    marginBottom: 5,
  },
  tagsText: {
    fontStyle: "italic",
    color: "#fff",
  },
  likesContainer: {
    backgroundColor: "rgba(0,0,0,0)", // this is temporary cuz im too lazy to code a heart for now
  },
  settings: {
    backgroundColor: "#083D77",
    height: 40,
    width: 40,
    borderRadius: 15,
    justifyContent: "center",
  },
  searchbar: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#00AFB5",
    borderRadius: 15,
    width: 330,
    height: 40,
    alignContent: "center",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
