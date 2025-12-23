import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import Header from "@/app/(tabs)/components/header";

export default function Channels() {
  return (
    <View style={styles.container}>
      <Header/>
      <View
        style={{  top:60, paddingBottom:70, zIndex:5 }}
      >
        <Text style={{ color: "#f93232ff", fontWeight:500, fontSize:16, left:12}}>
          All Channels
        </Text>
      </View>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
