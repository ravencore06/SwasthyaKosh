/**
 * Mock AI Service for SwasthyaKosh
 * Simulates AI analysis of medical text.
 */

const MEDICAL_KNOWLEDGE_BASE = {
    "paracetamol": {
        category: "Analgesic (Pain Relief)",
        use: "Reduces fever and mild to moderate pain.",
        warnings: ["Do not exceed 4g in 24 hours.", "Avoid alcohol while taking."]
    },
    "amoxicillin": {
        category: "Antibiotic (Penicillin type)",
        use: "Treats bacterial infections.",
        warnings: ["Complete the full course even if feeling better.", "May cause digestive upset."]
    },
    "metformin": {
        category: "Anti-Diabetic",
        use: "Helps control blood sugar levels in Type 2 diabetes.",
        warnings: ["Take with meals.", "Monitor blood sugar regularly."]
    },
    "ibuprofen": {
        category: "NSAID (Inflammation relief)",
        use: "Reduces inflammation and pain.",
        warnings: ["Avoid on empty stomach.", "Risk of stomach irritation."]
    }
};

export const analyzePrescription = async (text) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerText = text.toLowerCase();
    const medicinesFound = [];
    const warnings = [];

    // Basic keyword searching to simulate "AI Understanding"
    Object.keys(MEDICAL_KNOWLEDGE_BASE).forEach(med => {
        if (lowerText.includes(med)) {
            medicinesFound.push({
                name: med.charAt(0).toUpperCase() + med.slice(1),
                ...MEDICAL_KNOWLEDGE_BASE[med]
            });
            warnings.push(...MEDICAL_KNOWLEDGE_BASE[med].warnings);
        }
    });

    return {
        summary: medicinesFound.length > 0
            ? `This prescription focuses on ${medicinesFound.map(m => m.category).join(' and ')}.`
            : "Standard wellness or recovery protocol.",
        medicines: medicinesFound,
        allWarnings: [...new Set(warnings)],
        hasCriticalWarning: lowerText.includes('critical') || lowerText.includes('severe')
    };
};
