export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <h1 className="text-4xl font-bold text-navy mb-8 border-b-2 border-saffron inline-block pb-2">About Health Nexus</h1>
      
      <div className="bg-white p-8 shadow-sm border border-slate-200 rounded-lg text-slate-700 leading-relaxed text-lg mb-8">
        <p className="mb-6">
          The <strong>Health Nexus</strong> is a pioneering digital infrastructure developed under the <em>Ministry of Health and Family Welfare</em> to bridge the gap between expensive branded medications and affordable, high-quality generic alternatives. 
        </p>
        <p className="mb-6">
          Our vision aligns with the <strong>Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)</strong> to ensure that quality medicines remain accessible to every citizen. Through the National Pharmacy Grid, citizens can instantaneously query over 2.5 Lakh registered medicines and procure validated generic substitutes safely.
        </p>
        <p className="mb-6">
          Furthermore, Heath Nexus incorporates state-of-the-art Artificial Intelligence to empower the <strong>AI Health Vault</strong>. By utilizing next-generation AI, prescriptions can be autonomously evaluated for active compounds, guaranteeing patients uncover the most cost-effective medical alternatives exactly when they need them.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="text-xl font-bold text-navy mb-3">Our Mission</h3>
            <p className="text-sm">To provide universal access to equitable, affordable, and quality healthcare services through digital decentralization algorithms and centralized verification ledgers.</p>
         </div>
         <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="text-xl font-bold text-india-green mb-3">Security Infrastructure</h3>
            <p className="text-sm">Health Vault architectures utilize ABHA IDs to ensure your records remain entirely encrypted and inaccessible to external data brokers without explicit consent.</p>
         </div>
      </div>
    </div>
  );
}
