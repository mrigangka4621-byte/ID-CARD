/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { 
  Sun, 
  Briefcase, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Globe, 
  Shield, 
  ShieldCheck, 
  Camera, 
  Upload, 
  Download, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  Plus, 
  Trash2,
  CheckCircle2, 
  Layers, 
  CreditCard,
  Maximize2,
  Minus,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Pencil,
  Info
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Custom wrapper for html2canvas to safely parse Tailwind v4 OKLCH colors
const html2canvasWithOklchSupport = async (element: HTMLElement, options?: any) => {
  const originalGetComputedStyle = window.getComputedStyle;

  // Converts parsed OKLCH color strings to standard RGBA format
  const parsePercentOrFloat = (str: string, maxVal = 1): number => {
    if (str.endsWith('%')) {
      return (parseFloat(str) / 100) * maxVal;
    }
    return parseFloat(str);
  };

  const parseOklchAndConvertToRgb = (val: string): string => {
    if (!val || typeof val !== 'string') return val;

    // Matches standard browser representations of oklch: oklch(L C H) or oklch(L C H / alpha)
    const oklchRegex = /oklch\(\s*([^\s,\)]+)\s+([^\s,\)]+)\s+([^\s,\/\)]+)(?:\s*\/\s*([^\s\)]+))?\s*\)/g;

    return val.replace(oklchRegex, (_match, lStr, cStr, hStr, aStr) => {
      const l = parsePercentOrFloat(lStr);
      const c = parseFloat(cStr);
      const h = parseFloat(hStr);
      const a = aStr ? parsePercentOrFloat(aStr) : 1;

      // OKLCH to OKLAB math conversion
      const L = l;
      const a_ = c * Math.cos((h * Math.PI) / 180);
      const b_ = c * Math.sin((h * Math.PI) / 180);

      // OKLAB to LMS
      const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
      const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
      const s_ = L - 0.0894841775 * a_ - 1.2914855414 * b_;

      const l3 = l_ * l_ * l_;
      const m3 = m_ * m_ * m_;
      const s3 = s_ * s_ * s_;

      // LMS to Linear sRGB
      let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
      let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
      let b = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

      // Linear sRGB to standard sRGB gamma correction
      const format = (v: number) => {
        v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
        return Math.max(0, Math.min(255, Math.round(v * 255)));
      };

      return `rgba(${format(r)}, ${format(g)}, ${format(b)}, ${a})`;
    });
  };

  // Intercept getComputedStyle to override getPropertyValue and return converted values
  window.getComputedStyle = (el: Element, pseudoElt?: string | null): CSSStyleDeclaration => {
    const style = originalGetComputedStyle(el, pseudoElt);

    const proxiedStyle = new Proxy(style, {
      get(target, prop, receiver) {
        if (prop === 'getPropertyValue') {
          return (propertyName: string) => {
            const val = target.getPropertyValue(propertyName);
            return parseOklchAndConvertToRgb(val);
          };
        }
        const val = Reflect.get(target, prop, receiver);
        if (typeof val === 'string') {
          return parseOklchAndConvertToRgb(val);
        }
        return val;
      }
    });

    return proxiedStyle as any as CSSStyleDeclaration;
  };

  try {
    const result = await html2canvas(element, options);
    window.getComputedStyle = originalGetComputedStyle;
    return result;
  } catch (error) {
    window.getComputedStyle = originalGetComputedStyle;
    throw error;
  }
};

// --- SVGs & Assets Definition ---

// Beautiful SVG Logo Presets (Vector graphics)
const LOGO_PRESETS = [
  {
    id: 'sun_spark',
    name: 'Helios Spark',
    element: (className = "w-10 h-10") => (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="18" className="fill-amber-500/20" />
        <circle cx="50" cy="50" r="11" className="fill-amber-500" />
        <g stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-amber-500">
          <line x1="50" y1="10" x2="50" y2="24" />
          <line x1="50" y1="76" x2="50" y2="90" />
          <line x1="10" y1="50" x2="24" y2="50" />
          <line x1="76" y1="50" x2="90" y2="50" />
          <line x1="22" y1="22" x2="32" y2="32" />
          <line x1="68" y1="68" x2="78" y2="78" />
          <line x1="22" y1="68" x2="32" y2="58" />
          <line x1="68" y1="22" x2="58" y2="32" />
        </g>
      </svg>
    )
  },
  {
    id: 'solar_grid',
    name: 'Solar Grid',
    element: (className = "w-10 h-10") => (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,15 85,35 85,65 50,85 15,65 15,35" className="stroke-teal-500" strokeWidth="5" fill="none" />
        <g className="stroke-teal-500/80" strokeWidth="3">
          <line x1="50" y1="15" x2="50" y2="85" />
          <line x1="15" y1="35" x2="85" y2="35" />
          <line x1="15" y1="65" x2="85" y2="65" />
          <line x1="15" y1="35" x2="50" y2="85" />
          <line x1="85" y1="35" x2="50" y2="85" />
          <line x1="15" y1="65" x2="50" y2="15" />
          <line x1="85" y1="65" x2="50" y2="15" />
        </g>
      </svg>
    )
  },
  {
    id: 'eco_leaf',
    name: 'EcoLeaf Solar',
    element: (className = "w-10 h-10") => (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 15 C65 15, 80 25, 80 50 C80 75, 60 85, 50 85 C40 85, 20 75, 20 50 C20 25, 35 15, 50 15 Z" className="fill-emerald-500/10 stroke-emerald-500" strokeWidth="5" />
        <path d="M50 85 C50 85, 50 45, 80 25" className="stroke-emerald-500" strokeWidth="4" strokeLinecap="round" />
        <path d="M50 50 Q65 45 70 35 M50 65 Q65 60 75 52 M50 55 Q35 50 25 42" className="stroke-emerald-500/80" strokeWidth="3" />
        <circle cx="50" cy="20" r="4" className="fill-amber-500" />
        <circle cx="65" cy="25" r="3" className="fill-amber-500" />
        <circle cx="35" cy="25" r="3" className="fill-amber-500" />
      </svg>
    )
  },
  {
    id: 'volt_wave',
    name: 'Volt Wave',
    element: (className = "w-10 h-10") => (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="35" className="stroke-sky-500" strokeWidth="4" strokeDasharray="4 2" />
        <circle cx="50" cy="50" r="28" className="fill-sky-500/10 stroke-sky-500" strokeWidth="2" />
        <path d="M52 15 L35 52 L50 52 L44 85 L65 44 L48 44 Z" className="fill-amber-500 stroke-amber-600" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    )
  }
];

// Beautiful Base64 Encoded Preset Avatar SVGs
const AVATAR_PRESETS = [
  {
    id: 'male_consultant',
    name: 'Marcus (Gold)',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%231e293b" />
          <stop offset="100%" stop-color="%23f59e0b" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(%23g1)" />
      <circle cx="50" cy="35" r="17" fill="%23ffffff" fill-opacity="0.95" />
      <path d="M50 32 L40 45 L50 48 L60 45 Z" fill="%23cbd5e1" />
      <path d="M50 55 C28 55, 18 68, 18 85 L82 85 C82 68, 72 55, 50 55 Z" fill="%23ffffff" fill-opacity="0.95" />
      <rect x="47" y="55" width="6" height="12" fill="%233b82f6" />
      <polygon points="50,67 43,58 57,58" fill="%231e293b" />
    </svg>`
  },
  {
    id: 'female_advisor',
    name: 'Elena (Green)',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23064e3b" />
          <stop offset="100%" stop-color="%2310b981" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(%23g2)" />
      <!-- Stylish hair backdrop -->
      <path d="M30 38 C25 20, 75 20, 70 38 C75 50, 25 50, 30 38 Z" fill="%23111827" />
      <circle cx="50" cy="35" r="16" fill="%23ffffff" fill-opacity="0.95" />
      <path d="M32 32 Q50 18 68 32 C68 32, 60 25, 50 28 C40 25, 32 32, 32 32 Z" fill="%23111827" />
      <path d="M50 55 C30 55, 20 68, 20 85 L80 85 C80 68, 70 55, 50 55 Z" fill="%23ffffff" fill-opacity="0.95" />
      <path d="M42 55 Q50 63 58 55" fill="none" stroke="%23e2e8f0" stroke-width="2" />
    </svg>`
  },
  {
    id: 'field_tech',
    name: 'Dave (Tech/Helmet)',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%230f172a" />
          <stop offset="100%" stop-color="%230284c7" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(%23g3)" />
      <circle cx="50" cy="40" r="16" fill="%23ffffff" fill-opacity="0.95" />
      <!-- Safety Hard Hat -->
      <path d="M30 33 C30 18, 70 18, 70 33 Z" fill="%23f59e0b" />
      <rect x="26" y="30" width="48" height="4" rx="2" fill="%23d97706" />
      <path d="M47 18 L53 18 L51 30 L49 30 Z" fill="%23b45309" />
      <!-- Body with high-vis vest -->
      <path d="M50 58 C32 58, 22 70, 22 85 L78 85 C78 70, 68 58, 50 58 Z" fill="%23ffffff" fill-opacity="0.95" />
      <path d="M25 78 L35 59 L43 59 L35 85 Z" fill="%23fbbf24" />
      <path d="M75 78 L65 59 L57 59 L65 85 Z" fill="%23fbbf24" />
      <rect x="35" y="68" width="30" height="4" fill="%23e2e8f0" />
    </svg>`
  },
  {
    id: 'female_rep',
    name: 'Sarah (Sky Blue)',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%231e3a8a" />
          <stop offset="100%" stop-color="%230ea5e9" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(%23g4)" />
      <path d="M28 30 C22 25, 78 25, 72 30 C78 45, 72 52, 68 52 C68 52, 68 40, 50 40 C32 40, 32 52, 32 52 C28 52, 22 45, 28 30 Z" fill="%231e293b" />
      <circle cx="50" cy="35" r="15" fill="%23ffffff" fill-opacity="0.95" />
      <path d="M50 54 C32 54, 22 66, 22 85 L78 85 C78 66, 68 54, 50 54 Z" fill="%23ffffff" fill-opacity="0.95" />
      <circle cx="50" cy="62" r="5" fill="%23f59e0b" />
    </svg>`
  }
];

