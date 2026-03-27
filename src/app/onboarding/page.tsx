"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useGetDraftQuery, 
  useUpdateDraftMutation, 
  useSubmitOnboardingMutation,
  useGetDoctorsQuery 
} from "@/store/api/onboardingApi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { User, Activity, ShieldCheck, ChevronRight, ChevronLeft, Check } from "lucide-react";

// --- Validations ---
const step1Schema = z.object({
  fullName: z.string().min(3).refine(val => val.trim().split(" ").length >= 2, "Must include at least 2 words"),
  dob: z.string(), // simplified for now
  gender: z.string(),
  phone: z.string().min(10),
  emergencyContactName: z.string().min(2),
  emergencyContactPhone: z.string().min(10),
});

const step2Schema = z.object({
  bloodType: z.string(),
  currentMedications: z.string().optional(),
  knownAllergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  previousSurgeries: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
});

const step3Schema = z.object({
  insuranceProvider: z.string().min(2),
  insuranceId: z.string().min(2),
  policyHolderName: z.string().min(2),
  preferredDoctorId: z.string().uuid(),
  preferredTimeSlot: z.string(),
  referralSource: z.string(),
  additionalNotes: z.string().optional(),
});

// --- Components ---
export default function OnboardingPage() {
  const router = useRouter();
  const { data: draft, isLoading: isLoadingDraft } = useGetDraftQuery({});
  const [updateDraft] = useUpdateDraftMutation();
  const [submitOnboarding, { isLoading: isSubmitting }] = useSubmitOnboardingMutation();
  const { data: doctors } = useGetDoctorsQuery({});

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (draft?.currentStep && currentStep === 1) { // Only sync on first load or if we are at step 1
      setCurrentStep(draft.currentStep);
    }
    if (draft?.status === "COMPLETED") {
      router.push("/dashboard");
    }
  }, [draft, router]);

  const nextStep = async (data: any) => {
    try {
      await updateDraft({ step: currentStep, data }).unwrap();
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      } else {
        await submitOnboarding({}).unwrap();
        toast.success("Onboarding complete!");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error("Failed to save progress");
    }
  };

  if (isLoadingDraft) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Stepper Header */}
          <div className="bg-blue-600 p-8 text-white">
            <h1 className="text-2xl font-bold mb-4">Patient Onboarding</h1>
            <div className="flex justify-between items-center relative">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= step ? "bg-white text-blue-600 border-white" : "bg-blue-500 text-blue-200 border-blue-400"
                  }`}>
                    {currentStep > step ? <Check size={20} /> : step}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${currentStep >= step ? "text-white" : "text-blue-200"}`}>
                    {step === 1 ? "Personal" : step === 2 ? "Medical" : "Insurance"}
                  </span>
                </div>
              ))}
              {/* Progress Line */}
              <div className="absolute top-5 left-0 w-full h-0.5 bg-blue-400 -z-0" />
              <div className="absolute top-5 left-0 h-0.5 bg-white transition-all duration-300" style={{ width: `${(currentStep - 1) * 50}%` }} />
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && <Step1 currentData={draft?.step1Data} onNext={nextStep} />}
                {currentStep === 2 && <Step2 currentData={draft?.step2Data} onNext={nextStep} onBack={() => setCurrentStep(1)} />}
                {currentStep === 3 && <Step3 currentData={draft?.step3Data} doctors={doctors} onNext={nextStep} onBack={() => setCurrentStep(2)} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1({ currentData, onNext }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: currentData || {},
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900">Full Name <span className="text-red-500">*</span></label>
          <input {...register("fullName")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message as string}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Date of Birth <span className="text-red-500">*</span></label>
          <input type="date" {...register("dob")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob.message as string}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Gender <span className="text-red-500">*</span></label>
          <select {...register("gender")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Phone Number <span className="text-red-500">*</span></label>
          <input {...register("phone")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message as string}</p>}
        </div>
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="font-semibold text-lg mb-4 text-gray-900">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">Contact Name <span className="text-red-500">*</span></label>
            <input {...register("emergencyContactName")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            {errors.emergencyContactName && <p className="text-xs text-red-500 mt-1">{errors.emergencyContactName.message as string}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Contact Phone <span className="text-red-500">*</span></label>
            <input {...register("emergencyContactPhone")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            {errors.emergencyContactPhone && <p className="text-xs text-red-500 mt-1">{errors.emergencyContactPhone.message as string}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button type="submit" className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Next <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </form>
  );
}

function Step2({ currentData, onNext, onBack }: any) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: currentData || {},
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900">Blood Type <span className="text-red-500">*</span></label>
          <select {...register("bloodType")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="Unknown">Select Blood Type</option>
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900">Current Medications (Optional)</label>
          <textarea {...register("currentMedications")} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Family Medical History (Optional)</label>
          <textarea {...register("familyMedicalHistory")} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button type="button" onClick={onBack} className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <ChevronLeft size={18} className="mr-1" /> Back
        </button>
        <button type="submit" className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Next <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </form>
  );
}

function Step3({ currentData, doctors, onNext, onBack }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: currentData || {},
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900">Insurance Provider <span className="text-red-500">*</span></label>
          <input {...register("insuranceProvider")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Insurance ID <span className="text-red-500">*</span></label>
          <input {...register("insuranceId")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Policy Holder Name <span className="text-red-500">*</span></label>
          <input {...register("policyHolderName")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Preferred Doctor <span className="text-red-500">*</span></label>
          <select {...register("preferredDoctorId")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">Select Doctor</option>
            {doctors?.map((d: any) => (
              <option key={d.id} value={d.id}>{d.user.email} ({d.specialization || "General"})</option>
            ))}
          </select>
          {errors.preferredDoctorId && <p className="text-xs text-red-500 mt-1">{errors.preferredDoctorId.message as string}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Preferred Time Slot <span className="text-red-500">*</span></label>
          <div className="mt-2 flex space-x-4">
            {["Morning", "Afternoon", "Evening"].map(t => (
              <label key={t} className="inline-flex items-center">
                <input type="radio" value={t} {...register("preferredTimeSlot")} className="text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">{t}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Referral Source <span className="text-red-500">*</span></label>
          <select {...register("referralSource")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="Google">Google</option>
            <option value="Friend">Friend</option>
            <option value="Doctor Referral">Doctor Referral</option>
            <option value="Ad">Ad</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button type="button" onClick={onBack} className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <ChevronLeft size={18} className="mr-1" /> Back
        </button>
        <button type="submit" className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Finalize Onboarding <ShieldCheck size={18} className="ml-2" />
        </button>
      </div>
    </form>
  );
}
