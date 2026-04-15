export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <h1 className="text-4xl font-bold text-navy mb-8 border-b-2 border-india-green inline-block pb-2">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-8 shadow-sm border border-slate-200 rounded-lg">
          <h2 className="text-2xl font-bold text-navy mb-6">Get in Touch</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input type="text" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-india-green focus:ring focus:ring-green-200 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-india-green focus:ring focus:ring-green-200 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Message</label>
              <textarea rows={4} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-india-green focus:ring focus:ring-green-200 p-2 border"></textarea>
            </div>
            <button type="submit" className="bg-navy hover:bg-blue-900 text-white font-bold py-2 px-6 rounded">Send Message</button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-bold text-navy">Central Office</h3>
            <p className="text-slate-600 mt-2 text-sm">
              Ministry of Health & Family Welfare<br/>
              Nirman Bhawan, New Delhi - 110011<br/>
              India
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-bold text-navy">Helpline</h3>
            <p className="text-slate-600 mt-2 text-sm mb-1"><strong>National Toll-Free:</strong> 1800-111-222</p>
            <p className="text-slate-600 text-sm"><strong>Support Email:</strong> support@nexus.gov.in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
