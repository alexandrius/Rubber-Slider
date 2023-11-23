import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { getTopInset } from "rn-iphone-helper";

export default function Header({ onSettingsPress }) {
   return (
      <View style={styles.root}>
         <Image source={require("./assets/logo/logo.png")} />
         <TouchableOpacity onPress={onSettingsPress}>
            <Image source={require("./assets/settings/settings.png")} />
         </TouchableOpacity>
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
      paddingTop: 24 + getTopInset(),
   },
});
