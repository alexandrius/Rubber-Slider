import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { getStatusBarHeight } from "react-native-iphone-x-helper";

export default function Header() {
   return (
      <View style={styles.root}>
         <Image source={require("./assets/logo/logo.png")} />
         <Image source={require("./assets/settings/settings.png")} />
      </View>
   );
}
const styles = StyleSheet.create({
   root: {
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingBottom: 24,
      paddingTop: 24 + getStatusBarHeight(),
   },
});
