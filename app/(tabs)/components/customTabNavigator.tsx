import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";

export default function CustomTabNavigator() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Home",
      icon: "home",
      route: "/(tabs)",
      active: pathname === "/(tabs)",
    },
    {
      name: "Channels",
      icon: "tv",
      route: "/(tabs)/components/channels",
      active: pathname.includes("/channels"),
    },
    {
      name: "Dr. Vikram Sethi Blogs",
      icon: "book-open",
      route: "/(tabs)/components/allBlogs",
      active: pathname.includes("/allBlogs"),
    },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={[styles.tabItem, tab.active && styles.activeTab]}
          onPress={() => router.push(tab.route)}
        >
          <Feather
            name={tab.icon}
            size={24}
            color={tab.active ? "#23467eff" : "gray"}
          />
          <Text
            style={[styles.tabLabel, tab.active && styles.activeTabLabel]}
            numberOfLines={1}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    height: 70,
    paddingBottom: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: "#23467eff",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: "gray",
    textAlign: "center",
  },
  activeTabLabel: {
    color: "#23467eff",
    fontWeight: "600",
  },
});