// --- Barcode & QR Code Components (100% Offline & Reliable) ---

function Barcode({ value }: { value: string }) {
  const cleanVal = (value || 'SOLAR-001').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const bars: number[] = [];
  
  // Create deterministic series of bars based on the text value string hash
  let state = 12345;
  for (let i = 0; i < cleanVal.length; i++) {
    state += cleanVal.charCodeAt(i) * (i + 1) * 79;
  }
  
  const pseudoRandom = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  
  for (let i = 0; i < 41; i++) {
    const width = pseudoRandom() > 0.65 ? 3 : 1;
    bars.push(width);
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg viewBox={`0 0 ${bars.length * 2 + 10} 34`} className="w-full h-8" shapeRendering="crispEdges">
        <g className="fill-slate-800 dark:fill-slate-100">
          {bars.map((w, idx) => {
            // Draw lines on even indices, spaces on odd indices
            if (idx % 2 === 0) {
              const x = bars.slice(0, idx).reduce((acc, curr) => acc + curr, 0) + 5;
              return <rect key={idx} x={x} y={1} width={w} height={32} />;
            }
            return null;
          })}
        </g>
      </svg>
      <span className="text-[7.5px] font-mono tracking-[4px] mt-0.5 text-slate-500 uppercase text-center block">
        *{cleanVal}*
      </span>
    </div>
  );
}

function LocalQRCode({ value }: { value: string }) {
  const size = 21; // 21x21 QR Grid (Version 1)
  
  // Seed hash based on input string
  let seed = 0;
  const qrString = value || 'https://www.solariaenergy.com';
  for (let i = 0; i < qrString.length; i++) {
    seed += qrString.charCodeAt(i) * (i + 1);
  }
  
  const isBitActive = (r: number, c: number) => {
    // 1. Top-Left finder pattern
    if (r < 7 && c < 7) {
      return (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
    }
    // 2. Top-Right finder pattern
    if (r < 7 && c >= size - 7) {
      const cc = c - (size - 7);
      return (r === 0 || r === 6 || cc === 0 || cc === 6 || (r >= 2 && r <= 4 && cc >= 2 && cc <= 4));
    }
    // 3. Bottom-Left finder pattern
    if (r >= size - 7 && c < 7) {
      const rr = r - (size - 7);
      return (rr === 0 || rr === 6 || c === 0 || c === 6 || (rr >= 2 && rr <= 4 && c >= 2 && c <= 4));
    }
    // 4. Timing patterns (straight dotted lines connecting finders)
    if (r === 6 && c % 2 === 0) return true;
    if (c === 6 && r % 2 === 0) return true;
    
    // 5. Deterministic hash noise representing QR payload
    const hash = Math.sin(seed + r * 17.3 + c * 31.7) * 10000;
    return (hash - Math.floor(hash)) > 0.48;
  };

  const pixels = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      pixels.push({ r, c, active: isBitActive(r, c) });
    }
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full shadow-inner bg-white p-1 rounded border border-slate-200" shapeRendering="crispEdges">
      <rect width={size} height={size} fill="white" />
      <g fill="#1e293b">
        {pixels.filter(p => p.active).map((p, idx) => (
          <rect key={idx} x={p.c} y={p.r} width={1} height={1} />
        ))}
      </g>
    </svg>
  );
}

// --- Preset Templates definition for extreme user friendliness ---
const PRESET_TEMPLATES = [
  {
    name: 'Helios Gold',
    description: 'Senior Advisor (Classic Slate)',
    icon: '🌞',
    data: {
      companyName: 'HELIOS ENERGY GROUP',
      companySlogan: 'HARNESSING THE POWER OF THE SUN',
      logoPreset: 'sun_spark',
      accentColor: 'gold',
      cardTheme: 'helios',
      agentName: 'Marcus Vance',
      agentId: 'SLR-9840-2026',
      agentTitle: 'Senior Energy Consultant',
      agentPhone: '+1 (303) 555-0149',
      agentEmail: 'm.vance@heliosgroup.com',
      photoSrc: AVATAR_PRESETS[0].svg,
      photoShape: 'shield',
      companyAddress: '100 Sunshine Way, Suite 400, Denver, CO 80202',
      companyWebsite: 'www.heliosgroup.com',
      showHolo: true,
      showSignature: true,
      signatoryName: 'Robert Sterling, VP Operations',
      certifications: ['NABCEP Certified Advisor', 'OSHA 10 Safety Certified', 'Grid-Tie Battery Expert'],
      photoZoom: 100,
      photoX: 0,
      photoY: 0
    }
  },
  {
    name: 'EcoVolt Green',
    description: 'Lead Specialist (Eco Light)',
    icon: '🌿',
    data: {
      companyName: 'ECOVOLT SYSTEM SOLUTIONS',
      companySlogan: 'CLEAN POWER FOR AN ECO-FUTURE',
      logoPreset: 'eco_leaf',
      accentColor: 'green',
      cardTheme: 'ecovolt',
      agentName: 'Elena Rostova',
      agentId: 'EV-4210-ECO',
      agentTitle: 'Lead Environmental Advisor',
      agentPhone: '+1 (415) 555-0188',
      agentEmail: 'e.rostova@ecovoltsystems.com',
      photoSrc: AVATAR_PRESETS[1].svg,
      photoShape: 'circle',
      companyAddress: '450 Green Leaf Parkway, San Francisco, CA 94107',
      companyWebsite: 'www.ecovoltsystems.com',
      showHolo: true,
      showSignature: true,
      signatoryName: 'Clara Oswald, Director of ESG',
      certifications: ['LEED Green Associate', 'NABCEP Technical Sales', 'Residential Solar Designer'],
      photoZoom: 100,
      photoX: 0,
      photoY: 0
    }
  },
  {
    name: 'Cyber Aurora',
    description: 'Field Engineer (Dark Tech)',
    icon: '⚡',
    data: {
      companyName: 'AURORA GRID INDUSTRIES',
      companySlogan: 'INTELLIGENT SOLAR GRID NETWORKS',
      logoPreset: 'volt_wave',
      accentColor: 'blue',
      cardTheme: 'aurora',
      agentName: 'Dave Miller',
      agentId: 'AUR-5582-ENG',
      agentTitle: 'Lead Field Systems Engineer',
      agentPhone: '+1 (206) 555-0133',
      agentEmail: 'd.miller@auroragrid.com',
      photoSrc: AVATAR_PRESETS[2].svg,
      photoShape: 'sharp',
      companyAddress: '888 Innovation Drive, Tech District, Seattle, WA 98101',
      companyWebsite: 'www.auroragrid.com',
      showHolo: true,
      showSignature: true,
      signatoryName: 'Thomas Wright, Chief Engineer',
      certifications: ['OSHA 30 Safety Certified', 'Journeyman Electrician', 'ESS Storage Specialist'],
      photoZoom: 100,
      photoX: 0,
      photoY: 0
    }
  },
  {
    name: 'Solar Flare',
    description: 'Sales Executive (Bright Modern)',
    icon: '🔥',
    data: {
      companyName: 'FLARE SOLAR RESIDENTIAL',
      companySlogan: 'YOUR INDEPENDENT UTILITY FREEDOM',
      logoPreset: 'solar_grid',
      accentColor: 'orange',
      cardTheme: 'flare',
      agentName: 'Sarah Jenkins',
      agentId: 'FLR-1193-REP',
      agentTitle: 'Senior Solar Consultant',
      agentPhone: '+1 (602) 555-0177',
      agentEmail: 's.jenkins@flaresolar.com',
      photoSrc: AVATAR_PRESETS[3].svg,
      photoShape: 'rounded-square',
      companyAddress: '2400 Phoenix Sun Boulevard, Phoenix, AZ 85001',
      companyWebsite: 'www.flaresolar.com',
      showHolo: true,
      showSignature: true,
      signatoryName: 'Alan Mercer, Regional Sales VP',
      certifications: ['Top Residential Closer 2025', 'OSHA 10 Safety Certified', 'NABCEP Associate'],
      photoZoom: 100,
      photoX: 0,
      photoY: 0
    }
  }
];

