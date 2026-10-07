import type { Metadata } from "next";

/** Sign-in and account screens are private: keep the whole segment out of search. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function InstallerLayout({
  children,
}: LayoutProps<"/installer">) {
  return <div className="bg-surface">{children}</div>;
}
