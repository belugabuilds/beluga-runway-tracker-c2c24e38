import "./globals.css";
export const metadata = { title: "Runway Tracker", description: "A personal dashboard for solo founders to track burn rate, monthly survival metrics, and morale checkpoints during the lean years of building a business." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
