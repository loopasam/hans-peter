import "./styles.css";

export const metadata = {
  title: "Hans Peter",
  description: "A simple German speaking tutor.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
