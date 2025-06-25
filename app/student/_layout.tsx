import React from "react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* TODO: Student navigation/sidebar goes here */}
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}
