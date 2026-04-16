export interface DepartmentTemplate {
  name: string;
  color: string;
  requiresCertification?: boolean;
  roles: { name: string; minHoursNotice: number }[];
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
        roles: [
          { name: "Server", minHoursNotice: 4 },
          { name: "Host / Hostess", minHoursNotice: 2 },
          { name: "Busser", minHoursNotice: 2 },
          { name: "Expo", minHoursNotice: 2 },
        ],
      },
      {
        name: "Back of House",
        color: "#ef4444",
        roles: [
          { name: "Line Cook", minHoursNotice: 4 },
          { name: "Prep Cook", minHoursNotice: 4 },
          { name: "Dishwasher", minHoursNotice: 2 },
          { name: "Sous Chef", minHoursNotice: 8 },
        ],
      },
      {
        name: "Bar",
        color: "#8b5cf6",
        roles: [
          { name: "Bartender", minHoursNotice: 4 },
          { name: "Barback", minHoursNotice: 2 },
        ],
      },
      {
        name: "Management",
        color: "#6366f1",
        roles: [
          { name: "Shift Manager", minHoursNotice: 8 },
          { name: "General Manager", minHoursNotice: 24 },
        ],
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
        roles: [
          { name: "RN – ICU", minHoursNotice: 12 },
          { name: "LPN", minHoursNotice: 8 },
          { name: "CNA", minHoursNotice: 4 },
          { name: "Charge Nurse", minHoursNotice: 24 },
        ],
      },
      {
        name: "Emergency",
        color: "#ef4444",
        requiresCertification: true,
        roles: [
          { name: "RN – ER", minHoursNotice: 12 },
          { name: "ER Tech", minHoursNotice: 8 },
          { name: "Triage Nurse", minHoursNotice: 12 },
        ],
      },
      {
        name: "Medical / Surgical",
        color: "#10b981",
        roles: [
          { name: "RN", minHoursNotice: 8 },
          { name: "LPN", minHoursNotice: 8 },
          { name: "CNA", minHoursNotice: 4 },
        ],
      },
      {
        name: "Pharmacy",
        color: "#6366f1",
        requiresCertification: true,
        roles: [
          { name: "Pharmacist", minHoursNotice: 24 },
          { name: "Pharmacy Tech", minHoursNotice: 8 },
        ],
      },
      {
        name: "Administration",
        color: "#64748b",
        roles: [
          { name: "Unit Secretary", minHoursNotice: 4 },
          { name: "Patient Coordinator", minHoursNotice: 4 },
        ],
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
        roles: [
          { name: "Sales Associate", minHoursNotice: 4 },
          { name: "Department Lead", minHoursNotice: 8 },
          { name: "Fitting Room Attendant", minHoursNotice: 2 },
        ],
      },
      {
        name: "Cashier / POS",
        color: "#ec4899",
        roles: [
          { name: "Cashier", minHoursNotice: 2 },
          { name: "Customer Service Rep", minHoursNotice: 2 },
          { name: "Returns Specialist", minHoursNotice: 2 },
        ],
      },
      {
        name: "Stock / Receiving",
        color: "#f59e0b",
        roles: [
          { name: "Stock Associate", minHoursNotice: 4 },
          { name: "Receiving Clerk", minHoursNotice: 4 },
          { name: "Freight Team Member", minHoursNotice: 4 },
        ],
      },
      {
        name: "Management",
        color: "#6366f1",
        roles: [
          { name: "Assistant Manager", minHoursNotice: 24 },
          { name: "Store Manager", minHoursNotice: 48 },
          { name: "Visual Merchandiser", minHoursNotice: 8 },
        ],
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
        roles: [
          { name: "Front Desk Agent", minHoursNotice: 4 },
          { name: "Concierge", minHoursNotice: 8 },
          { name: "Night Auditor", minHoursNotice: 8 },
        ],
      },
      {
        name: "Housekeeping",
        color: "#f59e0b",
        roles: [
          { name: "Room Attendant", minHoursNotice: 2 },
          { name: "Housekeeping Supervisor", minHoursNotice: 8 },
          { name: "Laundry Attendant", minHoursNotice: 2 },
        ],
      },
      {
        name: "Food & Beverage",
        color: "#f97316",
        roles: [
          { name: "Server", minHoursNotice: 4 },
          { name: "Banquet Server", minHoursNotice: 4 },
          { name: "Bartender", minHoursNotice: 4 },
        ],
      },
      {
        name: "Security",
        color: "#64748b",
        roles: [
          { name: "Security Officer", minHoursNotice: 8 },
          { name: "Loss Prevention", minHoursNotice: 8 },
        ],
      },
    ],
  },
};
