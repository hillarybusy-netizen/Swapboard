export interface DepartmentTemplate {
  name: string;
  color: string;
  requiresCertification?: boolean;
  
}

export interface IndustryTemplate {
  label: string;
  icon: string;
  description: string;
  departments: DepartmentTemplate[];
}

export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  restaurant: {
    label: "Restaurant / Food Service",
    icon: "🍽️",
    description: "Perfect for cafes, restaurants, and food service businesses",
    departments: [
      {
        name: "Front of House",
        color: "#f97316",
        
      },
      {
        name: "Back of House",
        color: "#ef4444",
        
      },
      {
        name: "Bar",
        color: "#8b5cf6",
        
      },
      {
        name: "Management",
        color: "#6366f1",
        
      },
    ],
  },

  healthcare: {
    label: "Healthcare",
    icon: "🏥",
    description: "For hospitals, clinics, and healthcare facilities",
    departments: [
      {
        name: "ICU",
        color: "#3b82f6",
        requiresCertification: true,
        
      },
      {
        name: "Emergency",
        color: "#ef4444",
        requiresCertification: true,
        
      },
      {
        name: "Medical / Surgical",
        color: "#10b981",
        
      },
      {
        name: "Pharmacy",
        color: "#6366f1",
        requiresCertification: true,
        
      },
      {
        name: "Administration",
        color: "#64748b",
        
      },
    ],
  },

  retail: {
    label: "Retail",
    icon: "🛍️",
    description: "For stores, boutiques, and retail chains",
    departments: [
      {
        name: "Sales Floor",
        color: "#8b5cf6",
        
      },
      {
        name: "Cashier / POS",
        color: "#ec4899",
        
      },
      {
        name: "Stock / Receiving",
        color: "#f59e0b",
        
      },
      {
        name: "Management",
        color: "#6366f1",
        
      },
    ],
  },

  hospitality: {
    label: "Hospitality / Hotels",
    icon: "🏨",
    description: "For hotels, resorts, and hospitality businesses",
    departments: [
      {
        name: "Front Desk",
        color: "#10b981",
        
      },
      {
        name: "Housekeeping",
        color: "#f59e0b",
        
      },
      {
        name: "Food & Beverage",
        color: "#f97316",
        
      },
      {
        name: "Security",
        color: "#64748b",
        
      },
    ],
  },
};
