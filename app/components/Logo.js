import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";

const Logo = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>HandOff</Text>
      <FontAwesome5 name="handshake" size={40} color="#FEBE10" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E5077",
    marginRight: 10,
  },
});

export default Logo;
