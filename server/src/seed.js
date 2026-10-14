import { hashPassword } from './auth.js';
import { seedPharmacies, seedMedicines, seedInventory, seedLocations } from './data.js';

export async function seedDatabase(prisma) {
  if ((await prisma.pharmacy.count()) > 0) return;

  const demoPassword = await hashPassword('demo12345');

  const pharmacyDocs = [];
  for (const p of seedPharmacies) {
    const row = await prisma.pharmacy.create({
      data: {
        legacyId: p.id,
        name: p.name,
        city: p.city,
        address: p.address,
        phone: p.phone,
        email: p.demoEmail,
        username: p.demoUsername,
        password: demoPassword,
        isOpen: true
      }
    });
    pharmacyDocs.push({ legacyId: p.id, id: row.id });
  }

  const medicineDocs = [];
  for (const m of seedMedicines) {
    const row = await prisma.medicine.create({
      data: { legacyId: m.id, name: m.name, strength: m.strength, form: m.form }
    });
    medicineDocs.push({ legacyId: m.id, id: row.id });
  }

  const pMap = new Map(pharmacyDocs.map(p => [p.legacyId, p.id]));
  const mMap = new Map(medicineDocs.map(m => [m.legacyId, m.id]));

  for (const i of seedInventory) {
    await prisma.inventory.create({
      data: {
        legacyId: i.id,
        pharmacyId: pMap.get(i.pharmacyId),
        medicineId: mMap.get(i.medicineId),
        quantity: i.quantity,
        lastUpdated: new Date(i.lastUpdated)
      }
    });
  }

  for (const loc of seedLocations) {
    const pharmacyId = pMap.get(loc.pharmacyId);
    if (!pharmacyId) continue;
    await prisma.location.create({
      data: { pharmacyId, latitude: loc.latitude, longitude: loc.longitude }
    });
  }

  console.log('Seeded demo pharmacies, medicines, inventory, and map locations.');
}
