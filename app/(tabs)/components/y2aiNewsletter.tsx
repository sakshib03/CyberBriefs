import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import Header from "@/app/(tabs)/components/header";

export default function DarkWebNews() {
  return (
    <View style={styles.container}>
      <Header/>
      <TouchableOpacity
        style={{ alignItems: "center", justifyContent: "center", top: 240, zIndex:5 }}
      >
        <Text style={{ color: "#23467eff", textAlign: "center" }}>
          dark web news
        </Text>
      </TouchableOpacity>
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
