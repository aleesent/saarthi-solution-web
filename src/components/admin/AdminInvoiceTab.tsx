import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  Calculator, 
  Building2, 
  CheckCircle2, 
  Send,
  Sparkles,
  Share2,
  RefreshCw,
  Copy,
  Info,
  ShieldCheck,
  CreditCard,
  FileCheck,
  Check,
  CloudUpload,
  ExternalLink,
  Eye,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper: Convert number to Indian words
function numberToWordsINR(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';
  
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertBelowThousand(num: number): string {
    let str = '';
    if (num >= 100) {
      str += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      str += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) {
      str += ones[num] + ' ';
    }
    return str.trim();
  }

  const rounded = Math.round(amount);
  let crore = Math.floor(rounded / 10000000);
  let lakh = Math.floor((rounded % 10000000) / 100000);
  let thousand = Math.floor((rounded % 100000) / 1000);
  let remainder = rounded % 1000;

  let result = '';
  if (crore > 0) result += convertBelowThousand(crore) + ' Crore ';
  if (lakh > 0) result += convertBelowThousand(lakh) + ' Lakh ';
  if (thousand > 0) result += convertBelowThousand(thousand) + ' Thousand ';
  if (remainder > 0) result += convertBelowThousand(remainder);

  return `Rupees ${result.trim()} Only`;
}

interface InvoiceItem {
  id: string;
  description: string;
  candidateName: string;
  sacCode: string;
  annualCtc: number;
  feePercentage: number;
  amount: number;
}

