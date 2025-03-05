import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ title: 'Home' }} />
      <Stack.Screen name="ChatBot" options={{ title: 'BeaconSmart Assistant',headerShown: true,
      headerBackTitle: 'Back' }} />
      
    </Stack>
  );
}