import { colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";

export default function AppButton({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <LinearGradient
      style={style ? [styles.button, style] : styles.button}
      colors={[colors.primary, colors.secondary]}
      locations={[0, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Pressable onPress={onPress}>{children}</Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});
