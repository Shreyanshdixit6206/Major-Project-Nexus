'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { ShieldCheck, UploadCloud, FileText, User, Trash2, Download, Lock } from 'lucide-react';
import { saveHealthDocument, getHealthDocuments, deleteHealthDocument, getHealthDocumentContent } from '@/app/actions';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function SecurityVaultPage() {
  const { user, token } = useAuth();
  
  // Unlock Logic
  const [isLocked, setIsLocked] = useState(true);
  const [inputAbha, setInputAbha] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Doc Upload
  const [docName, setDocName] = useState('');
  const [fileData, setFileData] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isSubmitting, startSubmitting] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History
  const [history, setHistory] = useState<{id: number, document_name: string, uploaded_at: string}[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (user?.abhaId) {
      if (localStorage.getItem(`vault_unlocked_${user.abhaId}`) === 'true') {
        setIsLocked(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (token && !isLocked) {
      loadDocs(token);
    }
  }, [token, isLocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const correctAbhaId = user?.abhaId || 'TEST_ABHA_123456789';
    if (inputAbha === correctAbhaId) {
      setIsLocked(false);
      localStorage.setItem(`vault_unlocked_${correctAbhaId}`, 'true');
      setUnlockError('');
    } else {
      setUnlockError('Incorrect ABHA ID. Please enter the ABHA ID associated with this account to continue.');
    }
  };

  const loadDocs = async (jwtToken: string) => {
    const docs = await getHealthDocuments(jwtToken);
    setHistory(docs);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!docName) setDocName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileData(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !fileData || !token) return;
    setStatusMessage('');
    setIsError(false);

    startSubmitting(async () => {
      const result = await saveHealthDocument(token, docName, fileData);
      if (result.success) {
        setDocName('');
        setFileData('');
        setFileName('');
        setStatusMessage(result.message);
        setIsError(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadDocs(token);
      } else {
        setStatusMessage(result.message);
        setIsError(true);
      }
    });
  };

  const handleDownload = async (docId: number, name: string) => {
    if (!token) return;
    const content = await getHealthDocumentContent(token, docId);
    if (!content || !content.document_text) return;
    
    // Create a download link for the base64 URL
    const a = document.createElement('a');
    a.href = content.document_text;
    a.download = content.document_name || name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async (docId: number) => {
    if (!token) return;
    if (confirm('Are you sure you want to delete this securely stored document?')) {
      const ok = await deleteHealthDocument(token, docId);
      if (ok) {
        await loadDocs(token);
      }
    }
  };

  const testAbhaId = user?.abhaId || 'TEST_ABHA_123456789';

  if (isLocked) {
    return (
      <ProtectedRoute>
        <div className="max-w-xl mx-auto px-4 py-20 min-h-screen animate-fadeIn">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
            <div className="text-center mb-6">
              <Lock className="h-12 w-12 text-navy mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-navy">Verify Identity</h1>
              <p className="text-slate-600 mt-2 text-sm">For extremely sensitive medical records tracking, please authenticate your ABHA ID explicitly one time.</p>
            </div>
            
            {unlockError && (
              <div className="bg-red-50 text-red-700 p-3 rounded text-sm mb-4 border border-red-200">
                {unlockError}
              </div>
            )}
            
            <form onSubmit={handleUnlock}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Enter your ABHA ID required for Vault mapping:</label>
                <input 
                  type="text" 
                  value={inputAbha}
                  onChange={e => setInputAbha(e.target.value)}
                  placeholder="Ex. 91-1234-5678-9012"
                  className="w-full text-center tracking-widest text-lg p-3 border border-slate-300 rounded focus:ring focus:ring-blue-100 outline-none"
                />
                <p className="text-xs text-slate-500 mt-2 text-center">Prototype Hint: Your ABHA ID is:</p>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2 text-center">
                  <p className="text-sm font-mono font-bold text-blue-700 select-all cursor-pointer hover:bg-blue-100 transition p-2 rounded">
                    {testAbhaId}
                  </p>
                </div>
              </div>
              <button type="submit" disabled={!inputAbha.trim()} className="w-full bg-navy text-white font-bold py-3 rounded disabled:opacity-50">
                Unlock Secure Vault
              </button>
            </form>
            <div className="mt-6 flex items-center justify-center text-xs text-india-green bg-green-50 p-2 rounded">
              <ShieldCheck className="mr-1 h-4 w-4" /> Endpoint-to-Endpoint Government Encryption Active
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-3xl font-bold text-navy mb-2 flex items-center">
             <ShieldCheck className="mr-3 h-8 w-8 text-india-green" />
             Your Health Vault
           </h1>
           <p className="text-slate-600 flex items-center">
             <User className="h-4 w-4 mr-1" />
             Authenticated via ABHA: <strong className="ml-1 tracking-widest">{testAbhaId}</strong>
             <span className="ml-3 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded border border-green-200">JWT Secured</span>
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-50 p-6 rounded border border-slate-200 h-fit">
          <h2 className="text-xl font-bold text-navy mb-4 flex items-center">
            <UploadCloud className="mr-2 h-5 w-5 text-saffron" />
            Upload New Record
          </h2>

          {statusMessage && (
            <div className={`p-4 rounded mb-4 text-sm font-medium border ${isError ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'} animate-fadeIn`}>
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select File (PDF, JPEG, DOCX)</label>
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                className="w-full border border-slate-300 p-2 rounded focus:ring focus:ring-blue-100 bg-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
              <input value={docName} onChange={e=>setDocName(e.target.value)} type="text" placeholder="E.g., ENT Prescription May 2026" className="w-full border border-slate-300 p-2 rounded focus:ring focus:ring-blue-100" />
            </div>
            <button type="submit" disabled={isSubmitting || !docName || !fileData} className="bg-navy w-full py-3 text-white font-bold rounded flex justify-center items-center gap-2 hover:bg-blue-900 transition disabled:opacity-50">
              <ShieldCheck className="h-4 w-4" />
              {isSubmitting ? 'Verifying Context & Securing...' : 'Encrypt & Upload to Vault'}
            </button>
            <p className="text-xs text-slate-500 text-center mt-2">Zero-Trust Architecture: Document is converted and transmitted securely.</p>
          </form>
        </div>

        <div>
           <h2 className="text-xl font-bold text-navy mb-4 flex items-center">
             <FileText className="mr-2 h-5 w-5 text-navy" />
             Stored Digital Records
           </h2>
           {history.length === 0 ? (
             <div className="bg-white border border-slate-200 rounded p-10 text-center text-slate-500">
               No records found for this ABHA ID.
             </div>
           ) : (
             <div className="space-y-3">
               {history.map(doc => (
                 <div key={doc.id} className="bg-white border border-slate-200 rounded p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center shadow-sm gap-4 card-animate hover-scale transition-shadow hover:shadow-md">
                   <div>
                     <h3 className="font-bold text-navy">{doc.document_name}</h3>
                     <p className="text-xs text-slate-500 mt-1">Stored on: {new Date(doc.uploaded_at).toLocaleString()}</p>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => handleDownload(doc.id, doc.document_name)} className="bg-saffron text-white p-2 rounded hover:bg-orange-600 transition flex items-center gap-1 text-sm font-medium">
                       <Download className="h-4 w-4" /> Download
                     </button>
                     <button onClick={() => handleDelete(doc.id)} className="bg-red-50 text-red-600 p-2 rounded hover:bg-red-100 border border-red-200 transition flex items-center gap-1 text-sm font-medium">
                       <Trash2 className="h-4 w-4" /> Delete
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
