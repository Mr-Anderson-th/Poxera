// Poxera login — email + Google (demo: ไม่ยิง API จริง)
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera } from "@/features/poxera-store";

export default function AuthScreen() {
  const login = usePoxera((s) => s.login);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = () => {
    if (!valid) {
      setErr("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }
    setErr("");
    login(email.trim(), name.trim() || undefined);
    router.replace("/onboarding");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.brand}>POXERA</Text>
        <Text style={styles.tagline}>Poker nights, properly scored.</Text>

        <Text style={styles.label}>อีเมล</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (err) setErr("");
          }}
          placeholder="you@example.com"
          placeholderTextColor={C.tx3}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        {err ? <Text style={styles.error}>{err}</Text> : null}

        <Text style={styles.label}>ชื่อที่ใช้แสดง (ไม่บังคับ)</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="เช่น นน"
          placeholderTextColor={C.tx3}
          textContentType="name"
        />

        <Pressable
          onPress={submit}
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="เข้าสู่ระบบด้วยอีเมล"
        >
          <Text style={styles.primaryText}>เข้าสู่ระบบด้วยอีเมล</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>หรือ</Text>
          <View style={styles.divider} />
        </View>

        <Pressable
          onPress={() => {
            login("player@gmail.com", "นักโป๊กเกอร์");
            router.replace("/onboarding");
          }}
          style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="เข้าสู่ระบบด้วยบัญชี Google"
        >
          <Text style={styles.googleText}>เข้าสู่ระบบด้วย Google</Text>
        </Pressable>

        <Text style={styles.footnote}>
          ตัวอย่างสาธิต — การล็อกอินยังไม่เชื่อมต่อบัญชีจริง
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.linen },
  body: { flex: 1, paddingHorizontal: S.xl, justifyContent: "center" },
  brand: {
    ...f("extrabold"),
    fontSize: 34,
    letterSpacing: 4,
    color: C.ink,
    textAlign: "center",
  },
  tagline: {
    ...f("medium"),
    fontSize: 13,
    color: C.tx2,
    textAlign: "center",
    marginTop: S.sm,
    marginBottom: S.xl * 2,
  },
  label: { ...f("semibold"), fontSize: 13, color: C.ink, marginBottom: S.sm },
  input: {
    backgroundColor: C.paper,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: S.md,
    paddingVertical: 12,
    fontSize: 15,
    color: C.ink,
    marginBottom: S.md,
    minHeight: 48,
  },
  error: { ...f("medium"), fontSize: 12, color: C.rd, marginTop: -S.sm, marginBottom: S.sm },
  primaryBtn: {
    backgroundColor: C.org,
    borderRadius: R.md,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: S.md,
    minHeight: 48,
    justifyContent: "center",
  },
  primaryText: { ...f("bold"), fontSize: 15, color: C.white },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: S.lg },
  divider: { flex: 1, height: 1, backgroundColor: C.line },
  dividerText: { ...f("medium"), fontSize: 12, color: C.tx3, marginHorizontal: S.md },
  googleBtn: {
    backgroundColor: C.paper,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line2,
    alignItems: "center",
    paddingVertical: 14,
    minHeight: 48,
    justifyContent: "center",
  },
  googleText: { ...f("bold"), fontSize: 15, color: C.ink },
  footnote: {
    ...f("regular"),
    fontSize: 11,
    color: C.tx3,
    textAlign: "center",
    marginTop: S.xl,
  },
});
