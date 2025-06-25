import React from "react";

export default function ForgotPasswordScreen() {
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
      {/* Forgot Password Form */}
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
        <div style={{ marginBottom: 16 }}>[Email Input]</div>
        <div style={{ marginBottom: 24 }}>[Reset Password Button]</div>
        <div style={{ textAlign: "right" }}>[Back to Login Link]</div>
      </div>
    </div>
  );
}
