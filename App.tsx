import * as React from "react";
import { SQLiteProvider } from "expo-sqlite/next";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./screens/Home";
import Payment from "./screens/sheets/Payment";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import { Colors } from "./constants/styles";
const Stack = createNativeStackNavigator();

const loadDatabase = async () => {
  const dbName = "mySQLiteDB.db";
  const dbAsset = require("./assets/mySQLiteDB.db");
  const dbUri = Asset.fromModule(dbAsset).uri;
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

  const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
  if (!fileInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}SQLite`,
      { intermediates: true }
    );
    await FileSystem.downloadAsync(dbUri, dbFilePath);
  }
};

function AuthUser(){
  return (
    <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.primary500 },
      headerTintColor: 'white',
      contentStyle: { backgroundColor: Colors.primary100 },
    }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function AuthenticatedApp() {
  const [dbLoaded, setDbLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    loadDatabase()
      .then(() => setDbLoaded(true))
      .catch((e) => console.error(e));
  }, []);

  if (!dbLoaded)
    return (
      <View style={{ flex: 1 }}>
        <ActivityIndicator size={"large"} />
        <Text>Loading Database...</Text>
      </View>
    );
    
  return (
   
      <React.Suspense
        fallback={
          <View style={{ flex: 1 }}>
            <ActivityIndicator size={"large"} />
            <Text>Loading Database...</Text>
          </View>
        }
      >
        <SQLiteProvider databaseName="mySQLiteDB.db" useSuspense>
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={Home}
              options={{
                headerTitleAlign:"center",
                headerTitle: "Money Matters",
                headerShadowVisible:true,
                headerLargeTitle: true,
                headerTransparent: Platform.OS === "ios" ? true : false,
                // headerBlurEffect: "light",
                headerStyle:{
                  backgroundColor: '#94cce8',
                },
                headerTitleStyle: {
                  color:'#2b2d6e'
                },
              }}
            />
          </Stack.Navigator>
        </SQLiteProvider>
      </React.Suspense>
   
  );
}


function Navigation(){
  return (
    <NavigationContainer>
      {/* <AuthUser/> */}
      <AuthenticatedApp/>
  </NavigationContainer>
  );
}

export default function App(){
  return (
    <>
    <StatusBar style="dark"/>
    <Navigation/>
    </>
  )
}