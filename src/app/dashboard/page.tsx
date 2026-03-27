"use client";

import { useGetMeQuery } from "@/store/api/authApi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { 
  LogOut, User, Activity, Clock, Shield, 
  Phone, Mail, Calendar, HeartPulse, ClipboardList,
  MessageSquare, ChevronRight
} from "lucide-react";

export default function DashboardPage() {
  const { data: user, isLoading, isFetching, isError } = useGetMeQuery({});
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    // Wait for all initial loads and refetches to complete before judging the auth state
    if (!isLoading && !isFetching && (isError || !user)) {
      router.push("/login");
    }
    // Only redirect to onboarding if we have a user and they are a patient without a profile
    if (user && user.role === "PATIENT" && !user.patient) {
      router.push("/onboarding");
    }
  }, [user, isLoading, isError, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 font-medium">Authenticating...</div>;

  const isPatient = user?.role === "PATIENT";
  const patient = user?.patient;
  const doctor = isPatient ? patient?.assignedDoctor : user?.doctor;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center text-gray-900">
          <h1 className="text-xl font-bold text-blue-600 flex items-center">
             <Activity className="mr-2" /> Medical Platform
          </h1>
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors font-semibold"
          >
            <LogOut size={18} className="mr-2" /> Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-[2rem] shadow-2xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10">
            <Activity size={240} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-10">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-2xl rounded-3xl flex items-center justify-center text-4xl font-black shadow-2xl border border-white/30">
              {user?.email[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                {isPatient ? `Welcome, ${patient?.fullName || "Patient"}` : `Welcome, Dr. ${user?.email.split('@')[0]}`}
              </h2>
              <div className="flex flex-wrap gap-3">
                <span className="bg-white/10 backdrop-blur-md text-blue-100 px-4 py-1.5 rounded-full text-sm font-bold flex items-center border border-white/10">
                  <Shield size={16} className="mr-2" /> {user?.role} PORTAL
                </span>
                <span className="bg-green-500/20 backdrop-blur-md text-green-100 px-4 py-1.5 rounded-full text-sm font-bold flex items-center border border-green-500/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" /> SECURE SESSION
                </span>
              </div>
            </div>
          </div>
        </div>

        {isPatient ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Patient - Left Column */}
            <div className="lg:col-span-2 space-y-10">
              {/* Doctor Card */}
              <section className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                <div className="border-b border-gray-100 bg-gray-50/50 px-10 py-6 flex justify-between items-center">
                  <h3 className="font-black text-gray-900 flex items-center text-lg uppercase tracking-tight">
                    <User className="mr-3 text-blue-600" size={24} /> Assigned Specialist
                  </h3>
                  <div className="flex items-center text-green-600 font-black text-[10px] tracking-widest bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" /> ONLINE
                  </div>
                </div>
                
                {doctor ? (
                  <div className="p-10 flex flex-col md:flex-row md:items-start space-y-8 md:space-y-0 md:space-x-10">
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center text-blue-600 border border-blue-200 shadow-inner flex-shrink-0 relative">
                       <User size={56} strokeWidth={1.5} />
                       <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full" />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div>
                        <h4 className="text-3xl font-black text-gray-900 leading-none mb-2">{doctor.user?.email || "General Practitioner"}</h4>
                        <span className="text-blue-600 font-extrabold text-sm uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">
                          {doctor.specialization || "Clinical Medicine"}
                        </span>
                      </div>
                      <p className="text-gray-500 text-lg leading-relaxed max-w-2xl font-medium italic opacity-80">
                        "{doctor.bio || "Dedicated healthcare professional providing comprehensive clinical diagnostics and personalized patient care."}"
                      </p>
                      <button 
                        onClick={() => router.push(`/chat/${doctor.userId}`)}
                        className="flex items-center space-x-3 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 group active:scale-95"
                      >
                        <MessageSquare size={22} strokeWidth={2.5} />
                        <span className="uppercase tracking-widest text-sm">Start Consultation</span>
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-20 text-center">
                    <p className="text-gray-400 font-bold text-xl tracking-tight">Waiting for specialist assignment...</p>
                  </div>
                )}
              </section>

              {/* Patient Records */}
              <section className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
                <div className="border-b border-gray-100 bg-gray-50/50 px-10 py-6">
                   <h3 className="font-black text-gray-900 flex items-center text-lg uppercase tracking-tight">
                     <HeartPulse className="mr-3 text-red-500" size={24} /> Health Summary
                   </h3>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-900">
                    <div className="flex items-center p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50 hover:bg-white hover:border-red-100 transition-colors group">
                      <div className="p-4 bg-red-50 text-red-600 rounded-2xl mr-6 shadow-sm group-hover:bg-red-500 group-hover:text-white transition-all">
                        <Activity size={28} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Blood Registry</p>
                        <p className="text-2xl font-black">{patient?.bloodType || "UNDEFINED"}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50 hover:bg-white hover:border-blue-100 transition-colors group">
                      <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mr-6 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <ClipboardList size={28} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Medical Alerts</p>
                        <p className="text-base font-black leading-tight">
                          {patient?.knownAllergies?.length ? patient.knownAllergies.join(", ") : "NO ALERTS"}
                        </p>
                      </div>
                    </div>
                </div>
              </section>
            </div>

            {/* Patient - Right Column (Sidebar) */}
            <div className="space-y-10">
              <aside className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 p-10 space-y-10">
                <h3 className="font-black text-gray-900 text-xl tracking-tight border-b border-gray-100 pb-5 uppercase">Profile</h3>
                <div className="space-y-8">
                  <div className="flex items-start group">
                    <Mail size={22} className="text-blue-500 mt-1 mr-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Authenticated Email</p>
                      <p className="text-gray-900 font-black truncate max-w-[150px]">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start group">
                    <Phone size={22} className="text-green-500 mt-1 mr-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Registered Line</p>
                      <p className="text-gray-900 font-black">{patient?.phone || "PRIVATE"}</p>
                    </div>
                  </div>
                  <div className="flex items-start group">
                    <Calendar size={22} className="text-orange-500 mt-1 mr-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Date of Birth</p>
                      <p className="text-gray-900 font-black">
                        {patient?.dob ? new Date(patient.dob).toLocaleDateString(undefined, { dateStyle: 'long'}) : "NOT SET"}
                      </p>
                    </div>
                  </div>
                </div>
              </aside>

              <aside className="bg-blue-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <Shield size={100} />
                </div>
                <h4 className="font-black text-xl mb-6 flex items-center relative z-10 uppercase tracking-tight">
                  <Shield size={24} className="mr-3 text-blue-300" /> Insurance
                </h4>
                <div className="space-y-6 relative z-10">
                   <div>
                     <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest mb-1">Network Provider</p>
                     <p className="text-xl font-black truncate">{patient?.insuranceProvider || "N/A"}</p>
                   </div>
                   <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-xl border border-white/20">
                     <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest mb-2">Policy Identifier</p>
                     <p className="text-sm font-mono font-black tracking-widest text-blue-50">{patient?.insuranceId || "PENDING LINK"}</p>
                   </div>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          /* Doctor View */
          <div className="space-y-10">
            <header className="flex flex-col md:flex-row justify-between md:items-center bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 gap-6">
              <div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Clinical Dashboard</h3>
                <p className="text-gray-400 font-bold text-base uppercase tracking-widest mt-1">Patient Caseload & Registry</p>
              </div>
              <div className="bg-blue-600 text-white px-8 py-4 rounded-3xl flex items-center shadow-xl shadow-blue-200">
                <User size={24} className="mr-4" strokeWidth={2.5} />
                <span className="font-black text-sm uppercase tracking-[0.2em]">
                  {user?.doctor?.assignedPatients?.length || 0} Assignments
                </span>
              </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {user?.doctor?.assignedPatients?.length ? (
                user.doctor.assignedPatients.map((p: any) => (
                  <div key={p.id} className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 hover:shadow-2xl hover:border-blue-200/50 transition-all group relative overflow-hidden ring-1 ring-black/5 active:scale-95">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center space-x-6 mb-10">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                        <User size={36} />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-xl group-hover:text-blue-600 transition-colors leading-none mb-1">{p.fullName}</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.gender} &bull; TYPE {p.bloodType}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-5 border-t border-gray-50 pt-8">
                      <div className="flex justify-between items-center text-sm px-1">
                        <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Policy Holder</span>
                        <span className="font-black text-gray-900">{p.policyHolderName || "SELF"}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm px-1">
                        <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Insurance</span>
                        <span className="font-black text-gray-900 truncate max-w-[120px]">{p.insuranceProvider}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => router.push(`/chat/${p.userId}`)}
                      className="w-full mt-10 bg-gray-50 text-blue-600 font-black py-5 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm border border-gray-100 group-hover:border-blue-600 flex items-center justify-center space-x-4"
                    >
                      <MessageSquare size={20} strokeWidth={2.5} />
                      <span className="uppercase tracking-widest text-xs">Begin Session</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="lg:col-span-3 bg-white p-24 text-center rounded-[3rem] border-2 border-dashed border-gray-200 shadow-inner">
                   <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300">
                     <User size={48} />
                   </div>
                   <h4 className="text-2xl font-black text-gray-400 mb-3 uppercase tracking-tight">Active Queue Empty</h4>
                   <p className="text-gray-400 max-w-sm mx-auto font-medium text-lg leading-relaxed">Assigned patient cases will synchronize here automatically upon onboarding completion.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
