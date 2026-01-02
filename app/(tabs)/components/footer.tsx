import { Feather } from "@expo/vector-icons";
import { View, StyleSheet, Text,Linking, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { API_BASE } from "../utils/config";
import { openURL } from "expo-linking";

export default function Footer() {
    const [links, setLinks]=useState(null);

    useEffect(()=>{
        fetch(`${API_BASE}/social-links`)
        .then((res)=> res.json())
        .then((data)=>setLinks(data))
        .catch((err)=> console.log(err));
    },[]);

    const openLink=(url)=>{
        if(!url) return;
        Linking.openURL(url);
    };

  return (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>
        © 2026 cyberbriefs. All rights reserved.
      </Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={()=> openLink(links?.facebook)}>
          <Feather name="facebook" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={()=> openLink(links?.youtube)}>
          <Feather name="youtube" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={()=> openLink(links?.linkedin)}>
          <Feather name="linkedin" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: "#1a2553", 
    marginTop: 20,
    marginBottom:80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  footerText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  iconContainer: {
    flexDirection: "row",
  },
  iconButton: {
    backgroundColor: "#2a3a7b", 
    padding: 10,
    borderRadius: 50,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});
