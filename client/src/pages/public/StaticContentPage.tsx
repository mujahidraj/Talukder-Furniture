import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { COMPANY } from '../../lib/constants';

/* ═══════════════════════════════════════════════════════════════════
   STATIC CONTENT PAGE — Talukder Furniture
   Routes: /warranty, /privacy, /terms, /returns, /shipping, /license
   Each route renders a unique, fully informative page with genuine
   data for a Bangladeshi furniture manufacturer.
   ═══════════════════════════════════════════════════════════════════ */

// ─── Shared Icons (inline SVGs for zero-dependency) ───────────────
const Icons = {
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  check: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  x: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
  ),
  clock: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  truck: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  ),
  lock: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
  file: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  ),
  refresh: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
  ),
  award: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
  ),
  phone: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  ),
  mail: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  ),
  mapPin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
  ),
  tool: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  ),
  box: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  ),
  star: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
  eye: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  alertTriangle: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  zap: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  globe: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  ),
  home: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  chevronRight: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  ),
};

// ─── Shared UI Components ─────────────────────────────────────────
const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; id?: string }> = ({ icon, title, id }) => (
  <div id={id} className="flex items-center gap-3 mb-6 pt-8 first:pt-0 scroll-mt-32">
    <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <h2 className="text-2xl font-serif font-bold text-primary">{title}</h2>
  </div>
);

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; accent?: string }> = ({ icon, title, children, accent = 'bg-primary/5 border-primary/10' }) => (
  <div className={`${accent} border rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:shadow-md transition-shadow duration-300`}>
    <div className="absolute top-0 right-0 w-20 h-20 bg-black/[0.02] rounded-bl-full -z-0 group-hover:w-24 group-hover:h-24 transition-all duration-300" />
    <div className="relative z-10">
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-primary mb-3 font-serif">{title}</h3>
      <div className="text-gray-600 leading-relaxed text-[15px]">{children}</div>
    </div>
  </div>
);

const CheckItem: React.FC<{ children: React.ReactNode; type?: 'check' | 'x' }> = ({ children, type = 'check' }) => (
  <li className="flex items-start gap-3 py-1.5">
    <span className={`flex-shrink-0 mt-0.5 ${type === 'check' ? 'text-green-600' : 'text-red-500'}`}>
      {type === 'check' ? Icons.check : Icons.x}
    </span>
    <span className="text-gray-600">{children}</span>
  </li>
);

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-3 hover:border-gray-200 transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-primary pr-4">{q}</span>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 pb-5 text-gray-600 leading-relaxed text-[15px]">{a}</div>
      </div>
    </div>
  );
};

const ContactCTA: React.FC = () => (
  <div className="mt-16 bg-[#1a1a1a] text-white rounded-2xl p-8 md:p-12 relative overflow-hidden">
    <div className="absolute top-0 right-0 opacity-[0.04]">
      <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    </div>
    <h2 className="text-2xl md:text-3xl font-serif mb-4">Need Further Assistance?</h2>
    <p className="text-gray-300 mb-8 max-w-xl text-[15px] leading-relaxed">
      Our customer service team is ready to help. Reach out to us through any of the channels below, or visit one of our showrooms for in-person assistance.
    </p>
    <div className="flex flex-wrap gap-6 text-sm">
      <a href={`tel:${COMPANY.phone.replace(/\s|-/g, '')}`} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
        {Icons.phone} <span>{COMPANY.phone}</span>
      </a>
      <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
        {Icons.mail} <span>{COMPANY.email}</span>
      </a>
      <Link to="/stores" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
        {Icons.mapPin} <span>Visit Our Showrooms</span>
      </Link>
    </div>
    <div className="mt-6 pt-6 border-t border-white/10">
      <p className="text-gray-400 text-sm">
        <strong className="text-gray-300">Business Hours:</strong> {COMPANY.openTime}
      </p>
    </div>
  </div>
);

const Breadcrumbs: React.FC<{ title: string }> = ({ title }) => (
  <nav className="flex items-center gap-1 text-sm text-gray-400 mb-8" aria-label="Breadcrumb">
    <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
      {Icons.home} Home
    </Link>
    <span>{Icons.chevronRight}</span>
    <span className="text-primary font-medium">{title}</span>
  </nav>
);

