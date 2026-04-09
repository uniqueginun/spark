import { colors } from "@/constants/colors";
import { View } from "react-native";

type Props = {
  step: 1 | 2;
  total?: number;
};

export default function StepIndicator({ step, total = 2 }: Props) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i + 1 === step;
        return (
          <View
            key={i}
            style={{
              height: 4,
              flex: 1,
              borderRadius: 999,
              backgroundColor: isActive
                ? colors.primary
                : "rgba(255,255,255,0.25)",
            }}
          />
        );
      })}
    </View>
  );
}