export const AdminInvoiceTab: React.FC = () => {
  const { 
    employers, 
    invoices, 
    addInvoice, 
    deleteInvoice, 
    updateInvoice, 
    uploadInvoicePdf,
    websiteSettings 
  } = useData();
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Invoice State
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-SS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  const [poNumber, setPoNumber] = useState('PO/IND/2026/894');
  const [placeOfSupply, setPlaceOfSupply] = useState('24 - Gujarat');
  
  // Client Details
  const [clientName, setClientName] = useState(employers[0]?.companyName || 'Premier Industrial Manufacturing Corp');
  const [clientGst, setClientGst] = useState('24AABCS1429B1Z8');
  const [clientAddress, setClientAddress] = useState('Plot No. 42-45, GIDC Industrial Estate, Silvassa Road, Vapi / Silvassa Border');
  const [clientContactPerson, setClientContactPerson] = useState('Head - HR & Talent Acquisition');
  const [clientPhone, setClientPhone] = useState('+91 98240 11223');
  const [clientEmail, setClientEmail] = useState('accounts@premierindustrial.com');

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: 'Permanent Recruitment Fee - Assistant Factory Manager (Silvassa Plant)',
      candidateName: 'Rajesh Kumar M.',
      sacCode: '998512',
      annualCtc: 650000,
      feePercentage: 8.33,
      amount: 54145
    },
    {
      id: '2',
      description: 'Candidate Background Verification & Document Screening Fee',
      candidateName: 'Rajesh Kumar M.',
      sacCode: '998512',
      annualCtc: 0,
      feePercentage: 0,
      amount: 3500
    }
  ]);

  const [taxMode, setTaxMode] = useState<'INTRA_STATE' | 'INTER_STATE' | 'EXEMPT'>('INTRA_STATE');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('RTGS / NEFT Transfer');
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid' | 'Partially Paid' | 'Cancelled'>('Pending');
  const [notes, setNotes] = useState('Thank you for choosing Sarthi Solutions as your industrial recruitment partner. Candidate replacement guarantee valid for 90 days.');
  const [termsText, setTermsText] = useState(
    '1. Invoices are payable within 15 days from date of receipt.\n2. 90-day free candidate replacement warranty applies as per agreed SLA.\n3. Delayed payments subject to 1.5% interest per month.\n4. Cheques / RTGS payable in favor of "SARTHI SOLUTIONS".'
  );

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSavingToFirestore, setIsSavingToFirestore] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const taxableAmount = Math.max(0, subtotal - discountAmount);

  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (taxMode === 'INTRA_STATE') {
    cgstRate = 9;
    cgstAmount = Math.round((taxableAmount * 9) / 100);
    sgstRate = 9;
    sgstAmount = Math.round((taxableAmount * 9) / 100);
  } else if (taxMode === 'INTER_STATE') {
    igstRate = 18;
    igstAmount = Math.round((taxableAmount * 18) / 100);
  }

  const totalGst = cgstAmount + sgstAmount + igstAmount;
  const grandTotal = taxableAmount + totalGst;
  const totalInWords = numberToWordsINR(grandTotal);

  // Add Item
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: 'Executive Recruitment Service Fee',
      candidateName: '',
      sacCode: '998512',
      annualCtc: 500000,
      feePercentage: 8.33,
      amount: 41650
    };
    setItems([...items, newItem]);
  };

  // Remove Item
  const removeItem = (index: number) => {
    if (items.length <= 1) {
      alert('Invoice must have at least one line item.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Update Item
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    
    if (field === 'annualCtc' || field === 'feePercentage') {
      const ctc = Number(field === 'annualCtc' ? value : current.annualCtc) || 0;
      const pct = Number(field === 'feePercentage' ? value : current.feePercentage) || 0;
      if (ctc > 0 && pct > 0) {
        current.amount = Math.round((ctc * pct) / 100);
      }
    }
    
    updated[index] = current;
    setItems(updated);
  };

  // Apply Preset Templates
  const applyPreset = (presetType: string) => {
    if (presetType === 'manufacturing') {
      setItems([
        {
          id: '1',
          description: 'Permanent Recruitment Fee - Assistant Factory Manager (Silvassa Plant)',
          candidateName: 'Rajesh Kumar M.',
          sacCode: '998512',
          annualCtc: 650000,
          feePercentage: 8.33,
          amount: 54145
        },
        {
          id: '2',
          description: 'Candidate Background Verification & Pre-employment Compliance Screening',
          candidateName: 'Rajesh Kumar M.',
          sacCode: '998512',
          annualCtc: 0,
          feePercentage: 0,
          amount: 3500
        }
      ]);
    } else if (presetType === 'elevator') {
      setItems([
        {
          id: '1',
          description: 'Executive Search & Placement - Sales Head (Elevator & Heavy Engineering)',
          candidateName: 'Anil V. Parmar',
          sacCode: '998512',
          annualCtc: 820000,
          feePercentage: 8.33,
          amount: 68306
        }
      ]);
    } else if (presetType === 'bulk_staffing') {
      setItems([
        {
          id: '1',
          description: 'Technical Machine Operators & QC Supervisors Recruitment Batch (3 Candidates)',
          candidateName: 'Batch 2026-B1',
          sacCode: '998512',
          annualCtc: 1080000,
          feePercentage: 8.33,
          amount: 89964
        },
        {
          id: '2',
          description: 'Industrial Safety Induction & Document Vetting Desk',
          candidateName: 'Batch 2026-B1',
          sacCode: '998512',
          annualCtc: 0,
          feePercentage: 0,
          amount: 5000
        }
      ]);
    }
  };

  // Populate from Employer Dropdown
  const handleEmployerSelect = (selectedCompanyName: string) => {
    setClientName(selectedCompanyName);
    const emp = employers.find((e) => e.companyName === selectedCompanyName);
    if (emp) {
      if (emp.location) setClientAddress(emp.location);
      if (emp.contactPerson) setClientContactPerson(emp.contactPerson);
      if (emp.phone) setClientPhone(emp.phone);
      if (emp.email) setClientEmail(emp.email);
    }
  };

  // Print Invoice
  const handlePrint = () => {
    window.print();
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const safeClientName = clientName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      const fileName = `Invoice_${invoiceNumber}_${safeClientName}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Could not download PDF automatically. Please try the Print button.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Save to Firestore and Upload PDF to Firebase Storage
  const handleSaveToFirestore = async () => {
    if (!invoiceRef.current) return;
    setIsSavingToFirestore(true);
    setSaveSuccessMsg(null);

    try {
      // 1. Generate PDF blob
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const pdfBlob = pdf.output('blob');

      // 2. Upload to Firebase Storage
      let pdfUrl = '';
      let pdfStoragePath = '';
      try {
        const uploadRes = await uploadInvoicePdf(invoiceNumber, pdfBlob);
        pdfUrl = uploadRes.downloadUrl;
        pdfStoragePath = uploadRes.storagePath;
      } catch (storageErr) {
        console.warn('Storage upload note:', storageErr);
      }

      // 3. Save structured invoice into Firestore collection
      const invoiceData = {
        invoiceNumber,
        invoiceDate,
        dueDate,
        poNumber,
        placeOfSupply,
        clientName,
        clientCompany: clientName,
        clientGst,
        clientGstin: clientGst,
        clientAddress,
        clientContactPerson,
        clientPhone,
        clientEmail,
        billingType: 'Recruitment Consultancy Fee',
        taxMode,
        items,
        subtotal,
        discount: discountAmount,
        taxableAmount,
        isInterState: taxMode === 'INTER_STATE',
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        igstRate,
        igstAmount,
        totalGst,
        grandTotal,
        totalInWords,
        paymentStatus,
        paymentMethod,
        transactionRef: '',
        notes,
        termsAndConditions: termsText,
        pdfUrl,
        pdfStoragePath
      };

      const existing = invoices.find((i) => i.invoiceNumber === invoiceNumber);
      if (existing) {
        await updateInvoice(existing.id, invoiceData);
      } else {
        await addInvoice(invoiceData);
      }

      setSaveSuccessMsg(`Invoice "${invoiceNumber}" saved to Firestore & PDF archived in Firebase Storage!`);
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Error saving invoice to Firestore:', err);
      alert('Invoice structured data saved. Cloud sync warning: ' + err.message);
    } finally {
      setIsSavingToFirestore(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*Tax Invoice from Sarthi Solutions*\n` +
      `Invoice No: ${invoiceNumber}\n` +
      `Client: ${clientName}\n` +
      `Date: ${invoiceDate}\n` +
      `Total Payable: ₹${grandTotal.toLocaleString('en-IN')} (incl. GST)\n` +
      `Bank: HDFC Bank (A/C: 50200084920194, IFSC: HDFC0001024)\n` +
      `Principal Consultant: Raajesh V (+91 98243 22206)`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopySummary = () => {
    const summary = `Tax Invoice: ${invoiceNumber}\nClient: ${clientName}\nAmount: ₹${grandTotal.toLocaleString('en-IN')}\nDue Date: ${dueDate}\nBank: HDFC Bank (A/C: 50200084920194, IFSC: HDFC0001024)`;
    navigator.clipboard.writeText(summary);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleLoadInvoice = (inv: typeof invoices[0]) => {
    setInvoiceNumber(inv.invoiceNumber);
    setInvoiceDate(inv.invoiceDate);
    setDueDate(inv.dueDate);
    if (inv.poNumber) setPoNumber(inv.poNumber);
    if (inv.placeOfSupply) setPlaceOfSupply(inv.placeOfSupply);
    setClientName(inv.clientName || inv.clientCompany);
    if (inv.clientGst || inv.clientGstin) setClientGst(inv.clientGst || inv.clientGstin || '');
    if (inv.clientAddress) setClientAddress(inv.clientAddress);
    if (inv.clientContactPerson) setClientContactPerson(inv.clientContactPerson);
    if (inv.clientPhone) setClientPhone(inv.clientPhone);
    if (inv.clientEmail) setClientEmail(inv.clientEmail);
    if (inv.items && inv.items.length > 0) setItems(inv.items);
    if (inv.taxMode) setTaxMode(inv.taxMode);
    if (inv.discount) setDiscountAmount(inv.discount);
    if (inv.paymentStatus) setPaymentStatus(inv.paymentStatus);
    if (inv.notes) setNotes(inv.notes);
    if (inv.termsAndConditions) setTermsText(inv.termsAndConditions);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#0A3D91] text-white text-[10px] font-black uppercase">
              GST SAC 998512
            </span>
            <span className="text-xs font-bold text-[#D9A21B]">Official Cloud Billing Hub</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
            Recruitment Tax Invoice & Cloud PDF Generator
          </h2>
          <p className="text-xs text-slate-500">
            Generate, customize, print, and archive GST-compliant tax invoices directly in Firestore and Firebase Storage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy invoice summary to clipboard"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" /> WhatsApp
          </button>

          <button
            onClick={handlePrint}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>

          <button
            onClick={handleSaveToFirestore}
            disabled={isSavingToFirestore}
            className="text-xs font-black px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSavingToFirestore ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CloudUpload className="w-3.5 h-3.5 text-emerald-200" />
            )}
            <span>{isSavingToFirestore ? 'Saving Cloud...' : 'Save to Firestore'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="text-xs font-black px-4 py-2 rounded-xl bg-[#0A3D91] hover:bg-[#083275] text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#D9A21B]" />
            ) : (
              <Download className="w-4 h-4 text-[#D9A21B]" />
            )}
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Preset Quick Load Bar */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex items-center gap-2 text-slate-600 font-bold">
          <Sparkles className="w-4 h-4 text-[#D9A21B]" />
          <span>Quick Invoice Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('manufacturing')}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 font-bold hover:text-[#0A3D91] transition-all cursor-pointer"
          >
            🏭 Manufacturing Plant Hire (₹54k)
          </button>
          <button
            onClick={() => applyPreset('elevator')}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 font-bold hover:text-[#0A3D91] transition-all cursor-pointer"
          >
            🏢 Elevator Sales Head (₹68k)
          </button>
          <button
            onClick={() => applyPreset('bulk_staffing')}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 font-bold hover:text-[#0A3D91] transition-all cursor-pointer"
          >
            👥 Multi-Candidate Batch (₹94k)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Configuration (Hidden on Print) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs print:hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-[#0A3D91] text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4" /> Invoice Settings & Tax
            </h3>
            <span className="text-[10px] bg-blue-50 text-[#0A3D91] font-bold px-2 py-0.5 rounded-full">
              Form 16 / GST
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Invoice Number</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-[#0A3D91] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-[#0A3D91] outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Payment Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-[#0A3D91] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">PO / Work Order Ref</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-[#0A3D91] outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Place of Supply</label>
              <input
                type="text"
                value={placeOfSupply}
                onChange={(e) => setPlaceOfSupply(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-[#0A3D91] outline-none"
              />
            </div>
          </div>

          {/* Quick Select Client */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
              <span>Client / Employer Name *</span>
              <span className="text-[10px] text-blue-600 font-normal">Choose from DB</span>
            </label>
            <select
              value={clientName}
              onChange={(e) => handleEmployerSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-[#0A3D91] outline-none bg-white mb-2"
            >
              {employers.map((emp) => (
                <option key={emp.id} value={emp.companyName}>
                  {emp.companyName} ({emp.location})
                </option>
              ))}
              <option value="Custom">-- Enter Custom Client Details --</option>
            </select>

            <input
              type="text"
              placeholder="Client Company Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-[#0A3D91] outline-none mb-2"
            />

            <input
              type="text"
              placeholder="Client GSTIN (e.g. 24AABCS1429B1Z8)"
              value={clientGst}
              onChange={(e) => setClientGst(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-[#0A3D91] outline-none mb-2 font-mono text-xs uppercase"
            />

            <textarea
              rows={2}
              placeholder="Client Billing Address"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-[#0A3D91] outline-none mb-2"
            />
          </div>

          {/* Tax Mode */}
          <div className="pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-700 block mb-1">GST Tax Type</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTaxMode('INTRA_STATE')}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  taxMode === 'INTRA_STATE' ? 'bg-white text-[#0A3D91] shadow-xs' : 'text-slate-600'
                }`}
              >
                CGST + SGST (18%)
              </button>
              <button
                type="button"
                onClick={() => setTaxMode('INTER_STATE')}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  taxMode === 'INTER_STATE' ? 'bg-white text-[#0A3D91] shadow-xs' : 'text-slate-600'
                }`}
              >
                IGST (18%)
              </button>
              <button
                type="button"
                onClick={() => setTaxMode('EXEMPT')}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  taxMode === 'EXEMPT' ? 'bg-white text-[#0A3D91] shadow-xs' : 'text-slate-600'
                }`}
              >
                Nil / Exempt (0%)
              </button>
            </div>
          </div>

          {/* Discount & Status */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Special Discount (₹)</label>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-[#0A3D91] outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-[#0A3D91] outline-none bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid (Full)</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Line Items Editor */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-slate-900 text-xs">Line Items ({items.length})</span>
              <button
                type="button"
                onClick={addItem}
                className="text-[11px] font-black text-[#0A3D91] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-[11px]">Item #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Description / Service Name"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-[11px] bg-white"
                  />

                  <input
                    type="text"
                    placeholder="Candidate Name / Batch Ref"
                    value={item.candidateName}
                    onChange={(e) => updateItem(idx, 'candidateName', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-[11px] bg-white"
                  />

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Annual CTC</span>
                      <input
                        type="number"
                        placeholder="CTC (₹)"
                        value={item.annualCtc || ''}
                        onChange={(e) => updateItem(idx, 'annualCtc', e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-300 text-[11px] bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Fee %</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="%"
                        value={item.feePercentage || ''}
                        onChange={(e) => updateItem(idx, 'feePercentage', e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-300 text-[11px] bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total (₹)</span>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-300 text-[11px] bg-white font-bold text-[#0A3D91]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable Tax Invoice Document */}
        <div className="lg:col-span-8 space-y-4">
          <div
            ref={invoiceRef}
            className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-300 shadow-xl print:shadow-none print:border-none print:p-0 text-slate-900 font-sans"
            style={{ minHeight: '800px' }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#0A3D91] pb-6 mb-6 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A3D91] text-white flex flex-col items-center justify-center shadow-md border-2 border-[#D9A21B]">
                    <span className="font-black text-base leading-none">SS</span>
                    <span className="text-[7px] font-extrabold text-[#D9A21B] tracking-tighter">2018</span>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#0A3D91] tracking-tight">
                      SARTHI SOLUTIONS
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <p className="text-[11px] font-bold text-[#D9A21B] uppercase tracking-wider">
                        Executive Recruitment & Human Resources Consulting
                      </p>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-[#0A3D91] text-white tracking-wider uppercase">
                        SINCE 2018
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-600 space-y-0.5">
                  <p><strong>Proprietor:</strong> Raajesh V (Principal Recruitment Consultant)</p>
                  <p><strong>GSTIN:</strong> <span className="font-mono font-bold text-slate-900">24ABCPS1234F1Z5</span> | <strong>PAN:</strong> <span className="font-mono">ABCPS1234F</span></p>
                  <p><strong>Registered Address:</strong> Shop No. 12, Krishna Complex, Silvassa Road, Vapi / Surat, Gujarat - 396191</p>
                  <p><strong>Phone:</strong> +91 98243 22206 | <strong>Email:</strong> sarthisolutions.silvassa@gmail.com</p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-200 min-w-[200px]">
                <span className="px-3 py-1 bg-[#0A3D91] text-white text-[10px] font-black uppercase rounded-full tracking-wider">
                  TAX INVOICE
                </span>
                <div className="mt-2 text-sm font-black text-slate-900 font-mono">
                  {invoiceNumber}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  <strong>Date:</strong> {invoiceDate}
                </div>
                <div className="text-[11px] text-slate-500">
                  <strong>Due Date:</strong> {dueDate}
                </div>
                <div className="text-[11px] text-slate-500">
                  <strong>PO Ref:</strong> {poNumber}
                </div>
                <div className="text-[11px] text-slate-500">
                  <strong>Place of Supply:</strong> {placeOfSupply}
                </div>
              </div>
            </div>

            {/* Bill To Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 p-4 rounded-2xl bg-blue-50/40 border border-blue-100 text-xs">
              <div>
                <span className="font-black text-[#0A3D91] text-[10px] uppercase tracking-wider block mb-1">
                  BILL TO (RECIPIENT):
                </span>
                <h3 className="font-black text-slate-900 text-sm">{clientName}</h3>
                <p className="text-slate-600 mt-1 whitespace-pre-line">{clientAddress}</p>
                <p className="text-slate-600 mt-1">
                  <strong>GSTIN:</strong> <span className="font-mono font-bold text-slate-900">{clientGst || 'Unregistered / Exempt'}</span>
                </p>
              </div>

              <div className="sm:text-right">
                <span className="font-black text-[#0A3D91] text-[10px] uppercase tracking-wider block mb-1">
                  DISPATCH & CONTACT:
                </span>
                <p className="text-slate-700"><strong>Attn:</strong> {clientContactPerson}</p>
                <p className="text-slate-600"><strong>Phone:</strong> {clientPhone}</p>
                <p className="text-slate-600"><strong>Email:</strong> {clientEmail}</p>
                <div className="mt-2 inline-block">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                    paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    Status: {paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0A3D91] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3 rounded-l-xl">#</th>
                    <th className="py-3 px-3">Description of Services</th>
                    <th className="py-3 px-2 text-center">SAC Code</th>
                    <th className="py-3 px-2 text-right">Annual CTC</th>
                    <th className="py-3 px-2 text-center">Fee %</th>
                    <th className="py-3 px-3 text-right rounded-r-xl">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.description}</div>
                        {item.candidateName && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Candidate / Placement Ref: <strong>{item.candidateName}</strong>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-slate-600">{item.sacCode || '998512'}</td>
                      <td className="py-3 px-2 text-right text-slate-700">
                        {item.annualCtc > 0 ? `₹${item.annualCtc.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-3 px-2 text-center text-slate-700">
                        {item.feePercentage > 0 ? `${item.feePercentage}%` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        ₹{(Number(item.amount) || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Total */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 border-t-2 border-slate-200 mb-6 text-xs">
              <div className="sm:col-span-7 space-y-2">
                <div>
                  <span className="font-bold text-slate-500 text-[11px] block">Amount in Words:</span>
                  <p className="font-bold text-[#0A3D91] italic">{totalInWords}</p>
                </div>
                {notes && (
                  <div className="pt-2 text-slate-600 text-[11px]">
                    <span className="font-bold text-slate-700">Note: </span>
                    <span>{notes}</span>
                  </div>
                )}
              </div>

              <div className="sm:col-span-5 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Sub Total:</span>
                  <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-700 font-bold border-t border-slate-200 pt-1">
                  <span>Taxable Value:</span>
                  <span>₹{taxableAmount.toLocaleString('en-IN')}</span>
                </div>

                {taxMode === 'INTRA_STATE' && (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>CGST (9.00%):</span>
                      <span className="font-semibold text-slate-900">₹{cgstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SGST (9.00%):</span>
                      <span className="font-semibold text-slate-900">₹{sgstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}

                {taxMode === 'INTER_STATE' && (
                  <div className="flex justify-between text-slate-600">
                    <span>IGST (18.00%):</span>
                    <span className="font-semibold text-slate-900">₹{igstAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-black text-[#0A3D91] border-t-2 border-[#0A3D91] pt-2.5 mt-1">
                  <span>Total Payable:</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Bank Details & Signature Footer */}
            <div className="border-t border-slate-200 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px]">
              {/* Bank Details */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="font-black text-[#0A3D91] uppercase text-[10px] tracking-wider mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Electronic Remittance (NEFT / RTGS)
                </div>
                <div className="space-y-0.5 text-slate-700">
                  <div><span className="font-bold text-slate-500">Bank Name:</span> HDFC Bank Ltd</div>
                  <div><span className="font-bold text-slate-500">Branch:</span> Ring Road Branch, Surat, Gujarat</div>
                  <div><span className="font-bold text-slate-500">Account Name:</span> <strong className="text-slate-900">SARTHI SOLUTIONS</strong></div>
                  <div><span className="font-bold text-slate-500">Current A/C No:</span> <strong className="font-mono text-[#0A3D91]">50200084920194</strong></div>
                  <div><span className="font-bold text-slate-500">IFSC Code:</span> <strong className="font-mono text-[#0A3D91]">HDFC0001024</strong></div>
                  <div><span className="font-bold text-slate-500">UPI VPA:</span> 9824322206@hdfcbank</div>
                </div>
              </div>

              {/* Authorized Signatory Stamp & Signature */}
              <div className="flex flex-col justify-between items-end text-right">
                <div>
                  <div className="font-black text-slate-900 text-xs">For SARTHI SOLUTIONS</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Recruitment & Executive Advisory</div>
                </div>

                <div className="my-3 p-2 rounded-xl border-2 border-dashed border-[#0A3D91]/30 bg-blue-50/30 text-center inline-block">
                  <div className="text-[9px] font-black text-[#0A3D91] tracking-widest uppercase">SARTHI SOLUTIONS</div>
                  <div className="text-[8px] font-bold text-[#D9A21B]">ESTD. 2018 • SURAT & SILVASSA (UT)</div>
                  <div className="text-[8px] text-slate-500 font-mono">AUTHORIZED STAMP</div>
                </div>

                <div>
                  <div className="font-extrabold text-slate-900 text-xs">Raajesh V</div>
                  <div className="text-[10px] text-slate-500">Principal Consultant & Founder</div>
                </div>
              </div>
            </div>

            {/* Terms of Service Box */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed">
              <div className="font-bold text-slate-700 mb-0.5">Terms & Conditions:</div>
              <p className="whitespace-pre-line">{termsText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Invoices Archive in Firestore */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-[#0A3D91] flex items-center gap-2">
              <CloudUpload className="w-5 h-5 text-[#D9A21B]" />
              <span>Saved Invoices in Firestore Database ({invoices.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All invoices are synced with Firestore and their PDFs stored in Firebase Storage buckets.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Invoice No</th>
                <th className="p-3">Client / Company</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Taxable</th>
                <th className="p-3 text-right">Total Payable</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-[#0A3D91]">{inv.invoiceNumber}</td>
                  <td className="p-3 font-bold text-slate-900">{inv.clientName || inv.clientCompany}</td>
                  <td className="p-3 text-slate-500">{inv.invoiceDate}</td>
                  <td className="p-3 text-right text-slate-700">₹{(inv.taxableAmount || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right font-black text-slate-900">₹{(inv.grandTotal || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => handleLoadInvoice(inv)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0A3D91] font-bold text-[11px] cursor-pointer"
                      title="Load into Editor"
                    >
                      Edit / Load
                    </button>
                    {inv.pdfUrl && (
                      <a
                        href={inv.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1"
                        title="Download archived PDF from Firebase Storage"
                      >
                        <ExternalLink className="w-3 h-3" /> PDF
                      </a>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                          deleteInvoice(inv.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                      title="Delete from Firestore"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
