import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../splash";
import LoginScreen from "../login";
import RegisterScreen from "../register";
import ParentTabs from "./ParentTabs";
import KidsTabs from "./KidsTabs";

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Splash"
      >
        <Stack.Screen name="Splash">
          {(props) => (
            <SplashScreen
              {...props}
              onFinish={() => props.navigation.replace("Login")}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Parent" component={ParentTabs} />
        <Stack.Screen name="Kids" component={KidsTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

