import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

export type InputFieldProps = {
  label: string;
} & Omit<TextInputProps, "value" | "defaultValue" | "onChangeText">;

export default function InputField({
  label,
  style,
  ...textInputProps
}: InputFieldProps) {
  const [value, setValue] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        {...textInputProps}
        value={value}
        onChangeText={setValue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  input: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
  },
  error: {
    color: "red",
  },
});
