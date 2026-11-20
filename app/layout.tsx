import './globals.css';
import Link from 'next/link';
export const metadata={title:'MineCart — Minecraft, modded.',description:'Discover, publish and update Minecraft mods with MineCart.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><header className="nav"><Link className="brand" href="/"><b>M</b> MineCart</Link><nav><a href="/#browse">Discover</a><a href="/#categories">Categories</a><Link href="/upload">Publish a mod</Link></nav><div className="navright"><Link href="/login">Log in</Link><Link className="button" href="/login?signup=1">Join MineCart</Link></div></header>{children}<footer>MineCart · Built for the Minecraft modding community · © 2026</footer></body></html>}
