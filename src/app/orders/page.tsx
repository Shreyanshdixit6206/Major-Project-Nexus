'use client';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUserOrders } from '@/app/actions';
import { useAuth } from '@/context/AuthContext';
import { PackageOpen, ExternalLink, Calendar, MapPin, IndianRupee, Download as DownloadIcon } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OrdersDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (user?.abhaId) {
        const data = await getUserOrders(user.abhaId);
        setOrders(data);
      }
      setLoading(false);
    }
    
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleDownloadInvoice = (order: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138); // navy
    doc.text('Health Nexus Invoice', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Order ID: ${order.order_id}`, 14, 30);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 14, 35);
    
    // Customer
    doc.setTextColor(0, 0, 0);
    doc.text(`Shipping Details:`, 14, 45);
    doc.text(`ABHA ID: ${user?.abhaId}`, 14, 50);
    doc.text(`Address: ${order.address}`, 14, 55);
    
    // Items
    const tableData = (order.items || []).map((item: any) => [
      item.brand_name || 'Generic Medicine',
      item.quantity.toString(),
      `INR ${item.price_inr.toFixed(2)}`,
      `INR ${(item.price_inr * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['Item', 'Quantity', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] }
    });
    
    // Total
    const finalY = (doc as any).lastAutoTable.finalY || 65;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Amount: INR ${order.total_amount.toFixed(2)}`, 14, finalY + 10);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a securely verified generic medicine invoice via Health Nexus.', 14, finalY + 20);

    doc.save(`Invoice_${order.order_id}.pdf`);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
        <h1 className="text-3xl font-bold text-navy mb-8 border-b-2 border-saffron inline-block pb-2">My Orders Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 border-4 border-navy border-t-saffron rounded-full animate-spin"></div>
              <span className="text-navy font-bold mt-4">Loading purchase history...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded p-12 text-center">
            <PackageOpen className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-navy mb-2">No past orders found!</h2>
            <p className="text-slate-500 mb-6">Looks like you haven't bought any generic medicines yet.</p>
            <Link href="/store" className="bg-navy text-white px-6 py-3 rounded font-bold hover:bg-blue-900 transition-colors inline-block">
              Visit Medicine Store
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order.order_id} className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden relative card-animate hover-scale">
                <div className="bg-slate-50 px-5 py-3 border-b flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-slate-500">{order.order_id}</span>
                  <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wider rounded ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="p-5 flex-grow space-y-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                  
                  <div className="flex items-start text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-slate-400 flex-shrink-0" />
                    <span className="line-clamp-2">{order.address}</span>
                  </div>
                  
                  <div className="flex items-center text-lg font-bold text-navy">
                    <IndianRupee className="h-5 w-5 mr-1" />
                    {order.total_amount.toFixed(2)}
                  </div>
                  
                  <div className="pt-2 border-t text-sm font-semibold text-slate-600">
                    {order.items?.length || 0} items purchased
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto flex gap-2">
                  <button 
                    onClick={() => handleDownloadInvoice(order)}
                    className="flex-1 flex items-center justify-center text-navy font-bold hover:text-blue-800 transition-colors py-2 border border-navy hover:bg-blue-50 rounded bg-white shadow-sm text-sm"
                  >
                    <DownloadIcon className="h-4 w-4 mr-1" /> Invoice
                  </button>
                  <Link href={`/track?id=${order.order_id}`} className="flex-1 flex items-center justify-center text-india-green font-bold hover:text-green-800 transition-colors py-2 border border-india-green hover:bg-green-50 rounded bg-white shadow-sm text-sm">
                    <ExternalLink className="h-4 w-4 mr-1" /> Track
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