// --- Main App Component ---

export default function App() {
  // Load initial form states from localStorage or use beautiful defaults
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('solar_id_companyName') || '');
  const [companySlogan, setCompanySlogan] = useState(() => localStorage.getItem('solar_id_companySlogan') || '');
  const [logoPreset, setLogoPreset] = useState(() => localStorage.getItem('solar_id_logoPreset') || 'sun_spark');
  const [customLogoUrl, setCustomLogoUrl] = useState(() => localStorage.getItem('solar_id_customLogo') || '');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('solar_id_accentColor') || 'gold');
  const [cardOrientation, setCardOrientation] = useState<'vertical' | 'horizontal'>(() => 
    (localStorage.getItem('solar_id_orientation') as 'vertical' | 'horizontal') || 'vertical'
  );
  const [cardTheme, setCardTheme] = useState(() => localStorage.getItem('solar_id_theme') || 'helios');
  
  // Agent Details
  const [agentName, setAgentName] = useState(() => localStorage.getItem('solar_id_agentName') || '');
  const [agentId, setAgentId] = useState(() => localStorage.getItem('solar_id_agentId') || '');
  const [agentTitle, setAgentTitle] = useState(() => localStorage.getItem('solar_id_agentTitle') || '');
  const [agentPhone, setAgentPhone] = useState(() => localStorage.getItem('solar_id_agentPhone') || '');
  const [agentEmail, setAgentEmail] = useState(() => localStorage.getItem('solar_id_agentEmail') || '');
  
  // Photo State
  const [photoSrc, setPhotoSrc] = useState(() => localStorage.getItem('solar_id_photoSrc') || AVATAR_PRESETS[0].svg);
  const [photoZoom, setPhotoZoom] = useState(() => Number(localStorage.getItem('solar_id_photoZoom')) || 100);
  const [photoX, setPhotoX] = useState(() => Number(localStorage.getItem('solar_id_photoX')) || 0);
  const [photoY, setPhotoY] = useState(() => Number(localStorage.getItem('solar_id_photoY')) || 0);
  const [photoShape, setPhotoShape] = useState<'circle' | 'rounded-square' | 'sharp' | 'shield'>(() => 
    (localStorage.getItem('solar_id_photoShape') as any) || 'shield'
  );

  // Dates & Details
  const [issueDate, setIssueDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem('solar_id_issueDate') || today;
  });
  const [expiryDate, setExpiryDate] = useState(() => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 2); // default 2 years expiration
    const expiryStr = future.toISOString().split('T')[0];
    return localStorage.getItem('solar_id_expiryDate') || expiryStr;
  });
  const [companyAddress, setCompanyAddress] = useState(() => 
    localStorage.getItem('solar_id_address') || ''
  );
  const [companyWebsite, setCompanyWebsite] = useState(() => 
    localStorage.getItem('solar_id_website') || ''
  );

  // Security & Visual Toggles
  const [showHolo, setShowHolo] = useState(() => localStorage.getItem('solar_id_showHolo') !== 'false');
  const [showSignature, setShowSignature] = useState(() => localStorage.getItem('solar_id_showSignature') !== 'false');
  const [signatoryName, setSignatoryName] = useState(() => localStorage.getItem('solar_id_signatoryName') || '');
  
  // Custom Certifications List
  const [certifications, setCertifications] = useState<string[]>(() => {
    const saved = localStorage.getItem('solar_id_certifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [newCert, setNewCert] = useState('');

  // UI States
  const [activeTab, setActiveTab] = useState<'design' | 'agent' | 'photo'>('design');
  const [exportingState, setExportingState] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Advanced Interactive Usability States & Handlers
  const [isDraggingOverCard, setIsDraggingOverCard] = useState(false);

  const focusAndSelect = (id: string, tab: 'design' | 'agent' | 'photo') => {
    setActiveTab(tab);
    setTimeout(() => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (el) {
        el.focus();
        if (el.select) el.select();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDraggingOverCard(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    setIsDraggingOverCard(false);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDraggingOverCard(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large! Please upload a photo smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoSrc(event.target.result as string);
          setPhotoZoom(100);
          setPhotoX(0);
          setPhotoY(0);
          setActiveTab('photo');
          triggerAlert("Agent photo updated via drag-and-drop!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadTemplate = (template: typeof PRESET_TEMPLATES[0]) => {
    const d = template.data;
    setCompanyName(d.companyName);
    setCompanySlogan(d.companySlogan);
    setLogoPreset(d.logoPreset);
    setCustomLogoUrl('');
    setAccentColor(d.accentColor);
    setCardTheme(d.cardTheme);
    setAgentName(d.agentName);
    setAgentId(d.agentId);
    setAgentTitle(d.agentTitle);
    setAgentPhone(d.agentPhone);
    setAgentEmail(d.agentEmail);
    setPhotoSrc(d.photoSrc);
    setPhotoShape(d.photoShape as any);
    setCompanyAddress(d.companyAddress);
    setCompanyWebsite(d.companyWebsite);
    setShowHolo(d.showHolo);
    setShowSignature(d.showSignature);
    setSignatoryName(d.signatoryName);
    setCertifications(d.certifications);
    setPhotoZoom(d.photoZoom);
    setPhotoX(d.photoX);
    setPhotoY(d.photoY);
    triggerAlert(`Loaded ${template.name} Profile Preset!`);
  };

  // DOM Refs for html2canvas extraction
  const cardFrontRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);
  const printSheetRef = useRef<HTMLDivElement>(null);

  // Sync state to localStorage on modification
  useEffect(() => {
    localStorage.setItem('solar_id_companyName', companyName);
    localStorage.setItem('solar_id_companySlogan', companySlogan);
    localStorage.setItem('solar_id_logoPreset', logoPreset);
    localStorage.setItem('solar_id_customLogo', customLogoUrl);
    localStorage.setItem('solar_id_accentColor', accentColor);
    localStorage.setItem('solar_id_orientation', cardOrientation);
    localStorage.setItem('solar_id_theme', cardTheme);
    localStorage.setItem('solar_id_agentName', agentName);
    localStorage.setItem('solar_id_agentId', agentId);
    localStorage.setItem('solar_id_agentTitle', agentTitle);
    localStorage.setItem('solar_id_agentPhone', agentPhone);
    localStorage.setItem('solar_id_agentEmail', agentEmail);
    localStorage.setItem('solar_id_photoSrc', photoSrc);
    localStorage.setItem('solar_id_photoZoom', String(photoZoom));
    localStorage.setItem('solar_id_photoX', String(photoX));
    localStorage.setItem('solar_id_photoY', String(photoY));
    localStorage.setItem('solar_id_photoShape', photoShape);
    localStorage.setItem('solar_id_issueDate', issueDate);
    localStorage.setItem('solar_id_expiryDate', expiryDate);
    localStorage.setItem('solar_id_address', companyAddress);
    localStorage.setItem('solar_id_website', companyWebsite);
    localStorage.setItem('solar_id_showHolo', String(showHolo));
    localStorage.setItem('solar_id_showSignature', String(showSignature));
    localStorage.setItem('solar_id_signatoryName', signatoryName);
    localStorage.setItem('solar_id_certifications', JSON.stringify(certifications));
  }, [
    companyName, companySlogan, logoPreset, customLogoUrl, accentColor, 
    cardOrientation, cardTheme, agentName, agentId, agentTitle, 
    agentPhone, agentEmail, photoSrc, photoZoom, photoX, photoY, 
    photoShape, issueDate, expiryDate, companyAddress, companyWebsite, 
    showHolo, showSignature, signatoryName, certifications
  ]);

  // Helpers
  const triggerAlert = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large! Please upload a photo smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoSrc(event.target.result as string);
          setPhotoZoom(100);
          setPhotoX(0);
          setPhotoY(0);
          triggerAlert("Agent photo uploaded successfully!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomLogoUrl(event.target.result as string);
          setLogoPreset('custom');
          triggerAlert("Custom corporate logo loaded!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addCertification = () => {
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert('');
    }
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const resetToDefaults = () => {
    if (window.confirm("Are you sure you want to clear all fields and start fresh?")) {
      setCompanyName('');
      setCompanySlogan('');
      setLogoPreset('sun_spark');
      setCustomLogoUrl('');
      setAccentColor('gold');
      setCardOrientation('vertical');
      setCardTheme('helios');
      setAgentName('');
      setAgentId('');
      setAgentTitle('');
      setAgentPhone('');
      setAgentEmail('');
      setPhotoSrc(AVATAR_PRESETS[0].svg);
      setPhotoZoom(100);
      setPhotoX(0);
      setPhotoY(0);
      setPhotoShape('shield');
      setCompanyAddress('');
      setCompanyWebsite('');
      setShowHolo(true);
      setShowSignature(true);
      setSignatoryName('');
      setCertifications([]);
      triggerAlert("All fields cleared successfully!");
    }
  };

  // --- PDF & IMAGE GENERATION ENGINE ---

  // Generate individual card PDFs with extreme high crispness
  const exportCardPDF = async () => {
    setExportingState(`Generating ID Card PDF...`);
    try {
      // Create jsPDF using standard CR80 dimension in mm: 85.6mm x 53.98mm
      // Let's check orientation
      const isPortrait = cardOrientation === 'vertical';
      const widthMm = isPortrait ? 53.98 : 85.6;
      const heightMm = isPortrait ? 85.6 : 53.98;
      const orientationParam = isPortrait ? 'portrait' : 'landscape';

      const pdf = new jsPDF({
        orientation: orientationParam,
        unit: 'mm',
        format: [widthMm, heightMm]
      });

      // Options for html2canvas to ensure extreme high quality
      const canvasOpts = {
        scale: 4, // 4x scale translates to ~300+ DPI crisp prints
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      };

      const frontEl = cardFrontRef.current;
      if (!frontEl) throw new Error("Front side card element not found");
      const canvasFront = await html2canvasWithOklchSupport(frontEl, canvasOpts);
      const imgDataFront = canvasFront.toDataURL('image/png', 1.0);
      pdf.addImage(imgDataFront, 'PNG', 0, 0, widthMm, heightMm, undefined, 'FAST');

      const namePart = agentName.trim().replace(/\s+/g, '_') || 'Agent';
      const filename = `${namePart}_Solar_ID.pdf`;
      pdf.save(filename);
      triggerAlert(`Successfully downloaded: ${filename}`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF. Please ensure all images are fully loaded and try again.");
    } finally {
      setExportingState(null);
    }
  };

  // Generate a beautiful, perfectly formatted printable sheet on standard US Letter / A4 paper
  // This has cutting lines and side-by-side front/back layout for immediate home printing, cutting, folding, and laminating
  const exportPrintSheetPDF = async () => {
    setExportingState("Assembling US Letter Print Sheet PDF...");
    try {
      const sheetEl = printSheetRef.current;
      if (!sheetEl) throw new Error("Print sheet canvas element not found");

      // Temporarily reveal print sheet to DOM if it was hidden
      sheetEl.style.display = "block";

      const canvasOpts = {
        scale: 3, // Excellent resolution for standard US Letter page
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      };

      const canvas = await html2canvasWithOklchSupport(sheetEl, canvasOpts);
      sheetEl.style.display = "none"; // Hide back

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Standard US Letter size is 8.5 x 11 inches or 215.9 x 279.4 mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 215.9, 279.4, undefined, 'FAST');
      
      const namePart = agentName.trim().replace(/\s+/g, '_') || 'Agent';
      const filename = `${namePart}_Print_Sheet_Letter.pdf`;
      pdf.save(filename);
      triggerAlert(`Downloaded high-res Letter Print Sheet!`);
    } catch (err) {
      console.error(err);
      alert("Error generating print sheet.");
    } finally {
      setExportingState(null);
    }
  };

  // Generate raw PNG images for digital distribution
  const exportPNG = async () => {
    setExportingState(`Rendering PNG...`);
    try {
      const el = cardFrontRef.current;
      if (!el) throw new Error("Element not found");

      const canvas = await html2canvasWithOklchSupport(el, {
        scale: 4, // Ultra high quality PNG
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const namePart = agentName.trim().replace(/\s+/g, '_') || 'Agent';
      link.download = `${namePart}_Solar_ID.png`;
      link.href = dataUrl;
      link.click();
      triggerAlert(`Saved high-res PNG image!`);
    } catch (err) {
      console.error(err);
      alert("Error exporting PNG image.");
    } finally {
      setExportingState(null);
    }
  };

  // Return the selected logo element based on config
  const renderSelectedLogo = (className = "w-9 h-9") => {
    if (logoPreset === 'custom' && customLogoUrl) {
      return <img src={customLogoUrl} alt="Company Logo" className={`${className} object-contain rounded-sm`} />;
    }
    const found = LOGO_PRESETS.find(p => p.id === logoPreset);
    if (found) return found.element(className);
    return LOGO_PRESETS[0].element(className); // fallback
  };

  // Color theme mapper
  const getColorClasses = () => {
    switch (accentColor) {
      case 'gold':
        return {
          primary: 'text-amber-500',
          bg: 'bg-amber-500',
          border: 'border-amber-500',
          gradient: 'from-amber-500 via-amber-400 to-yellow-600',
          bgGradient: 'from-amber-500/10 to-amber-600/5',
          ring: 'ring-amber-400',
          badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          darkBorder: 'border-amber-600',
          textMuted: 'text-amber-200/80'
        };
      case 'green':
        return {
          primary: 'text-emerald-500',
          bg: 'bg-emerald-500',
          border: 'border-emerald-500',
          gradient: 'from-emerald-500 via-teal-400 to-emerald-600',
          bgGradient: 'from-emerald-500/10 to-emerald-600/5',
          ring: 'ring-emerald-400',
          badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          darkBorder: 'border-emerald-600',
          textMuted: 'text-emerald-200/80'
        };
      case 'blue':
        return {
          primary: 'text-sky-400',
          bg: 'bg-sky-500',
          border: 'border-sky-400',
          gradient: 'from-sky-500 via-blue-400 to-sky-600',
          bgGradient: 'from-sky-500/10 to-sky-600/5',
          ring: 'ring-sky-400',
          badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
          darkBorder: 'border-sky-500',
          textMuted: 'text-sky-200/80'
        };
      case 'orange':
        return {
          primary: 'text-orange-500',
          bg: 'bg-orange-500',
          border: 'border-orange-500',
          gradient: 'from-orange-500 via-amber-500 to-red-600',
          bgGradient: 'from-orange-500/10 to-orange-600/5',
          ring: 'ring-orange-400',
          badgeBg: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
          darkBorder: 'border-orange-600',
          textMuted: 'text-orange-200/80'
        };
      case 'charcoal':
        default:
        return {
          primary: 'text-slate-300',
          bg: 'bg-slate-400',
          border: 'border-slate-400',
          gradient: 'from-slate-400 via-slate-300 to-slate-500',
          bgGradient: 'from-slate-500/10 to-slate-600/5',
          ring: 'ring-slate-400',
          badgeBg: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
          darkBorder: 'border-slate-500',
          textMuted: 'text-slate-300/80'
        };
    }
  };

  const colors = getColorClasses();

  // Cards design layout config
  const getThemeStyles = (side: 'front' | 'back') => {
    switch (cardTheme) {
      case 'helios': // Dark Premium Slate with Gold/Colors
        return {
          cardBg: 'bg-slate-950 text-white border border-slate-800',
          innerAccent: colors.primary,
          headerBg: 'bg-slate-900 border-b border-slate-800',
          photoBorder: `border-2 ${colors.border}`,
          textHeading: 'text-white font-bold tracking-wide',
          textSubheading: colors.primary,
          labelColor: 'text-slate-400',
          valColor: 'text-slate-200',
          holoOpacity: 'opacity-15',
          barColor: 'text-white'
        };
      case 'ecovolt': // Soft Light Eco Theme
        return {
          cardBg: 'bg-slate-50 text-slate-900 border border-slate-200',
          innerAccent: 'text-emerald-700',
          headerBg: 'bg-white border-b border-slate-100',
          photoBorder: `border-2 border-emerald-600`,
          textHeading: 'text-slate-900 font-bold tracking-tight',
          textSubheading: 'text-emerald-700 font-semibold',
          labelColor: 'text-slate-500',
          valColor: 'text-slate-800 font-medium',
          holoOpacity: 'opacity-[0.06]',
          barColor: 'text-slate-800'
        };
      case 'aurora': // Glowing Dark Tech Blue Gradient
        return {
          cardBg: 'bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950 text-white border border-indigo-900/60',
          innerAccent: 'text-cyan-400',
          headerBg: 'bg-indigo-950/40 border-b border-indigo-900/40',
          photoBorder: 'border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]',
          textHeading: 'text-white font-extrabold tracking-wide',
          textSubheading: 'text-cyan-400 font-semibold uppercase',
          labelColor: 'text-indigo-300',
          valColor: 'text-white',
          holoOpacity: 'opacity-20',
          barColor: 'text-white'
        };
      case 'flare': // Dynamic White-Sleek Orange-accent
        return {
          cardBg: 'bg-white text-slate-800 border border-slate-300',
          innerAccent: 'text-orange-600',
          headerBg: 'bg-slate-50 border-b border-slate-200',
          photoBorder: 'border-2 border-orange-500',
          textHeading: 'text-slate-800 font-bold tracking-tight',
          textSubheading: 'text-orange-600 font-semibold',
          labelColor: 'text-slate-400',
          valColor: 'text-slate-700',
          holoOpacity: 'opacity-[0.07]',
          barColor: 'text-slate-800'
        };
      default:
        return {
          cardBg: 'bg-slate-900 text-white border border-slate-800',
          innerAccent: colors.primary,
          headerBg: 'bg-slate-800/80',
          photoBorder: `border-2 ${colors.border}`,
          textHeading: 'text-white font-bold',
          textSubheading: colors.primary,
          labelColor: 'text-slate-400',
          valColor: 'text-slate-200',
          holoOpacity: 'opacity-10',
          barColor: 'text-white'
        };
    }
  };

  const themeStyles = getThemeStyles('front');

  // Portrait Layout dimensions (Aspect ratio is ~1:1.586)
  // For screen: width 310px, height 490px
  // Landscape: width 490px, height 310px

  // Border radius of agent photo frame based on selection
  const getPhotoShapeClass = () => {
    switch (photoShape) {
      case 'circle': return 'rounded-full';
      case 'rounded-square': return 'rounded-2xl';
      case 'sharp': return 'rounded-none';
      case 'shield': return 'rounded-b-2xl rounded-t-sm';
      default: return 'rounded-full';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans" id="root-layout">
      
      {/* Dynamic Success Alert Banner */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white py-3 px-5 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <p className="font-semibold text-sm">{successMessage}</p>
        </div>
      )}

      {/* Exporting Loading Overlay */}
      {exportingState && (
        <div className="fixed inset-0 bg-slate-950/75 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col items-center max-w-sm text-center shadow-2xl">
            <RefreshCw className="w-12 h-12 text-amber-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold mb-2">Generating Print Asset</h3>
            <p className="text-slate-400 text-sm mb-1">{exportingState}</p>
            <p className="text-[11px] text-slate-500 italic mt-3">Compiling high-resolution vector layers...</p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800/80 px-6 py-4 sticky top-0 z-40" id="navbar">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sun className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
                SOLARIA ID FORGE
              </h1>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                PROFESSIONAL SOLAR REPRESENTATIVE CR80 ID BUILDER
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={resetToDefaults}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition duration-200 cursor-pointer text-slate-300"
              title="Clear all form fields to start fresh"
              id="reset-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Clear All Fields
            </button>
            <div className="h-6 w-[1px] bg-slate-800 hidden sm:block"></div>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 py-1.5 px-3 rounded-full font-bold hidden sm:inline-block">
              Print Ready: 300+ DPI
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:overflow-hidden">
        
        {/* Left Side: Customization Studio (Cols 1-7) */}
        <div className="lg:col-span-7 flex flex-col gap-5 lg:overflow-y-auto pr-0 lg:pr-2" id="control-panel">
          
          {/* 1-Click Quick-Start Profiles Widget */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/60 flex flex-col gap-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                1-Click Agent Profiles
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Click to immediately load a fully coordinated design</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  onClick={() => loadTemplate(tmpl)}
                  type="button"
                  className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-amber-500/50 p-2.5 rounded-xl flex flex-col items-start gap-1 transition duration-150 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="text-sm">{tmpl.icon}</span>
                    <span className="text-[11px] font-extrabold text-white group-hover:text-amber-400 transition-colors truncate">{tmpl.name}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium truncate w-full">{tmpl.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Help Banner */}
          <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl px-4 py-2.5 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 font-medium leading-normal">
              <span className="text-amber-400 font-extrabold">Pro Tip:</span> You can also <span className="text-white font-semibold">click directly on any text or photo</span> in the preview card on the right to edit it instantly! Drag-and-drop any headshot image directly onto the card photo frame to upload.
            </p>
          </div>

          {/* Tabs Navigator */}
          <div className="bg-slate-950 p-1 rounded-xl flex gap-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('design')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition duration-150 cursor-pointer ${
                activeTab === 'design' 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              id="tab-design"
            >
              <Layers className="w-4 h-4" />
              Company & Design
            </button>
            <button
              onClick={() => setActiveTab('agent')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition duration-150 cursor-pointer ${
                activeTab === 'agent' 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              id="tab-agent"
            >
              <User className="w-4 h-4" />
              Agent Profile
            </button>
            <button
              onClick={() => setActiveTab('photo')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition duration-150 cursor-pointer ${
                activeTab === 'photo' 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              id="tab-photo"
            >
              <Camera className="w-4 h-4" />
              Photo Crop
            </button>
          </div>

          {/* Tab 1: Company & Design Styling */}
          {activeTab === 'design' && (
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-5" id="design-tab-panel">
              <h2 className="text-sm font-bold tracking-wider text-amber-400 uppercase flex items-center gap-2">
                <Layers className="w-4 h-4" />
                1. Company Branding & Aesthetic Presets
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase">Solar Company Name</label>
                  <div className="relative">
                    <Sun className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      id="input-company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value.toUpperCase())}
                      className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-white font-bold"
                      placeholder="e.g. SOLARIA SOLUTIONS"
                      maxLength={32}
                    />
                  </div>
                </div>

                {/* Slogan */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase">Corporate Slogan / Subtitle</label>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      id="input-company-slogan"
                      value={companySlogan}
                      onChange={(e) => setCompanySlogan(e.target.value.toUpperCase())}
                      className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-amber-500 text-white"
                      placeholder="e.g. RENEWABLE POWER"
                      maxLength={40}
                    />
                  </div>
                </div>
              </div>

              {/* Logo Selectors */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
                  Corporate Logo Mark
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {LOGO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setLogoPreset(preset.id)}
                      type="button"
                      className={`p-2 rounded-xl bg-slate-900 border flex flex-col items-center gap-1 transition duration-150 hover:bg-slate-850 cursor-pointer ${
                        logoPreset === preset.id ? 'border-amber-500 ring-1 ring-amber-500/30' : 'border-slate-800/80'
                      }`}
                    >
                      {preset.element("w-7 h-7")}
                      <span className="text-[9px] text-slate-400 truncate max-w-full font-medium">{preset.name}</span>
                    </button>
                  ))}
                  
                  {/* Custom Logo Upload option */}
                  <label className={`p-2 rounded-xl bg-slate-900 border flex flex-col items-center justify-center gap-1 transition duration-150 hover:bg-slate-850 cursor-pointer text-center relative ${
                    logoPreset === 'custom' ? 'border-amber-500 ring-1 ring-amber-500/30' : 'border-slate-800/80'
                  }`}>
                    <input type="file" accept="image/*" onChange={handleCustomLogoUpload} className="hidden" />
                    {customLogoUrl ? (
                      <img src={customLogoUrl} alt="Custom" className="w-7 h-7 object-contain rounded" />
                    ) : (
                      <Upload className="w-5 h-5 text-slate-400" />
                    )}
                    <span className="text-[9px] text-slate-400 truncate max-w-full font-semibold">
                      {customLogoUrl ? "Replace Logo" : "Upload PNG"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Theme Settings & Orientation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                
                {/* Theme Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-400 font-bold uppercase">Aesthetic Theme Preset</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCardTheme('helios')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                        cardTheme === 'helios' 
                          ? 'bg-slate-900 border-amber-500 text-white' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🌞 Helios Gold
                    </button>
                    <button
                      onClick={() => setCardTheme('ecovolt')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                        cardTheme === 'ecovolt' 
                          ? 'bg-emerald-950/20 border-emerald-500 text-emerald-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🌿 Eco Green
                    </button>
                    <button
                      onClick={() => setCardTheme('aurora')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                        cardTheme === 'aurora' 
                          ? 'bg-blue-950/20 border-sky-400 text-sky-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      ⚡ Cyber Blue
                    </button>
                    <button
                      onClick={() => setCardTheme('flare')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                        cardTheme === 'flare' 
                          ? 'bg-amber-950/20 border-orange-500 text-orange-400' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🔥 Solar Flare
                    </button>
                  </div>
                </div>

                {/* Accent Color */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-400 font-bold uppercase">Primary Accent Color</label>
                  <div className="flex items-center gap-2 h-full py-1">
                    {[
                      { id: 'gold', color: 'bg-amber-500' },
                      { id: 'green', color: 'bg-emerald-500' },
                      { id: 'blue', color: 'bg-sky-400' },
                      { id: 'orange', color: 'bg-orange-500' },
                      { id: 'charcoal', color: 'bg-slate-400' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setAccentColor(item.id)}
                        className={`w-8 h-8 rounded-full ${item.color} border-2 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                          accentColor === item.id ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        title={`Select ${item.id} accent color`}
                      >
                        {accentColor === item.id && <div className="w-2.5 h-2.5 bg-slate-950 rounded-full" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Layout Orientation */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
                <label className="text-xs text-slate-400 font-bold uppercase">Card Orientation</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setCardOrientation('vertical');
                    }}
                    className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition duration-150 cursor-pointer ${
                      cardOrientation === 'vertical' 
                        ? 'bg-slate-900 border-amber-500 text-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-3.5 h-5 bg-current opacity-30 rounded-sm" />
                    Portrait Format (Vertical)
                  </button>
                  <button
                    onClick={() => {
                      setCardOrientation('horizontal');
                    }}
                    className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition duration-150 cursor-pointer ${
                      cardOrientation === 'horizontal' 
                        ? 'bg-slate-900 border-amber-500 text-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-5 h-3.5 bg-current opacity-30 rounded-sm" />
                    Landscape Format (Horizontal)
                  </button>
                </div>
              </div>

              {/* Security Hologram & Stamp Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800/60 mt-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-300">Visual Security Badge Ribbon</span>
                  <span className="text-[10px] text-slate-400">Adds an elegant security stamp on the front of the ID badge</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showHolo} 
                    onChange={(e) => setShowHolo(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-slate-950"></div>
                </label>
              </div>

            </div>
          )}

          {/* Tab 2: Agent Personal Profile Details */}
          {activeTab === 'agent' && (
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-5 animate-fadeIn" id="agent-tab-panel">
              <h2 className="text-sm font-bold tracking-wider text-amber-400 uppercase flex items-center gap-2">
                <User className="w-4 h-4" />
                2. Agent Information & Credentials
              </h2>

              {/* Full Name & Job Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase">Agent Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      id="input-agent-name"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-amber-500 text-white font-semibold"
                      placeholder="e.g. Marcus Vance"
                      maxLength={24}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase">Job Title / Designation</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      id="input-agent-title"
                      value={agentTitle}
                      onChange={(e) => setAgentTitle(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-amber-500 text-white"
                      placeholder="e.g. Senior Solar Consultant"
                      maxLength={30}
                    />
                  </div>
                </div>
              </div>

              {/* ID Number & Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase">Unique Employee ID Number</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      id="input-agent-id"
                      value={agentId}
                      onChange={(e) => setAgentId(e.target.value.toUpperCase())}
                      className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-amber-500 text-white font-mono"
                      placeholder="e.g. SLR-9840-2026"
                      maxLength={16}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase">Representative Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      id="input-agent-phone"
                      value={agentPhone}
                      onChange={(e) => setAgentPhone(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-amber-500 text-white"
                      placeholder="e.g. +1 (303) 555-0149"
                      maxLength={18}
                    />
                  </div>
                </div>
              </div>

              {/* Representative Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase">Agent Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    id="input-agent-email"
                    value={agentEmail}
                    onChange={(e) => setAgentEmail(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-amber-500 text-white"
                    placeholder="e.g. m.vance@solariaenergy.com"
                    maxLength={36}
                  />
                </div>
              </div>

              {/* Dates Validation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase">Issue Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-amber-500 text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase">Expiry Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-amber-500 text-white"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Tab 3: Photo Crop & Avatar Configuration */}
          {activeTab === 'photo' && (
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-5 animate-fadeIn" id="photo-tab-panel">
              <h2 className="text-sm font-bold tracking-wider text-amber-400 uppercase flex items-center gap-2">
                <Camera className="w-4 h-4" />
                3. Representative Agent Photo
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/40">
                Ensure a professional look. Upload a clear square headshot, or select a crisp preset vector placeholder avatar to build instant mockup designs without uploading images.
              </p>

              {/* Upload Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Drag-n-drop Upload Container */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Upload Custom Photo</span>
                  <label className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-900/50 hover:bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition duration-150">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">Drag & Drop or Browse</span>
                    <span className="text-[10px] text-slate-500">JPG, PNG, GIF up to 2MB</span>
                  </label>
                </div>

                {/* Preset Avatars Selection */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Or Choose Vector Preset</span>
                  <div className="grid grid-cols-2 gap-2">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setPhotoSrc(preset.svg);
                          setPhotoZoom(100);
                          setPhotoX(0);
                          setPhotoY(0);
                        }}
                        className={`p-1.5 rounded-xl bg-slate-900 border flex items-center gap-2 text-left transition hover:bg-slate-850 cursor-pointer ${
                          photoSrc === preset.svg ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-slate-800'
                        }`}
                      >
                        <img src={preset.svg} alt={preset.name} className="w-8 h-8 rounded-lg object-cover" />
                        <span className="text-[10px] font-medium text-slate-300 truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Photo Frame Styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-900">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Badge Photo Frame Shape</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'shield', label: '🛡️ Crest Shield' },
                      { id: 'circle', label: '⚪ Classic Circle' },
                      { id: 'rounded-square', label: '⏹️ Rounded Box' },
                      { id: 'sharp', label: '⬛ Sharp Square' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setPhotoShape(item.id as any)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold border text-center transition cursor-pointer ${
                          photoShape === item.id 
                            ? 'bg-slate-900 border-amber-500 text-amber-400' 
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Adjustments (Zoom / Positioning) */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Align Headshot Image</span>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-2">
                    
                    {/* Zoom Slider */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Zoom ({photoZoom}%)</span>
                      <input 
                        type="range" 
                        min="100" 
                        max="250" 
                        value={photoZoom} 
                        onChange={(e) => setPhotoZoom(Number(e.target.value))}
                        className="w-2/3 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    {/* Move X Slider */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Horizontal ({photoX}px)</span>
                      <input 
                        type="range" 
                        min="-50" 
                        max="50" 
                        value={photoX} 
                        onChange={(e) => setPhotoX(Number(e.target.value))}
                        className="w-2/3 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    {/* Move Y Slider */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Vertical ({photoY}px)</span>
                      <input 
                        type="range" 
                        min="-50" 
                        max="50" 
                        value={photoY} 
                        onChange={(e) => setPhotoY(Number(e.target.value))}
                        className="w-2/3 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Side: High-Fidelity Print-Preview Stage (Cols 8-12) */}
        <div className="lg:col-span-5 flex flex-col gap-5 justify-between lg:overflow-hidden h-full" id="preview-panel">
          
          {/* Card Layout Preview Container */}
          <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800/80 flex-1 flex flex-col items-center justify-center relative min-h-[440px] lg:min-h-0">
            
            {/* Stage Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 pointer-events-none rounded-3xl" />
            
            {/* Status indicators */}
            <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] text-slate-400 font-mono tracking-wider bg-slate-900/80 py-1 px-3 rounded-full border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              LIVE PREVIEW: {cardOrientation.toUpperCase()}
            </div>

            {/* Print Stage - Renders Card Canvas */}
            <div className="relative flex items-center justify-center p-6 w-full max-w-full overflow-hidden" id="card-stage">
              
              {/* Vertical Card Preview Box */}
              {cardOrientation === 'vertical' ? (
                <div className="relative w-[304px] h-[482px]">
                  
                  {/* Outer Wrapper */}
                  <div className="relative w-full h-full">
                    
                    {/* --- FRONT SIDE PORTRAIT --- */}
                    <div 
                      ref={cardFrontRef}
                      className={`absolute inset-0 w-full h-full rounded-[18px] overflow-hidden select-none shadow-2xl flex flex-col justify-between ${themeStyles.cardBg}`}
                      style={{ contentVisibility: 'auto' }}
                      id="card-front-portrait"
                    >
                      {/* Holographic Security Overlay Grid */}
                      {showHolo && (
                        <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-400 via-pink-400 to-amber-300 pointer-events-none mix-blend-color-dodge ${themeStyles.holoOpacity} z-10`} />
                      )}

                      {/* Top Header branding band */}
                      <div 
                        onClick={() => focusAndSelect('input-company-name', 'design')}
                        className={`px-4 py-3.5 flex items-center gap-2.5 ${themeStyles.headerBg} cursor-pointer hover:ring-2 hover:ring-amber-500/40 rounded-t-[18px] transition duration-150 group/brand relative`}
                        title="Click to edit company branding"
                      >
                        {renderSelectedLogo("w-8 h-8 flex-shrink-0")}
                        <div className="flex-1 min-w-0 leading-none">
                          <h3 className={`text-xs font-black tracking-wider leading-tight truncate uppercase ${themeStyles.textHeading}`}>
                            {companyName || 'SOLAR CO'}
                          </h3>
                          <span className="text-[8px] tracking-widest text-slate-400 uppercase font-semibold block leading-none mt-0.5 truncate">
                            {companySlogan || 'SUSTAINABLE POWER'}
                          </span>
                        </div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 text-slate-950 p-1 rounded-full opacity-0 group-hover/brand:opacity-100 transition duration-150 shadow-md">
                          <Pencil className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      {/* Main Body Column */}
                      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-4 pb-3 text-center gap-3 relative">
                        
                        {/* Agent photo styled container */}
                        <div 
                          className="relative group/photo cursor-pointer"
                          onClick={() => focusAndSelect('input-agent-name', 'photo')}
                          title="Click to change photo / Drag & Drop any image file here!"
                        >
                          {/* Inner glowing color ring around photo frame */}
                          <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${colors.gradient} opacity-20 blur-sm`} />
                          
                          <div className={`w-28 h-36 overflow-hidden bg-slate-900 relative shadow-md ${getPhotoShapeClass()} ${themeStyles.photoBorder}`}>
                            <div 
                              className="absolute inset-0 flex items-center justify-center bg-slate-950"
                              style={{
                                backgroundImage: `url(${photoSrc})`,
                                backgroundSize: `${photoZoom}%`,
                                backgroundPosition: `calc(50% + ${photoX}px) calc(50% + ${photoY}px)`,
                                backgroundRepeat: 'no-repeat'
                              }}
                            />
                          </div>

                          {/* Floating inline crop controls overlay */}
                          <div className="absolute inset-x-0 -bottom-2.5 flex items-center justify-center gap-1 opacity-0 group-hover/photo:opacity-100 transition-all bg-slate-950/95 py-1 px-1.5 rounded-full border border-slate-800/80 shadow-xl scale-90 z-20 mx-auto max-w-[130px]">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPhotoZoom(prev => Math.min(250, prev + 10)); }} 
                              className="p-1 hover:bg-slate-800 text-amber-400 rounded transition cursor-pointer" 
                              title="Zoom In"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPhotoZoom(prev => Math.max(100, prev - 10)); }} 
                              className="p-1 hover:bg-slate-800 text-amber-400 rounded transition cursor-pointer" 
                              title="Zoom Out"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPhotoX(prev => prev - 5); }} 
                              className="p-1 hover:bg-slate-800 text-slate-300 rounded transition cursor-pointer" 
                              title="Nudge Left"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPhotoX(prev => prev + 5); }} 
                              className="p-1 hover:bg-slate-800 text-slate-300 rounded transition cursor-pointer" 
                              title="Nudge Right"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPhotoX(0); setPhotoY(0); setPhotoZoom(100); }} 
                              className="p-1 hover:bg-slate-800 text-rose-400 rounded transition cursor-pointer" 
                              title="Reset"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Certified badge icon overlapping */}
                          <div className="absolute -top-1.5 -right-1.5 bg-slate-900 p-1 rounded-full shadow border border-slate-800 z-10">
                            <ShieldCheck className={`w-5 h-5 ${colors.primary}`} />
                          </div>
                        </div>

                        {/* Agent Credentials Block */}
                        <div 
                          onClick={() => focusAndSelect('input-agent-name', 'agent')}
                          className="leading-tight mt-1 cursor-pointer hover:ring-2 hover:ring-amber-500/40 p-2 rounded-lg transition duration-150 group/agent-text relative"
                          title="Click to edit agent credentials"
                        >
                          <h2 className="text-base font-extrabold tracking-tight text-white uppercase truncate max-w-[240px]">
                            {agentName || 'Agent Name'}
                          </h2>
                          <p className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${themeStyles.textSubheading}`}>
                            {agentTitle || 'Representative'}
                          </p>
                          <div className="absolute -right-1 top-1/2 -translate-y-1/2 bg-amber-500 text-slate-950 p-0.5 rounded-full opacity-0 group-hover/agent-text:opacity-100 transition duration-150 shadow-md">
                            <Pencil className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </div>

                      {/* Security Bottom Authorization Bar */}
                      <div 
                        onClick={() => focusAndSelect('input-agent-id', 'agent')}
                        className="px-5 pb-5 pt-1.5 flex flex-col gap-2 border-t border-slate-800/20 cursor-pointer hover:bg-slate-900/10 transition duration-150 group/security relative"
                        title="Click to edit employee ID and contact details"
                      >
                        
                        {/* Credential rows */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 text-left text-[9px]">
                          <div>
                            <span className={`block text-[7px] uppercase font-bold tracking-wider ${themeStyles.labelColor}`}>Employee ID</span>
                            <span className="font-mono font-bold text-white truncate block">{agentId || 'SLR-0000'}</span>
                          </div>
                          <div>
                            <span className={`block text-[7px] uppercase font-bold tracking-wider ${themeStyles.labelColor}`}>Phone No</span>
                            <span className="font-semibold text-slate-200 truncate block">{agentPhone || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="absolute right-2 top-2 bg-amber-500 text-slate-950 p-0.5 rounded-full opacity-0 group-hover/security:opacity-100 transition duration-150 shadow-sm z-10">
                          <Pencil className="w-2.5 h-2.5" />
                        </div>

                        {/* Holo security strip text */}
                        {showHolo && (
                          <div className={`py-1 text-center font-bold tracking-[2px] rounded uppercase text-[7px] border flex items-center justify-center gap-1.5 select-none ${colors.badgeBg}`}>
                            <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                            VERIFIED ENERGY CONSULTANT
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                </div>
              ) : (
                /* Horizontal Card Landscape Mode Preview Box */
                <div className="relative w-[482px] h-[304px]">
                  
                  {/* Outer Wrapper */}
                  <div className="relative w-full h-full">
                    
                    {/* --- FRONT SIDE LANDSCAPE --- */}
                    <div 
                      ref={cardFrontRef}
                      className={`absolute inset-0 w-full h-full rounded-[18px] overflow-hidden select-none shadow-2xl flex flex-col justify-between ${themeStyles.cardBg}`}
                      style={{ contentVisibility: 'auto' }}
                      id="card-front-landscape"
                    >
                      {/* Holographic Security Overlay Grid */}
                      {showHolo && (
                        <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-400 via-pink-400 to-amber-300 pointer-events-none mix-blend-color-dodge ${themeStyles.holoOpacity} z-10`} />
                      )}

                      {/* Top Header branding band */}
                      <div 
                        onClick={() => focusAndSelect('input-company-name', 'design')}
                        className={`px-5 py-3 flex items-center justify-between gap-2 border-b border-slate-800/40 ${themeStyles.headerBg} cursor-pointer hover:ring-2 hover:ring-amber-500/40 rounded-t-[18px] transition duration-150 group/brand relative`}
                        title="Click to edit company branding"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderSelectedLogo("w-7.5 h-7.5 flex-shrink-0")}
                          <div className="leading-none truncate">
                            <h3 className={`text-xs font-black tracking-wider leading-none uppercase truncate ${themeStyles.textHeading}`}>
                              {companyName || 'SOLAR CO'}
                            </h3>
                            <span className="text-[7.5px] tracking-widest text-slate-400 uppercase font-semibold block leading-none mt-1 truncate">
                              {companySlogan || 'SUSTAINABLE POWER'}
                            </span>
                          </div>
                        </div>

                        {showHolo && (
                          <div className={`py-1 px-3 text-center font-bold tracking-wider rounded uppercase text-[6.5px] border flex items-center gap-1 select-none ${colors.badgeBg} z-10`}>
                            <Sparkles className="w-2.5 h-2.5" />
                            AUTHORIZED REP
                          </div>
                        )}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 text-slate-950 p-1 rounded-full opacity-0 group-hover/brand:opacity-100 transition duration-150 shadow-md">
                          <Pencil className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      {/* Main Body Side-By-Side */}
                      <div className="flex-1 flex p-4 items-center gap-4 relative">
                        
                        {/* Left Column: Photo frame */}
                        <div 
                          className="relative flex-shrink-0 cursor-pointer group/photo"
                          onClick={() => focusAndSelect('input-agent-name', 'photo')}
                          title="Click to change photo / Drag & Drop any image file here!"
                        >
                          <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${colors.gradient} opacity-20 blur-sm`} />
                          
                          <div className={`w-24 h-32 overflow-hidden bg-slate-900 relative shadow-md ${getPhotoShapeClass()} ${themeStyles.photoBorder}`}>
                            <div 
                              className="absolute inset-0 flex items-center justify-center bg-slate-950"
                              style={{
                                backgroundImage: `url(${photoSrc})`,
                                backgroundSize: `${photoZoom}%`,
                                backgroundPosition: `calc(50% + ${photoX}px) calc(50% + ${photoY}px)`,
                                backgroundRepeat: 'no-repeat'
                              }}
                            />
                          </div>

                          {/* Floating inline crop controls overlay */}
                          <div className="absolute inset-x-0 -bottom-2.5 flex items-center justify-center gap-1 opacity-0 group-hover/photo:opacity-100 transition-all bg-slate-950/95 py-1 px-1.5 rounded-full border border-slate-800/80 shadow-xl scale-90 z-20 mx-auto max-w-[130px]">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPhotoZoom(prev => Math.min(250, prev + 10)); }} 
                              className="p-1 hover:bg-slate-800 text-amber-400 rounded transition cursor-pointer" 
                              title="Zoom In"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPhotoZoom(prev => Math.max(100, prev - 10)); }} 
                              className="p-1 hover:bg-slate-800 text-amber-400 rounded transition cursor-pointer" 
                              title="Zoom Out"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPhotoX(prev => prev - 5); }} 
                              className="p-1 hover:bg-slate-800 text-slate-300 rounded transition cursor-pointer" 
                              title="Nudge Left"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPhotoX(prev => prev + 5); }} 
                              className="p-1 hover:bg-slate-800 text-slate-300 rounded transition cursor-pointer" 
                              title="Nudge Right"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPhotoX(0); setPhotoY(0); setPhotoZoom(100); }} 
                              className="p-1 hover:bg-slate-800 text-rose-400 rounded transition cursor-pointer" 
                              title="Reset"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Right Column: Profile & details */}
                        <div className="flex-1 flex flex-col justify-center min-w-0 gap-2 text-left">
                          <div 
                            onClick={() => focusAndSelect('input-agent-name', 'agent')}
                            className="cursor-pointer hover:ring-2 hover:ring-amber-500/40 p-1.5 rounded-lg transition duration-150 group/agent-text relative"
                            title="Click to edit agent credentials"
                          >
                            <h2 className="text-base font-extrabold tracking-tight text-white uppercase truncate max-w-full">
                              {agentName || 'Agent Name'}
                            </h2>
                            <p className={`text-[9.5px] font-bold tracking-widest uppercase mt-0.5 ${themeStyles.textSubheading}`}>
                              {agentTitle || 'Representative'}
                            </p>
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-amber-500 text-slate-950 p-0.5 rounded-full opacity-0 group-hover/agent-text:opacity-100 transition duration-150 shadow-md">
                              <Pencil className="w-2.5 h-2.5" />
                            </div>
                          </div>

                          {/* Credentials layout Grid */}
                          <div 
                            onClick={() => focusAndSelect('input-agent-id', 'agent')}
                            className="grid grid-cols-2 gap-x-3 gap-y-1 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 text-[8.5px] cursor-pointer hover:bg-slate-900/10 transition duration-150 group/security relative"
                            title="Click to edit contact info and employee ID"
                          >
                            <div>
                              <span className={`block text-[6.5px] uppercase font-bold tracking-wider ${themeStyles.labelColor}`}>Employee ID</span>
                              <span className="font-mono font-bold text-white truncate block">{agentId || 'SLR-0000'}</span>
                            </div>
                            <div>
                              <span className={`block text-[6.5px] uppercase font-bold tracking-wider ${themeStyles.labelColor}`}>Phone Number</span>
                              <span className="font-semibold text-slate-200 truncate block">{agentPhone || 'N/A'}</span>
                            </div>
                            <div className="col-span-2 border-t border-slate-800/40 pt-1 mt-0.5">
                              <span className={`block text-[6.5px] uppercase font-bold tracking-wider ${themeStyles.labelColor}`}>Representative Email</span>
                              <span className="text-slate-200 truncate block font-medium">{agentEmail || 'N/A'}</span>
                            </div>
                            <div className="absolute right-1 top-1 bg-amber-500 text-slate-950 p-0.5 rounded-full opacity-0 group-hover/security:opacity-100 transition duration-150 shadow-md z-10">
                              <Pencil className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Export Center (Actions Panel) */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-3" id="export-panel">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Download className="w-4 h-4 text-amber-500" />
              Download & Export Center (High Quality Print-Ready)
            </h3>

            {/* Direct Digital Cards */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportCardPDF}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                id="export-pdf-btn"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                Download ID Card PDF
              </button>
              <button
                onClick={exportPNG}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                id="export-png-btn"
              >
                <Download className="w-4 h-4 text-amber-500" />
                Download ID Card PNG
              </button>
            </div>

            <button
              onClick={exportPrintSheetPDF}
              className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              id="export-sheet-btn"
            >
              <FileText className="w-4 h-4 text-amber-500" />
              US Letter Print Sheet (Full Page)
            </button>
            
            <p className="text-[10px] text-slate-500 text-center italic mt-1 leading-normal">
              CR80 Card PDF prints exactly to size (3.37" x 2.12" / 85.6mm x 54mm) on card printers. US Letter Print Sheet is perfect for easy printing with standard office printers.
            </p>
          </div>

        </div>

      </main>

      {/* --- OFFSCREEN HIDDEN CANVAS: THE US LETTER PRINT SHEET TEMPLATE --- */}
      {/* 
        This is an elegant A4 / US Letter template formatted exactly for standard paper printing.
        It has precise alignment grids, fold guides, cutting crop marks, and detailed instructions!
        This element is hidden by default and only loaded momentarily during sheet rendering.
      */}
      <div 
        ref={printSheetRef}
        className="bg-white text-slate-900 p-12"
        style={{
          display: 'none',
          width: '816px',  // Exactly matches US Letter at 96 DPI
          height: '1056px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
        id="print-sheet-canvas"
      >
        <div className="flex flex-col justify-between h-full border-4 border-slate-300 p-6 rounded-lg relative bg-slate-50/10">
          
          {/* Header instructions block */}
          <div className="text-center border-b-2 border-slate-200 pb-4">
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-widest flex items-center justify-center gap-2">
              ⚡ SOLARIA Representative ID Print Sheet
            </h1>
            <p className="text-[11px] text-slate-500 font-bold tracking-wider mt-1 uppercase">
              US Letter Format • 100% Actual Scale • Print in full color
            </p>
          </div>

          {/* Core centered card canvas alignment tray */}
          <div className="my-auto flex flex-col items-center justify-center gap-12 py-10 relative">
            
            {/* Guidelines banner */}
            <div className="text-center max-w-md bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase block mb-0.5">
                ✂️ Printing & Cutting Instructions:
              </span>
              <p className="text-[9px] text-amber-700 leading-normal">
                Cut along the dotted boundary lines around the card. Slip into a standard 5mil CR80 laminating pouch or dynamic badge holder for instant field-ready use.
              </p>
            </div>

            {/* Grid Container holding front card centered */}
            <div className="flex items-center justify-center p-8 bg-white border border-slate-200 shadow-sm rounded-xl relative">
              
              {/* Outer Cut/Boundary Marker Line */}
              <div className="absolute -inset-1 border border-dashed border-slate-300 pointer-events-none rounded" />

              {/* CARD FRONT RENDER (FOR PRINT SHEET) */}
              <div className="bg-slate-950 text-white rounded-[10px] shadow border border-slate-800/80 overflow-hidden"
                   style={{
                     width: cardOrientation === 'vertical' ? '216px' : '342px',
                     height: cardOrientation === 'vertical' ? '342px' : '216px',
                   }}
              >
                {/* Visual replica of front card */}
                <div className="p-3 flex flex-col h-full justify-between relative text-left">
                  {/* Hologram badge overlay for print */}
                  {showHolo && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 via-pink-400/10 to-amber-300/10 pointer-events-none mix-blend-color-dodge" />
                  )}
                  
                  {/* Top brand */}
                  <div className="flex items-center gap-1.5 border-b border-slate-800/60 pb-1.5">
                    {renderSelectedLogo("w-5.5 h-5.5 flex-shrink-0")}
                    <div className="leading-none min-w-0">
                      <span className="text-[8px] font-black text-white block uppercase tracking-wide truncate">{companyName || 'SOLAR CO'}</span>
                      <span className="text-[5.5px] text-slate-400 block uppercase truncate leading-none mt-0.5">{companySlogan || 'POWERING TOMORROW'}</span>
                    </div>
                  </div>

                  {/* Body headshot */}
                  <div className="flex-1 flex items-center justify-center gap-3 py-2">
                    <div className={`w-14 h-[74px] overflow-hidden bg-slate-900 relative ${getPhotoShapeClass()} ${themeStyles.photoBorder} flex-shrink-0 shadow`}>
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${photoSrc})`,
                          backgroundSize: `${photoZoom}%`,
                          backgroundPosition: `calc(50% + ${photoX / 1.5}px) calc(50% + ${photoY / 1.5}px)`,
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    </div>

                    <div className="min-w-0 leading-tight">
                      <h4 className="text-[10px] font-extrabold text-white uppercase truncate">{agentName || 'NEW AGENT'}</h4>
                      <p className={`text-[6.5px] font-extrabold uppercase tracking-wide ${colors.primary}`}>{agentTitle || 'REPRESENTATIVE'}</p>
                      
                      <div className="mt-1.5 bg-slate-950/60 p-1 rounded text-[5.5px] border border-slate-800">
                        <span className="block text-slate-400">ID: <strong className="text-white font-mono">{agentId || 'SLR-PENDING'}</strong></span>
                        <span className="block text-slate-300">PH: {agentPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Strip */}
                  <div className={`text-[5px] font-bold py-1 text-center border-t border-slate-800/40 rounded uppercase ${colors.badgeBg}`}>
                    ✓ AUTHORIZED REPRESENTATIVE
                  </div>
                </div>
              </div>

            </div>

            <div className="text-center mt-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase">REPRESENTATIVE ID CARD (CR-80 ACTUAL SIZE)</span>
            </div>

          </div>

          {/* Footer print disclaimer info */}
          <div className="border-t-2 border-slate-200 pt-3 flex items-center justify-between text-[9px] text-slate-400 font-medium">
            <span>Corporate Accreditations: Solaria Energy Grid Systems Inc.</span>
            <span>Created via Solaria ID Forge • {new Date().toLocaleDateString()}</span>
          </div>

        </div>
      </div>

    </div>
  );
}