const TableOfContents: React.FC<{ sections: { id: string; label: string }[] }> = ({ sections }) => (
  <nav className="hidden lg:block sticky top-28 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">On This Page</h3>
    <ul className="space-y-2.5">
      {sections.map(s => (
        <li key={s.id}>
          <a href={`#${s.id}`} className="text-sm text-gray-500 hover:text-primary transition-colors block">
            {s.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

const StepItem: React.FC<{ step: number; title: string; children: React.ReactNode }> = ({ step, title, children }) => (
  <div className="flex gap-4 md:gap-6 group">
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:scale-110 transition-transform">
        {step}
      </div>
      <div className="w-px flex-1 bg-gray-200 mt-2" />
    </div>
    <div className="pb-8">
      <h4 className="font-bold text-primary mb-1">{title}</h4>
      <p className="text-gray-600 text-[15px] leading-relaxed">{children}</p>
    </div>
  </div>
);


// ═══════════════════════════════════════════════════════════════════
//  WARRANTY INFORMATION PAGE
// ═══════════════════════════════════════════════════════════════════
function WarrantyContent() {
  const toc = [
    { id: 'overview', label: 'Warranty Overview' },
    { id: 'coverage', label: 'Coverage by Category' },
    { id: 'covered', label: "What's Covered" },
    { id: 'not-covered', label: "What's Not Covered" },
    { id: 'claim', label: 'How to File a Claim' },
    { id: 'void', label: 'Warranty Void Conditions' },
    { id: 'faq', label: 'Frequently Asked Questions' },
  ];

  return (
    <div className="flex gap-12">
      <div className="flex-1 min-w-0">
        <Breadcrumbs title="Warranty Information" />

        <SectionTitle icon={Icons.shield} title="Warranty Overview" id="overview" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
          At Talukder Furniture, we take immense pride in the quality and durability of our products. Every piece of furniture that leaves our factory is built to withstand the demands of daily use while maintaining its aesthetic appeal for years. Our comprehensive warranty program reflects our confidence in the materials, workmanship, and engineering that goes into every product we manufacture.
        </p>
        <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
          This warranty is provided by <strong>Talukder Group of Industries</strong>, a leading furniture manufacturer in Bangladesh. All warranty terms comply with the <strong>Bangladesh Consumer Rights Protection Act, 2009</strong> (ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯) and are enforceable under the laws of the People's Republic of Bangladesh.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <p className="text-amber-800 text-sm leading-relaxed">
            <strong>Important:</strong> Please retain your original purchase receipt or invoice. A valid proof of purchase is required for all warranty claims. The warranty period begins from the date of delivery as recorded in our system.
          </p>
        </div>

        <SectionTitle icon={Icons.clock} title="Warranty Coverage by Product Category" id="coverage" />
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="text-left p-4 rounded-tl-xl font-semibold">Product Category</th>
                <th className="text-left p-4 font-semibold">Structural Warranty</th>
                <th className="text-left p-4 font-semibold">Surface/Finish Warranty</th>
                <th className="text-left p-4 rounded-tr-xl font-semibold">Mechanism/Hardware</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Wooden Furniture (Solid Wood)', '10 Years', '3 Years', '5 Years'],
                ['Engineered Wood / MDF / Particle Board', '5 Years', '2 Years', '3 Years'],
                ['Plastic / Molded Furniture', '5 Years', '2 Years', 'N/A'],
                ['Steel / Metal Furniture', '10 Years', '3 Years (Powder Coating)', '5 Years'],
                ['Upholstered / Sofa Sets', '5 Years (Frame)', '1 Year (Fabric/Leather)', '3 Years (Recliner)'],
                ['Office Chairs (Revolving)', '5 Years (Frame)', '1 Year (Mesh/Fabric)', '3 Years (Gas Lift/Tilt)'],
                ['Mattresses', '5 Years', '1 Year (Cover)', 'N/A'],
                ['Kids Collection', '5 Years', '2 Years', '3 Years'],
                ['Institutional / Hospital Furniture', '7 Years', '3 Years', '5 Years'],
              ].map(([cat, structural, surface, mechanism], i) => (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-primary/[0.03] transition-colors`}>
                  <td className="p-4 font-medium text-primary">{cat}</td>
                  <td className="p-4 text-gray-600">{structural}</td>
                  <td className="p-4 text-gray-600">{surface}</td>
                  <td className="p-4 text-gray-600">{mechanism}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SectionTitle icon={Icons.check} title="What Is Covered" id="covered" />
        <ul className="space-y-1 mb-8 list-none">
          <CheckItem>Manufacturing defects in materials or workmanship visible under normal use</CheckItem>
          <CheckItem>Structural failure of joints, frames, or load-bearing components under normal conditions</CheckItem>
          <CheckItem>Defects in welding, riveting, or fastening that compromise product integrity</CheckItem>
          <CheckItem>Mechanical failure of moving parts (drawer slides, hinges, gas lifts, recliner mechanisms) under normal use</CheckItem>
          <CheckItem>Warping, splitting, or cracking of solid wood beyond natural settling (greater than 3mm)</CheckItem>
          <CheckItem>Delamination or peeling of veneer, laminate, or melamine surfaces due to adhesive failure</CheckItem>
          <CheckItem>Powder coating or paint defects including premature flaking, bubbling, or corrosion under normal indoor conditions</CheckItem>
          <CheckItem>Spring or foam failure in upholstered products resulting in loss of support within the warranty period</CheckItem>
          <CheckItem>Hardware malfunction (locks, casters, adjustable feet) during normal operation</CheckItem>
        </ul>

        <SectionTitle icon={Icons.x} title="What Is NOT Covered" id="not-covered" />
        <ul className="space-y-1 mb-8 list-none">
          <CheckItem type="x">Normal wear and tear including fading, pilling, or softening that occurs with regular use over time</CheckItem>
          <CheckItem type="x">Damage caused by misuse, abuse, accidents, or use beyond the product's intended purpose or weight capacity</CheckItem>
          <CheckItem type="x">Damage resulting from exposure to excessive moisture, humidity, direct sunlight, or extreme temperatures</CheckItem>
          <CheckItem type="x">Stains, scratches, dents, or cosmetic damage caused after delivery</CheckItem>
          <CheckItem type="x">Damage caused by improper assembly if the product was self-assembled against provided instructions</CheckItem>
          <CheckItem type="x">Modifications, repairs, or alterations made by unauthorized parties or third-party service providers</CheckItem>
          <CheckItem type="x">Products used in commercial or industrial settings unless explicitly rated for commercial use</CheckItem>
          <CheckItem type="x">Natural characteristics of wood such as grain variation, minor color differences, or small knots (these are features, not defects)</CheckItem>
          <CheckItem type="x">Damage caused by pests, termites, floods, fire, or any natural disaster / force majeure</CheckItem>
          <CheckItem type="x">Products purchased from unauthorized dealers or resellers</CheckItem>
        </ul>

        <SectionTitle icon={Icons.tool} title="How to File a Warranty Claim" id="claim" />
        <div className="space-y-0 mb-8">
          <StepItem step={1} title="Contact Our Support Team">
            Reach out to us via phone at <strong>{COMPANY.phone}</strong>, email at <strong>{COMPANY.email}</strong>, or visit any of our authorized showrooms. Our support team is available Saturday through Thursday, 9:00 AM to 6:00 PM (BST).
          </StepItem>
          <StepItem step={2} title="Provide Required Documentation">
            Have your original purchase receipt or invoice number ready. You will need to provide your full name, contact number, the product name or SKU, and a description of the issue.
          </StepItem>
          <StepItem step={3} title="Submit Visual Evidence">
            Take clear photographs of the defect from multiple angles. Include a wide shot showing the full product and close-up shots of the specific issue. Video may be requested for mechanical issues.
          </StepItem>
          <StepItem step={4} title="Inspection & Assessment">
            Our quality team will review your claim within 3–5 business days. For complex cases, we may schedule an in-person inspection at your location, free of charge within Dhaka metropolitan area.
          </StepItem>
          <StepItem step={5} title="Resolution">
            If the claim is approved, we will offer repair, replacement of the defective part, or full product replacement depending on the nature and severity of the issue. Repairs are typically completed within 7–14 business days.
          </StepItem>
        </div>

        <SectionTitle icon={Icons.alertTriangle} title="Conditions That Void the Warranty" id="void" />
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 md:p-8 mb-8">
          <ul className="space-y-3 text-red-800 text-[15px]">
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 flex-shrink-0">{Icons.x}</span>
              <span>Removing, altering, or defacing the warranty label, serial number sticker, or product identification tag</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 flex-shrink-0">{Icons.x}</span>
              <span>Unauthorized repair or modification by any person not authorized by Talukder Furniture</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 flex-shrink-0">{Icons.x}</span>
              <span>Using the product in a manner inconsistent with the provided care instructions or user manual</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 flex-shrink-0">{Icons.x}</span>
              <span>Failure to provide valid proof of purchase or if the product was purchased from an unauthorized channel</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 flex-shrink-0">{Icons.x}</span>
              <span>Using residential-grade furniture in commercial, institutional, or industrial settings beyond its rated capacity</span>
            </li>
          </ul>
        </div>

        <SectionTitle icon={Icons.star} title="Frequently Asked Questions" id="faq" />
        <div className="mb-4">
          <FaqItem q="Does the warranty transfer if I sell or gift the furniture?" a="No. The warranty is valid only for the original purchaser and is non-transferable. It is tied to the original purchase receipt and the registered customer information in our system." />
          <FaqItem q="I lost my receipt. Can I still claim warranty?" a="We maintain digital records of all purchases made through our showrooms and website. Contact us with your name, phone number, and approximate date of purchase, and we will attempt to locate your order in our system. Without any verifiable proof of purchase, warranty claims cannot be processed." />
          <FaqItem q="Do you provide on-site repair or do I need to bring the product to your store?" a="For large furniture items (beds, wardrobes, dining sets), we provide on-site repair service free of charge within Dhaka metropolitan area. For other regions, transportation charges may apply. Small items like chairs may need to be brought to our nearest service center." />
          <FaqItem q="How long does a warranty repair typically take?" a="Most repairs are completed within 7–14 business days from the date of claim approval. If replacement parts need to be manufactured, it may take up to 21 business days. We will keep you informed of the progress throughout the process." />
          <FaqItem q="What happens if my product model is discontinued?" a="If your exact product is discontinued and a replacement is needed, we will offer you a comparable or upgraded product from our current collection at no additional cost. If no suitable replacement exists, a store credit equal to the original purchase value will be issued." />
        </div>

        <ContactCTA />
      </div>
      <div className="hidden lg:block w-56 flex-shrink-0">
        <TableOfContents sections={toc} />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
//  PRIVACY POLICY PAGE
// ═══════════════════════════════════════════════════════════════════
function PrivacyContent() {
  const toc = [
    { id: 'info-collect', label: 'Information We Collect' },
    { id: 'how-use', label: 'How We Use Information' },
    { id: 'data-sharing', label: 'Data Sharing' },
    { id: 'cookies', label: 'Cookies & Tracking' },
    { id: 'data-security', label: 'Data Security' },
    { id: 'your-rights', label: 'Your Rights' },
    { id: 'children', label: "Children's Privacy" },
    { id: 'retention', label: 'Data Retention' },
    { id: 'updates', label: 'Policy Updates' },
    { id: 'contact-privacy', label: 'Contact Us' },
  ];

  return (
    <div className="flex gap-12">
      <div className="flex-1 min-w-0">
        <Breadcrumbs title="Privacy Policy" />

        <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
          Talukder Group of Industries ("we", "our", "us") is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>talukder-furniture.com</strong>, visit our physical showrooms, or interact with our services. This policy complies with the <strong>Bangladesh Digital Security Act, 2018</strong> (ডিজিটাল নিরাপত্তা আইন, ২০১৮) and the <strong>Bangladesh Information and Communication Technology Act, 2006</strong>.
        </p>
        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          By using our website or services, you consent to the data practices described in this policy. If you do not agree with this policy, please do not use our website or services.
        </p>

        <SectionTitle icon={Icons.eye} title="Information We Collect" id="info-collect" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <InfoCard icon={Icons.users} title="Personal Information You Provide">
            <ul className="space-y-2 mt-2">
              <li>• Full name and contact details (phone number, email address)</li>
              <li>• Delivery address and billing information</li>
              <li>• Messages or inquiries submitted through our contact form, FAQ form, or product enquiry form</li>
              <li>• Job applications submitted through our career portal (CV, qualifications, work history)</li>
              <li>• Any other information you voluntarily provide when communicating with us</li>
            </ul>
          </InfoCard>
          <InfoCard icon={Icons.globe} title="Information Collected Automatically">
            <ul className="space-y-2 mt-2">
              <li>• IP address, browser type, and operating system</li>
              <li>• Pages visited, time spent on pages, and navigation paths</li>
              <li>• Referring website URL and search terms used to find our site</li>
              <li>• Device type (desktop, mobile, tablet) and screen resolution</li>
              <li>• Date and time of access</li>
            </ul>
          </InfoCard>
        </div>

        <SectionTitle icon={Icons.file} title="How We Use Your Information" id="how-use" />
        <div className="space-y-4 mb-8">
          {[
            { title: 'Order & Inquiry Processing', desc: 'To process your product inquiries, respond to contact form submissions, schedule showroom visits, and coordinate delivery of furniture to your specified address.' },
            { title: 'Customer Communication', desc: 'To send you order updates, delivery notifications, and respond to your questions or complaints. We may also send product recommendations and promotional offers if you have opted in.' },
            { title: 'Website Improvement', desc: 'To analyze usage patterns and improve our website functionality, user experience, and content. This includes understanding which products are most viewed and how visitors navigate our catalog.' },
            { title: 'Legal Compliance', desc: 'To comply with applicable laws, regulations, and legal processes under Bangladeshi law, including tax obligations and consumer protection requirements.' },
            { title: 'Security & Fraud Prevention', desc: 'To protect our website, business operations, and users from unauthorized access, fraud, and other security threats.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100/80 transition-colors">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-1">{item.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <SectionTitle icon={Icons.users} title="Data Sharing & Third Parties" id="data-sharing" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          We do <strong>not sell, trade, or rent</strong> your personal information to third parties. We may share your information only in the following limited circumstances:
        </p>
        <ul className="space-y-1 mb-8 list-none">
          <CheckItem><strong>Delivery Partners:</strong> We share your name, address, and phone number with our logistics and delivery partners solely for the purpose of delivering your furniture order.</CheckItem>
          <CheckItem><strong>Payment Processors:</strong> If online payment is used, your payment information is processed securely by PCI-DSS compliant third-party payment gateways. We do not store your credit/debit card details on our servers.</CheckItem>
          <CheckItem><strong>Analytics Providers:</strong> We use Google Analytics to understand website traffic patterns. Google Analytics collects anonymized usage data subject to Google's own privacy policy.</CheckItem>
          <CheckItem><strong>Legal Requirements:</strong> We may disclose your information if required by law, court order, or government authority under the laws of Bangladesh.</CheckItem>
          <CheckItem><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, customer data may be transferred as part of the business assets, with continued privacy protection.</CheckItem>
        </ul>

        <SectionTitle icon={Icons.lock} title="Cookies & Tracking Technologies" id="cookies" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          Our website uses cookies and similar technologies to enhance your browsing experience. Cookies are small text files stored on your device that help us recognize you on return visits and understand how you use our site.
        </p>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="text-left p-4 rounded-tl-xl font-semibold">Cookie Type</th>
                <th className="text-left p-4 font-semibold">Purpose</th>
                <th className="text-left p-4 rounded-tr-xl font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Essential', 'Required for basic website functionality (session management, security tokens, admin authentication)', 'Session / 30 days'],
                ['Functional', 'Remembers your preferences such as wishlist items, recently viewed products, and grid layout settings', 'Up to 1 year'],
                ['Analytics', 'Helps us understand visitor behavior through anonymized statistics (page views, session duration, bounce rate)', 'Up to 2 years'],
              ].map(([type, purpose, duration], i) => (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-primary">{type}</td>
                  <td className="p-4 text-gray-600">{purpose}</td>
                  <td className="p-4 text-gray-600">{duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          You can control cookies through your browser settings. Disabling essential cookies may affect website functionality. We do not use cookies for intrusive advertising or cross-site tracking.
        </p>

        <SectionTitle icon={Icons.shield} title="Data Security" id="data-security" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Icons.lock, title: 'Encryption', desc: 'All data transmitted between your browser and our servers is encrypted using industry-standard TLS/SSL encryption (HTTPS).' },
            { icon: Icons.shield, title: 'Access Control', desc: 'Access to personal data is restricted to authorized personnel only, protected by role-based authentication and strong password policies.' },
            { icon: Icons.tool, title: 'Regular Audits', desc: 'We regularly review our data collection, storage, and processing practices, and update our security measures against new vulnerabilities.' },
          ].map((item, i) => (
            <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center mx-auto mb-3">{item.icon}</div>
              <h4 className="font-bold text-primary text-sm mb-2">{item.title}</h4>
              <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <SectionTitle icon={Icons.users} title="Your Rights" id="your-rights" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          Under applicable Bangladeshi law and in alignment with international best practices, you have the following rights regarding your personal data:
        </p>
        <ul className="space-y-1 mb-8 list-none">
          <CheckItem><strong>Right to Access:</strong> You may request a copy of the personal data we hold about you at any time.</CheckItem>
          <CheckItem><strong>Right to Correction:</strong> You may request correction of any inaccurate or incomplete data we have about you.</CheckItem>
          <CheckItem><strong>Right to Deletion:</strong> You may request deletion of your personal data, subject to any legal obligations that require us to retain certain information.</CheckItem>
          <CheckItem><strong>Right to Opt-Out:</strong> You may opt out of receiving promotional communications at any time by contacting us or using the unsubscribe mechanism in our communications.</CheckItem>
          <CheckItem><strong>Right to Complain:</strong> You have the right to lodge a complaint with the relevant regulatory authority if you believe your data has been mishandled.</CheckItem>
        </ul>
        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          To exercise any of these rights, please contact us at <strong>{COMPANY.email}</strong> or <strong>{COMPANY.phone}</strong>. We will respond to your request within 30 business days.
        </p>

        <SectionTitle icon={Icons.users} title="Children's Privacy" id="children" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal data, please contact us immediately and we will take steps to delete such information from our records.
        </p>

        <SectionTitle icon={Icons.clock} title="Data Retention" id="retention" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy:</p>
        <ul className="space-y-1 mb-8 list-none">
          <CheckItem><strong>Customer inquiries and leads:</strong> Retained for 2 years from the date of last interaction, then anonymized or deleted.</CheckItem>
          <CheckItem><strong>Order and transaction records:</strong> Retained for 6 years to comply with Bangladesh tax and accounting regulations (Income Tax Ordinance, 1984 and VAT and Supplementary Duty Act, 2012).</CheckItem>
          <CheckItem><strong>Job applications:</strong> Retained for 1 year from the date of application for future openings, unless you request earlier deletion.</CheckItem>
          <CheckItem><strong>Website analytics data:</strong> Anonymized data is retained indefinitely. Identifiable session data is purged after 26 months.</CheckItem>
        </ul>

        <SectionTitle icon={Icons.refresh} title="Changes to This Policy" id="updates" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will update the "Last Updated" date at the top of this page. We encourage you to review this policy periodically. Continued use of our website after any modifications constitutes your acceptance of the updated policy.
        </p>

        <SectionTitle icon={Icons.mail} title="Contact Us About Privacy" id="contact-privacy" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection team:
        </p>
        <div className="bg-gray-50 rounded-xl p-6 mb-4 text-[15px]">
          <p className="font-bold text-primary mb-2">Talukder Group of Industries — Data Protection</p>
          <p className="text-gray-600">Address: {COMPANY.address}</p>
          <p className="text-gray-600">Phone: {COMPANY.phone}</p>
          <p className="text-gray-600">Email: {COMPANY.email}</p>
          <p className="text-gray-600">Business Hours: {COMPANY.openTime}</p>
        </div>

        <ContactCTA />
      </div>
      <div className="hidden lg:block w-56 flex-shrink-0">
        <TableOfContents sections={toc} />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
//  TERMS & CONDITIONS PAGE
// ═══════════════════════════════════════════════════════════════════
function TermsContent() {
  const toc = [
    { id: 'acceptance', label: 'Acceptance of Terms' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'products', label: 'Products & Pricing' },
    { id: 'orders', label: 'Orders & Payment' },
    { id: 'ip', label: 'Intellectual Property' },
    { id: 'prohibited', label: 'Prohibited Conduct' },
    { id: 'liability', label: 'Limitation of Liability' },
    { id: 'governing', label: 'Governing Law' },
    { id: 'disputes', label: 'Dispute Resolution' },
    { id: 'misc', label: 'Miscellaneous' },
  ];

  return (
    <div className="flex gap-12">
      <div className="flex-1 min-w-0">
        <Breadcrumbs title="Terms & Conditions" />

        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          These Terms and Conditions ("Terms") govern your access to and use of the Talukder Furniture website (<strong>talukder-furniture.com</strong>) and all related services provided by Talukder Group of Industries. Please read these Terms carefully before using our website. By accessing or using our website, you agree to be bound by these Terms. If you do not agree, you must not use our website.
        </p>

        <SectionTitle icon={Icons.file} title="1. Acceptance of Terms" id="acceptance" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          By accessing, browsing, or using this website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our <Link to="/privacy" className="text-primary underline font-medium hover:text-black">Privacy Policy</Link>, <Link to="/shipping" className="text-primary underline font-medium hover:text-black">Shipping Policy</Link>, <Link to="/returns" className="text-primary underline font-medium hover:text-black">Return & Exchange Policy</Link>, and <Link to="/warranty" className="text-primary underline font-medium hover:text-black">Warranty Information</Link>, all of which are incorporated herein by reference.
        </p>
        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the website following any changes constitutes your acceptance of the revised Terms. We recommend reviewing this page periodically.
        </p>

        <SectionTitle icon={Icons.users} title="2. Eligibility" id="eligibility" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          You must be at least 18 years of age to use this website independently or place product inquiries. Individuals under 18 may use the website only under the supervision and consent of a parent or legal guardian. By using this website, you represent and warrant that you meet these age requirements. If you are placing an inquiry on behalf of a company or organization, you represent that you have the authority to bind that entity to these Terms.
        </p>

        <SectionTitle icon={Icons.box} title="3. Products & Pricing" id="products" />
        <div className="space-y-4 mb-8">
          <p className="text-gray-600 text-[15px] leading-relaxed">
            <strong>Product Information:</strong> We make every reasonable effort to ensure that product descriptions, images, specifications, and dimensions displayed on our website are accurate. However, we do not warrant that product descriptions or other content are 100% accurate, complete, or error-free. Colors may vary slightly due to monitor settings and photography lighting. Actual product dimensions may have a tolerance of ±2% from stated specifications.
          </p>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            <strong>Pricing:</strong> All prices displayed on our website are in Bangladeshi Taka (৳ BDT) and include applicable Value Added Tax (VAT) at the prevailing rate as per the VAT and Supplementary Duty Act, 2012, unless stated otherwise. Prices are subject to change without prior notice. The price applicable to your order will be the price at the time of order confirmation. We reserve the right to correct any pricing errors.
          </p>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            <strong>Availability:</strong> Product availability is subject to change. We display stock status in good faith, but cannot guarantee that all items shown as available will remain in stock at the time of your inquiry. For made-to-order items, estimated production timelines will be communicated at the time of order confirmation.
          </p>
        </div>

        <SectionTitle icon={Icons.file} title="4. Orders & Payment" id="orders" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          <strong>Inquiry-Based Model:</strong> Talukder Furniture currently operates on an inquiry-based model. Product orders are placed through our showrooms or via direct communication with our sales team after submitting an inquiry through the website. An inquiry submitted via our website does not constitute a binding order or contract.
        </p>
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          <strong>Order Confirmation:</strong> A binding purchase agreement is created only when our sales team confirms your order in writing (via SMS, email, or printed invoice) and a payment has been received per the agreed terms. We reserve the right to decline any order for any reason, including product unavailability or suspected fraudulent activity.
        </p>
        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          <strong>Payment Methods:</strong> We accept cash on delivery, bank transfer (NPSB/BEFTN), mobile banking (bKash, Nagad, Rocket), and credit/debit cards at our showrooms. Payment terms and applicable advance amounts are communicated by our sales team at the time of order confirmation. All payments must be made in BDT.
        </p>

        <SectionTitle icon={Icons.shield} title="5. Intellectual Property" id="ip" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          All content on this website — including but not limited to text, graphics, logos, product images, product designs, icons, page layouts, software, and the compilation thereof — is the property of Talukder Group of Industries or its content suppliers and is protected by the <strong>Copyright Act, 2000 (Bangladesh)</strong> and international copyright laws.
        </p>
        <ul className="space-y-1 mb-8 list-none">
          <CheckItem type="x">Reproducing, distributing, modifying, or publicly displaying any content from this website without express written consent</CheckItem>
          <CheckItem type="x">Using our trade name, trademark, logo, or product designs for any commercial purpose</CheckItem>
          <CheckItem type="x">Using data mining, robots, scraping, or similar data gathering tools on our website</CheckItem>
          <CheckItem type="x">Creating derivative works based on our product designs or website content</CheckItem>
          <CheckItem type="x">Framing or mirroring any portion of this website on another website</CheckItem>
        </ul>
        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          The Talukder Furniture name, logo, and all related product names, design marks, and slogans are registered trademarks of Talukder Group of Industries. Unauthorized use constitutes trademark infringement and unfair competition under the <strong>Trademarks Act, 2009 (Bangladesh)</strong>.
        </p>

        <SectionTitle icon={Icons.alertTriangle} title="6. Prohibited Conduct" id="prohibited" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">You agree not to:</p>
        <ul className="space-y-1 mb-8 list-none">
          <CheckItem type="x">Use the website for any unlawful purpose or in violation of any applicable local, national, or international law</CheckItem>
          <CheckItem type="x">Attempt to gain unauthorized access to our servers, databases, or admin systems</CheckItem>
          <CheckItem type="x">Transmit any viruses, malware, or harmful code through the website</CheckItem>
          <CheckItem type="x">Submit false, misleading, or fraudulent inquiries or personal information</CheckItem>
          <CheckItem type="x">Interfere with or disrupt the operation of the website or servers</CheckItem>
          <CheckItem type="x">Harass, threaten, or abuse our staff through any communication channel</CheckItem>
          <CheckItem type="x">Use automated tools to mass-download product images, descriptions, or pricing data</CheckItem>
        </ul>

        <SectionTitle icon={Icons.shield} title="7. Limitation of Liability" id="liability" />
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
            To the maximum extent permitted by the laws of Bangladesh, Talukder Group of Industries, its directors, officers, employees, and agents shall not be liable for:
          </p>
          <ul className="space-y-2 text-gray-700 text-[15px]">
            <li>• Any indirect, incidental, consequential, special, or punitive damages arising from your use or inability to use the website</li>
            <li>• Any loss of data, profits, revenue, or business opportunities</li>
            <li>• Any errors, inaccuracies, or omissions in product descriptions, pricing, or availability</li>
            <li>• Any unauthorized access to or alteration of your personal data</li>
            <li>• Any damage resulting from third-party content, links, or services referenced on our website</li>
          </ul>
          <p className="text-gray-700 text-[15px] leading-relaxed mt-3">
            Our total liability for any claim related to our products or services shall not exceed the amount you actually paid for the specific product giving rise to the claim.
          </p>
        </div>

        <SectionTitle icon={Icons.globe} title="8. Governing Law" id="governing" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          These Terms shall be governed by and construed in accordance with the laws of the People's Republic of Bangladesh, without regard to conflict of law principles. Any legal action or proceeding arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Dhaka, Bangladesh.
        </p>

        <SectionTitle icon={Icons.file} title="9. Dispute Resolution" id="disputes" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          In the event of any dispute arising out of or in connection with these Terms, the parties shall first attempt to resolve the matter amicably through good-faith negotiations within 30 days. If the dispute cannot be resolved through negotiation, either party may pursue resolution through:
        </p>
        <ul className="space-y-1 mb-8 list-none">
          <CheckItem><strong>Consumer Complaint:</strong> You may file a complaint with the National Consumer Rights Protection Directorate (জাতীয় ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর) under the Consumer Rights Protection Act, 2009.</CheckItem>
          <CheckItem><strong>Mediation/Arbitration:</strong> The parties may agree to resolve the dispute through arbitration under the Arbitration Act, 2001 (Bangladesh), with the seat of arbitration in Dhaka.</CheckItem>
          <CheckItem><strong>Litigation:</strong> Either party may commence proceedings in the competent courts of Dhaka, Bangladesh.</CheckItem>
        </ul>

        <SectionTitle icon={Icons.file} title="10. Miscellaneous" id="misc" />
        <div className="space-y-4 mb-8">
          <p className="text-gray-600 text-[15px] leading-relaxed">
            <strong>Severability:</strong> If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect.
          </p>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            <strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, Shipping Policy, Return Policy, and Warranty Information, constitute the entire agreement between you and Talukder Group of Industries regarding your use of the website.
          </p>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            <strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision.
          </p>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            <strong>Force Majeure:</strong> We shall not be liable for any delay or failure in performance resulting from causes beyond our reasonable control, including but not limited to natural disasters, pandemics, war, government actions, hartals/strikes, or infrastructure failures.
          </p>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            <strong>Assignment:</strong> You may not assign or transfer your rights under these Terms without our prior written consent. We may freely assign our rights and obligations under these Terms.
          </p>
        </div>

        <ContactCTA />
      </div>
      <div className="hidden lg:block w-56 flex-shrink-0">
        <TableOfContents sections={toc} />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
//  RETURNS & EXCHANGES PAGE
// ═══════════════════════════════════════════════════════════════════
function ReturnsContent() {
  const toc = [
    { id: 'return-policy', label: 'Return Policy' },
    { id: 'eligibility-returns', label: 'Eligibility Criteria' },
    { id: 'non-returnable', label: 'Non-Returnable Items' },
    { id: 'exchange-process', label: 'Exchange Process' },
    { id: 'return-steps', label: 'How to Return' },
    { id: 'refunds', label: 'Refunds' },
    { id: 'damaged', label: 'Damaged/Defective Items' },
    { id: 'return-faq', label: 'FAQ' },
  ];

  return (
    <div className="flex gap-12">
      <div className="flex-1 min-w-0">
        <Breadcrumbs title="Returns & Exchanges" />

        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          At Talukder Furniture, we stand behind the quality of every product we deliver. We understand that choosing furniture is a significant decision, and we want you to be completely satisfied with your purchase. This policy outlines our return and exchange process in compliance with the <strong>Bangladesh Consumer Rights Protection Act, 2009</strong>.
        </p>

        <SectionTitle icon={Icons.refresh} title="14-Day Return Policy" id="return-policy" />
        <div className="bg-primary text-white rounded-2xl p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-[0.06]">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </div>
          <h3 className="text-3xl font-serif mb-4">14-Day Return Window</h3>
          <p className="text-white/80 text-[15px] leading-relaxed max-w-2xl">
            You have <strong className="text-white">14 calendar days</strong> from the date of delivery to return an eligible item. The return period begins on the day you receive the product, as confirmed by our delivery records. Returns requested after this period will not be accepted.
          </p>
        </div>

        <SectionTitle icon={Icons.check} title="Return Eligibility Criteria" id="eligibility-returns" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">To qualify for a return, all of the following conditions must be met:</p>
        <ul className="space-y-1 mb-8 list-none">
          <CheckItem>The item must be in its <strong>original, unused, and unassembled</strong> condition</CheckItem>
          <CheckItem>The item must be in its <strong>original packaging</strong> with all tags, labels, and protective materials intact</CheckItem>
          <CheckItem>All included accessories, hardware, assembly tools, and instruction manuals must be present</CheckItem>
          <CheckItem>The return request must be initiated within <strong>14 calendar days</strong> of delivery</CheckItem>
          <CheckItem>You must provide the <strong>original purchase receipt or invoice number</strong></CheckItem>
          <CheckItem>The item must not show any signs of use, wear, stains, scratches, or assembly marks</CheckItem>
        </ul>

        <SectionTitle icon={Icons.x} title="Non-Returnable Items" id="non-returnable" />
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 md:p-8 mb-8">
          <p className="text-red-800 text-[15px] leading-relaxed mb-4">The following items cannot be returned or exchanged under any circumstances:</p>
          <ul className="space-y-2 text-red-800 text-[15px]">
            <li className="flex items-start gap-3"><span className="text-red-400 mt-0.5 flex-shrink-0">{Icons.x}</span><span><strong>Custom-made or made-to-order furniture</strong> — Products manufactured to your specific dimensions, color, or material specifications</span></li>
            <li className="flex items-start gap-3"><span className="text-red-400 mt-0.5 flex-shrink-0">{Icons.x}</span><span><strong>Assembled furniture</strong> — Products that have been fully or partially assembled by you or a third party (White Glove assembly by our team is excepted)</span></li>
            <li className="flex items-start gap-3"><span className="text-red-400 mt-0.5 flex-shrink-0">{Icons.x}</span><span><strong>Clearance and final sale items</strong> — Products marked as "Clearance", "Final Sale", or sold at a discount greater than 40%</span></li>
            <li className="flex items-start gap-3"><span className="text-red-400 mt-0.5 flex-shrink-0">{Icons.x}</span><span><strong>Mattresses with removed packaging</strong> — Due to hygiene regulations, mattresses cannot be returned once the sealed packaging has been opened</span></li>
            <li className="flex items-start gap-3"><span className="text-red-400 mt-0.5 flex-shrink-0">{Icons.x}</span><span><strong>Products with visible signs of use</strong> — Items showing scratches, stains, odors, pet hair, or any other evidence of use</span></li>
            <li className="flex items-start gap-3"><span className="text-red-400 mt-0.5 flex-shrink-0">{Icons.x}</span><span><strong>Gift cards and vouchers</strong> — Non-refundable after purchase</span></li>
          </ul>
        </div>

        <SectionTitle icon={Icons.refresh} title="Exchange Process" id="exchange-process" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <InfoCard icon={Icons.refresh} title="Size/Color Exchange">
            <p>If a product doesn't fit your space or you'd prefer a different color variant, we offer a one-time exchange within 14 days. The replacement must be of equal or greater value (you pay the difference for higher-value items).</p>
          </InfoCard>
          <InfoCard icon={Icons.tool} title="Defective Replacement">
            <p>If your product has a manufacturing defect, we will replace it free of charge regardless of the return window. This is covered under our <Link to="/warranty" className="text-primary underline font-medium">Warranty Policy</Link>. No restocking fee applies.</p>
          </InfoCard>
          <InfoCard icon={Icons.box} title="Damaged in Transit">
            <p>If your furniture arrives damaged during delivery, please refuse the delivery or report it within 48 hours with photographs. We will arrange an immediate replacement or full refund at your choice.</p>
          </InfoCard>
        </div>

        <SectionTitle icon={Icons.truck} title="How to Initiate a Return" id="return-steps" />
        <div className="space-y-0 mb-8">
          <StepItem step={1} title="Contact Us Within 14 Days">
            Call us at <strong>{COMPANY.phone}</strong> or email <strong>{COMPANY.email}</strong> with your order/invoice number and reason for return. Our team will verify your eligibility and provide a Return Authorization Number (RAN).
          </StepItem>
          <StepItem step={2} title="Prepare the Item">
            Repack the item in its original packaging with all accessories, tags, and protective materials. Write the Return Authorization Number clearly on the outside of the package. Do not use the product packaging as the shipping box — wrap it in an outer carton.
          </StepItem>
          <StepItem step={3} title="Schedule Pickup or Drop-off">
            For Dhaka metropolitan area, we will arrange a free pickup from your address within 3–5 business days. For other areas, you may drop the item at your nearest Talukder Furniture showroom, or we can arrange third-party pickup at the customer's cost.
          </StepItem>
          <StepItem step={4} title="Quality Inspection">
            Upon receiving the returned item, our quality team will inspect it within 2–3 business days to verify it meets the return eligibility criteria. You will be notified of the inspection result via SMS and email.
          </StepItem>
          <StepItem step={5} title="Refund or Exchange Processing">
            If approved, your refund or exchange will be processed within 7–10 business days from the date of inspection approval. You will receive confirmation once the refund has been initiated.
          </StepItem>
        </div>

        <SectionTitle icon={Icons.file} title="Refund Information" id="refunds" />
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="text-left p-4 rounded-tl-xl font-semibold">Payment Method</th>
                <th className="text-left p-4 font-semibold">Refund Method</th>
                <th className="text-left p-4 rounded-tr-xl font-semibold">Processing Time</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Cash on Delivery', 'Bank transfer to your provided account or bKash/Nagad', '7–10 business days'],
                ['Bank Transfer (NPSB/BEFTN)', 'Refund to original bank account', '7–10 business days'],
                ['bKash / Nagad / Rocket', 'Refund to original mobile wallet', '5–7 business days'],
                ['Credit/Debit Card (at showroom)', 'Refund to original card', '10–15 business days (depends on issuing bank)'],
              ].map(([method, refundMethod, time], i) => (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-primary">{method}</td>
                  <td className="p-4 text-gray-600">{refundMethod}</td>
                  <td className="p-4 text-gray-600">{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <p className="text-amber-800 text-sm leading-relaxed">
            <strong>Restocking Fee:</strong> A restocking fee of <strong>10%</strong> of the product price may apply to returns that are not due to manufacturing defects or damage during delivery. This fee covers the cost of quality inspection, repackaging, and restocking. Defective product returns and exchanges are exempt from restocking fees.
          </p>
        </div>

        <SectionTitle icon={Icons.alertTriangle} title="Damaged or Defective Items" id="damaged" />
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 md:p-8 mb-8">
          <h4 className="font-bold text-green-900 mb-3 text-lg">Expedited Resolution for Damaged/Defective Products</h4>
          <p className="text-green-800 text-[15px] leading-relaxed mb-4">
            If your product arrives damaged during transit or has a manufacturing defect visible upon delivery:
          </p>
          <ul className="space-y-2 text-green-800 text-[15px]">
            <li className="flex items-start gap-3"><span className="text-green-600 mt-0.5 flex-shrink-0">{Icons.check}</span><span><strong>During Delivery:</strong> You may refuse the delivery. Our delivery team will note the issue, and we will schedule a replacement delivery at no cost.</span></li>
            <li className="flex items-start gap-3"><span className="text-green-600 mt-0.5 flex-shrink-0">{Icons.check}</span><span><strong>Within 48 Hours:</strong> Contact us with clear photographs showing the damage. We will arrange an immediate replacement or full refund — your choice.</span></li>
            <li className="flex items-start gap-3"><span className="text-green-600 mt-0.5 flex-shrink-0">{Icons.check}</span><span><strong>After 48 Hours but Within 14 Days:</strong> Standard return process applies, but no restocking fee will be charged for verified defects.</span></li>
            <li className="flex items-start gap-3"><span className="text-green-600 mt-0.5 flex-shrink-0">{Icons.check}</span><span><strong>After 14 Days:</strong> Manufacturing defects are covered under our <Link to="/warranty" className="text-green-900 underline font-medium">Warranty Policy</Link> for repair or replacement.</span></li>
          </ul>
        </div>

        <SectionTitle icon={Icons.star} title="Frequently Asked Questions" id="return-faq" />
        <div className="mb-4">
          <FaqItem q="Can I return furniture that has been assembled?" a="No. Once furniture has been assembled (either by you or a third party), it cannot be returned under our standard return policy. The exception is if the product was assembled by our White Glove service team and found to be defective — in that case, a full replacement or refund will be provided." />
          <FaqItem q="Do I have to pay for return shipping?" a="For returns within Dhaka metropolitan area, we provide free pickup. For returns from other locations, the customer is responsible for shipping costs unless the return is due to a manufacturing defect or damage during delivery, in which case we cover all costs." />
          <FaqItem q="Can I exchange for a completely different product?" a="Yes, you can exchange for a different product within 14 days, provided the original item meets all return eligibility criteria. If the new item costs more, you pay the difference. If it costs less, the difference will be refunded." />
          <FaqItem q="What if I received the wrong product?" a="If you receive a product that is different from what you ordered, contact us immediately. We will arrange a free pickup and deliver the correct product at no additional cost. This does not count against your return allowance." />
          <FaqItem q="How do I check the status of my refund?" a="You can check your refund status by calling our customer service at the number provided below or emailing us with your Return Authorization Number. We will provide real-time updates on the inspection and refund processing status." />
        </div>

        <ContactCTA />
      </div>
      <div className="hidden lg:block w-56 flex-shrink-0">
        <TableOfContents sections={toc} />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
//  SHIPPING INFORMATION PAGE
// ═══════════════════════════════════════════════════════════════════
function ShippingContent() {
  const toc = [
    { id: 'delivery-zones', label: 'Delivery Zones' },
    { id: 'timeframes', label: 'Delivery Timeframes' },
    { id: 'white-glove', label: 'White Glove Service' },
    { id: 'shipping-cost', label: 'Shipping Costs' },
    { id: 'tracking', label: 'Order Tracking' },
    { id: 'scheduling', label: 'Delivery Scheduling' },
    { id: 'safety', label: 'Packaging & Safety' },
    { id: 'shipping-faq', label: 'FAQ' },
  ];

  return (
    <div className="flex gap-12">
      <div className="flex-1 min-w-0">
        <Breadcrumbs title="Shipping Information" />

        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          We understand that receiving your furniture in perfect condition is just as important as choosing it. At Talukder Furniture, we take special care in packaging, handling, and delivering every product to ensure it arrives at your doorstep exactly as it left our factory. Here is everything you need to know about our shipping and delivery process.
        </p>

        <SectionTitle icon={Icons.globe} title="Delivery Zones" id="delivery-zones" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <InfoCard icon={Icons.zap} title="Zone A — Dhaka Metro" accent="bg-green-50 border-green-100">
            <p className="mb-2">Covers all areas within Dhaka North and South City Corporation, including Uttara, Gulshan, Banani, Dhanmondi, Mirpur, Mohammadpur, Motijheel, and surrounding areas.</p>
            <p className="font-semibold text-green-700 text-sm">Fastest delivery • Free White Glove eligible</p>
          </InfoCard>
          <InfoCard icon={Icons.truck} title="Zone B — Major Cities" accent="bg-blue-50 border-blue-100">
            <p className="mb-2">Covers Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Mymensingh, Comilla, Gazipur, and Narayanganj city areas.</p>
            <p className="font-semibold text-blue-700 text-sm">Standard delivery • Assembly available</p>
          </InfoCard>
          <InfoCard icon={Icons.box} title="Zone C — Nationwide" accent="bg-amber-50 border-amber-100">
            <p className="mb-2">All other areas across Bangladesh including district towns, upazila headquarters, and rural areas accessible by road transport.</p>
            <p className="font-semibold text-amber-700 text-sm">Extended delivery • Courier partner pickup</p>
          </InfoCard>
        </div>

        <SectionTitle icon={Icons.clock} title="Delivery Timeframes" id="timeframes" />
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="text-left p-4 rounded-tl-xl font-semibold">Delivery Zone</th>
                <th className="text-left p-4 font-semibold">In-Stock Items</th>
                <th className="text-left p-4 font-semibold">Made-to-Order Items</th>
                <th className="text-left p-4 rounded-tr-xl font-semibold">Express Delivery</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Zone A — Dhaka Metro', '3–5 business days', '15–30 business days', '1–2 business days (if available)'],
                ['Zone B — Major Cities', '5–7 business days', '20–35 business days', 'Not available'],
                ['Zone C — Nationwide', '7–14 business days', '25–40 business days', 'Not available'],
              ].map(([zone, inStock, madeToOrder, express], i) => (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-primary/[0.03] transition-colors`}>
                  <td className="p-4 font-medium text-primary">{zone}</td>
                  <td className="p-4 text-gray-600">{inStock}</td>
                  <td className="p-4 text-gray-600">{madeToOrder}</td>
                  <td className="p-4 text-gray-600">{express}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8">
          <p className="text-blue-800 text-sm leading-relaxed">
            <strong>Note:</strong> Delivery times are estimates and may vary during peak seasons (Eid, Puja, New Year), extreme weather events, hartals, or due to any circumstances beyond our control. Made-to-order timeframes begin after order confirmation and payment receipt.
          </p>
        </div>

        <SectionTitle icon={Icons.star} title="White Glove Assembly Service" id="white-glove" />
        <div className="bg-[#1a1a1a] text-white rounded-2xl p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-[0.06]">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3 className="text-3xl font-serif mb-4">Premium White Glove Delivery</h3>
          <p className="text-gray-300 text-[15px] leading-relaxed mb-6 max-w-2xl">
            We don't just drop boxes at your door. Our premium White Glove delivery service ensures your furniture is delivered, assembled, and ready to use in your home — with zero effort on your part.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              ['Room of Choice Delivery', 'Our team carries your furniture to the exact room you specify, regardless of floor level (elevator buildings) or up to the 3rd floor (walk-up buildings).'],
              ['Full Professional Assembly', 'Trained technicians assemble your furniture on-site using proper tools, ensuring all joints are secure and mechanisms function correctly.'],
              ['Packaging Removal', 'We remove and responsibly dispose of all packaging materials — boxes, foam, plastic wrap, and styrofoam — leaving your space clean.'],
              ['Final Inspection', 'Before leaving, our team conducts a walkthrough with you to ensure everything is perfect and demonstrate any adjustable features.'],
            ].map(([title, desc], i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-green-400 mt-0.5 flex-shrink-0">{Icons.check}</span>
                <div>
                  <span className="font-semibold text-white">{title}</span>
                  <p className="text-gray-400 text-sm mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-sm">
            <p className="text-gray-300">
              <strong className="text-white">Availability:</strong> White Glove service is complimentary for all orders above ৳25,000 in Dhaka Metro (Zone A). For Zone B cities, the service is available for an additional ৳2,000–৳5,000 depending on the city. Not available in Zone C.
            </p>
          </div>
        </div>

        <SectionTitle icon={Icons.file} title="Shipping Costs" id="shipping-cost" />
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="text-left p-4 rounded-tl-xl font-semibold">Order Value (BDT)</th>
                <th className="text-left p-4 font-semibold">Zone A — Dhaka Metro</th>
                <th className="text-left p-4 font-semibold">Zone B — Major Cities</th>
                <th className="text-left p-4 rounded-tr-xl font-semibold">Zone C — Nationwide</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Above ৳25,000', 'Free', '৳500 – ৳1,500', '৳1,000 – ৳3,000'],
                ['৳10,000 – ৳25,000', '৳300 – ৳800', '৳800 – ৳2,000', '৳1,500 – ৳4,000'],
                ['Below ৳10,000', '৳500 – ৳1,000', '৳1,000 – ৳2,500', '৳2,000 – ৳5,000'],
              ].map(([value, zoneA, zoneB, zoneC], i) => (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-primary">{value}</td>
                  <td className="p-4 text-gray-600">{zoneA}</td>
                  <td className="p-4 text-gray-600">{zoneB}</td>
                  <td className="p-4 text-gray-600">{zoneC}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-500 text-sm mb-8">
          * Shipping costs vary based on product weight, dimensions, and exact delivery location. Exact shipping charges will be confirmed by our sales team at the time of order confirmation. Large items (wardrobes, dining sets, bed frames) may incur additional handling charges for Zone B and C deliveries.
        </p>

        <SectionTitle icon={Icons.eye} title="Order Tracking" id="tracking" />
        <div className="space-y-0 mb-8">
          <StepItem step={1} title="Order Confirmed">
            Once your order is confirmed and payment is received, you will receive an SMS and email with your Order Confirmation Number and estimated delivery date.
          </StepItem>
          <StepItem step={2} title="In Production (Made-to-Order only)">
            For custom or made-to-order items, you will receive periodic updates on production progress. You can call our team anytime for a status check.
          </StepItem>
          <StepItem step={3} title="Dispatched">
            When your order leaves our warehouse, you will receive an SMS notification with a tracking number (if applicable) and the delivery team's contact information.
          </StepItem>
          <StepItem step={4} title="Out for Delivery">
            On the day of delivery, our team will call you <strong>30 minutes before arrival</strong> to confirm you are available. You can request to reschedule if the timing doesn't work.
          </StepItem>
          <StepItem step={5} title="Delivered">
            Upon successful delivery, you will be asked to inspect the product and sign a delivery confirmation. For White Glove deliveries, the team will assemble and demonstrate the product before leaving.
          </StepItem>
        </div>

        <SectionTitle icon={Icons.clock} title="Delivery Scheduling" id="scheduling" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          We understand that receiving large furniture requires someone to be present at the delivery location. Here's how we make scheduling convenient:
        </p>
        <ul className="space-y-1 mb-8 list-none">
          <CheckItem>Deliveries are scheduled Saturday through Thursday between 9:00 AM and 6:00 PM (BST)</CheckItem>
          <CheckItem>You can request a preferred delivery date and morning (9AM–1PM) or afternoon (1PM–6PM) time window</CheckItem>
          <CheckItem>If you are unavailable on the scheduled date, you can reschedule up to 2 times at no additional cost</CheckItem>
          <CheckItem>Friday and national holiday deliveries are not available</CheckItem>
          <CheckItem>For apartment buildings, please inform us in advance about any building-specific delivery restrictions, elevator availability, or required building management approvals</CheckItem>
          <CheckItem>We cannot deliver to locations that are inaccessible by road or require water transport (chars, islands) — alternative pickup arrangements can be made</CheckItem>
        </ul>

        <SectionTitle icon={Icons.box} title="Packaging & Product Safety" id="safety" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          Every product is carefully packaged to ensure it reaches you in pristine condition:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            { icon: Icons.shield, title: 'Multi-Layer Protection', desc: 'Products are wrapped in bubble wrap, foam corners, and corrugated cardboard for maximum impact protection during transit.' },
            { icon: Icons.box, title: 'Custom Crating', desc: 'Large and fragile items like glass-top tables and mirrors are crated in custom wooden frames for added structural protection.' },
            { icon: Icons.truck, title: 'Dedicated Fleet', desc: 'We use our own delivery vehicles with air-suspension and padded interiors to minimize vibration and movement during transit.' },
            { icon: Icons.check, title: 'Pre-Dispatch QC', desc: 'Every product undergoes a final quality inspection before packaging. Any defects found at this stage are resolved before dispatch.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">{item.icon}</div>
              <div>
                <h4 className="font-semibold text-primary text-sm mb-1">{item.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <SectionTitle icon={Icons.star} title="Frequently Asked Questions" id="shipping-faq" />
        <div className="mb-4">
          <FaqItem q="How can I track my order?" a="Once your order is dispatched, you will receive an SMS and email with tracking information. You can also contact our customer service team with your order number for a real-time update. Our delivery team will call you 30 minutes prior to arrival." />
          <FaqItem q="What if my item arrives damaged?" a="While rare, if your item arrives damaged, please refuse the delivery or contact our support team within 48 hours with clear photographs of the damage. We will arrange an immediate replacement delivery at no cost. For more details, see our Return & Exchange Policy." />
          <FaqItem q="Can I change my delivery address after placing an order?" a="Yes, you can change the delivery address up to 48 hours before the scheduled delivery by contacting our customer service team. Changes may affect delivery timing and shipping costs if the new location is in a different delivery zone." />
          <FaqItem q="Do you deliver to upper floors without an elevator?" a="Yes, our delivery team can carry furniture up to the 3rd floor (walk-up) at no additional charge within Zone A. For floors above the 3rd floor in buildings without elevator access, an additional handling fee of ৳200–৳500 per floor may apply depending on the item size and weight." />
          <FaqItem q="What happens if I'm not home during delivery?" a="Our delivery team will call you 30 minutes before arrival. If you are unavailable, we will attempt to reschedule. After 2 failed delivery attempts, the order may be returned to our warehouse, and a redelivery fee may apply." />
        </div>

        <ContactCTA />
      </div>
      <div className="hidden lg:block w-56 flex-shrink-0">
        <TableOfContents sections={toc} />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
//  LICENSE & CERTIFICATES PAGE
// ═══════════════════════════════════════════════════════════════════
function LicenseContent() {
  const toc = [
    { id: 'about-licenses', label: 'Our Certifications' },
    { id: 'trade-license', label: 'Trade License' },
    { id: 'quality', label: 'Quality Standards' },
    { id: 'environmental', label: 'Environmental Commitment' },
    { id: 'membership', label: 'Industry Memberships' },
    { id: 'brand-licensing', label: 'Brand Licensing Terms' },
  ];

  return (
    <div className="flex gap-12">
      <div className="flex-1 min-w-0">
        <Breadcrumbs title="License & Certificates" />

        <SectionTitle icon={Icons.award} title="Our Certifications & Compliance" id="about-licenses" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
          Talukder Group of Industries is a fully licensed and registered business entity operating under the laws of the People's Republic of Bangladesh. We maintain all necessary trade licenses, tax registrations, and industry certifications required for manufacturing and selling furniture products in Bangladesh.
        </p>

        <SectionTitle icon={Icons.file} title="Trade License & Registrations" id="trade-license" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            { title: 'Trade License', desc: 'Issued by the respective City Corporation / Pourashava authority. Renewed annually and valid for all furniture manufacturing and retail operations.' },
            { title: 'TIN Certificate', desc: 'Tax Identification Number issued by the National Board of Revenue (NBR), Bangladesh. All tax obligations including income tax, VAT, and supplementary duties are fully complied with.' },
            { title: 'VAT Registration (BIN)', desc: 'Business Identification Number for Value Added Tax registration under the VAT and Supplementary Duty Act, 2012. VAT is charged and remitted as per applicable rates.' },
            { title: 'Factory License', desc: 'Issued under the Bangladesh Labour Act, 2006, certifying compliance with factory safety, worker welfare, and operational standards.' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-6 hover:border-gray-200 transition-colors">
              <h4 className="font-bold text-primary mb-2">{item.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <SectionTitle icon={Icons.shield} title="Quality Standards" id="quality" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          Our manufacturing processes adhere to the following quality standards and testing protocols:
        </p>
        <ul className="space-y-1 mb-8 list-none">
          <CheckItem><strong>BSTI Compliance:</strong> Products conform to Bangladesh Standards and Testing Institution (BSTI) guidelines for furniture safety, load-bearing capacity, and material quality where applicable standards exist.</CheckItem>
          <CheckItem><strong>ISO-Aligned Processes:</strong> Our production workflow follows ISO 9001:2015 principles for quality management systems, ensuring consistent product quality from raw material sourcing to final inspection.</CheckItem>
          <CheckItem><strong>Material Testing:</strong> All raw materials including wood, steel, fabric, foam, and adhesives undergo incoming quality inspection to verify they meet our internal specifications.</CheckItem>
          <CheckItem><strong>Finished Product Testing:</strong> Every product category undergoes rigorous testing for load capacity, stability, durability, and safety before mass production. Test protocols include static load tests, cyclic fatigue tests, and impact resistance tests.</CheckItem>
          <CheckItem><strong>Formaldehyde Emission Standards:</strong> All engineered wood products (MDF, particle board, plywood) used in our furniture meet or exceed E1 emission standards (≤0.1 ppm) for formaldehyde, ensuring safe indoor air quality.</CheckItem>
        </ul>

        <SectionTitle icon={Icons.globe} title="Environmental Commitment" id="environmental" />
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 md:p-8 mb-8">
          <h4 className="font-bold text-green-900 mb-3 text-lg font-serif">Our Sustainability Pledge</h4>
          <p className="text-green-800 text-[15px] leading-relaxed mb-4">
            As a responsible manufacturer, we are committed to minimizing our environmental footprint:
          </p>
          <ul className="space-y-2 text-green-800 text-[15px]">
            <li className="flex items-start gap-3"><span className="text-green-600 mt-0.5 flex-shrink-0">{Icons.check}</span><span><strong>Responsible Sourcing:</strong> We source timber from plantation forests and verified suppliers. We do not use wood from protected forests or endangered tree species.</span></li>
            <li className="flex items-start gap-3"><span className="text-green-600 mt-0.5 flex-shrink-0">{Icons.check}</span><span><strong>Waste Reduction:</strong> Wood offcuts and sawdust are recycled into composite materials or used as biomass fuel. We aim to minimize production waste at every stage.</span></li>
            <li className="flex items-start gap-3"><span className="text-green-600 mt-0.5 flex-shrink-0">{Icons.check}</span><span><strong>Eco-Friendly Finishes:</strong> We are progressively transitioning to water-based paints and low-VOC (Volatile Organic Compound) coatings to reduce harmful emissions.</span></li>
            <li className="flex items-start gap-3"><span className="text-green-600 mt-0.5 flex-shrink-0">{Icons.check}</span><span><strong>Packaging Optimization:</strong> We use recyclable cardboard and minimize plastic usage in our packaging materials. Styrofoam is being phased out in favor of biodegradable alternatives.</span></li>
            <li className="flex items-start gap-3"><span className="text-green-600 mt-0.5 flex-shrink-0">{Icons.check}</span><span><strong>Compliance:</strong> All operations comply with the Bangladesh Environment Conservation Act, 1995 and the Environment Conservation Rules, 1997.</span></li>
          </ul>
        </div>

        <SectionTitle icon={Icons.users} title="Industry Memberships" id="membership" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          Talukder Group of Industries maintains active memberships in the following industry bodies:
        </p>
        <ul className="space-y-1 mb-8 list-none">
          <CheckItem><strong>Dhaka Chamber of Commerce & Industry (DCCI):</strong> Active member contributing to Bangladesh's business development ecosystem.</CheckItem>
          <CheckItem><strong>Bangladesh Furniture Industries Owners' Association:</strong> Participating member working to advance industry standards and best practices in the furniture sector.</CheckItem>
          <CheckItem><strong>Federation of Bangladesh Chambers of Commerce & Industry (FBCCI):</strong> Affiliated through industry association membership.</CheckItem>
        </ul>

        <SectionTitle icon={Icons.lock} title="Brand Licensing & Usage Terms" id="brand-licensing" />
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          The following terms govern the use of Talukder Furniture's brand assets:
        </p>
        <ul className="space-y-1 mb-8 list-none">
          <CheckItem type="x">The Talukder Furniture name, logo, and all design marks may not be used without express written permission from Talukder Group of Industries</CheckItem>
          <CheckItem type="x">Authorized dealers and showroom partners are granted limited brand usage rights as outlined in their dealer agreements</CheckItem>
          <CheckItem type="x">Media and press may use the Talukder Furniture name and logo for editorial purposes with proper attribution</CheckItem>
          <CheckItem type="x">Any unauthorized commercial use of our brand assets constitutes trademark infringement under the Trademarks Act, 2009 of Bangladesh</CheckItem>
        </ul>
        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
          For brand licensing inquiries, dealer partnership applications, or permission requests, please contact us at <strong>{COMPANY.email}</strong>.
        </p>

        <ContactCTA />
      </div>
      <div className="hidden lg:block w-56 flex-shrink-0">
        <TableOfContents sections={toc} />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
//  MAIN STATIC CONTENT PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════
const PAGE_CONFIG: Record<string, { title: string; lastUpdated: string; heroSubtitle: string }> = {
  warranty: {
    title: 'Warranty Information',
    lastUpdated: 'July 1, 2026',
    heroSubtitle: 'Our commitment to quality, backed by comprehensive coverage',
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'July 1, 2026',
    heroSubtitle: 'How we collect, use, and protect your personal information',
  },
  terms: {
    title: 'Terms & Conditions',
    lastUpdated: 'July 1, 2026',
    heroSubtitle: 'The rules and guidelines governing your use of our website',
  },
  returns: {
    title: 'Returns & Exchanges',
    lastUpdated: 'July 1, 2026',
    heroSubtitle: 'Our hassle-free return and exchange policy for your peace of mind',
  },
  shipping: {
    title: 'Shipping Information',
    lastUpdated: 'July 1, 2026',
    heroSubtitle: 'Everything you need to know about delivery and logistics',
  },
  license: {
    title: 'License & Certificates',
    lastUpdated: 'July 1, 2026',
    heroSubtitle: 'Our credentials, certifications, and commitment to standards',
  },
};

const PAGE_CONTENT: Record<string, React.FC> = {
  warranty: WarrantyContent,
  privacy: PrivacyContent,
  terms: TermsContent,
  returns: ReturnsContent,
  shipping: ShippingContent,
  license: LicenseContent,
};

export default function StaticContentPage() {
  const location = useLocation();
  const path = location.pathname.replace('/', '');
  const [isVisible, setIsVisible] = useState(false);

  const config = PAGE_CONFIG[path] || {
    title: 'Information',
    lastUpdated: 'July 1, 2026',
    heroSubtitle: '',
  };

  const ContentComponent = PAGE_CONTENT[path];

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [path]);

  return (
    <div className="bg-gradient-to-b from-white via-sky-50 to-blue-50 min-h-screen pb-24">
      {/* ─── Hero Banner ─── */}
      <div
        className="relative w-full h-[250px] md:h-[320px] flex items-center justify-center mb-12"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-lg">
            {config.title}
          </h1>
          <div className="w-16 h-1 bg-white mx-auto rounded-full mb-4" />
          {config.heroSubtitle && (
            <p className="text-white/70 text-sm md:text-base max-w-lg mx-auto mb-3 leading-relaxed">
              {config.heroSubtitle}
            </p>
          )}
          <p className="text-white/50 text-xs md:text-sm font-medium tracking-widest uppercase">
            Last Updated: {config.lastUpdated}
          </p>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div
        className={`container-custom max-w-6xl transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        {ContentComponent ? <ContentComponent /> : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-serif text-primary mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-6">The page you are looking for is not available.</p>
            <Link to="/" className="btn btn-primary">Return Home</Link>
          </div>
        )}
      </div>
    </div>
  );
}
