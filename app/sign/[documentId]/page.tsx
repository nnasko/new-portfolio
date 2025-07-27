'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, PenTool, Clock, AlertCircle, RotateCcw } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
}

interface Document {
  id: string;
  documentNumber: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'SENT' | 'ACKNOWLEDGED' | 'EXPIRED' | 'VOIDED';
  Client?: Client;
  createdAt: string;
  sentAt?: string;
  acknowledgedAt?: string;
}

export default function SignDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const documentId = params.documentId as string;

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/legal/public/${documentId}`);
      const data = await response.json();

      if (data.success) {
        setDocument(data.document);
        if (data.document.status === 'ACKNOWLEDGED') {
          setSigned(true);
        }
      } else {
        setError(data.error || 'Document not found');
      }
    } catch (err) {
      setError('Failed to load document');
      console.error('Error fetching document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!document) return;
    
    // Check if signature is required
    if (!signature) {
      setShowSignatureModal(true);
      return;
    }

    setSigning(true);
    try {
      const response = await fetch(`/api/legal/public/${documentId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature }),
      });

      const data = await response.json();

      if (data.success) {
        setSigned(true);
        setDocument(prev => prev ? { ...prev, status: 'ACKNOWLEDGED' as const, acknowledgedAt: new Date().toISOString() } : null);
      } else {
        setError(data.error || 'Failed to sign document');
      }
    } catch (err) {
      setError('Failed to sign document');
      console.error('Error signing document:', err);
    } finally {
      setSigning(false);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignature(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signatureData = canvas.toDataURL('image/png');
    setSignature(signatureData);
    setShowSignatureModal(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [showSignatureModal]);

  const downloadPDF = () => {
    window.open(`/api/legal/public/${documentId}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400 lowercase">loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-light text-neutral-900 dark:text-neutral-100 mb-2 lowercase">
            document not found
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 lowercase">
            {error || 'the document you are looking for does not exist or has expired.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase"
          >
            return home
          </button>
        </div>
      </div>
    );
  }

  if (signed || document.status === 'ACKNOWLEDGED') {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-light text-neutral-900 dark:text-neutral-100 mb-2 lowercase">
            document signed
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 lowercase">
            thank you for signing the service agreement.
          </p>
          <div className="space-y-3">
            <button
              onClick={downloadPDF}
              className="w-full flex items-center justify-center gap-2 border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase"
            >
              <FileText size={16} />
              download signed copy
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase"
            >
              return home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-neutral-900 dark:text-neutral-100 mb-2 lowercase">
            service agreement
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 lowercase">
            please review and sign the document below
          </p>
        </div>

        {/* Document Info */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 mb-6 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-500 lowercase">document number</p>
                <p className="font-mono">{document.documentNumber}</p>
              </div>
              <div>
                <p className="text-neutral-500 lowercase">client</p>
                <p>{document.Client?.name}</p>
              </div>
              <div>
                <p className="text-neutral-500 lowercase">title</p>
                <p>{document.title}</p>
              </div>
              <div>
                <p className="text-neutral-500 lowercase">status</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 lowercase">
                  <Clock className="h-3 w-3 mr-1" />
                  awaiting signature
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 mb-6">
          <div className="p-6">
            <div 
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: document.content }}
            />
          </div>
        </div>

        {/* Signature Preview */}
        {signature && (
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 mb-6">
            <div className="p-6">
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 lowercase">your signature</h3>
              <img src={signature} alt="Your signature" className="border border-neutral-200 dark:border-neutral-700 h-16 max-w-full" />
              <button
                onClick={() => setSignature(null)}
                className="mt-3 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors lowercase"
              >
                clear signature
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={downloadPDF}
            className="flex items-center justify-center gap-2 border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-6 py-3 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase"
          >
            <FileText size={16} />
            download pdf
          </button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSign}
            disabled={signing}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 font-medium transition-colors lowercase"
          >
            {signing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                signing...
              </>
            ) : signature ? (
              <>
                <CheckCircle size={16} />
                sign with saved signature
              </>
            ) : (
              <>
                <PenTool size={16} />
                sign document
              </>
            )}
          </motion.button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-neutral-500 lowercase">
          <p>by signing this document, you agree to its terms and conditions.</p>
          <p className="mt-2">digital signatures have the same legal validity as handwritten signatures.</p>
        </div>

        {/* Signature Modal */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-light text-neutral-900 dark:text-neutral-100 mb-4 lowercase">
                  sign document
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 lowercase">
                  please draw your signature in the box below
                </p>
                
                <div className="border border-neutral-300 dark:border-neutral-600 bg-white mb-4">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="block w-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (rect && canvasRef.current) {
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;
                        setIsDrawing(true);
                        const ctx = canvasRef.current.getContext('2d');
                        if (ctx) {
                          ctx.beginPath();
                          ctx.moveTo(x, y);
                        }
                      }
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      if (!isDrawing) return;
                      const touch = e.touches[0];
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (rect && canvasRef.current) {
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;
                        const ctx = canvasRef.current.getContext('2d');
                        if (ctx) {
                          ctx.lineTo(x, y);
                          ctx.stroke();
                        }
                      }
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      setIsDrawing(false);
                    }}
                  />
                </div>

                {signature && (
                  <div className="mb-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 lowercase">signature preview:</p>
                    <img src={signature} alt="Signature" className="border border-neutral-200 dark:border-neutral-700 max-w-full h-16" />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={clearSignature}
                    className="flex items-center gap-2 border border-neutral-300 bg-neutral-100 dark:bg-neutral-700 dark:border-neutral-600 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors lowercase"
                  >
                    <RotateCcw size={14} />
                    clear
                  </button>
                  <button
                    onClick={() => setShowSignatureModal(false)}
                    className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-700 dark:border-neutral-600 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors lowercase"
                  >
                    cancel
                  </button>
                  <button
                    onClick={saveSignature}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm transition-colors lowercase"
                  >
                    save signature
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 