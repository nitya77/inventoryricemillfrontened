"use client";
import API_BASE_URL from "@/utils/api";

import {
  ClipboardCheck,
  Calendar,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Briefcase,
  Package,
  Box,
  Hash,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SearchableSelect from "@/components/SearchableSelect";
import { alertSuccess, alertError, alertWarning } from "@/utils/alerts";

const UNITS = [
  { id: "Kg", label: "Kg" },
  { id: "Qtl", label: "Qtl" },
  { id: "Ton", label: "Ton" },
];

type OrderItem = {
  variety: string;
  varietyId: string;
  totalQty: string;
  ratePerUnit: string;
  unit: string;
};

export default function NewOrderBookingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [orderType, setOrderType] = useState<"Purchase" | "Sale">("Sale");
  const [entities, setEntities] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [orderHeader, setOrderHeader] = useState({
    entityId: "",
    expectedDate: new Date().toISOString().split("T")[0],
  });

  const [items, setItems] = useState<OrderItem[]>([
    { variety: "", varietyId: "", totalQty: "", ratePerUnit: "", unit: "Kg" },
  ]);

  const fetchEntities = async () => {
    try {
      const endpoint = orderType === "Purchase" ? "sellers" : "customers";
      const res = await fetch(`${API_BASE_URL}/api/${endpoint}?limit=1000`);
      const data = await res.json();
      const list = data.items || [];
      setEntities(
        list.map((e: any) => ({
          id: e.id,
          label: e.name,
          subLabel: e.location || "Authorized Trader",
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/varieties`);
      const data = await res.json();
      if (data) {
        setProducts(
          data.map((v: any) => ({
            id: v.id,
            label: v.name,
            subLabel: v.description || "Variety Master",
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEntities();
    fetchProducts();
  }, [orderType]);

  const addItemRow = () => {
    setItems([...items, { variety: "", varietyId: "", totalQty: "", ratePerUnit: "", unit: "Kg" }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  const totalValuation = items.reduce(
    (sum, item) => sum + Number(item.totalQty) * Number(item.ratePerUnit),
    0
  );
  const totalVolume = items.reduce((sum, item) => sum + Number(item.totalQty), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderHeader.entityId) return alertWarning("Please select a trader");
    if (items.some((it) => !it.varietyId)) return alertWarning("Please select a variety for all rows");

    setIsLoading(true);
    try {
      const payload = {
        type: orderType,
        entityId: Number(orderHeader.entityId),
        expectedDate: orderHeader.expectedDate,
        items: items.map((item) => ({
          ...item,
          varietyId: Number(item.varietyId),
          totalQty: Number(item.totalQty),
          ratePerUnit: Number(item.ratePerUnit),
          totalAmount: Number(item.totalQty) * Number(item.ratePerUnit),
        })),
      };

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alertSuccess("Order Commitment Verified");
        router.push("/orders");
      } else {
        alertError("System failed to execute order creation");
      }
    } catch (err) {
      console.error(err);
      alertError("Connection exception, please retry");
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
            href="/orders"
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Queue</span>
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <ClipboardCheck size={32} className="text-indigo-600" /> Booking Entry
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Register new multi-variety industrial commitments and fulfillment specs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center">
            <button
              type="button"
              onClick={() => setOrderType("Purchase")}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                orderType === "Purchase"
                  ? "bg-indigo-600 text-white shadow-xl"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Inward Purchase
            </button>
            <button
              type="button"
              onClick={() => setOrderType("Sale")}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                orderType === "Sale"
                  ? "bg-indigo-600 text-white shadow-xl"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Outward Sale
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        {/* Header Section */}
        <div className="p-10 border-b border-slate-100 bg-slate-50/30 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <SearchableSelect
              label={`Target ${orderType === "Purchase" ? "Partner / Seller" : "Buyer / Customer"}`}
              placeholder="Search and Select Trader"
              options={entities}
              value={orderHeader.entityId}
              onChange={(val) => setOrderHeader({ ...orderHeader, entityId: String(val) })}
              icon={Briefcase}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">
              Fulfillment Deadline
            </label>
            <div className="relative group">
              <Calendar
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none"
              />
              <input
                type="date"
                required
                value={orderHeader.expectedDate}
                onChange={(e) => setOrderHeader({ ...orderHeader, expectedDate: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Multi-Item Section */}
        <div className="p-10 space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
              <Package size={18} className="text-indigo-600" /> Variety Commitments
            </h2>
            <button
              type="button"
              onClick={addItemRow}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
            >
              <Plus size={14} /> Add Specification
            </button>
          </div>

          {/* Column Labels */}
          <div className="hidden md:grid md:grid-cols-[2rem_1fr_10rem_8rem_10rem_8rem_2.5rem] gap-3 px-5 pb-2">
            <div />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Variety</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Commitment Qty</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Unit</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Rate / Unit</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aggregate</span>
            <div />
          </div>

          {/* Item Rows */}
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-slate-50/60 border border-slate-100 rounded-2xl px-5 py-4 flex flex-col md:grid md:grid-cols-[2rem_1fr_10rem_8rem_10rem_8rem_2.5rem] gap-3 items-center hover:border-indigo-100 hover:bg-indigo-50/20 transition-all group"
              >
                {/* Row Number */}
                <div className="flex items-center justify-center w-8 h-8 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-500 transition-all shrink-0 self-center">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Variety */}
                <div className="w-full">
                  <SearchableSelect
                    placeholder="Select Variety"
                    options={products}
                    value={item.varietyId}
                    onChange={(val) => {
                      const match = products.find(p => p.id == val);
                      const next = [...items];
                      next[index] = { ...next[index], varietyId: String(val), variety: match?.label || "" };
                      setItems(next);
                    }}
                    icon={Box}
                  />
                </div>

                {/* Qty */}
                <input
                  type="number"
                  required
                  value={item.totalQty}
                  onChange={(e) => updateItem(index, "totalQty", e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-black outline-none focus:border-indigo-600 transition-all text-center placeholder:text-slate-300 shadow-sm"
                />

                {/* Unit */}
                <select
                  value={item.unit}
                  onChange={(e) => updateItem(index, "unit", e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-all cursor-pointer shadow-sm"
                >
                  {UNITS.map((u) => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </select>

                {/* Rate */}
                <div className="relative w-full group/rate">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 group-focus-within/rate:text-indigo-500 transition-colors">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    value={item.ratePerUnit}
                    onChange={(e) => updateItem(index, "ratePerUnit", e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-4 py-3.5 text-xs font-black outline-none focus:border-indigo-600 transition-all text-center placeholder:text-slate-300 shadow-sm"
                  />
                </div>

                {/* Computed Amount */}
                <div className="flex flex-col items-end w-full">
                  <span className="text-sm font-black text-slate-900 tracking-tighter">
                    ₹{(Number(item.totalQty) * Number(item.ratePerUnit)).toLocaleString()}
                  </span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    Total
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

          {/* Add row hint */}
          {items.length === 0 && (
            <div className="text-center py-10 text-[10px] font-black text-slate-300 uppercase tracking-widest">
              No varieties added yet
            </div>
          )}
        </div>

        {/* Footer Metrics */}
        <div className="p-10 bg-slate-900 border-t border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-12">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Aggregate Volume
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white tracking-tighter">
                  {totalVolume.toLocaleString()}
                </span>
                <span className="text-[10px] font-black text-slate-600 uppercase">Total Units</span>
              </div>
            </div>
            <div className="w-[1px] h-10 bg-slate-800" />
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                {items.length} Line {items.length === 1 ? "Item" : "Items"}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-400 tracking-tighter">
                  {items.filter((i) => i.variety).length}
                </span>
                <span className="text-[10px] font-black text-slate-600 uppercase">Specified</span>
              </div>
            </div>
            <div className="w-[1px] h-10 bg-slate-800" />
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">
                Pipeline Valuation
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-400 tracking-tighter">
                  ₹{totalValuation.toLocaleString()}
                </span>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">
                  Confirmed
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
              "Synchronizing Queue..."
            ) : (
              <>
                <Save size={18} />
                Authorize {orderType} Commitment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
