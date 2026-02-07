import React from "react";

export default function OnboardingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAFAF7",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>[Logo]</div>
      {/* Welcome Message */}
      <div style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>
        [Welcome to Quran School App]
      </div>
      {/* Onboarding Steps */}
      <div
        style={{
          width: 320,
          maxWidth: "90%",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 16 }}>[Step 1]</div>
        <div style={{ marginBottom: 16 }}>[Step 2]</div>
        <div style={{ marginBottom: 16 }}>[Step 3]</div>
        <div style={{ marginTop: 24 }}>[Get Started Button]</div>
      </div>
    </div>
  );
}
