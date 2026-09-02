import { Rss, MapPin, Play, History, User } from "lucide-react-native";
import { Tabs } from "expo-router";
import { C } from "@/theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.org,
        tabBarInactiveTintColor: "#B3B3BA",
        tabBarStyle: {
          backgroundColor: C.paper,
          borderTopColor: C.line,
          height: 84,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "800",
          letterSpacing: 0.8,
          textTransform: "uppercase",
        },
        sceneStyle: { backgroundColor: C.linen },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Feed",
          tabBarIcon: ({ color }) => <Rss size={21} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: "Clubs",
          tabBarIcon: ({ color }) => <MapPin size={21} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          title: "Play",
          tabBarIcon: ({ color }) => <Play size={24} color={color} strokeWidth={2} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <History size={21} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: "You",
          tabBarIcon: ({ color }) => <User size={21} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
