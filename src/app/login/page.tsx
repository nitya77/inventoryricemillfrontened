"use client";
import API_BASE_URL from "@/utils/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, Factory, ArrowRight, ShieldCheck } from "lucide-react";
import { alertSuccess, alertError, alertWarning } from "@/utils/alerts";

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [module, setModule] = useState("Milling");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, password, role, module }),
      });

      const data = await res.json();
      if (res.ok) {
        // Evaluate dynamic DB permissions for targeted module
        let modKey = module.toLowerCase();
        if (modKey === "inventory") modKey = "construction";

        // Trap explicitly restricted access natively based on HRMS rules
        if (data.user?.permissions && data.user.permissions[modKey] === false) {
           alertWarning(`SECURITY STOP: Your assigned role (${data.user.role}) lacks the required access to initialize the '${module}' environment.`);
           setIsLoading(false);
           return;
        }

        localStorage.setItem("inventory_token", data.token);
        localStorage.setItem("inventory_user", JSON.stringify(data.user));
        
        alertSuccess("Authentication Successful");
        
        switch(module) {
          case "HRM": router.push("/hrms"); break;
          case "Milling": router.push("/milling"); break;
          case "Construction": router.push("/construction"); break;
          default: router.push("/");
        }
      } else {
        alertError(data.error || data.message || "Invalid credentials");
      }
    } catch (err) {
      alertError("System error. Please check if API server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-blue-100 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl shadow-xl shadow-slate-300 text-white mb-6">
            <Factory size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Login</h1>
          <p className="text-slate-500 font-medium mt-2">Himalayan Gold Rice Mill ERP Environment</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xl relative">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">App Module</label>
                <div className="relative">
                  <select 
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white transition-all appearance-none outline-none font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="HRM">Human Resources</option>
                    <option value="Milling">Milling & Procure</option>
                    <option value="Construction">Construction</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Role Permission</label>
                <div className="relative">
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white transition-all appearance-none outline-none font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="Admin">Administrator</option>
                    <option value="Manager">Manager / Lead</option>
                    <option value="Staff">Regular Staff</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Authorized ID</label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter employee identifier..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Credentials</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition-all outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
               <label className="flex items-center gap-2 cursor-pointer group">
                 <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                 <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Maintain Session</span>
               </label>
               <button type="button" className="text-xs font-bold text-indigo-600 hover:underline">Revoke Access?</button>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 py-4 rounded-xl font-bold tracking-tight transition-all shadow-xl shadow-slate-200 group overflow-hidden relative"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-4">
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TLS 1.3 Secure</span>
             </div>
             <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
             <p className="text-[10px] font-bold text-slate-400">Build v2.4.10</p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-xs font-medium text-slate-400 uppercase tracking-widest">
          &copy; 2024 Himalayan Gold Rice Mills
        </p>
      </div>
    </div>
  );
}
