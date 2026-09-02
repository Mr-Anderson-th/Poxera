// Poxera — mock auth gate at the app root.
// ผู้ใช้ยังไม่ login → ไปหน้า /auth; ยังไม่ onboard → /onboarding; ไม่งั้น → แท็บหลัก
import { Redirect, Slot, usePathname } from "expo-router";
import { usePoxera } from "@/features/poxera-store";
import { ActivityIndicator, View } from "react-native";
import { C } from "@/theme/tokens";

const PROTECTED = new Set(["/", "/clubs", "/play", "/history", "/you"]);

export default function PoxeraGate() {
  const pathname = usePathname();
  const { loggedIn, onboarded } = usePoxera();

  if (!loggedIn) {
    if (pathname === "/auth") return <Slot />;
    return <Redirect href="/auth" />;
  }
  if (!onboarded) {
    if (pathname === "/onboarding") return <Slot />;
    return <Redirect href="/onboarding" />;
  }
  if (PROTECTED.has(pathname)) return <Slot />;
  return <Redirect href="/" />;
}
