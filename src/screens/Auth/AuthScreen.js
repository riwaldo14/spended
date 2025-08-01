import { Button, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { TextInput } from "react-native";

export default function AuthScreen({ route, navigation }) {
  const [name, setName] = useState("");

  return (
    <View>
      <Text>AuthScreen</Text>
      <TextInput
        onChangeText={(text) => setName(text)}
        value={name}
        placeholder="Enter your name"
      />
      <Button title="Go to Home" onPress={() => navigation.navigate("Home")} />
    </View>
  );
}

const styles = StyleSheet.create({});
