import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { seedPharmacies, seedMedicines, seedInventory, seedLocations } from './data.js';
import { prisma } from './db.js';
import { seedDatabase } from './seed.js';
import {
  authMiddleware,
  hashPassword,
  signPharmacyToken,
  verifyPassword,
  verifyPharmacyToken
} from './auth.js';

const app = express();
const corsOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : null;
app.use(corsOrigins ? { origin: corsOrigins, credentials: true } : {}));
app.use(express.json());

let databaseMode = 'memory';
const locationByLegacy = new Map(seedLocations.map(l => [l.pharmacyId, l]));
let pharmacies = structuredClone(seedPharmacies).map(p => {
  const loc = locationByLegacy.get(p.id);
  return loc ? { ...p, latitude: loc.latitude, longitude: loc.longitude } : p;
});
let medicines = structuredClone(seedMedicines);
let inventory = structuredClone(seedInventory);

function asResult(row) {
  const p = row.pharmacy;
  const m = row.medicine;
  return {
    inventoryId: row.id,
    pharmacyId: p.id,
    pharmacyName: p.name,
    city: p.city,
    address: p.address,
    phone: p.phone,
    isOpen: p.isOpen ?? true,
    latitude: p.location?.latitude ?? null,
    longitude: p.location?.longitude ?? null,
    medicineId: m.id,
    medicineName: m.name,
    strength: m.strength,
    form: m.form,
    quantity: row.quantity,
    lastUpdated: row.lastUpdated
  };
}

function memoryResults(q = '', city = '') {
  const ql = q.toLowerCase();
  const cl = city.toLowerCase();
  return inventory
    .map(i => {
      const p = pharmacies.find(x => x.id === i.pharmacyId);
      const m = medicines.find(x => x.id === i.medicineId);
      const pharmacy = p
        ? {
            ...p,
            isOpen: true,
            location: p.latitude != null ? { latitude: p.latitude, longitude: p.longitude } : null
          }
        : p;
      return { id: i.id, quantity: i.quantity, lastUpdated: i.lastUpdated, pharmacy, medicine: m };
    })
    .filter(x => x.pharmacy && x.medicine)
    .filter(x => !ql || `${x.medicine.name} ${x.medicine.strength} ${x.medicine.form}`.toLowerCase().includes(ql))
    .filter(x => !cl || x.pharmacy.city.toLowerCase().includes(cl))
    .map(asResult);
}

async function prismaSearch(q, city) {
  const medFilter = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { strength: { contains: q, mode: 'insensitive' } },
          { form: { contains: q, mode: 'insensitive' } }
        ]
      }
    : {};

  const rows = await prisma.inventory.findMany({
    where: {
      medicine: medFilter,
      pharmacy: city ? { city: { contains: city, mode: 'insensitive' } } : undefined
    },
    include: {
      pharmacy: { include: { location: true } },
      medicine: true
    },
    orderBy: { lastUpdated: 'desc' }
  });

  return rows.map(i =>
    asResult({
      id: i.id,
      quantity: i.quantity,
      lastUpdated: i.lastUpdated.toISOString(),
      pharmacy: {
        id: i.pharmacy.id,
        name: i.pharmacy.name,
        city: i.pharmacy.city,
        address: i.pharmacy.address,
        phone: i.pharmacy.phone,
        isOpen: i.pharmacy.isOpen,
        location: i.pharmacy.location
      },
      medicine: {
        id: i.medicine.id,
        name: i.medicine.name,
        strength: i.medicine.strength,
        form: i.medicine.form
      }
    })
  );
}

app.get('/api/health', (_req, res) =>
  res.json({
    status: 'ok',
    database: databaseMode,
    project: 'Medicine Availability Finder',
    timestamp: new Date().toISOString()
  })
);

app.get('/api/medicines', async (_req, res, next) => {
  try {
    if (databaseMode === 'postgresql') {
      const rows = await prisma.medicine.findMany({ orderBy: { name: 'asc' } });
      return res.json(rows.map(m => ({ id: m.id, name: m.name, strength: m.strength, form: m.form })));
    }
    res.json(medicines);
  } catch (e) {
    next(e);
  }
});

app.get('/api/pharmacies', async (_req, res, next) => {
  try {
    if (databaseMode === 'postgresql') {
      const rows = await prisma.pharmacy.findMany({
        include: { location: true },
        orderBy: { name: 'asc' }
      });
      return res.json(
        rows.map(p => ({
          id: p.id,
          name: p.name,
          city: p.city,
          address: p.address,
          phone: p.phone,
          isOpen: p.isOpen,
          latitude: p.location?.latitude ?? null,
          longitude: p.location?.longitude ?? null
        }))
      );
    }
    res.json(
      pharmacies.map(p => ({
        id: p.id,
        name: p.name,
        city: p.city,
        address: p.address,
        phone: p.phone,
        isOpen: true,
        latitude: p.latitude ?? null,
        longitude: p.longitude ?? null
      }))
    );
  } catch (e) {
    next(e);
  }
});

app.get('/api/inventory/search', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const city = String(req.query.city || '').trim();
    if (databaseMode === 'postgresql') return res.json(await prismaSearch(q, city));
    res.json(memoryResults(q, city));
  } catch (e) {
    next(e);
  }
});

