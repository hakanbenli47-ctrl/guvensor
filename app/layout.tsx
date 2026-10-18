import type { Metadata,Viewport } from "next";
import "./globals.css";
export const metadata:Metadata={
 title:"YKS Akademi 2027 | Kişisel Eğitim Koçu",
 description:"Akdeniz Üniversitesi Psikoloji hedefi için 196 konulu TYT ve AYT hazırlık platformu; akıllı tekrar, deneme ve ilerleme analizi.",
 applicationName:"YKS Akademi",
 icons:{icon:"/icon.svg"},
 manifest:"/manifest.webmanifest",
};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#141f35"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr"><body>{children}</body></html>}
