import React from "react";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* TODO: Teacher navigation/sidebar goes here */}
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}
