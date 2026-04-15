'use client';

import { useState, useTransition, useRef } from 'react';
import { analyzePrescriptionText, AnalysisResult } from '@/app/ai-actions';
import { Bot, ShoppingCart, Info, Pill, Paperclip, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Medicine } from '@/app/actions';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AIConsultPage() {
  const [prescriptionText, setPrescriptionText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const { addToCart } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileData, setFileData] = useState<{mimeType: string, base64: string} | null>(null);
  const [addedItems, setAddedItems] = useState<Record<number, boolean>>({});

  const handleAddToCart = (alt: Medicine) => {
    addToCart(alt);
    setAddedItems(p => ({...p, [alt.id]: true}));
    setTimeout(() => {
      setAddedItems(p => ({...p, [alt.id]: false}));
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrescriptionText(prev => prev + (prev ? '\n' : '') + `[Attached: ${file.name}]`);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string; 
        const base64 = result.split(',')[1]; 
        setFileData({ mimeType: file.type, base64 });
      };
      reader.readAsDataURL(file);

      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescriptionText.trim()) return;
    setError('');
    
    // Add artificial delay to feel like a chat
    startTransition(async () => {
      try {
        const data = await analyzePrescriptionText(prescriptionText, fileData || undefined);
        if (data) {
          setResult(data);
        } else {
          setError('Failed to extract meaningful data from the prescription. Please try uploading a clearer image or typing the prescription details.');
        }
        setFileData(null); // Clear after analysis
      } catch (err: any) {
        console.error('AI Analysis Error:', err);
        // Provide more helpful error messages
        if (err.message?.includes('not found') || err.message?.includes('not supported')) {
          setError('The AI service is temporarily unavailable. Please try again in a moment or contact support.');
        } else if (err.message?.includes('API')) {
          setError('API connection issue. Please check your internet and try again.');
        } else {
          setError(err.message || 'An unexpected error occurred. Please try again.');
        }
      }
    });
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen animate-fadeIn">
      <div className="text-center mb-10">
         <div className="bg-navy text-white h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4 shadow">
            <Bot className="h-8 w-8" />
         </div>
         <h1 className="text-3xl font-bold text-navy">AI Prescription Assistant</h1>
         <p className="text-slate-600 mt-2">Chat with our National AI to convert your expensive doctor prescriptions into affordable generic carts.</p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg min-h-[400px] flex flex-col shadow-sm">
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          <div className="flex">
             <div className="bg-navy text-white p-4 rounded-xl rounded-tl-sm max-w-[80%]">
                Hello. I am the Health Nexus AI. Paste any doctor's prescription text below, and I will analyze the active chemical compounds to find you cheaper generic substitutes immediately linked to our National Pharmacy Grid.
             </div>
          </div>

          {result && (
             <div className="flex flex-col space-y-4 animate-slideIn">
                <div className="flex justify-end">
                   <div className="bg-saffron text-white p-4 rounded-xl rounded-tr-sm max-w-[80%] animate-fadeIn">
                      {result.extractedText}
                   </div>
                </div>

                <div className="flex animate-slideIn">
                   <div className="bg-white border-2 border-slate-200 text-slate-800 p-5 rounded-xl rounded-tl-sm w-full">
                      <p className="font-bold text-navy mb-4 border-b pb-2 flex items-center gap-2">
                        <Check className="text-india-green h-5 w-5" />
                        Analysis Complete. I found {result.identifiedDrugs.length} prescriptions. By switching to generics, you can save roughly ₹{result.overallCostSavings}.
                      </p>
                      
                      {result.identifiedDrugs.map((drug, i) => (
                        <div key={i} className="mb-6 last:mb-0 bg-slate-50 p-4 rounded border border-slate-100">
                           <div className="flex items-center mb-2">
                             <Pill className="text-india-green h-5 w-5 mr-2" />
                             <h4 className="font-bold text-Navy text-lg">{drug.name}</h4>
                           </div>
                           <p className="text-sm text-slate-600 mb-3 ml-7"><Info className="inline h-3 w-3 mr-1" /> {drug.reasoning}</p>
                           
                           {drug.genericsFound.length > 0 && (
                             <div className="ml-7 grid grid-cols-1 gap-2">
                               {drug.genericsFound.slice(0, 2).map(alt => (
                                 <div key={alt.id} className="flex justify-between items-center bg-white p-2 border border-slate-200 rounded shadow-sm">
                                    <div className="text-sm">
                                      <span className="font-bold">{alt.brand_name || 'Generic'}</span>
                                      <span className="text-xs text-slate-500 block">₹{alt.price_inr.toFixed(2)} | {alt.manufacturer}</span>
                                    </div>
                                    <button 
                                      onClick={() => handleAddToCart(alt)}
                                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-300 flex items-center shadow-sm ${addedItems[alt.id] ? 'bg-navy text-white scale-105' : 'bg-india-green text-white hover:bg-green-700'}`}
                                    >
                                      {addedItems[alt.id] ? (
                                        <><Check className="h-3 w-3 mr-1 animate-bounce" /> Added!</>
                                      ) : (
                                        <><ShoppingCart className="h-3 w-3 mr-1" /> Cart</>
                                      )}
                                    </button>
                                 </div>
                               ))}
                             </div>
                           )}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          )}
          
          {isPending && (
             <div className="flex animate-slideIn">
               <div className="bg-slate-100 text-slate-600 p-4 rounded-xl rounded-tl-sm flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-navy rounded-full animate-spin"></div>
                  <span>AI is analyzing your prescription...</span>
               </div>
             </div>
          )}

          {error && (
             <div className="flex animate-slideIn">
               <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-xl rounded-tl-sm max-w-[80%] shadow-sm">
                  <p className="flex items-center gap-2 font-medium">
                     <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                     {error}
                  </p>
               </div>
             </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200 rounded-b-lg">
          <form onSubmit={handleAnalyze} className="flex gap-2 items-center">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-100 text-slate-600 p-3 rounded hover:bg-slate-200 transition"
              title="Attach Prescription Document"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png,.docx" 
              onChange={handleFileChange}
            />
            <textarea 
              value={prescriptionText}
              onChange={e => setPrescriptionText(e.target.value)}
              placeholder="Paste prescription text or attach a document..."
              className="flex-grow border border-slate-300 rounded p-3 resize-none outline-none focus:border-navy"
              rows={2}
            />
            <button 
              type="submit" 
              disabled={isPending || !prescriptionText.trim()}
              className="bg-navy hover:bg-blue-900 text-white font-bold px-6 rounded transition disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
