import { Search, ShieldCheck, FileText, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white border-b overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-saffron via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row items-center relative z-10">
          <div className="md:w-1/2 pr-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-navy leading-tight mb-6 flex flex-col">
              <span className="text-saffron mb-2">Quality Medicines.</span>
              <span>Affordable Prices.</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
              Welcome to the Health Nexus National Pharmacy Grid. Discover generic alternatives, verify prescriptions via our AI vault, and access healthcare at a fraction of the cost.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/store" className="bg-navy hover:bg-blue-900 text-white px-8 py-4 rounded font-bold shadow-lg transition-transform hover:-translate-y-1 flex justify-center items-center">
                <Search className="mr-2 h-5 w-5" />
                Search Medicines
              </Link>
              <Link href="/vault" className="bg-white border-2 border-india-green text-india-green hover:bg-green-50 px-8 py-4 rounded font-bold shadow-lg transition-transform hover:-translate-y-1 flex justify-center items-center">
                <FileText className="mr-2 h-5 w-5" />
                Upload Prescription
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 relative">
             <div className="bg-slate-50 p-6 rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 gov-gradient"></div>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-navy">National Live Status</h3>
                  <p className="text-sm text-slate-500">Real-time statistics across the directory</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                    <Activity className="h-8 w-8 text-saffron mb-2" />
                    <span className="text-2xl font-bold text-slate-800">2.5 Lakh+</span>
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Medicines Listed</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                    <ShieldCheck className="h-8 w-8 text-india-green mb-2" />
                    <span className="text-2xl font-bold text-slate-800">100%</span>
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Verified Sources</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy">Our Core Objectives</h2>
            <div className="h-1 w-20 gov-gradient mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded border-t-4 border-saffron shadow hover:shadow-md transition-shadow card-animate hover-scale">
              <h3 className="text-xl font-bold text-navy mb-3">Accessibility</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Ensure access to quality medicines for all sections of the population, bridging the gap between urban and rural healthcare.</p>
            </div>
            <div className="bg-white p-8 rounded border-t-4 border-india-green shadow hover:shadow-md transition-shadow card-animate hover-scale">
              <h3 className="text-xl font-bold text-navy mb-3">Affordability</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Reduce out-of-pocket expenditure through a robust database of generic alternatives that cost substantially less than branded variants.</p>
            </div>
            <div className="bg-white p-8 rounded border-t-4 border-navy shadow hover:shadow-md transition-shadow card-animate hover-scale">
              <h3 className="text-xl font-bold text-navy mb-3">Awareness</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Create awareness about generic medicines through education and our Gemini-powered AI prescription analysis engine.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
