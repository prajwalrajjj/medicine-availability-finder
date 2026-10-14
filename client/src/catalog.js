export const pharmacies = [
  { id: 'ph1', name: 'Green Cross Pharmacy', city: 'Surat', address: '12 Ring Road', phone: 'Demo contact only', latitude: 21.1702, longitude: 72.8311 },
  { id: 'ph2', name: 'WellCare Medical Store', city: 'Surat', address: '48 Adajan Main Road', phone: 'Demo contact only', latitude: 21.1959, longitude: 72.7933 },
  { id: 'ph3', name: 'City Health Pharmacy', city: 'Surat', address: '7 Vesu Circle', phone: 'Demo contact only', latitude: 21.1418, longitude: 72.7811 },
  { id: 'ph4', name: 'Sunrise Pharmacy', city: 'Ahmedabad', address: '21 CG Road', phone: 'Demo contact only', latitude: 23.0225, longitude: 72.5714 },
  { id: 'ph5', name: 'Lakshmi Medical Store', city: 'Ahmedabad', address: '14 Navrangpura', phone: 'Demo contact only', latitude: 23.0365, longitude: 72.5611 },
  { id: 'ph6', name: 'Central Chemist', city: 'Vadodara', address: '9 Alkapuri', phone: 'Demo contact only', latitude: 22.3119, longitude: 73.1665 },
  { id: 'ph7', name: 'Harbour Medical', city: 'Mumbai', address: '32 Andheri West', phone: 'Demo contact only', latitude: 19.1363, longitude: 72.8296 },
  { id: 'ph8', name: 'Capital Pharmacy', city: 'Delhi', address: '5 Connaught Place', phone: 'Demo contact only', latitude: 28.6315, longitude: 77.2167 },
  { id: 'ph9', name: 'Garden City Meds', city: 'Bengaluru', address: '18 Indiranagar', phone: 'Demo contact only', latitude: 12.9784, longitude: 77.6408 }
];

export const medicines = [
  { id: 'med1', name: 'Paracetamol', strength: '500 mg', form: 'tablet' },
  { id: 'med2', name: 'Cetirizine', strength: '10 mg', form: 'tablet' },
  { id: 'med3', name: 'ORS', strength: 'standard sachet', form: 'powder sachet' },
  { id: 'med4', name: 'Azithromycin', strength: '500 mg', form: 'tablet' },
  { id: 'med5', name: 'Ibuprofen', strength: '200 mg', form: 'tablet' },
  { id: 'med6', name: 'Amoxicillin', strength: '250 mg', form: 'capsule' },
  { id: 'med7', name: 'Pantoprazole', strength: '40 mg', form: 'tablet' },
  { id: 'med8', name: 'Metformin', strength: '500 mg', form: 'tablet' }
];

function quantityFor(pharmacyIndex, medicineIndex) {
  return 8 + ((pharmacyIndex * 4 + medicineIndex * 7) % 32);
}

export function catalogueRows(overrides = {}) {
  const updated = new Date().toISOString();
  const rows = [];
  pharmacies.forEach((pharmacy, pharmacyIndex) => {
    medicines.forEach((medicine, medicineIndex) => {
      const inventoryId = `${pharmacy.id}-${medicine.id}`;
      rows.push({
        inventoryId,
        pharmacyId: pharmacy.id,
        pharmacyName: pharmacy.name,
        city: pharmacy.city,
        address: pharmacy.address,
        phone: pharmacy.phone,
        isOpen: true,
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,
        medicineId: medicine.id,
        medicineName: medicine.name,
        strength: medicine.strength,
        form: medicine.form,
        quantity: overrides[inventoryId] ?? quantityFor(pharmacyIndex, medicineIndex),
        lastUpdated: updated
      });
    });
  });
  return rows;
}

export function searchCatalogue(query = '', city = '', overrides = {}) {
  const medicineQuery = query.trim().toLowerCase();
  const cityQuery = city.trim().toLowerCase();
  const allCities = !cityQuery || cityQuery === 'all' || cityQuery === 'all locations';
  return catalogueRows(overrides).filter(row => {
    const medicineText = `${row.medicineName} ${row.strength} ${row.form}`.toLowerCase();
    const medicineMatches = !medicineQuery || medicineText.includes(medicineQuery);
    const cityMatches = allCities || row.city.toLowerCase().includes(cityQuery);
    return medicineMatches && cityMatches && row.quantity >= 0;
  });
}
