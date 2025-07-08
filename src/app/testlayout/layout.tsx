"use client";
export default function TestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 40, color: 'green', textAlign: 'center', margin: '40px' }}>
      TEST LAYOUT WORKS
      {children}
    </div>
  );
} 