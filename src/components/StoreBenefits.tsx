import { Headphones, PackageCheck, Search, ShieldCheck } from "lucide-react";

const benefits = [
  { icon: PackageCheck, title: "Current stock", text: "Live product availability" },
  { icon: ShieldCheck, title: "Secure checkout", text: "Protected account checkout" },
  { icon: Search, title: "Find the right part", text: "Search the current catalog" },
  { icon: Headphones, title: "Talk to our team", text: "+250 793 209 175" },
];

const StoreBenefits = () => (
  <section className="section-container py-8" aria-label="Customer services">
    <div className="grid border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-4">
      {benefits.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 last:border-0 sm:border-r lg:border-b-0">
          <Icon className="h-7 w-7 shrink-0 text-secondary" />
          <div><h3 className="text-xs font-extrabold uppercase text-[#17233a]">{title}</h3><p className="mt-1 text-[11px] text-slate-500">{text}</p></div>
        </div>
      ))}
    </div>
  </section>
);

export default StoreBenefits;