app.post('/api/pharmacy/signup', async (req, res, next) => {
  try {
    if (databaseMode !== 'postgresql') {
      return res.status(503).json({ error: 'Pharmacy registration requires PostgreSQL (e.g. Amazon RDS)' });
    }
    const { name, phone, email, username, address, city, password, latitude, longitude } = req.body;
    if (!name || !phone || !email || !username || !address || !city || !password || latitude == null || longitude == null) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: 'Invalid location coordinates' });
    }

    const existing = await prisma.pharmacy.findFirst({
      where: { OR: [{ phone }, { email }, { username }] }
    });
    if (existing) return res.status(400).json({ error: 'Phone, email, or username already registered' });

    const hashed = await hashPassword(password);
    const pharmacy = await prisma.$transaction(async tx => {
      const created = await tx.pharmacy.create({
        data: {
          name,
          phone,
          email,
          username,
          address,
          city,
          password: hashed,
          isOpen: true
        }
      });
      await tx.location.create({
        data: { pharmacyId: created.id, latitude: lat, longitude: lng }
      });
      return created;
    });

    res.status(201).json({ message: 'Pharmacy registered', pharmacyId: pharmacy.id });
  } catch (e) {
    next(e);
  }
});

app.post('/api/pharmacy/signin', async (req, res, next) => {
  try {
    if (databaseMode !== 'postgresql') {
      return res.status(503).json({ error: 'Pharmacy sign-in requires PostgreSQL' });
    }
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const pharmacy = await prisma.pharmacy.findFirst({
      where: { OR: [{ username }, { email: username }] }
    });
    if (!pharmacy?.password) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await verifyPassword(password, pharmacy.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = await signPharmacyToken(pharmacy);
    res.json({
      token,
      pharmacy: { id: pharmacy.id, name: pharmacy.name, city: pharmacy.city, username: pharmacy.username }
    });
  } catch (e) {
    next(e);
  }
});

app.patch('/api/inventory/:id', async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 1000000) {
      return res.status(400).json({ error: 'quantity must be a non-negative integer' });
    }

    if (databaseMode === 'postgresql') {
      const existing = await prisma.inventory.findUnique({ where: { id: req.params.id } });
      if (!existing) return res.status(404).json({ error: 'Inventory record not found' });

      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : '';
      if (token) {
        const pharmacyId = await verifyPharmacyToken(token);
        if (!pharmacyId || pharmacyId !== existing.pharmacyId) {
          return res.status(403).json({ error: 'You can only update your own pharmacy inventory' });
        }
      }

      const updated = await prisma.inventory.update({
        where: { id: req.params.id },
        data: { quantity, lastUpdated: new Date() }
      });
      return res.json({ success: true, quantity: updated.quantity, lastUpdated: updated.lastUpdated });
    }

    const item = inventory.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Inventory record not found' });
    item.quantity = quantity;
    item.lastUpdated = new Date().toISOString();
    res.json({ success: true, quantity: item.quantity, lastUpdated: item.lastUpdated });
  } catch (e) {
    next(e);
  }
});

app.post('/api/inventory', authMiddleware, async (req, res, next) => {
  try {
    const { medicineId, quantity } = req.body;
    const q = Number(quantity);
    if (!medicineId || !Number.isInteger(q) || q < 0) {
      return res.status(400).json({ error: 'medicineId and non-negative integer quantity are required' });
    }

    if (databaseMode === 'postgresql') {
      const [pharmacy, medicine] = await Promise.all([
        prisma.pharmacy.findUnique({ where: { id: req.pharmacyId } }),
        prisma.medicine.findUnique({ where: { id: medicineId } })
      ]);
      if (!pharmacy || !medicine) return res.status(404).json({ error: 'Pharmacy or medicine not found' });

      const row = await prisma.inventory.upsert({
        where: { pharmacyId_medicineId: { pharmacyId: pharmacy.id, medicineId: medicine.id } },
        create: { pharmacyId: pharmacy.id, medicineId: medicine.id, quantity: q, lastUpdated: new Date() },
        update: { quantity: q, lastUpdated: new Date() }
      });
      return res.status(201).json({ success: true, id: row.id });
    }

    if (!medicines.some(m => m.id === medicineId)) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    const row = { id: `inv${Date.now()}`, pharmacyId: req.pharmacyId, medicineId, quantity: q, lastUpdated: new Date().toISOString() };
    inventory.push(row);
    res.status(201).json({ success: true, id: row.id });
  } catch (e) {
    next(e);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT || 5000);

async function start() {
  if (process.env.POSTGRES_URL) {
    try {
      await prisma.$connect();
      databaseMode = 'postgresql';
      await seedDatabase(prisma);
      console.log('Connected to PostgreSQL (Amazon RDS–compatible).');
    } catch (e) {
      console.error('PostgreSQL connection failed:', e.message);
      process.exit(1);
    }
  } else {
    console.log('POSTGRES_URL is empty; using in-memory demo data (restart resets changes).');
  }

  app.listen(port, () => console.log(`Medicine Availability API listening on port ${port}`));
}

start();
