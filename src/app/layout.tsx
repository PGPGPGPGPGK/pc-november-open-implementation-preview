import type {Metadata} from 'next';
import Link from 'next/link';
import {Barlow_Condensed,DM_Sans,JetBrains_Mono} from 'next/font/google';
import './globals.css';
import './light-palette.css';
import './preview.css';

const display=Barlow_Condensed({variable:'--font-barlow-condensed',subsets:['latin'],weight:['600','700','800','900']});
const sans=DM_Sans({variable:'--font-dm-sans',subsets:['latin'],weight:['400','500','600','700']});
const mono=JetBrains_Mono({variable:'--font-jetbrains-mono',subsets:['latin'],weight:['400','600']});
export const metadata:Metadata={title:'November Open — implementation preview',description:'Preview only: synthetic tournament data. No payments, registrations or communications.',robots:{index:false,follow:false}};
const csp="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'none'; frame-src 'none'; object-src 'none'; base-uri 'self'";
export default function Layout({children}:{children:React.ReactNode}){
 return <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}><head><meta httpEquiv="Content-Security-Policy" content={csp}/></head><body>
 <span hidden data-preview-palette="light"/>
 <div id="preview-only" className="preview-banner"><strong>DESIGN PREVIEW ONLY</strong> · Sample tournament data. No registrations, payments or messages. Please use fictional details.</div>
 <nav className="preview-nav" aria-label="Preview navigation"><Link href="/">Announcement</Link><Link href="/events/november-2026/">November Open registration</Link><Link href="/terms/">Terms</Link><Link href="/privacy/">Privacy</Link></nav>
 <main>{children}</main>
 <footer className="preview-footer">Independent personal preview · not the live Pickleball Central website · no data leaves this preview.</footer>
 </body></html>;
}
