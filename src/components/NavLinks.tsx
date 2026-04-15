'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/store', label: 'Medicine Store' },
  { href: '/vault', label: 'Health Vault' },
  { href: '/ai-consult', label: 'AI Consult' },
  { href: '/about', label: 'About' },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex space-x-8 py-3 text-sm font-semibold uppercase tracking-wider overflow-x-auto whitespace-nowrap">
      {navItems.map(item => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={`hover:text-saffron transition-colors duration-200 ${
              pathname === item.href ? 'text-saffron' : ''
            }`}
            prefetch={true}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
