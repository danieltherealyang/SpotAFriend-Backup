import { set, update, ref, get, child, remove, push } from "firebase/database";
import { db } from "../firebase/index.js";

export function EditUserAttrib(userobj, attrib, value, func, setUser) {
    var userExists = true;
    const dbref = ref(db, 'users/' + userobj.username);
    if (attrib != "username") {
        update(dbref, {
            [attrib]: value,
        });
        return true;
    } else {
        userExists = get(ref(db, 'users/' + value)).then(async (snapshot) => {
            if (snapshot.exists()) {
                await func("user " + value + " already exists"); return false;
            }
            get(dbref).then((snap) => {
                if (snap.exists()) {
                    var data = snap.val();
                    data.username = value;
                    var updated = {};
                    updated[value] = data;
                    set(child(ref(db, 'users/'), value), updated[value]);
                }
            }).catch((error) => {
                console.error(error);
            });
            remove(ref(db, 'users/' + userobj.username));
            userobj.username = value;
            return true;
        });
    }
    return userExists;
}

export function GetGroupMembers(group) {
    // requires the following code in the calling function to work:
    // var [array, setArray] = useState('asdf');
    // var func = async () => {
    //     const promise = await GetGroupMembers("asdf");
    //     const value = promise;
    //     setArray(value);
    // };
    // func();
    //const dbref = ref(db, 'groups/' + group);
    const dbref = ref(db, 'groups/' + group + '/users');
    const promise = get(dbref).then((snapshot) => {
        if (snapshot.exists()) {
            var data = [];
            snapshot.forEach((childSnap) => {
                data.push(childSnap.val());
            });
            return data;
        }
        return [];
    }).catch((error) => {return [];});
    return promise;
}

export function GetFriendsList(userobj) {
    const dbref = ref(db, 'users/' + userobj.username + '/friends');
    const promise = get(dbref).then((snapshot) => {
        if (snapshot.exists()) {
            var data = [];
            snapshot.forEach((childSnap) => {
                data.push(childSnap.val());
            });
            return data;
        }
        return [];
    }).catch((error) => {return [];});
    return promise;
}

export function RemoveFriend(userobj, index) {
    const dbref = ref(db, 'users/' + userobj.username + '/friends');
    remove(child(dbref, index.toString()));
}

export async function SearchFriend(userobj, friend) {
    const dbref = ref(db, 'users/' + friend);
    const promise = await get(dbref).then((snapshot) => {
        if (snapshot.exists() && snapshot.val() != userobj.username) {
            return true;
        }
        return false;
    }).catch((error) => {return false;});
    return promise;
}

export function AddFriend(userobj, friendName, setStatus) {
    if (friendName == userobj.username) {
        setStatus('Cannot add yourself as a friend');
        return;
    }
    const dbref = child(ref(db, 'users/' + userobj.username),'friends');
    var success = get(dbref).then((snapshot) => {
        if (snapshot.exists()) {
            var data = [];
            snapshot.forEach((childSnap) => {
                data.push(childSnap.val());
            });
            if (!data.includes(friendName)) {
                data.push(friendName);
                set(dbref, data);
                setStatus(friendName + ' has been added')
                return true;
            } else {
                setStatus(friendName + ' is already a friend')
            }
        } else {
            var data = [friendName];
            set(dbref, data);
            return true;
        }
        return false;
    }).catch((error) => {console.log(error); return false;});
    return success;
}

export function AddUserGroup(user, group) {

    let newGroup = 0;

    // Add group to user
    var groupArray = [""];
    if (user.groups == null){
        groupArray = [group];
        newGroup = 1;
    }
    else{
        groupArray = user.groups;
    }
    if (!newGroup){
        for (const element of groupArray){
            if (element == group){
                return;
            }
        }
        groupArray.push(group);
    }
    update(ref(db, 'users/' + user.username), {
        groups: groupArray,
    });

    // Add user to group
    //userArray.push(user.username);
    push(ref(db, 'groups/' + group + '/users'), user.username);
    set(ref(db, 'groups/' + group + '/target'), {
        timestamp: 0,
        user: user.username,
    });
    //update(ref(db, 'groups/' + group), userArray);
} 

export async function GetGroupMembers1(groupName) {
    const dbref = child(ref(db, 'groups'),groupName);
    const promise = await get(dbref).then((snapshot) => {
        if (snapshot.exists()) {
            var data = [];
            snapshot.forEach((childSnap) => {
                data.push(childSnap.val());
            });
            return data;
        }
        return [];
    }).catch((error) => {console.log(error); return [];});
    return promise;
}

export function AddNewGroup(user, group) {
  // Add group to user
  var groupArray = user.groups;
  for (const element of groupArray) {
    if (element == group) {
      return;
    }
    groupArray.push(group);
    update(ref(db, 'users/' + user.username), {
        groups: groupArray,
    });

    set(ref(db, 'groups/' + group + '/users'), {
        0: user.username,
    });

  set(ref(db, "groups/" + group), {
    0: user.username,
  });
}}
