"use client";
import API_BASE_URL from "@/utils/api";

import {
  Scale,
  User,
  Truck,
  Droplets,
  Save,
  Calculator,
  ArrowLeft,
  Activity,
  Zap,
  AlertCircle,
  Package,
  Box,
  Plus,
  Trash2,
  Calendar,
  UserCheck,
  Hash,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SearchableSelect from "@/components/SearchableSelect";
import { alertSuccess, alertError, alertWarning } from "@/utils/alerts";

const UNITS = [
  { id: "Kg", label: "Kg" },
  { id: "Qtl", label: "Qtl" },
  { id: "Ton", label: "Ton" },
];

const BAG_WEIGHT = 0.58;
const MOISTURE_LIMIT = 14;
const MOISTURE_DED_PER_POINT = 0.5;
const DEFAULT_RATE = "2200";

type ProcurementItem = {
  variety: string;
  varietyId: string;
  quality: string;
  qualityId: string;
  moisture: string;
  grossWeight: string;
  tareWeight: string;
  bagsCount: string;
  pricePerQuintal: string;
  unit: string;
  bagWeight: string;
  moistureLimit: string;
  moistureFactor: string;
  dustDeduction: string;
};

function calcRow(item: ProcurementItem) {
  const gross = Number(item.grossWeight) || 0;
  const tare = Number(item.tareWeight) || 0;
  const bags = Number(item.bagsCount) || 0;
  const bagWt = Number(item.bagWeight) || BAG_WEIGHT;
  const moist = Number(item.moisture) || 0;
  const limit = Number(item.moistureLimit) || MOISTURE_LIMIT;
  const factor = Number(item.moistureFactor) || MOISTURE_DED_PER_POINT;
  const dustDed = Number(item.dustDeduction) || 0;
  const rate = Number(item.pricePerQuintal) || 0;

  const totalWeight = gross - tare;
  const bagDeduction = bags * bagWt;
  const genuinePaddyWeight = totalWeight - bagDeduction;

  const moistureExcess = moist > limit ? moist - limit : 0;
  const moistureDeduction = (genuinePaddyWeight / 100) * (moistureExcess * factor);

  const nakedWeight = genuinePaddyWeight - moistureDeduction - dustDed;
  const amount = (nakedWeight / 100) * rate;

  return { 
    totalWeight, 
    bagDeduction, 
    genuinePaddyWeight, 
    moistureExcess, 
    moistureDeduction, 
    dustDeduction: dustDed, 
    nakedWeight: Number(nakedWeight) || 0, 
    amount: Number(amount) || 0 
  };
}

export default function NewProcurementIntakePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillId = searchParams.get("partyId");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [qualities, setQualities] = useState<any[]>([]);

  const [header, setHeader] = useState({
    farmerName: "",
    partyId: "", // New
    driverName: "",
    vehicleNo: "",
    intakeDate: "",
    totalGross: "",
    totalTare: "",
    totalBags: "",
    paymentMode: "Credit", // Default to Credit
    paymentDetails: "",
    chequeNo: "",
    bankName: "",
    utrNo: "",
    chequeDate: ""
  });

  const isConsolidated = Number(header.totalGross) > 0 && Number(header.totalTare) > 0;
  const totalNetWeight = isConsolidated ? Number(header.totalGross) - Number(header.totalTare) : 0;

  const [items, setItems] = useState<ProcurementItem[]>([
    {
      variety: "",
      varietyId: "",
      quality: "Fresh",
      qualityId: "",
      moisture: "14",
      grossWeight: "",
      tareWeight: "",
      bagsCount: "",
      pricePerQuintal: DEFAULT_RATE,
      unit: "Kg",
      bagWeight: String(BAG_WEIGHT),
      moistureLimit: String(MOISTURE_LIMIT),
      moistureFactor: String(MOISTURE_DED_PER_POINT),
      dustDeduction: "",
    },
  ]);

  useEffect(() => {
    setHeader(h => ({ ...h, intakeDate: new Date().toISOString().split("T")[0] }));
  }, []);

  useEffect(() => {
    const API_BASE = `${API_BASE_URL}/api`;

    // 1. Fetch Varieties from Master
    fetch(`${API_BASE}/varieties`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setProducts(
            data.map((v: any) => ({
              id: v.id,
              label: v.name,
              subLabel: v.description || "Variety Master",
            }))
          );
        }
      });

    // 1.5 Fetch Qualities from Master
    fetch(`${API_BASE}/qualities`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setQualities(
            data.map((q: any) => ({
              id: q.id,
              label: q.name,
            }))
          );
        }
      });

    // 2. Fetch Source Parties (Sellers)
    fetch(`${API_BASE}/parties?limit=1000&type=seller`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          const partyList = data.items.map((p: any) => ({
            id: String(p.id),
            label: p.name,
            subLabel: `${p.category} | ${p.phone || 'No Contact'}`,
          }));
          setParties(partyList);

          // Handle pre-fill
          if (prefillId) {
            const match = partyList.find((p: any) => p.id === prefillId);
            if (match) {
              setHeader(h => ({ ...h, partyId: match.id, farmerName: match.label }));
            }
          }
        }
      })
      .catch(err => console.error("Party fetch failed:", err));
  }, [prefillId]);

  const addItemRow = () => {
    setItems([
      ...items,
      {
        variety: "",
        varietyId: "",
        quality: "Fresh",
        qualityId: "",
        moisture: "14",
        grossWeight: "",
        tareWeight: "",
        bagsCount: "",
        pricePerQuintal: DEFAULT_RATE,
        unit: "Kg",
        bagWeight: String(BAG_WEIGHT),
        moistureLimit: String(MOISTURE_LIMIT),
        moistureFactor: String(MOISTURE_DED_PER_POINT),
        dustDeduction: "",
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  const updateRow = (index: number, updates: Partial<ProcurementItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...updates };
    setItems(next);
  };

  // Aggregate calculations
  const calcs = items.map(item => {
    // If consolidated, the 'grossWeight' field is used as the 'Segment Net Weight'
    if (isConsolidated) {
      const segWeight = Number(item.grossWeight) || 0;
      const bags = Number(item.bagsCount) || 0;
      const bagWt = Number(item.bagWeight) || BAG_WEIGHT;
      const moist = Number(item.moisture) || 0;
      const limit = Number(item.moistureLimit) || MOISTURE_LIMIT;
      const factor = Number(item.moistureFactor) || MOISTURE_DED_PER_POINT;
      const rate = Number(item.pricePerQuintal) || 0;
      const dustDed = Number(item.dustDeduction) || 0;

      const bagDeduction = bags * bagWt;
      const genuinePaddyWeight = segWeight - bagDeduction;
      const moistureExcess = moist > limit ? moist - limit : 0;
      const moistureDeduction = (genuinePaddyWeight / 100) * (moistureExcess * factor);
      const nakedWeight = genuinePaddyWeight - moistureDeduction - dustDed;
      const amount = (nakedWeight / 100) * rate;

      return { totalWeight: segWeight, bagDeduction, genuinePaddyWeight, moistureExcess, moistureDeduction, dustDeduction: dustDed, nakedWeight, amount };
    }
    return calcRow(item);
  });

  const allocatedWeight = items.reduce((s, it) => s + (Number(it.grossWeight) || 0), 0);
  const remainingWeight = totalNetWeight - allocatedWeight;

  const totalNakedWeight = calcs.reduce((s, c) => s + (c.nakedWeight || 0), 0);
  const totalAmount = calcs.reduce((s, c) => s + (c.amount || 0), 0);
  const totalBagDeduction = calcs.reduce((s, c) => s + (c.bagDeduction || 0), 0);
  const totalMoistureDeduction = calcs.reduce((s, c) => s + (c.moistureDeduction || 0), 0);
  const totalDustDeduction = calcs.reduce((s, c) => s + (c.dustDeduction || 0), 0);
  const anyMoistureWarning = calcs.some((c) => (c.moistureExcess || 0) > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!header.farmerName) return alertWarning("Please enter farmer / source name");
    if (!header.vehicleNo) return alertWarning("Please enter vehicle number");
    if (isConsolidated && Math.abs(remainingWeight) > 1) {
      return alertWarning(`Weight mismatch! You have ${remainingWeight} Kg unallocated. Please distribute all vehicle weight before saving.`);
    }

    setIsLoading(true);
    try {
      // Submit each item as a separate procurement record linked by vehicle/farmer
      const results = await Promise.all(
        items.map((item, i) => {
          const c = calcs[i];
          const payload = {
            farmerName: header.farmerName,
            vehicleNo: header.vehicleNo,
            variety: item.variety,
            varietyId: item.varietyId,
            quality: item.quality, 
            qualityId: item.qualityId,
            moisture: Number(item.moisture),
            // In consolidated mode, grossWeight is the segment weight, tare is 0
            grossWeight: isConsolidated ? Number(item.grossWeight) : Number(item.grossWeight),
            tareWeight: isConsolidated ? 0 : Number(item.tareWeight),
            bagsCount: Number(item.bagsCount),
            bagWeight: Number(item.bagWeight),
            pricePerQuintal: Number(item.pricePerQuintal),
            moistureLimit: Number(item.moistureLimit),
            moistureDeductionPerPoint: Number(item.moistureFactor),
            netWeight: c.nakedWeight,
            totalAmount: c.amount,
            unit: item.unit,
          };
          return fetch(`${API_BASE_URL}/api/procurement`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...payload,
              driverName: header.driverName || undefined,
              intakeDate: header.intakeDate,
              totalBags: header.totalBags ? Number(header.totalBags) : undefined,
              partyId: header.partyId || undefined, // Send partyId to backend
              paymentMode: header.paymentMode,
              paymentDetails: header.paymentMode === "Cheque"
                ? `CHQ: ${header.chequeNo} | ${header.bankName} | ${header.chequeDate}`
                : header.paymentMode === "Bank"
                  ? `UTR: ${header.utrNo} | ${header.bankName}`
                  : header.paymentDetails,
            }),
          });
        })
      );

      if (results.every((r) => r.ok)) {
        alertSuccess("Procurement Intake Logged");
        router.push("/procurement");
      } else {
        alertError("One or more items failed to save. Please check and retry.");
      }
    } catch (err) {
      console.error(err);
      alertError("API Runtime Exception");
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
            href="/procurement"
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Registry</span>
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Scale size={32} className="text-indigo-600" /> New Procurement
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Record paddy intake from farmers — enter weight, moisture and rate per item.
          </p>
        </div>
      </div>

      <div className="w-full">
        {/* Main Entry Console */}
        <div>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden"
          >
            {/* Form Header Bar */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                <Zap size={18} className="text-indigo-600" /> Intake Entry
              </h2>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm">
                Gate Entry
              </div>
            </div>

            <div className="p-10 space-y-10">
              {/* Consignor Header — shared across all items */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-slate-100">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] pl-1">
                    Dhaan / Paddy Source Name
                  </label>
                  <div className="relative group flex-1">
                    <SearchableSelect
                      label="Farmer / Source Name"
                      icon={User}
                      placeholder="Select or enter farmer name..."
                      options={parties}
                      value={header.partyId || header.farmerName}
                      onChange={(val) => {
                        const p = parties.find(x => x.id === val);
                        if (p) {
                          setHeader({ ...header, farmerName: p.label, partyId: p.id });
                        } else {
                          setHeader({ ...header, farmerName: String(val), partyId: "" });
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Driver Name — NEW */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] pl-1">
                    Driver Name
                  </label>
                  <div className="relative group">
                    <UserCheck
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none"
                    />
                    <input
                      type="text"
                      value={header.driverName}
                      onChange={(e) => setHeader({ ...header, driverName: e.target.value })}
                      placeholder="Driver's full name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] pl-1">
                    Vehicle Number
                  </label>
                  <div className="relative group">
                    <Truck
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none"
                    />
                    <input
                      type="text"
                      required
                      value={header.vehicleNo}
                      onChange={(e) => setHeader({ ...header, vehicleNo: e.target.value })}
                      placeholder="HR-XX-XXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all uppercase placeholder:normal-case shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] pl-1">
                    Intake Date
                  </label>
                  <div className="relative group">
                    <Calendar
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none"
                    />
                    <input
                      type="date"
                      required
                      value={header.intakeDate}
                      onChange={(e) => setHeader({ ...header, intakeDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Total Vehicle Weights + Total Bags */}
                <div className="md:col-span-2 grid grid-cols-3 gap-6 bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100/50">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] pl-1">
                      Total Vehicle Gross (Kg)
                    </label>
                    <input
                      type="number"
                      placeholder="Gross Weight"
                      value={header.totalGross}
                      onChange={(e) => setHeader({ ...header, totalGross: e.target.value })}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] pl-1">
                      Tare / Empty Bag (Kg)
                    </label>
                    <input
                      type="number"
                      placeholder="Tare Weight"
                      value={header.totalTare}
                      onChange={(e) => setHeader({ ...header, totalTare: e.target.value })}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm"
                    />
                  </div>
                  {/* Total Bags — NEW */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] pl-1">
                      Total Bags (Vehicle)
                    </label>
                    <div className="relative">
                      <Hash
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none"
                      />
                      <input
                        type="number"
                        placeholder="No. of bags"
                        min="0"
                        value={header.totalBags}
                        onChange={(e) => setHeader({ ...header, totalBags: e.target.value })}
                        className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-3.5 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="md:col-span-3 space-y-6 bg-emerald-50/20 p-6 rounded-2xl border border-emerald-100/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] pl-1">
                        Payment Mode
                      </label>
                      <select
                        value={header.paymentMode}
                        onChange={(e) => setHeader({ ...header, paymentMode: e.target.value })}
                        className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none focus:border-emerald-600 transition-all shadow-sm appearance-none"
                      >
                        <option value="Credit">Credit (Post to Ledger)</option>
                        <option value="Cash">Cash / Immediate</option>
                        <option value="Bank">Bank Transfer / RTGS / NEFT</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    {header.paymentMode === "Cheque" ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] pl-1">Cheque Number</label>
                          <input
                            type="text"
                            placeholder="6-digit No"
                            value={header.chequeNo}
                            onChange={(e) => setHeader({ ...header, chequeNo: e.target.value })}
                            className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none focus:border-emerald-600 transition-all shadow-sm"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] pl-1">Bank Name</label>
                          <input
                            type="text"
                            placeholder="e.g. HDFC, SBI"
                            value={header.bankName}
                            onChange={(e) => setHeader({ ...header, bankName: e.target.value })}
                            className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none focus:border-emerald-600 transition-all shadow-sm"
                          />
                        </div>
                      </div>
                    ) : header.paymentMode === "Bank" ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] pl-1">UTR / Ref Number</label>
                          <input
                            type="text"
                            placeholder="Transaction ID"
                            value={header.utrNo}
                            onChange={(e) => setHeader({ ...header, utrNo: e.target.value })}
                            className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none focus:border-emerald-600 transition-all shadow-sm"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] pl-1">Receiving Bank</label>
                          <input
                            type="text"
                            placeholder="Bank Name"
                            value={header.bankName}
                            onChange={(e) => setHeader({ ...header, bankName: e.target.value })}
                            className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none focus:border-emerald-600 transition-all shadow-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] pl-1">
                          Payment Details (Remarks)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Paid from Petty Cash"
                          value={header.paymentDetails}
                          onChange={(e) => setHeader({ ...header, paymentDetails: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none focus:border-emerald-600 transition-all shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                  {header.paymentMode === "Cheque" && (
                    <div className="space-y-3 max-w-[200px]">
                      <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] pl-1">Cheque Date</label>
                      <input
                        type="date"
                        value={header.chequeDate}
                        onChange={(e) => setHeader({ ...header, chequeDate: e.target.value })}
                        className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none focus:border-emerald-600 transition-all shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {isConsolidated && (
                <div className="flex items-center justify-between bg-slate-900 text-white px-8 py-5 rounded-2xl shadow-xl -mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Net Weight</span>
                      <span className="text-xl font-black tracking-tighter">{totalNetWeight.toLocaleString()} Kg</span>
                    </div>
                    <div className="w-px h-8 bg-slate-700" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Allocated</span>
                      <span className="text-xl font-black tracking-tighter text-emerald-400">{allocatedWeight.toLocaleString()} Kg</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Balance Remaining</span>
                      <span className={`text-xl font-black tracking-tighter ${remainingWeight === 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                        {remainingWeight.toLocaleString()} Kg
                      </span>
                    </div>
                    {remainingWeight > 0 && (
                      <button
                        onClick={() => updateItem(items.length - 1, "grossWeight", String(Number(items[items.length - 1].grossWeight || 0) + remainingWeight))}
                        className="p-2 bg-indigo-600 hover:bg-white hover:text-indigo-600 rounded-lg transition-all"
                        title="Add to last row"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* LIVE AUDIT RIBBON — Repositioned from side panel to horizontal bar */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 py-8">
                <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 flex flex-col gap-2 relative overflow-hidden group border-b-4 border-b-slate-200">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-600/5 rounded-bl-[2rem]" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">
                    Bag Tare Deds
                  </span>
                  <p className="text-2xl font-black text-slate-900 leading-tight">
                    -{totalBagDeduction.toFixed(2)} <span className="text-sm font-bold text-slate-400">Kg</span>
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 flex flex-col gap-2 relative overflow-hidden group border-b-4 border-b-orange-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">
                    Moisture Deds
                  </span>
                  <p className={`text-2xl font-black leading-tight ${anyMoistureWarning ? "text-orange-600" : "text-slate-900"}`}>
                    -{totalMoistureDeduction.toFixed(2)} <span className="text-sm font-bold text-slate-400">Kg</span>
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 flex flex-col gap-2 relative overflow-hidden group border-b-4 border-b-red-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">
                    Dust/Husk Deds
                  </span>
                  <p className={`text-2xl font-black leading-tight ${totalDustDeduction > 0 ? "text-red-600" : "text-slate-900"}`}>
                    -{totalDustDeduction.toFixed(2)} <span className="text-sm font-bold text-slate-400">Kg</span>
                  </p>
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-[1.5rem] p-5 flex flex-col gap-2 relative overflow-hidden group border-b-4 border-b-indigo-300">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider pl-1">
                    Est. Rice Yield
                  </span>
                  <p className="text-2xl font-black text-indigo-700 leading-tight">
                    ~{(totalNakedWeight * 0.65).toFixed(0)} <span className="text-sm font-bold text-indigo-400">Kg</span>
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-5 flex flex-col gap-2 relative overflow-hidden group border-b-4 border-b-red-500">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">
                    Total Wt Loss
                  </span>
                  <p className="text-2xl font-black text-red-400 leading-tight">
                    -{(totalBagDeduction + totalMoistureDeduction + totalDustDeduction).toFixed(2)} <span className="text-sm font-bold text-slate-500">Kg</span>
                  </p>
                </div>
              </div>

              {/* Multi-Item Varieties */}
              <div className="pt-8 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                    <Package size={18} className="text-indigo-600" /> Variety Items
                    <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                      {items.length} {items.length === 1 ? "Item" : "Items"}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                  >
                    <Plus size={14} /> Add Variety
                  </button>
                </div>

                {/* Column Labels — desktop only */}
                <div className={`hidden lg:grid ${isConsolidated ? 'lg:grid-cols-[3rem_2fr_1.2fr_1fr_1.2fr_1.1fr_1.2fr_1fr_1.1fr_1.5fr_2.5rem]' : 'lg:grid-cols-[3rem_2.2fr_1fr_1.2fr_1.2fr_1.2fr_1.1fr_1.2fr_1fr_1.1fr_1.5fr_2.5rem]'} gap-4 px-5 pb-2`}>
                  <div />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Dhaan Variety</span>
                  
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{isConsolidated ? 'Portion Weight' : 'Quality'}</span>
                  
                  {isConsolidated ? (
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Quality</span>
                  ) : (
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Moist%</span>
                  )}
                  
                  {isConsolidated ? (
                     <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Moist%</span>
                  ) : (
                     <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Gross</span>
                  )}
                  
                  {!isConsolidated && <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Tare</span>}
                  
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Bags</span>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Dust Kg/Gm</span>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Bag Tare</span>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Rate/Qt</span>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Settlement</span>
                  <div />
                </div>

                {/* Item Rows */}
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const c = calcs[index];
                    return (
                      <div
                        key={index}
                        className={`bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex flex-col gap-4 lg:grid ${isConsolidated ? 'lg:grid-cols-[3rem_2fr_1.2fr_1fr_1.2fr_1.1fr_1.2fr_1fr_1.1fr_1.5fr_2.5rem]' : 'lg:grid-cols-[3rem_2.2fr_1fr_1.2fr_1.2fr_1.2fr_1.1fr_1.2fr_1fr_1.1fr_1.5fr_2.5rem]'} lg:gap-4 lg:items-center hover:border-indigo-100 hover:bg-indigo-50/20 transition-all group shadow-sm`}
                      >
                        {/* Row number */}
                        <div className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-500 transition-all shrink-0">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="w-full">
                          <SearchableSelect
                            placeholder="Select Variety"
                            options={products}
                            value={item.varietyId}
                            onChange={(val) => {
                              const match = products.find((p) => p.id == val);
                              updateRow(index, { varietyId: String(val), variety: match?.label || "" });
                            }}
                            icon={Box}
                          />
                        </div>

                        {/* WEIGHT (Segment) if consolidated, else Quality */}
                        {isConsolidated ? (
                          <div className="w-full">
                            <input
                              type="number"
                              required
                              value={item.grossWeight}
                              onChange={(e) => updateItem(index, "grossWeight", e.target.value)}
                              placeholder="Portion Weight"
                              className="w-full bg-white border border-indigo-200 rounded-xl px-2 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all text-center placeholder:text-slate-300 shadow-sm"
                            />
                          </div>
                        ) : (
                          <div className="w-full">
                            {/* Quality Dropdown - moved here if not consolidated */}
                            <select
                              value={item.qualityId}
                              onChange={(e) => {
                                const match = qualities.find(q => q.id == e.target.value);
                                updateRow(index, { qualityId: e.target.value, quality: match?.label || "Fresh" });
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all cursor-pointer shadow-sm appearance-none"
                            >
                              <option value="">Select Grade</option>
                              {qualities.map(q => <option key={q.id} value={q.id}>{q.label}</option>)}
                            </select>
                          </div>
                        )}

                        {/* Quality (only if consolidated, shown after weight) */}
                        {isConsolidated && (
                          <div className="w-full">
                            <select
                              value={item.quality}
                              onChange={(e) => updateItem(index, "quality", e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all cursor-pointer shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E')] bg-[length:10px] bg-[right_1rem_center] bg-no-repeat"
                            >
                              <option value="Fresh">Fresh</option>
                              <option value="Dull">Dull</option>
                              <option value="Cutting Black">Cutting Black</option>
                              <option value="Bhusi">Bhusi</option>
                            </select>
                          </div>
                        )}

                        {/* Moisture & Settings */}
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={item.moisture}
                          onChange={(e) => updateItem(index, "moisture", e.target.value)}
                          title={`Limit: ${item.moistureLimit}% | Ded: ${item.moistureFactor}kg/Qt`}
                          className={`w-full bg-white border rounded-xl px-2 py-4 text-sm font-black outline-none transition-all text-center shadow-sm ${c.moistureExcess > 0
                            ? "border-orange-300 focus:border-orange-500"
                            : "border-slate-200 focus:border-indigo-600"
                            }`}
                        />

                        {/* Gross - hidden if consolidated */}
                        {!isConsolidated && (
                          <input
                            type="number"
                            required
                            value={item.grossWeight}
                            onChange={(e) => updateItem(index, "grossWeight", e.target.value)}
                            placeholder="Gross"
                            className="w-full bg-white border border-slate-200 rounded-xl px-2 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all text-center placeholder:text-slate-300 shadow-sm"
                          />
                        )}

                        {/* Tare - hidden if consolidated */}
                        {!isConsolidated && (
                          <input
                            type="number"
                            required
                            value={item.tareWeight}
                            onChange={(e) => updateItem(index, "tareWeight", e.target.value)}
                            placeholder="Tare"
                            className="w-full bg-white border border-slate-200 rounded-xl px-2 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all text-center placeholder:text-slate-300 shadow-sm"
                          />
                        )}

                        {/* Bags */}
                        <input
                          type="number"
                          required
                          value={item.bagsCount}
                          onChange={(e) => updateItem(index, "bagsCount", e.target.value)}
                          placeholder="Bags"
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all text-center placeholder:text-slate-300 shadow-sm"
                        />

                        {/* Dust/Husk Deduction Settings Moved AFTER Bags */}
                        <input
                          type="number"
                          step="0.001"
                          value={item.dustDeduction}
                          onChange={(e) => updateItem(index, "dustDeduction", e.target.value)}
                          placeholder="Dust Kg/Gm"
                          title="Direct Weight Deduction for Dirt/Husk (Kg)"
                          className={`w-full bg-white border rounded-xl px-2 py-4 text-sm font-black outline-none transition-all text-center shadow-sm ${Number(item.dustDeduction) > 0
                            ? "border-red-300 focus:border-red-500 text-red-600"
                            : "border-slate-200 focus:border-indigo-600"
                            }`}
                        />

                        {/* Bag Weight Adjustment */}
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.bagWeight}
                          onChange={(e) => updateItem(index, "bagWeight", e.target.value)}
                          title="Weight of single empty bag (Kg)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-1 py-4 text-xs font-bold outline-none focus:bg-white focus:border-indigo-600 transition-all text-center text-slate-500 shadow-inner"
                        />

                        {/* Rate/Qt */}
                        <input
                          type="number"
                          required
                          value={item.pricePerQuintal}
                          onChange={(e) => updateItem(index, "pricePerQuintal", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all text-center shadow-sm"
                        />

                        {/* Net Wt / Amount display */}
                        <div className="flex flex-col lg:items-end gap-1 bg-slate-100/50 lg:bg-transparent rounded-xl p-3 lg:p-0 min-w-[5rem]">
                          <div className="flex items-center justify-between lg:block">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest lg:hidden">Naked Paddy</span>
                            <span className="text-sm font-black text-slate-900 tracking-tighter">
                              {c.nakedWeight > 0 ? c.nakedWeight.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "—"} Kg
                            </span>
                          </div>
                          <div className="flex items-center justify-between lg:block">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest lg:hidden">Total Amt</span>
                            <span className="text-sm font-black text-emerald-600">
                              ₹{c.amount > 0 ? Math.round(c.amount).toLocaleString() : "0"}
                            </span>
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          disabled={items.length === 1}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-20 shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Secondary Add Button at Bottom */}
                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all shadow-sm"
                  >
                    <Plus size={14} /> Add Another Variety
                  </button>
                </div>

              </div>
            </div>

            {/* Form Footer */}
            <div className="p-10 bg-slate-900 border-t border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-12">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1.5 opacity-80">
                    Net Weight
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white tracking-tighter">
                      {totalNakedWeight.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </span>
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Kg</span>
                  </div>
                </div>
                <div className="w-[1px] h-10 bg-slate-800" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">
                    Total Amount (₹)
                  </p>
                  <p className="text-2xl font-black text-emerald-400 tracking-tight">
                    ₹{Math.round(totalAmount).toLocaleString()}
                  </p>
                </div>
                <div className="w-[1px] h-10 bg-slate-800" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">
                    Varieties
                  </p>
                  <p className="text-2xl font-black text-white tracking-tight">{items.length}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-600/40 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} />
                    Save Intake
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
