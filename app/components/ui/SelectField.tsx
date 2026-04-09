import { colors } from "@/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type SelectFieldProps = {
  label: string;
  options: string[];
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  onValueChange?: (value: string) => void;
};

export default function SelectField({
  label,
  options,
  placeholder = "Select an option",
  style,
  onValueChange,
}: SelectFieldProps) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const select = (option: string) => {
    setSelected(option);
    onValueChange?.(option);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          style,
          pressed && styles.triggerPressed,
        ]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${label}. ${selected || placeholder}`}
      >
        <Text
          style={[styles.triggerText, !selected && styles.triggerPlaceholder]}
          numberOfLines={1}
        >
          {selected || placeholder}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.gray}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setOpen(false)}
            accessibilityLabel="Dismiss"
          />
          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 20) + 12 },
            ]}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.sheetScroll}
            >
              {options.map((option, index) => {
                const isSelected = option === selected;
                return (
                  <Pressable
                    key={`${option}-${index}`}
                    style={({ pressed }) => [
                      styles.optionRow,
                      isSelected && styles.optionRowSelected,
                      pressed && styles.optionRowPressed,
                    ]}
                    onPress={() => select(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
  },
  triggerPressed: {
    opacity: 0.85,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    color: "white",
  },
  triggerPlaceholder: {
    color: colors.gray,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    backgroundColor: "#14121c",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingTop: 8,
    paddingHorizontal: 8,
    maxHeight: "72%",
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  sheetScroll: {
    maxHeight: 360,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  optionRowSelected: {
    backgroundColor: "rgba(242, 93, 46, 0.12)",
  },
  optionRowPressed: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  optionText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  optionTextSelected: {
    fontWeight: "600",
    color: "white",
  },
});
