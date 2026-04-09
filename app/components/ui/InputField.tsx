import { colors } from "@/constants/colors";
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";

export type InputFieldProps = {
  label: string;
} & TextInputProps;

export default function InputField({
  label,
  style,
  ...textInputProps
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, style]} {...textInputProps} />
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
    color: colors.gray,
  },
  input: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray,
    color: colors.gray,
    backgroundColor: "rgba(255,255,255,0.12)",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "400",
    textAlign: "left",
    textAlignVertical: "top",
  },
  error: {
    color: "red",
  },
});
