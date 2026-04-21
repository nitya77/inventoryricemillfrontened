"use client";
import API_BASE_URL from "@/utils/api";

import {
  ClipboardCheck, Search, Plus, TrendingUp, ChevronRight, ChevronLeft,
  Printer, ShoppingCart, User, Trash2, Edit2, X, Save, Box
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";

const ORDER_TYPES = ["Purchase", "Sale"];
const STATUSES = ["Confirmed", "Pending", "Fulfilled", "Cancelled"];

function Drawer({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </div>
    </>
  );
}

function LabeledInput({ label, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">{label}</label>
      <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm" {...props} />
    </div>
  );
}

function LabeledSelect({ label, children, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">{label}</label>
      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all cursor-pointer" {...props}>{children}</select>
    </div>
  );
}

export default function OrderRegistryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [orderType, setOrderType] = useState("All");

  const [products, setProducts] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<{
    order_type: string; entity_id: number | string; variety: string;
    total_quantity: string; rate_per_unit: string; expected_date: string;
    status: string; unit: string;
  }>({
    order_type: "Purchase", entity_id: "", variety: "",
    total_quantity: "", rate_per_unit: "", expected_date: "",
    status: "Confirmed", unit: "Kg"
  });

  const fetchOrders = async () => {
    setIsFetching(true);
    try {
      const typeParam = orderType !== "All" ? `&type=${orderType}` : "";
      const res = await fetch(`${API_BASE_URL}/api/orders?page=${page}&limit=10&search=${search}${typeParam}`);
      const data = await res.json();
      if (data.items) { setOrders(data.items); setMeta(data.meta); }
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    const t = setTimeout(fetchOrders, 300);
    return () => clearTimeout(t);
  }, [page, search, orderType]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/products?limit=1000`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/sellers?limit=1000`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/customers?limit=1000`).then(r => r.json()),
    ]).then(([pd, sd, cd]) => {
      if (pd.items) setProducts(pd.items.map((p: any) => ({ id: p.variety, label: p.variety, subLabel: p.type })));
      if (sd.items) setSellers(sd.items.map((s: any) => ({ id: s.id, label: s.name, subLabel: s.seller_type || "Seller" })));
      if (cd.items) setCustomers(cd.items.map((c: any) => ({ id: c.id, label: c.name, subLabel: "Customer" })));
    });
  }, []);

  const entityOptions = form.order_type === "Purchase" ? sellers : customers;

  const openEdit = (order: any) => {
    setForm({
      order_type: order.order_type,
      entity_id: order.entity_id ? Number(order.entity_id) : "",  // keep as number to match option IDs
      variety: order.variety,
      total_quantity: order.total_quantity?.toString() || "",
      rate_per_unit: order.rate_per_unit?.toString() || "",
      expected_date: order.expected_date ? order.expected_date.split("T")[0] : "",
      status: order.status || "Confirmed",
      unit: order.unit || "Kg"
    });
    setError(""); setSelectedId(order.id); setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.variety || !form.entity_id) { setError("Variety and entity are required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${selectedId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_type: form.order_type,
          entity_id: Number(form.entity_id),
          variety: form.variety,
          total_quantity: Number(form.total_quantity),
          rate_per_unit: Number(form.rate_per_unit),
          expected_date: form.expected_date || null,
          status: form.status,
          unit: form.unit
        })
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Save failed"); return; }
      setDrawerOpen(false); fetchOrders();
    } catch { setError("Network error"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this order? This action cannot be undone.")) return;
    try { await fetch(`${API_BASE_URL}/api/orders/${id}`, { method: "DELETE" }); fetchOrders(); }
    catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2"><span className="w-8 h-[2px] bg-indigo-600 rounded-full" /><span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Orders</span></div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3"><ClipboardCheck size={32} /> Orders</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Manage purchase and sales order bookings.</p>
        </div>
        <Link href="/orders/new" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
          <Plus size={18} /> New Booking
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row justify-between lg:items-center gap-6 bg-slate-50/30">
          <div className="relative flex-1 group max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input type="text" placeholder="Search by Trader, Invoice #, or Variety..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm" />
          </div>
          <div className="flex items-center gap-3">
            <select value={orderType} onChange={(e) => { setOrderType(e.target.value); setPage(1); }}
              className="bg-white border border-slate-200 rounded-2xl px-5 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none focus:border-indigo-600 transition-all shadow-sm cursor-pointer">
              <option value="All">All Contexts</option>
              <option value="Purchase">Inward Purchase</option>
              <option value="Sale">Outward Sale</option>
            </select>
            <button onClick={fetchOrders} className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><TrendingUp size={18} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                                <th className="px-10 py-6 text-center w-20">#</th>
                <th className="px-10 py-6">Order No.</th>
                <th className="px-10 py-6">Party Name</th>
                <th className="px-10 py-6">Variety</th>
                <th className="px-10 py-6">Quantity & Amount</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isFetching ? Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={6} className="px-10 py-10 bg-slate-50/10"></td></tr>
              )) : orders.map((order, idx) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                  <td className="px-10 py-7 text-center">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{(meta.currentPage - 1) * 10 + idx + 1}</span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{order.invoice_no || `TRK-${order.id.toString().padStart(4, '0')}`}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${order.order_type === "Purchase" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>{order.order_type}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{order.status}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-all shadow-sm ${order.order_type === "Purchase" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                        {order.order_type === "Purchase" ? <ShoppingCart size={18} /> : <User size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase leading-none mb-1 group-hover:translate-x-1 transition-transform">{order.entity_name}</p>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Authorized Partner</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">{order.variety}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{order.expected_date?.split('T')[0] || 'N/A'}</p>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-baseline gap-2 mb-1"><span className="text-lg font-black text-slate-900 tracking-tighter leading-none">{Number(order.total_quantity).toLocaleString()}</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{order.unit || 'Kg'}</span></div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60">₹{Number(order.total_amount || 0).toLocaleString()} Valued</p>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/orders/invoice/${order.invoice_no || order.id}`} className="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Print Order Copy"><Printer size={16} /></Link>
                      <button onClick={() => openEdit(order)} className="p-3 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm" title="Edit Order"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(order.id)} className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Delete Order"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isFetching && orders.length === 0 && (
            <div className="p-32 text-center flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border border-slate-100 border-dashed"><ClipboardCheck size={40} /></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Commitment Queue Clear</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {orders.length} of {meta.totalItems} Records</p>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronLeft size={20} /></button>
            <div className="flex items-center gap-1 mx-4">
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${page === p ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{p}</button>
              ))}
            </div>
            <button disabled={page === meta.totalPages} onClick={() => setPage(page + 1)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Edit Order Booking">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <LabeledSelect label="Order Type" value={form.order_type} onChange={(e: any) => setForm({ ...form, order_type: e.target.value })}>
              {ORDER_TYPES.map(t => <option key={t}>{t}</option>)}
            </LabeledSelect>
            <LabeledSelect label="Status" value={form.status} onChange={(e: any) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </LabeledSelect>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">{form.order_type === "Purchase" ? "Seller" : "Customer"} *</label>
            <SearchableSelect
              options={entityOptions}
              value={form.entity_id}
              onChange={(v) => setForm({ ...form, entity_id: Number(v) })}
              placeholder={`Select ${form.order_type === "Purchase" ? "Seller" : "Customer"}`}
              icon={User}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Variety *</label>
            <SearchableSelect options={products} value={form.variety} onChange={(v) => setForm({ ...form, variety: String(v) })} placeholder="Select Variety" icon={Box} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <LabeledInput label="Total Quantity" type="number" value={form.total_quantity} onChange={(e: any) => setForm({ ...form, total_quantity: e.target.value })} />
            <LabeledInput label="Rate / Unit (₹)" type="number" value={form.rate_per_unit} onChange={(e: any) => setForm({ ...form, rate_per_unit: e.target.value })} />
          </div>
          <LabeledInput label="Expected Delivery Date" type="date" value={form.expected_date} onChange={(e: any) => setForm({ ...form, expected_date: e.target.value })} />
          {error && <p className="text-xs font-black text-red-500 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">{error}</p>}
          <div className="flex gap-3 pt-4">
            <button onClick={() => setDrawerOpen(false)} className="flex-1 py-3.5 border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50">
              <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
