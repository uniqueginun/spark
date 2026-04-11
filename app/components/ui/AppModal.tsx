import React from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    View,
    type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type AppModalProps = {
  modalVisible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  position?: "center" | "top" | "bottom";
};

const AppModal = ({
  modalVisible,
  onRequestClose,
  children,
  position = "top",
}: AppModalProps) => {
  const insets = useSafeAreaInsets();

  const animationType = position === "bottom" ? "slide" : "fade";

  const overlayStyle: ViewStyle[] = [styles.overlay];
  if (position === "center") {
    overlayStyle.push(styles.overlayCenter);
  } else if (position === "top") {
    overlayStyle.push(styles.overlayTop, {
      paddingTop: Math.max(insets.top, 8),
    });
  } else {
    overlayStyle.push(styles.overlayBottom, styles.overlayFullBleed);
  }

  const sheetStyle: ViewStyle[] = [styles.modalView];
  if (position === "bottom") {
    sheetStyle.push({
      paddingBottom: Math.max(insets.bottom, 20),
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      marginBottom: 0,
      maxWidth: "100%",
      alignSelf: "stretch",
    });
  }

  return (
    <Modal
      animationType={animationType}
      transparent
      visible={modalVisible}
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onRequestClose}
          accessibilityRole="button"
          accessibilityLabel="Close dialog"
        />
        <View style={overlayStyle} pointerEvents="box-none">
          <View style={sheetStyle}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 20,
  },
  overlayCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTop: {
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  overlayBottom: {
    justifyContent: "flex-end",
    alignItems: "stretch",
  },
  overlayFullBleed: {
    paddingHorizontal: 0,
  },
  modalView: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
});

export default AppModal;
