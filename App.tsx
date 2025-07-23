import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import IntroScreen from "./src/screens/IntroScreen"
import UserTypeScreen from "./src/screens/UserTypeScreen"
import AuthScreen from "./src/screens/AuthScreen"
import MainTabNavigator from "./src/navigation/MainTabNavigator"
import { AuthProvider } from "./src/context/AuthContext"

const Stack = createStackNavigator()

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#182825" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                }
              },
            }}
          >
            <Stack.Screen name="Intro" component={IntroScreen} />
            <Stack.Screen name="UserType" component={UserTypeScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Main" component={MainTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
