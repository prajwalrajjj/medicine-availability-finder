export const seedPharmacies = [
  { id: 'ph1', name: 'Green Cross Pharmacy', city: 'Surat', address: '12 Ring Road, Surat', phone: 'Demo contact only', demoEmail: 'green.cross@demo.local', demoUsername: 'greencross' },
  { id: 'ph2', name: 'WellCare Medical Store', city: 'Surat', address: '48 Adajan Main Road, Surat', phone: 'Demo contact only', demoEmail: 'wellcare@demo.local', demoUsername: 'wellcare' },
  { id: 'ph3', name: 'City Health Pharmacy', city: 'Surat', address: '7 Vesu Circle, Surat', phone: 'Demo contact only', demoEmail: 'cityhealth@demo.local', demoUsername: 'cityhealth' },
  { id: 'ph4', name: 'Sunrise Pharmacy', city: 'Ahmedabad', address: '21 CG Road, Ahmedabad', phone: 'Demo contact only', demoEmail: 'sunrise@demo.local', demoUsername: 'sunrise' }
];

export const seedMedicines = [
  { id: 'med1', name: 'Paracetamol', strength: '500 mg', form: 'tablet' },
  { id: 'med2', name: 'Cetirizine', strength: '10 mg', form: 'tablet' },
  { id: 'med3', name: 'ORS', strength: 'standard sachet', form: 'powder sachet' },
  { id: 'med4', name: 'Azithromycin', strength: '500 mg', form: 'tablet' },
  { id: 'med5', name: 'Ibuprofen', strength: '200 mg', form: 'tablet' }
];

export const seedInventory = [
  { id: 'inv1', pharmacyId: 'ph1', medicineId: 'med1', quantity: 24 },
  { id: 'inv2', pharmacyId: 'ph2', medicineId: 'med1', quantity: 0 },
  { id: 'inv3', pharmacyId: 'ph3', medicineId: 'med1', quantity: 12 },
  { id: 'inv4', pharmacyId: 'ph1', medicineId: 'med2', quantity: 9 },
  { id: 'inv5', pharmacyId: 'ph2', medicineId: 'med2', quantity: 15 },
  { id: 'inv6', pharmacyId: 'ph3', medicineId: 'med3', quantity: 6 },
  { id: 'inv7', pharmacyId: 'ph1', medicineId: 'med4', quantity: 4 },
  { id: 'inv8', pharmacyId: 'ph4', medicineId: 'med1', quantity: 8 },
  { id: 'inv9', pharmacyId: 'ph4', medicineId: 'med5', quantity: 18 },
  { id: 'inv10', pharmacyId: 'ph2', medicineId: 'med5', quantity: 7 }
].map(x => ({ ...x, lastUpdated: new Date().toISOString() }));

export const seedLocations = [
  { pharmacyId: 'ph1', latitude: 21.1702, longitude: 72.8311 },
  { pharmacyId: 'ph2', latitude: 21.1959, longitude: 72.7933 },
  { pharmacyId: 'ph3', latitude: 21.1418, longitude: 72.7811 },
  { pharmacyId: 'ph4', latitude: 23.0225, longitude: 72.5714 }
];
