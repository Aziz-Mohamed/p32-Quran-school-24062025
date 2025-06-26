import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface WiFiNetwork {
  id: string;
  name: string;
  ssid: string;
  password: string;
  isActive: boolean;
  connectedDevices: number;
  maxDevices: number;
  signalStrength: number;
  security: "WPA2" | "WPA3" | "Open";
  lastUpdated: string;
}

interface ConnectedDevice {
  id: string;
  name: string;
  macAddress: string;
  ipAddress: string;
  deviceType: "student" | "teacher" | "admin" | "guest";
  connectedAt: string;
  dataUsage: string;
}

const mockNetworks: WiFiNetwork[] = [
  {
    id: "1",
    name: "Quran School Main",
    ssid: "QuranSchool_Main",
    password: "••••••••••••",
    isActive: true,
    connectedDevices: 45,
    maxDevices: 100,
    signalStrength: 95,
    security: "WPA2",
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    name: "Student Network",
    ssid: "QuranSchool_Students",
    password: "••••••••••••",
    isActive: true,
    connectedDevices: 28,
    maxDevices: 50,
    signalStrength: 88,
    security: "WPA2",
    lastUpdated: "1 hour ago",
  },
  {
    id: "3",
    name: "Guest Network",
    ssid: "QuranSchool_Guest",
    password: "••••••••••••",
    isActive: false,
    connectedDevices: 0,
    maxDevices: 20,
    signalStrength: 75,
    security: "WPA3",
    lastUpdated: "3 days ago",
  },
];

const mockDevices: ConnectedDevice[] = [
  {
    id: "1",
    name: "Ahmed's iPhone",
    macAddress: "AA:BB:CC:DD:EE:FF",
    ipAddress: "192.168.1.101",
    deviceType: "student",
    connectedAt: "2 hours ago",
    dataUsage: "1.2 GB",
  },
  {
    id: "2",
    name: "Teacher Fatima's iPad",
    macAddress: "11:22:33:44:55:66",
    ipAddress: "192.168.1.102",
    deviceType: "teacher",
    connectedAt: "4 hours ago",
    dataUsage: "2.8 GB",
  },
  {
    id: "3",
    name: "Admin Laptop",
    macAddress: "AA:11:BB:22:CC:33",
    ipAddress: "192.168.1.103",
    deviceType: "admin",
    connectedAt: "6 hours ago",
    dataUsage: "5.1 GB",
  },
  {
    id: "4",
    name: "Guest Device",
    macAddress: "FF:EE:DD:CC:BB:AA",
    ipAddress: "192.168.1.104",
    deviceType: "guest",
    connectedAt: "30 minutes ago",
    dataUsage: "150 MB",
  },
];

