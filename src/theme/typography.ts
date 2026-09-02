import {
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_600SemiBold,
  NotoSansThai_700Bold,
  NotoSansThai_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/noto-sans-thai";

export const FONT_FAMILIES = {
  regular: "NotoSansThai_400Regular",
  medium: "NotoSansThai_500Medium",
  semibold: "NotoSansThai_600SemiBold",
  bold: "NotoSansThai_700Bold",
  extrabold: "NotoSansThai_800ExtraBold",
} as const;

export type FontKey = keyof typeof FONT_FAMILIES;

/** Hook สำหรับ root layout — คืน true เมื่อฟอนต์โหลดครบ */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    NotoSansThai_400Regular,
    NotoSansThai_500Medium,
    NotoSansThai_600SemiBold,
    NotoSansThai_700Bold,
    NotoSansThai_800ExtraBold,
  });
  return loaded;
}

/** Style helper: font family + weight ในครั้งเดียว */
export function f(weight: FontKey) {
  return { fontFamily: FONT_FAMILIES[weight] };
}
