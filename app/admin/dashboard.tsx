import { View } from "react-native";
import { ThemedText } from "../../components/ThemedText";

export default function AdminDashboard() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ThemedText>Admin Dashboard</ThemedText>
    </View>
  );
}