const NetworkCard: React.FC<{
  network: WiFiNetwork;
  onToggle: (id: string) => void;
}> = ({ network, onToggle }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getSignalColor = () => {
    if (network.signalStrength >= 80) return colors.success;
    if (network.signalStrength >= 60) return colors.warning;
    return colors.error;
  };

  const getSecurityColor = () => {
    switch (network.security) {
      case "WPA3":
        return colors.success;
      case "WPA2":
        return colors.primary;
      case "Open":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getSignalIcon = () => {
    if (network.signalStrength >= 80) return "wifi";
    if (network.signalStrength >= 60) return "wifi-outline";
    return "cellular-outline";
  };

  return (
    <View
      style={[
        styles.networkCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.networkHeader}>
        <View style={styles.networkInfo}>
          <Text style={[styles.networkName, { color: colors.textPrimary }]}>
            {network.name}
          </Text>
          <Text style={[styles.networkSSID, { color: colors.textSecondary }]}>
            {network.ssid}
          </Text>
        </View>
        <Switch
          value={network.isActive}
          onValueChange={() => onToggle(network.id)}
          trackColor={{ false: colors.border, true: colors.primary + "40" }}
          thumbColor={network.isActive ? colors.primary : colors.textSecondary}
        />
      </View>

      <View style={styles.networkStats}>
        <View style={styles.statItem}>
          <Ionicons name={getSignalIcon()} size={16} color={getSignalColor()} />
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {network.signalStrength}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Signal
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color={colors.accent} />
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {network.connectedDevices}/{network.maxDevices}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Devices
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="shield-checkmark"
            size={16}
            color={getSecurityColor()}
          />
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {network.security}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Security
          </Text>
        </View>
      </View>

      <View style={styles.networkFooter}>
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
          Last updated: {network.lastUpdated}
        </Text>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="settings-outline" size={16} color={colors.primary} />
          <Text style={[styles.editText, { color: colors.primary }]}>
            Configure
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DeviceCard: React.FC<{ device: ConnectedDevice }> = ({ device }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getDeviceTypeColor = () => {
    switch (device.deviceType) {
      case "student":
        return colors.primary;
      case "teacher":
        return colors.secondary;
      case "admin":
        return colors.accent;
      case "guest":
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getDeviceIcon = () => {
    switch (device.deviceType) {
      case "student":
        return "school";
      case "teacher":
        return "person";
      case "admin":
        return "settings";
      case "guest":
        return "people";
      default:
        return "phone-portrait";
    }
  };

  return (
    <View
      style={[
        styles.deviceCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.deviceHeader}>
        <View style={styles.deviceInfo}>
          <View
            style={[
              styles.deviceIcon,
              { backgroundColor: getDeviceTypeColor() + "15" },
            ]}
          >
            <Ionicons
              name={getDeviceIcon() as any}
              size={16}
              color={getDeviceTypeColor()}
            />
          </View>
          <View style={styles.deviceDetails}>
            <Text style={[styles.deviceName, { color: colors.textPrimary }]}>
              {device.name}
            </Text>
            <Text style={[styles.deviceType, { color: colors.textSecondary }]}>
              {device.deviceType.charAt(0).toUpperCase() +
                device.deviceType.slice(1)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.deviceTypeBadge,
            { backgroundColor: getDeviceTypeColor() + "15" },
          ]}
        >
          <Text
            style={[styles.deviceTypeText, { color: getDeviceTypeColor() }]}
          >
            {device.deviceType.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.deviceDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            IP Address:
          </Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {device.ipAddress}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            MAC Address:
          </Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {device.macAddress}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Connected:
          </Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {device.connectedAt}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Data Usage:
          </Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {device.dataUsage}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function WiFiConfigScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [networks, setNetworks] = useState<WiFiNetwork[]>(mockNetworks);
  const [selectedTab, setSelectedTab] = useState<"networks" | "devices">(
    "networks"
  );

  const toggleNetwork = (id: string) => {
    setNetworks((prev) =>
      prev.map((network) =>
        network.id === id
          ? { ...network, isActive: !network.isActive }
          : network
      )
    );
  };

  const totalDevices = networks.reduce(
    (sum, network) => sum + network.connectedDevices,
    0
  );
  const activeNetworks = networks.filter((network) => network.isActive).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            WiFi Configuration
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage network settings and connected devices
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            /* Add new network */
          }}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Network</Text>
        </TouchableOpacity>
      </View>

      {/* Overview Stats */}
      <View style={styles.overviewSection}>
        <View
          style={[
            styles.overviewCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewValue, { color: colors.textPrimary }]}>
              {networks.length}
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Total Networks
            </Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewValue, { color: colors.success }]}>
              {activeNetworks}
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Active Networks
            </Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewValue, { color: colors.primary }]}>
              {totalDevices}
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Connected Devices
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === "networks" && {
              backgroundColor: colors.primary + "15",
            },
            { borderColor: colors.border },
          ]}
          onPress={() => setSelectedTab("networks")}
        >
          <Ionicons
            name="wifi"
            size={20}
            color={
              selectedTab === "networks" ? colors.primary : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  selectedTab === "networks"
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            Networks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === "devices" && {
              backgroundColor: colors.primary + "15",
            },
            { borderColor: colors.border },
          ]}
          onPress={() => setSelectedTab("devices")}
        >
          <Ionicons
            name="phone-portrait"
            size={20}
            color={
              selectedTab === "devices" ? colors.primary : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  selectedTab === "devices"
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            Connected Devices
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === "networks" ? (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              WiFi Networks
            </Text>
            {networks.map((network) => (
              <NetworkCard
                key={network.id}
                network={network}
                onToggle={toggleNetwork}
              />
            ))}
          </View>
        ) : (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Connected Devices
            </Text>
            {mockDevices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(24),
  },
  title: {
    fontSize: normalize(28),
    fontWeight: "700",
    marginBottom: normalize(4),
  },
  subtitle: {
    fontSize: normalize(16),
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderRadius: normalize(12),
    gap: normalize(8),
  },
  addButtonText: {
    color: "#fff",
    fontSize: normalize(14),
    fontWeight: "600",
  },
  overviewSection: {
    marginBottom: normalize(24),
  },
  overviewCard: {
    flexDirection: "row",
    padding: normalize(20),
    borderRadius: normalize(16),
    borderWidth: normalize(1),
  },
  overviewItem: {
    flex: 1,
    alignItems: "center",
  },
  overviewValue: {
    fontSize: normalize(24),
    fontWeight: "700",
    marginBottom: normalize(4),
  },
  overviewLabel: {
    fontSize: normalize(12),
    fontWeight: "500",
  },
  overviewDivider: {
    width: normalize(1),
    backgroundColor: "#e0e0e0",
    marginHorizontal: normalize(16),
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: normalize(24),
    gap: normalize(12),
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(12),
    borderWidth: normalize(1),
    gap: normalize(8),
  },
  tabText: {
    fontSize: normalize(14),
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: "600",
    marginBottom: normalize(16),
  },
  networkCard: {
      padding: normalize(20),
    borderRadius: normalize(16),
    borderWidth: normalize(1),
    marginBottom: normalize(12),
  },
  networkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(16),
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    fontSize: normalize(18),
    fontWeight: "600",
    marginBottom: normalize(4),
  },
  networkSSID: {
    fontSize: normalize(14),
  },
  networkStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: normalize(16),
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: normalize(16),
    fontWeight: "600",
    marginTop: normalize(4),
    marginBottom: normalize(2),
  },
  statLabel: {
    fontSize: normalize(12),
  },
  networkFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastUpdated: {
    fontSize: normalize(12),
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(4),
  },
  editText: {
    fontSize: normalize(12),
    fontWeight: "600",
  },
  deviceCard: {
    padding: normalize(16),
    borderRadius: normalize(12),
    borderWidth: normalize(1),
    marginBottom: normalize(8),
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deviceIcon: {
      width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    justifyContent: "center",
    alignItems: "center",
    marginRight: normalize(12),
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: normalize(16),
    fontWeight: "600",
    marginBottom: normalize(2),
  },
  deviceType: {
    fontSize: normalize(14),
  },
  deviceTypeBadge: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(8),
  },
  deviceTypeText: {
    fontSize: normalize(10),
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: normalize(4),
  },
  detailLabel: {
    fontSize: normalize(12),
  },
  detailValue: {
    fontSize: normalize(12),
    fontWeight: "500",
  },
});
