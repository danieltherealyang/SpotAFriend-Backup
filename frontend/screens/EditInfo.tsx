import { useState } from 'react';
import { StyleSheet, TextInput, Touchable, TouchableOpacity } from 'react-native';

import { Text, View } from '../components/Themed';
import { default as theme } from '../theme.json';
import { EditUserAttrib } from '../firebase/library';
import { useContext } from 'react';
import { UserContext } from '../components/UserContext';
import { db } from '../firebase/index';

export default function EditInfo({ route, navigation } : any) {
  const {name, cancel, attrib, initial} = route.params;
  const [data, setData] = useState(initial);
  var [errorMsg, setErrorMsg] = useState('');
  var msgColor = 'red';
  
  return (
    <View style={styles.container}>
      <Header name={"edit " + name} cancel={cancel} attrib={attrib} value={data} func={setErrorMsg} navigation={navigation}/>
      <Divider/>
      <DataInput initial={data} hook={setData}/>
      <Divider/>
      <View style={{flexDirection: 'row', padding: 15, width: '90%', justifyContent: 'center', borderWidth: 0, backgroundColor: "#E3DAC9" }}>
        <Text style={{color: msgColor}}>{errorMsg}</Text>
      </View>
    </View>
  );
}

function Header(props: any) {
  const { user, setUser } = useContext(UserContext);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.cancelButton} onPress={props.cancel}>
        <Text>cancel</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{props.name}</Text>
      <TouchableOpacity style={styles.doneButton} onPress={async () => {
        var val = await EditUserAttrib(user, props.attrib, props.value, props.func, setUser);
        if (val) {
          props.navigation.navigate("Profile");
      }}}>
        <Text style={{color: theme['color-button-fill-blue'], fontWeight: 'bold'}}>done</Text>
      </TouchableOpacity>
    </View>
  );
}

function DataInput(props: any) {
  const [data, setData] = useState('');
  return (
    <TextInput
      style={styles.row}
      defaultValue={props.initial}
      onChangeText={(data) => {setData(data); props.hook(data);}}
    />
  );
}

function Divider() {
  return (
    <View style={styles.divider}>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: "#E3DAC9",
  },
  row: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: "#E3DAC9",
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 50,
    backgroundColor: "#E3DAC9",
  },
  cancelButton: {
    width: '20%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: 10,
    backgroundColor: "#E3DAC9",
  },
  doneButton: {
    width: '20%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: "#E3DAC9",
  },
  divider: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#E3DAC9",
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  separator: {
    marginVertical: 1,
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});