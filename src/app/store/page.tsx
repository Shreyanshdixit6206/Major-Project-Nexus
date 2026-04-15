'use client';

import { useState, useTransition, useEffect } from 'react';
import { executeSearch, getCommonMedicines } from '@/app/actions';
import { SearchEngineResult, PmbjpMedicine } from '@/lib/searchEngine';
import { Info, Package, AlertTriangle, Pill, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import AddToCartButton from '@/components/AddToCartButton';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MedicinesStore() {
  const [resultData, setResultData] = useState<SearchEngineResult | null>(null);
  const [commonMeds, setCommonMeds] = useState<PmbjpMedicine[]>([]);
  const [isPending, startTransition] = useTransition();
  const { addToCart } = useCart();

  useEffect(() => {
    getCommonMedicines().then(data => setCommonMeds(data || []));
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    startTransition(async () => {
      const data = await executeSearch(query);
      setResultData(data);
    });
  };

  const mapPmbjpToCartItem = (med: PmbjpMedicine) => ({
    id: med.id, // we might need to differentiate ids to not overlap with a_z, but it's fine for prototype
    brand_name: med.generic_name,
    manufacturer: 'PMBJP Authorised',
    price_inr: med.mrp,
    is_discontinued: 'False',
    dosage_form: med.unit_size,
    primary_ingredient: med.group_name,
    primary_strength: '',
    therapeutic_class: ''
  });

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-navy mb-2 flex items-center">
          <Pill className="mr-3 h-8 w-8 text-saffron" />
          PMBJP Generic Medicine Store
        </h1>
        <p className="text-slate-600">
          Search for medicines. We prioritize matching PMBJP datasets to provide the most affordable, generic substitutes. Search using the autocomplete!
        </p>
      </div>

      {/* Search Autocomplete Bar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8 relative z-50">
         <SearchAutocomplete onSearch={handleSearch} />
      </div>

      {/* Results */}
      {isPending && <p className="text-slate-500 animate-pulse">Searching the databases...</p>}

      {!isPending && !resultData && commonMeds.length > 0 && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center">
             <Package className="h-5 w-5 mr-2 text-saffron" />
             Frequently Bought Generics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commonMeds.map((med) => (
              <div key={med.id} className="bg-white text-left border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden card-animate hover-scale">
                <div className="absolute top-0 right-0 bg-india-green text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-widest">
                   Top Pick
                </div>
                <div className="p-5 flex-grow mt-2">
                  <h3 className="font-bold text-lg text-navy pr-4 mb-3" title={med.generic_name}>
                    {med.generic_name}
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-start">
                       <span className="font-semibold bg-green-100 text-green-800 text-xs px-2 py-1 rounded whitespace-nowrap">
                         ₹{med.mrp.toFixed(2)}
                       </span>
                    </div>
                    <div className="flex items-center pt-2">
                       <Package className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                       <span>{med.unit_size || '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-lg flex gap-2">
                   <AddToCartButton medicine={mapPmbjpToCartItem(med)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isPending && resultData && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header Status Bar */}
          <div className="mb-6">
            {resultData.status === 'EXACT_PMBJP' && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md flex items-start">
                <CheckCircle className="h-6 w-6 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-lg">Available in PMBJP!</h3>
                  <p className="text-sm mt-1">Found highly affordable generic substitute.</p>
                </div>
              </div>
            )}
            
            {resultData.status === 'FOUND_AZ_WITH_ALTERNATIVES' && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md flex items-start">
                <Info className="h-6 w-6 mr-3 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-lg whitespace-pre-wrap">Branded Target Found: {resultData.exactMatch && 'name' in resultData.exactMatch ? resultData.exactMatch.name : ''}</h3>
                  <p className="text-sm mt-1">This specific branded medicine is <strong>Out of Stock / Not directly available</strong> in our store. However, we've extracted its composition and found generic substitutes for you below!</p>
                </div>
              </div>
            )}

            {resultData.status === 'NOT_FOUND' && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-md flex items-start">
                <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">No medicines found</h3>
                  <p className="mt-1 text-sm">We couldn't find any match for "{resultData.searchedTerm}" in our databases. Please try another term.</p>
                </div>
              </div>
            )}
          </div>

          {/* PMBJP Alternatives Grid */}
          {resultData.pmbjpAlternatives.length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2">
                Suggested Generic Medicines to Buy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resultData.pmbjpAlternatives.map((med) => (
                  <div key={med.id} className="bg-white border text-left border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden card-animate hover-scale">
                    <div className="absolute top-0 right-0 bg-india-green text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-widest">
                       Verify PMBJP
                    </div>
                    <div className="p-5 flex-grow mt-2">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-navy pr-4" title={med.generic_name}>
                          {med.generic_name}
                        </h3>
                      </div>
                      
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center flex-wrap gap-2">
                           <span className="font-semibold text-slate-700 bg-green-100 text-green-800 text-xs px-2 py-1 rounded whitespace-nowrap">
                             ₹{med.mrp.toFixed(2)}
                           </span>
                           {resultData.status === 'FOUND_AZ_WITH_ALTERNATIVES' && resultData.exactMatch && 'price' in resultData.exactMatch && resultData.exactMatch.price > med.mrp && (
                             <span className="font-bold text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded whitespace-nowrap uppercase tracking-wider">
                               Save ₹{(resultData.exactMatch.price - med.mrp).toFixed(2)} ({Math.round(((resultData.exactMatch.price - med.mrp) / resultData.exactMatch.price) * 100)}%)
                             </span>
                           )}
                        </div>
                        <div className="flex items-center pt-2">
                           <Package className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                           <span>{med.unit_size || '-'}</span>
                        </div>
                        <div className="pt-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Therapeutic Group</span>
                          <p className="text-slate-800 mt-1 line-clamp-2" title={med.group_name}>{med.group_name || 'Generic'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-lg flex gap-2">
                       <AddToCartButton medicine={mapPmbjpToCartItem(med)} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
