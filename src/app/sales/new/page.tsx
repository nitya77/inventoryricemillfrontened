"use client";
import API_BASE_URL from "@/utils/api";

import {
  Zap,
  Calendar,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Package,
  User,
  Box,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SearchableSelect from "@/components/SearchableSelect";
import { alertSuccess, alertError, alertWarning } from "@/utils/alerts";

const UNITS = [
  { id: "Kg", label: "Kg" },
  { id: "Qtl", label: "Qtl" },
  { id: "Ton", label: "Ton" },
];

type SaleItem = {
  variety: string;
  varietyId: string;
  productType: string;
  bagsSold: string;
  weightSold: string;
  rate: string;
  quality: string;
  qualityId: string;
  unit: string;
};

function NewSalesInvoicePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillId = searchParams.get("partyId");
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [invoiceHeader, setInvoiceHeader] = useState({
    buyerName: "",
    partyId: "",
    salesDate: "",
    paymentMode: "Credit", // Default to Credit
    paymentDetails: "",
    chequeNo: "",
    bankName: "",
    utrNo: "",
    chequeDate: ""
  });

  const [items, setItems] = useState<SaleItem[]>([
    { variety: "", varietyId: "", productType: "Finished", bagsSold: "", weightSold: "", rate: "", quality: "Fresh", qualityId: "", unit: "Kg" },
  ]);

  useEffect(() => {
    setInvoiceHeader(h => ({ ...h, salesDate: new Date().toISOString().split("T")[0] }));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/parties?limit=1000&type=customer`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          const list = data.items.map((c: any) => ({
            id: String(c.id), // Use numeric ID
            label: c.name,
            subLabel: `${c.category} | ${c.phone || 'No Contact'}`,
          }));
          setCustomers(list);

          // Handle pre-fill
          if (prefillId) {
            const match = list.find((c: any) => c.id === prefillId);
            if (match) {
              setInvoiceHeader(h => ({ ...h, partyId: match.id, buyerName: match.label }));
            }
          }
        }
      });

    fetch(`${API_BASE_URL}/api/products?limit=1000`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setProducts(
            data.items.map((p: any) => ({
              id: `${p.variety}|${p.type}|${p.quality || 'Fresh'}|${p.variety_id}|${p.quality_id}`,
              label: `${p.variety} ${p.quality ? `(${p.quality})` : ''}`,
              subLabel: `${p.type} | ${p.name} | ${Number(p.quantity).toLocaleString()} Kg`,
            }))
          );
        }
      });
  }, [prefillId]);

  const addItemRow = () => {
    setItems([
      ...items,
      { variety: "", varietyId: "", productType: "Finished", bagsSold: "", weightSold: "", rate: "", quality: "Fresh", qualityId: "", unit: "Kg" },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SaleItem, value: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.weightSold) * Number(item.rate),
    0
  );
  const totalWeight = items.reduce((sum, item) => sum + Number(item.weightSold), 0);
  const totalBags = items.reduce((sum, item) => sum + Number(item.bagsSold), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceHeader.buyerName) return alertWarning("Please select a buyer");
    if (items.some((it) => !it.variety)) return alertWarning("Please select a variety for all rows");

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: invoiceHeader.buyerName,
          partyId: invoiceHeader.partyId || null,
          salesDate: invoiceHeader.salesDate,
          paymentMode: invoiceHeader.paymentMode,
          paymentDetails: invoiceHeader.paymentMode === "Cheque" 
            ? `CHQ: ${invoiceHeader.chequeNo} | ${invoiceHeader.bankName} | ${invoiceHeader.chequeDate}`
            : invoiceHeader.paymentMode === "Bank"
            ? `UTR: ${invoiceHeader.utrNo} | ${invoiceHeader.bankName}`
            : invoiceHeader.paymentDetails,
          items: items.map(i => ({
            variety: i.variety,
            varietyId: i.varietyId,
            quality: i.quality,
            qualityId: i.qualityId,
            weightSold: Number(i.weightSold),
            rate: Number(i.rate),
            bagsSold: Number(i.bagsSold),
            unit: i.unit
          }))
        }),
      });


      if (res.ok) {
        alertSuccess("Sales Invoice generated successfully");
        router.push("/sales");
      } else {
        const d = await res.json();
        alertError(d.error || "Failed to generate invoice");
      }
    } catch (err) {
      console.error(err);
      alertError("API failure, cannot dispatch request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <Link
            href="/sales"
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Registry</span>
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Zap size={32} className="text-indigo-600" /> Commercial Dispatch
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Create a new industrial sales invoice and authorize stock exit.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden"
      >
        {/* Header Section */}
        <div className="p-10 border-b border-slate-100 bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <SearchableSelect
                label="Consignee Entity"
                placeholder="Search and Select Buyer"
                options={customers}
                value={invoiceHeader.partyId || invoiceHeader.buyerName}
                onChange={(val) => {
                  const c = customers.find(x => x.id === val);
                  if (c) {
                    setInvoiceHeader({ ...invoiceHeader, buyerName: c.label, partyId: c.id });
                  } else {
                    setInvoiceHeader({ ...invoiceHeader, buyerName: String(val), partyId: "" });
                  }
                }}
                icon={User}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">
                Dispatch Date
              </label>
              <div className="relative group">
                <Calendar
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                />
                <input
                  type="date"
                  required
                  value={invoiceHeader.salesDate}
                  onChange={(e) => setInvoiceHeader({ ...invoiceHeader, salesDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">
                  Payment Mode
                </label>
                <select
                  value={invoiceHeader.paymentMode}
                  onChange={(e) => setInvoiceHeader({ ...invoiceHeader, paymentMode: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236366f1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E')] bg-[length:10px] bg-[right_1rem_center] bg-no-repeat"
                >
                  <option value="Credit">Credit (Post to Ledger)</option>
                  <option value="Cash">Cash / Immediate</option>
                  <option value="Bank">Bank Transfer / RTGS / NEFT</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {invoiceHeader.paymentMode === "Cheque" ? (
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Cheque Number</label>
                    <input 
                      type="text" 
                      placeholder="6 digit"
                      value={invoiceHeader.chequeNo}
                      onChange={(e) => setInvoiceHeader({ ...invoiceHeader, chequeNo: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Bank Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ICICI"
                      value={invoiceHeader.bankName}
                      onChange={(e) => setInvoiceHeader({ ...invoiceHeader, bankName: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm"
                    />
                  </div>
                </div>
              ) : invoiceHeader.paymentMode === "Bank" ? (
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">UTR / Transaction ID</label>
                    <input 
                      type="text" 
                      placeholder="Ref No."
                      value={invoiceHeader.utrNo}
                      onChange={(e) => setInvoiceHeader({ ...invoiceHeader, utrNo: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Bank Reference</label>
                    <input 
                      type="text" 
                      placeholder="Bank Name"
                      value={invoiceHeader.bankName}
                      onChange={(e) => setInvoiceHeader({ ...invoiceHeader, bankName: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">
                    Payment Details (Transaction ID, etc.)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. UPI Ref: 123456 | HDFC Bank"
                    value={invoiceHeader.paymentDetails}
                    onChange={(e) => setInvoiceHeader({ ...invoiceHeader, paymentDetails: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm"
                  />
                </div>
              )}
            </div>
            
            {invoiceHeader.paymentMode === "Cheque" && (
              <div className="space-y-3 max-w-[200px] text-left">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Cheque Issue Date</label>
                <input 
                  type="date"
                  value={invoiceHeader.chequeDate}
                  onChange={(e) => setInvoiceHeader({ ...invoiceHeader, chequeDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Items Section */}
        <div className="p-10 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
              <Package size={18} className="text-indigo-600" /> Line Items
            </h2>
            <button
              type="button"
              onClick={addItemRow}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
            >
              <Plus size={14} /> Add Variety
            </button>
          </div>

          {/* Column Labels */}
          <div className="hidden md:grid md:grid-cols-[2rem_1fr_8rem_10rem_10rem_9rem_2.5rem] gap-4 px-5 pb-2">
            <div />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Variety / Grade</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Bags</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Weight Qty</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Rate</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Valuation</span>
            <div />
          </div>

          {/* Item Rows */}
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-slate-50/60 border border-slate-100 rounded-2xl px-5 py-4 flex flex-col md:grid md:grid-cols-[2rem_1fr_8rem_10rem_10rem_9rem_2.5rem] gap-4 items-center hover:border-indigo-100 hover:bg-indigo-50/20 transition-all group"
              >
                {/* Row Number */}
                <div className="flex items-center justify-center w-8 h-8 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-500 transition-all shrink-0 self-center">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Variety / Grade */}
                <div className="w-full">
                  <SearchableSelect
                    placeholder="Select Variety / Grade"
                    options={products}
                    value={`${item.variety}|${item.productType}|${item.quality}|${item.varietyId}|${item.qualityId}`}
                    onChange={(val) => {
                      const [variety, type, quality, varietyId, qualityId] = String(val).split('|');
                      const next = [...items];
                      next[index] = { ...next[index], variety, varietyId, productType: type, quality, qualityId };
                      setItems(next);
                    }}
                    icon={Box}
                  />
                </div>

                {/* Bags */}
                <input
                  type="number"
                  required
                  value={item.bagsSold}
                  onChange={(e) => updateItem(index, "bagsSold", e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-black outline-none focus:border-indigo-600 transition-all text-center placeholder:text-slate-300 shadow-sm"
                />

                {/* Weight */}
                <input
                  type="number"
                  required
                  value={item.weightSold}
                  onChange={(e) => updateItem(index, "weightSold", e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-black outline-none focus:border-indigo-600 transition-all text-center placeholder:text-slate-300 shadow-sm"
                />

                {/* Rate */}
                <div className="relative w-full group/rate">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 group-focus-within/rate:text-indigo-500 transition-colors">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    value={item.rate}
                    onChange={(e) => updateItem(index, "rate", e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-4 py-3.5 text-xs font-black outline-none focus:border-indigo-600 transition-all text-center placeholder:text-slate-300 shadow-sm"
                  />
                </div>

                {/* Computed Valuation */}
                <div className="flex flex-col items-end w-full">
                  <span className="text-sm font-black text-slate-900 tracking-tighter">
                    ₹{(Number(item.weightSold) * Number(item.rate)).toLocaleString()}
                  </span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    Valued
                  </span>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  disabled={items.length === 1}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-20 shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Aggregates */}
        <div className="p-10 bg-slate-900 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-12">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Aggregate Exit Load
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white tracking-tighter">
                  {totalWeight.toLocaleString()}
                </span>
                <span className="text-[10px] font-black text-slate-600 uppercase">Total Weight</span>
              </div>
            </div>
            <div className="w-[1px] h-10 bg-slate-800" />
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Standard Jute Bags
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white tracking-tighter">{totalBags}</span>
                <span className="text-[10px] font-black text-slate-600 uppercase">Units</span>
              </div>
            </div>
            <div className="w-[1px] h-10 bg-slate-800" />
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">
                Total Invoice Valuation
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-400 tracking-tighter">
                  ₹{totalAmount.toLocaleString()}
                </span>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">
                  Paid
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-600/40 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              "Synchronizing Asset Exit..."
            ) : (
              <>
                <Save size={18} />
                Authorize &amp; Finalize Invoice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewSalesInvoicePage() {
  return (
    <Suspense fallback={
      <div className="p-20 text-center space-y-4 animate-pulse">
        <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto" />
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">Preparing Sales Invoice Terminal...</p>
      </div>
    }>
      <NewSalesInvoicePageContent />
    </Suspense>
  );
}
