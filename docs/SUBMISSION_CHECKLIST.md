# Submission checklist — Medicine Availability Finder

**Suggested title:** Cloud-Based Medicine Availability and Pharmacy Inventory Management System Using AWS

## Must demonstrate

- [ ] Working **medicine search** (e.g. Paracetamol)
- [ ] **Pharmacy inventory management** (quantity updates)
- [ ] **Database** with medicines, pharmacies, inventory (PostgreSQL / RDS)
- [ ] **Cloud deployment** of backend and/or frontend (EC2 + S3 minimum)
- [ ] Explanation of **browser → API → database** flow (diagram in report)

## Suggested report sections

1. Introduction and problem statement  
2. Related work — cite [VitaMap](https://github.com/akasr/vitamap) and [ACKNOWLEDGMENTS.md](../ACKNOWLEDGMENTS.md)  
3. System architecture (EC2, RDS, S3, IAM, CloudWatch)  
4. Database schema (`db/prisma/schema.prisma`)  
5. Screenshots: search results, map, inventory, RDS, AWS console  
6. Conclusion and future work (distance filter, autocomplete — as in VitaMap roadmap)

## Demo script (5–8 minutes)

1. Show homepage title: **Medicine Availability Finder**  
2. Search Cetirizine in Surat  
3. Open **Pharmacy map** tab  
4. **Pharmacy inventory** — sign in (`greencross` / `demo12345` on seeded RDS) and change stock  
5. Refresh search — show updated quantity  
6. Show `/api/health` JSON with `"database":"postgresql"`  
7. Briefly show AWS RDS instance and EC2 process (or S3 bucket)

## Honesty notes for viva

- Inventory is **demo/fictional**, not real pharmacy data.  
- Not every AWS service must be live; document what you actually configured.  
- Chatbot/RAG from VitaMap is **not** included in this codebase.
