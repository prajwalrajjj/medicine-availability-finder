export const seedPharmacies = [
  { id: 'ph1', name: 'Green Cross Pharmacy', city: 'Surat', address: '12 Ring Road, Surat', phone: 'Demo contact only', demoEmail: 'green.cross@demo.local', demoUsername: 'greencross' },
  { id: 'ph2', name: 'WellCare Medical Store', city: 'Surat', address: '48 Adajan Main Road, Surat', phone: 'Demo contact only', demoEmail: 'wellcare@demo.local', demoUsername: 'wellcare' },
  { id: 'ph3', name: 'City Health Pharmacy', city: 'Surat', address: '7 Vesu Circle, Surat', phone: 'Demo contact only', demoEmail: 'cityhealth@demo.local', demoUsername: 'cityhealth' },
  { id: 'ph4', name: 'Sunrise Pharmacy', city: 'Ahmedabad', address: '21 CG Road, Ahmedabad', phone: 'Demo contact only', demoEmail: 'sunrise@demo.local', demoUsername: 'sunrise' },
  { id: 'ph5', name: 'Lakshmi Medical Store', city: 'Ahmedabad', address: '14 Navrangpura, Ahmedabad', phone: 'Demo contact only', demoEmail: 'lakshmi@demo.local', demoUsername: 'lakshmi' },
  { id: 'ph6', name: 'Central Chemist', city: 'Vadodara', address: '9 Alkapuri, Vadodara', phone: 'Demo contact only', demoEmail: 'central@demo.local', demoUsername: 'central' },
  { id: 'ph7', name: 'Harbour Medical', city: 'Mumbai', address: '32 Andheri West, Mumbai', phone: 'Demo contact only', demoEmail: 'harbour@demo.local', demoUsername: 'harbour' },
  { id: 'ph8', name: 'Capital Pharmacy', city: 'Delhi', address: '5 Connaught Place, Delhi', phone: 'Demo contact only', demoEmail: 'capital@demo.local', demoUsername: 'capital' },
  { id: 'ph9', name: 'Garden City Meds', city: 'Bengaluru', address: '18 Indiranagar, Bengaluru', phone: 'Demo contact only', demoEmail: 'gardencity@demo.local', demoUsername: 'gardencity' }
];

export const seedMedicines = [
  { id: 'med1', name: 'Paracetamol', strength: '500 mg', form: 'tablet' },
  { id: 'med2', name: 'Cetirizine', strength: '10 mg', form: 'tablet' },
  { id: 'med3', name: 'ORS', strength: 'standard sachet', form: 'powder sachet' },
  { id: 'med4', name: 'Azithromycin', strength: '500 mg', form: 'tablet' },
  { id: 'med5', name: 'Ibuprofen', strength: '200 mg', form: 'tablet' },
  { id: 'med6', name: 'Amoxicillin', strength: '250 mg', form: 'capsule' },
  { id: 'med7', name: 'Pantoprazole', strength: '40 mg', form: 'tablet' },
  { id: 'med8', name: 'Metformin', strength: '500 mg', form: 'tablet' }
];

export const seedLocations = [
  { pharmacyId: 'ph1', latitude: 21.1702, longitude: 72.8311 },
  { pharmacyId: 'ph2', latitude: 21.1959, longitude: 72.7933 },
  { pharmacyId: 'ph3', latitude: 21.1418, longitude: 72.7811 },
  { pharmacyId: 'ph4', latitude: 23.0225, longitude: 72.5714 },
  { pharmacyId: 'ph5', latitude: 23.0365, longitude: 72.5611 },
  { pharmacyId: 'ph6', latitude: 22.3119, longitude: 73.1665 },
  { pharmacyId: 'ph7', latitude: 19.1363, longitude: 72.8296 },
  { pharmacyId: 'ph8', latitude: 28.6315, longitude: 77.2167 },
  { pharmacyId: 'ph9', latitude: 12.9784, longitude: 77.6408 }
];

export const seedInventory = seedPharmacies.flatMap((pharmacy, pharmacyIndex) =>
  seedMedicines.map((medicine, medicineIndex) => ({
    id: `${pharmacy.id}-${medicine.id}`,
    pharmacyId: pharmacy.id,
    medicineId: medicine.id,
    quantity: 8 + ((pharmacyIndex * 4 + medicineIndex * 7) % 32),
    lastUpdated: new Date().toISOString()
  }))
);
