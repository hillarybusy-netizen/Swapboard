import { Settings, Shield, Mail, Bell, Lock } from "lucide-react";

export default function AdminSettings() {
  const sections = [
    { title: "Security", description: "Manage platform admin access and roles", icon: Shield },
    { title: "Notifications", description: "Configure system-wide alerts and emails", icon: Bell },
    { title: "Authentication", description: "Global auth providers and policies", icon: Lock },
    { title: "Communications", description: "System emails and marketing settings", icon: Mail },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">Internal Settings</h1>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Platform-wide configuration and administrative tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="glass rounded-[2rem] p-8 border-white/5 hover:border-gold/20 transition-all group cursor-pointer">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-gold group-hover:text-black transition-all">
                <section.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">{section.title}</h3>
                <p className="text-xs font-bold text-white/30">{section.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-[2.5rem] p-10 border-white/5 bg-gold/[0.01]">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-gold" />
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">System Health</h3>
        </div>
        
        <div className="space-y-6">
          {[
            { label: "Database Connection", status: "Healthy", color: "text-green-500" },
            { label: "Auth Service", status: "Operational", color: "text-green-500" },
            { label: "Storage Engine", status: "Operational", color: "text-green-500" },
            { label: "Analytics Pipeline", status: "Active", color: "text-gold" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center border-b border-white/[0.03] pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{item.label}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
