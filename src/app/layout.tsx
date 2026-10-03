import type { Metadata, Viewport } from "next";
import { Archivo, Chivo, IBM_Plex_Mono, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

// The agents track runs on its own pairing; both are declared here so the
// section theme can switch the whole chrome, header and footer included.
const chivo = Chivo({
  subsets: ["latin"],
  variable: "--font-chivo",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RAG Field Manual",
    template: "%s — RAG Field Manual",
  },
  description:
    "Two volumes: thirty RAG project specifications with the architecture they share, and thirty AI agent builds with the decisions behind them.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8ebe6" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1310" },
  ],
};

// Runs in <head> before first paint: restores the chosen theme and stamps the
// section from the path, so a hard load never flashes the wrong palette.
// <html> carries both attributes and suppressHydrationWarning covers the mutation.
const SECTIONS: [string, string][] = [
  ["/agents", "agents"],
  ["/operations", "ops"],
  ["/python", "python"],
  ["/stack", "stack"],
  ["/training", "training"],
  ["/ml", "training"],
  ["/glossary", "glossary"],
];

const bootScript = `(function(){try{
var d=document.documentElement;
var t=localStorage.getItem("rfm-theme");
if(t==="light"||t==="dark")d.setAttribute("data-theme",t);
var p=location.pathname,m=${JSON.stringify(SECTIONS)};
for(var i=0;i<m.length;i++){if(p===m[i][0]||p.indexOf(m[i][0]+"/")===0){d.setAttribute("data-section",m[i][1]);break;}}
}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${sourceSerif.variable} ${plexMono.variable} ${chivo.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
