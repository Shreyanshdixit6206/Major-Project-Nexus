import { getOrder } from '@/app/actions';
import { Package, Truck, CheckCircle2, Factory, Download, MapPin, Receipt, ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams;
  const orderId = params.id;

  if (!orderId) {
    redirect('/store');
  }

  const order = await getOrder(orderId);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">Order Not Found</h1>
        <p className="text-slate-600 mb-8">We could not find any order with ID: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{orderId}</span></p>
        <Link href="/store" className="bg-navy text-white px-6 py-3 rounded font-bold hover:bg-blue-900 transition-colors">
          Return to Store
        </Link>
      </div>
    );
  }

  // Determine current step directly from order status (mocked here based on time if we wanted, but we'll stick to 'PROCESSING' since it's just created)
  // Let's fake an advanced status for UI demonstration based merely on random or default to processing
  const currentStep = 1; // 0: Placed, 1: Processed, 2: Shipped, 3: Delivered

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center">
        <Link href="/store" className="text-navy hover:text-saffron font-medium flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Store
        </Link>
      </div>

      <div className="bg-white border text-left border-slate-200 shadow-sm rounded-lg overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-navy p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center text-white">
          <div>
            <p className="text-slate-300 text-sm uppercase tracking-wider font-bold mb-1">Order Details</p>
            <h1 className="text-2xl font-mono font-bold tracking-tight">{order.order_id}</h1>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center bg-blue-800/50 px-4 py-2 rounded-full border border-blue-700">
            <span className="h-2 w-2 bg-saffron rounded-full animate-pulse mr-2"></span>
            <span className="font-bold text-sm tracking-wide">{order.status || 'PROCESSING'}</span>
          </div>
        </div>

        <div className="p-8">
          {/* Tracking Timeline */}
          <div className="mb-12 relative w-full overflow-hidden">
             <div className="flex justify-between items-start relative z-10">
               {[
                 { label: 'Order Placed', icon: Receipt },
                 { label: 'Processing', icon: Factory },
                 { label: 'Shipped', icon: Truck },
                 { label: 'Delivered', icon: Package }
               ].map((step, idx) => {
                 const isCompleted = idx <= currentStep;
                 const isCurrent = idx === currentStep;
                 const Icon = step.icon;
                 
                 return (
                   <div key={idx} className="flex flex-col items-center flex-1 z-10 relative">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 z-10 bg-white ${
                       isCompleted ? 'border-india-green text-india-green' : 'border-slate-200 text-slate-300'
                     }`}>
                       {isCompleted && !isCurrent ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                     </div>
                     <span className={`text-xs sm:text-sm font-bold mt-3 text-center ${isCompleted ? 'text-navy' : 'text-slate-400'}`}>
                       {step.label}
                     </span>
                     {isCurrent && <span className="text-xs text-saffron font-bold mt-1 max-w-[100px] text-center">Current Status</span>}
                   </div>
                 );
               })}
             </div>
             {/* Timeline background line */}
             <div className="absolute top-6 left-0 right-0 h-1 bg-slate-100 z-0 px-24">
               <div 
                 className="h-full bg-india-green transition-all duration-1000 ease-in-out"
                 style={{ width: `${(currentStep / 3) * 100}%` }}
               ></div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Col: Order items */}
            <div>
              <h3 className="text-lg font-bold text-navy border-b border-slate-200 pb-2 mb-4">Items Summary</h3>
              <div className="space-y-4">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row justify-between text-sm items-start sm:items-center bg-slate-50 p-3 rounded border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">{item.brand_name || 'Generic Product'}</p>
                      <p className="text-xs text-slate-500">{item.primary_ingredient}</p>
                    </div>
                    <div className="text-right mt-2 sm:mt-0 sm:ml-4 whitespace-nowrap">
                      <span className="text-slate-400 text-xs">Qty {item.quantity} × </span>
                      <span className="font-bold text-india-green">₹{(item.price_inr * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center text-xl font-bold bg-green-50 text-green-900 border border-green-200 p-4 rounded-lg shadow-sm">
                <span>Grand Total</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Right Col: Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-navy border-b border-slate-200 pb-2 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-saffron" /> Delivery Information
                </h3>
                <div className="bg-slate-50 rounded p-4 text-sm text-slate-600 border border-slate-100">
                  <p className="font-bold text-slate-800 text-base mb-1">{order.user_name || 'Pharmacist'}</p>
                  <p className="mb-2 text-xs font-mono">{order.phone}</p>
                  <p className="leading-relaxed whitespace-pre-wrap">{order.address || 'Address provided at checkout.'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-navy border-b border-slate-200 pb-2 mb-4">Actions</h3>
                <button className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-3 px-4 rounded shadow-sm text-sm flex items-center justify-center transition-colors">
                  <Download className="w-4 h-4 mr-2" /> Download Tax Invoice
                </button>
                <p className="text-xs text-slate-400 mt-3 text-center">For any queries, refer to this Order ID when contacting PMBJP Support.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
