import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { router, usePathname } from "expo-router";

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const pathname = usePathname();

  const getActiveItem = () => {
    if (pathname === "/(tabs)") return "home";
    if (pathname.includes("/recentNews")) return "recentNews";
    if (pathname.includes("/channels")) return "channels";
    if (pathname.includes("/newsLetter")) return "newsLetter";
    if (pathname.includes("/allBlogs")) return "allBlogs";
    
    return "home";
  };

  const activeItem = getActiveItem();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ padding: 2 }}>
          {/* <TouchableOpacity onPress={() => setOpenMenu(!openMenu)}>
            <Feather name="menu" size={26} color="#242424" />
          </TouchableOpacity> */}
          <Image 
          source={require("../../../assets/images/logo.png")}
          style={{padding:10, width:35, height:40}}
          />
        </View>
        <View style={styles.subHeader}>
          <Image
            source={require("../../../assets/images/logo2.png")}
            style={styles.logo}
          />
        </View>
      </View>

      {/* MENU */}
      {openMenu && (
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.closeIcon}
            onPress={() => setOpenMenu(false)}
          >
            <Feather name="x" size={28} color="#f93232ff" />
          </TouchableOpacity>

          {/* HOME */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              activeItem === "home" && styles.activeMenuItem,
            ]}
            onPress={() => {
              router.push("/(tabs)");
              setOpenMenu(false);
            }}
          >
            <Feather
              name="home"
              size={20}
              color={activeItem === "home" ? "#f93232ff" : "#242424"}
            />
            <Text
              style={[
                styles.menuText,
                activeItem === "home" && styles.activeMenuText,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* CHANNELS */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              activeItem === "channels" && styles.activeMenuItem,
            ]}
            onPress={() => {
              router.push("/(tabs)/components/Channels/channels");
              setOpenMenu(false);
            }}
          >
            <Feather
              name="tv"
              size={20}
              color={activeItem === "channels" ? "#f93232ff" : "#242424"}
            />
            <Text
              style={[
                styles.menuText,
                activeItem === "channels" && styles.activeMenuText,
              ]}
            >
              Channels
            </Text>
          </TouchableOpacity>
          <View style={styles.divider} />

       
          <TouchableOpacity
            style={[
              styles.menuItem,
              activeItem === "newsLetter" && styles.activeMenuItem,
            ]}
            onPress={() => {
              router.push("/(tabs)/components/NewsLetter/newsLetter");
              setOpenMenu(false);
            }}
          >
            <Feather
              name="shield"
              size={20}
              color={activeItem === "newsLetter" ? "#f93232ff" : "#242424"}
            />
            <Text
              style={[
                styles.menuText,
                activeItem === "newsLetter" && styles.activeMenuText,
              ]}
            >
              Y2AI Newsletter
            </Text>
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* BLOGS */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              activeItem === "allBlogs" && styles.activeMenuItem,
            ]}
            onPress={() => {
              router.push("/(tabs)/components/Blogs/allBlogs");
              setOpenMenu(false);
            }}
          >
            <Feather
              name="book-open"
              size={20}
              color={activeItem === "allBlogs" ? "#f93232ff" : "#242424"}
            />
            <Text
              style={[
                styles.menuText,
                activeItem === "allBlogs" && styles.activeMenuText,
              ]}
            >
              Dr. Vikram Sethi Blogs
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#070707ff",
    position: "relative",
    zIndex:1000,
  },

  header: {
    top: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#ffffff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 5,
  },

  subHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 120,
    height: 50,
    resizeMode: "contain",
  },

  menuContainer: {
    position: "absolute",
    top: 40,
    paddingTop: 100,
    paddingLeft:30,
    width: "100%",
    height: 1000,
    backgroundColor: "#ffffff",
    borderRadius: 4,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 10,
  },

  closeIcon: {
    position: "absolute",
    top: 30,
    right: 20,
    padding: 4,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  menuText: {
    marginLeft: 12,
    fontSize: 20,
    color: "#242424",
    fontWeight: "500",
  },

  activeMenuText: {
    color: "#f93232ff",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginHorizontal: 12,
  },
});
