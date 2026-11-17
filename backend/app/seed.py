import os
import sys
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.department import Department
from app.models.user import User, UserRole
from app.models.issue import (
    Issue, IssueType, IssueStatus, SeverityLevel, ComplaintSupport
)
from app.models.image import IssueImage
from app.models.history import IssueStatusHistory
from app.models.duplicate import DuplicateIssueRelation

def seed_database():
    print("=" * 70)
    print("      NAGARSETU (नागरिकों और प्रशासन के बीच सेतु) — DATABASE SEED")
    print("=" * 70)
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed 6 Official NagarSetu Departments
        dept_data = [
            {
                "name": "Road Maintenance & Paving Department",
                "code": "DEPT_ROAD",
                "description": "Responsible for arterial roads, pothole resurfacing, and pavement safety.",
                "email": "roads@nagarsetu.gov.in"
            },
            {
                "name": "Sanitation & Waste Management Department",
                "code": "DEPT_SAN",
                "description": "Handles solid waste collection, municipal dumpsters, and illegal garbage dumping.",
                "email": "sanitation@nagarsetu.gov.in"
            },
            {
                "name": "Water Supply & Distribution Department",
                "code": "DEPT_WATER",
                "description": "Manages potable water mains, pipeline bursts, leakages, and pressure monitoring.",
                "email": "water@nagarsetu.gov.in"
            },
            {
                "name": "Drainage & Stormwater Department",
                "code": "DEPT_DRAIN",
                "description": "Maintains stormwater drains, sewer lines, open manholes, and urban waterlogging prevention.",
                "email": "drainage@nagarsetu.gov.in"
            },
            {
                "name": "Electrical Infrastructure Department",
                "code": "DEPT_ELEC",
                "description": "Maintains municipal lighting, exposed electric cables, and transformer safety.",
                "email": "electrical@nagarsetu.gov.in"
            },
            {
                "name": "Public Works Department (PWD)",
                "code": "DEPT_PWD",
                "description": "Oversees public infrastructure, footpaths, bridges, and general civic assets.",
                "email": "pwd@nagarsetu.gov.in"
            },
        ]

        dept_map = {}
        for d in dept_data:
            dept = db.query(Department).filter(Department.code == d["code"]).first()
            if not dept:
                dept = Department(
                    name=d["name"],
                    code=d["code"],
                    description=d["description"],
                    contact_email=d["email"]
                )
                db.add(dept)
                db.flush()
            else:
                dept.name = d["name"]
                dept.description = d["description"]
                dept.contact_email = d["email"]
            dept_map[d["code"]] = dept

        db.commit()
        print(f"[OK] Seeded {len(dept_map)} NagarSetu Departments.")

        # 2. Seed Users
        # Primary Admin
        admin = db.query(User).filter(User.email == "admin@nagarsetu.gov.in").first()
        if not admin:
            admin = User(
                full_name="Municipal Chief Commissioner (NagarSetu Admin)",
                email="admin@nagarsetu.gov.in",
                hashed_password=get_password_hash("Admin@123"),
                role=UserRole.ADMIN
            )
            db.add(admin)

        # Legacy alias for backward compatibility
        legacy_admin = db.query(User).filter(User.email == "admin@civicsense.ai").first()
        if not legacy_admin:
            legacy_admin = User(
                full_name="Administrator (CivicSense Compatibility)",
                email="admin@civicsense.ai",
                hashed_password=get_password_hash("Admin@123"),
                role=UserRole.ADMIN
            )
            db.add(legacy_admin)

        # Department Officers
        officers_to_seed = [
            ("Rajesh Sharma", "road.officer@nagarsetu.gov.in", "DEPT_ROAD"),
            ("Priya Patel", "sanitation.officer@nagarsetu.gov.in", "DEPT_SAN"),
            ("Vikram Malhotra", "water.officer@nagarsetu.gov.in", "DEPT_WATER"),
            ("Amit Deshmukh", "drainage.officer@nagarsetu.gov.in", "DEPT_DRAIN"),
            ("Kavita Nair", "electrical.officer@nagarsetu.gov.in", "DEPT_ELEC"),
            ("Suresh Chandra", "pwd.officer@nagarsetu.gov.in", "DEPT_PWD"),
            # Legacy officer aliases
            ("Rajesh Sharma (PWD Lead)", "pwd.officer@civicsense.ai", "DEPT_ROAD"),
            ("Priya Patel (Sanitation Lead)", "sanitation.officer@civicsense.ai", "DEPT_SAN"),
        ]

        officer_map = {}
        for name, email, dcode in officers_to_seed:
            off = db.query(User).filter(User.email == email).first()
            if not off:
                off = User(
                    full_name=name,
                    email=email,
                    hashed_password=get_password_hash("Officer@123"),
                    role=UserRole.OFFICER,
                    department_id=dept_map[dcode].id
                )
                db.add(off)
                db.flush()
            officer_map[email] = off

        # Citizens
        citizens_to_seed = [
            ("Ananya Verma", "citizen@nagarsetu.gov.in", "Citizen@123"),
            ("Rohan Gupta", "rohan.gupta@delhi.org", "Citizen@123"),
            ("Harpreet Singh", "harpreet.singh@chandigarh.org", "Citizen@123"),
            ("Ananya Verma (Legacy)", "citizen@civicsense.ai", "Citizen@123"),
        ]

        citizen_map = {}
        for name, email, pwd in citizens_to_seed:
            cit = db.query(User).filter(User.email == email).first()
            if not cit:
                cit = User(
                    full_name=name,
                    email=email,
                    hashed_password=get_password_hash(pwd),
                    role=UserRole.CITIZEN
                )
                db.add(cit)
                db.flush()
            citizen_map[email] = cit

        db.commit()
        db.refresh(admin)
        main_citizen = citizen_map["citizen@nagarsetu.gov.in"]
        db.refresh(main_citizen)
        print("[OK] Seeded NagarSetu Users (Admin, Department Leads, Citizens).")

        # 3. Seed Realistic Indian Civic Issues
        now = datetime.utcnow()
        sample_issues = [
            {
                "title": "Hazardous Open Manhole on Ring Road near Metro Pillar 42",
                "description": "Deep open stormwater chamber without warning barricades or reflector tape. High risk of severe accident for two-wheelers and school pedestrians at night.",
                "type": IssueType.MANHOLE,
                "lat": 28.6139,
                "lng": 77.2090,
                "address": "Ring Road Sector 4, Connaught Place, New Delhi",
                "confidence": 0.96,
                "severity": SeverityLevel.CRITICAL,
                "priority": 94.0,
                "explanation": "Priority Score: 94.0/100 (CRITICAL)\n• High public safety hazard for category 'Open Manhole' (Life risk index: 95/100).\n• High-confidence computer vision detection (96% certainty).\n• Located on heavy arterial ring road near school route.\nRecommended Action: Immediate barricading and iron lid installation within 24 hours.",
                "status": IssueStatus.ASSIGNED,
                "dept_code": "DEPT_DRAIN",
                "progress": 30,
                "support_count": 8,
                "assigned_email": "drainage.officer@nagarsetu.gov.in",
                "sla_hours": 24,
                "sla_deadline": now + timedelta(hours=14)
            },
            {
                "title": "Severe Pothole Cluster and Asphalt Cratering on Outer Ring Road",
                "description": "Road surface has eroded causing large 10-inch potholes. Multiple bike riders skidded during rain yesterday.",
                "type": IssueType.POTHOLE,
                "lat": 28.6250,
                "lng": 77.2180,
                "address": "Barakhamba Road Crossing, Central Delhi",
                "confidence": 0.93,
                "severity": SeverityLevel.HIGH,
                "priority": 79.5,
                "explanation": "Priority Score: 79.5/100 (HIGH)\n• Significant vehicle damage and skid risk on major crossing.\n• 93% AI detection certainty.\n• Endorsed by 5 nearby citizens.\nRecommended Action: Hot-mix asphalt road patching within 48 hours.",
                "status": IssueStatus.IN_PROGRESS,
                "dept_code": "DEPT_ROAD",
                "progress": 65,
                "support_count": 5,
                "assigned_email": "road.officer@nagarsetu.gov.in",
                "sla_hours": 48,
                "sla_deadline": now + timedelta(hours=22)
            },
            {
                "title": "Major Potable Water Pipeline Burst and Road Submergence",
                "description": "Ganga water distribution pipe cracked. Clean drinking water continuously gushing onto the road since 6 AM.",
                "type": IssueType.WATER_LEAKAGE,
                "lat": 28.6210,
                "lng": 77.2120,
                "address": "Near Shivaji Stadium Bus Terminal, New Delhi",
                "confidence": 0.91,
                "severity": SeverityLevel.HIGH,
                "priority": 82.0,
                "explanation": "Priority Score: 82.0/100 (HIGH)\n• High-volume drinking water loss and road foundation erosion risk.\n• 91% AI confidence.\nRecommended Action: Water valve isolation and pipe clamp welding within 48 hours.",
                "status": IssueStatus.UNDER_REVIEW,
                "dept_code": "DEPT_WATER",
                "progress": 20,
                "support_count": 6,
                "assigned_email": "water.officer@nagarsetu.gov.in",
                "sla_hours": 48,
                "sla_deadline": now + timedelta(hours=36)
            },
            {
                "title": "Overflowing Public Dustbins and Garbage Accumulation",
                "description": "Municipal bins spilling onto the sidewalk. Stench spreading to residential colony, stray animals scattering plastic waste.",
                "type": IssueType.GARBAGE,
                "lat": 28.6100,
                "lng": 77.2000,
                "address": "Janpath Market South Gate, New Delhi",
                "confidence": 0.92,
                "severity": SeverityLevel.MODERATE,
                "priority": 56.0,
                "explanation": "Priority Score: 56.0/100 (MODERATE)\n• Public hygiene and pedestrian sidewalk obstruction.\n• Confirmed by 4 citizen reports.\nRecommended Action: Compact truck collection and disinfectant spray within 5 days.",
                "status": IssueStatus.RESOLUTION_SUBMITTED,
                "dept_code": "DEPT_SAN",
                "progress": 95,
                "support_count": 4,
                "assigned_email": "sanitation.officer@nagarsetu.gov.in",
                "sla_hours": 120,
                "sla_deadline": now + timedelta(hours=72),
                "resolution_notes": "Sanitation compactor cleared all accumulated waste, disinfected bin area with bleaching powder, and added supplementary dry-waste container.",
                "resolution_photo": "/uploads/original/sample_infra.jpg",
                "ai_comp": '{"comparison_verified": true, "repair_confidence": 0.94, "defect_cleared": true, "similarity_score": 0.72, "verdict": "REPAIR_LIKELY_AUTHENTIC", "ai_assessment_notes": "Scene verified. Garbage cleared and area disinfected."}'
            },
            {
                "title": "Dangling Live High-Voltage Cable near Community Park",
                "description": "Nangi bijli ki taar park ke gate par latak rahi hai. Children play here every evening. Immediate power disconnection required.",
                "type": IssueType.ELECTRICAL_WIRE,
                "lat": 28.6080,
                "lng": 77.2150,
                "address": "Lodi Garden Gate 3, New Delhi",
                "confidence": 0.97,
                "severity": SeverityLevel.CRITICAL,
                "priority": 98.0,
                "explanation": "Priority Score: 98.0/100 (CRITICAL)\n• Lethal electrocution risk to children and public in recreational zone.\n• 97% AI detection certainty.\nRecommended Action: Immediate emergency lineman dispatch and circuit shutdown within 24 hours.",
                "status": IssueStatus.ASSIGNED,
                "dept_code": "DEPT_ELEC",
                "progress": 25,
                "support_count": 12,
                "assigned_email": "electrical.officer@nagarsetu.gov.in",
                "sla_hours": 24,
                "sla_deadline": now + timedelta(hours=8)
            },
            {
                "title": "Severe Monsoon Waterlogging Underpass Blockage",
                "description": "ITO flyover underpass inundated with 2 feet of stagnant water blocking passenger cars and small vehicles.",
                "type": IssueType.WATERLOGGING,
                "lat": 28.6300,
                "lng": 77.2250,
                "address": "ITO Flyover Underpass, New Delhi",
                "confidence": 0.94,
                "severity": SeverityLevel.HIGH,
                "priority": 84.0,
                "explanation": "Priority Score: 84.0/100 (HIGH)\n• Traffic gridlock and engine stall risk.\n• Recurring monsoon flood hotspot.\nRecommended Action: High-capacity water pump deployment within 24 hours.",
                "status": IssueStatus.ACCEPTED,
                "dept_code": "DEPT_DRAIN",
                "progress": 40,
                "support_count": 9,
                "assigned_email": "drainage.officer@nagarsetu.gov.in",
                "sla_hours": 48,
                "sla_deadline": now + timedelta(hours=28)
            },
            {
                "title": "Broken Streetlight Array Creating Dark Zone",
                "description": "Three consecutive sodium vapor lights not functioning. Road completely dark causing safety risk for night commuters.",
                "type": IssueType.STREETLIGHT,
                "lat": 28.6050,
                "lng": 77.2150,
                "address": "Max Mueller Marg, Lodi Estate, New Delhi",
                "confidence": 0.89,
                "severity": SeverityLevel.MODERATE,
                "priority": 48.0,
                "explanation": "Priority Score: 48.0/100 (MODERATE)\n• Nighttime visibility reduction.\nRecommended Action: LED luminaire replacement within 5 days.",
                "status": IssueStatus.RESOLVED,
                "dept_code": "DEPT_ELEC",
                "progress": 100,
                "support_count": 3,
                "assigned_email": "electrical.officer@nagarsetu.gov.in",
                "sla_hours": 120,
                "sla_deadline": now - timedelta(hours=10),
                "resolved_at": now - timedelta(hours=6),
                "resolution_notes": "All 3 streetlight fixtures replaced with energy-efficient 90W LED lamps. Circuit load tested.",
                "resolution_photo": "/uploads/original/sample_infra.jpg",
                "citizen_feedback": "Streetlights are glowing bright now. Thank you NagarSetu team!"
            }
        ]

        for item in sample_issues:
            existing = db.query(Issue).filter(Issue.title == item["title"]).first()
            if not existing:
                iss = Issue(
                    title=item["title"],
                    description=item["description"],
                    issue_type=item["type"],
                    latitude=item["lat"],
                    longitude=item["lng"],
                    address=item["address"],
                    ai_confidence=item["confidence"],
                    severity=item["severity"],
                    priority_score=item["priority"],
                    priority_explanation=item["explanation"],
                    status=item["status"],
                    progress_percentage=item.get("progress", 0),
                    latest_update=f"Complaint tracked at status {item['status'].value}.",
                    support_count=item.get("support_count", 1),
                    reporter_id=main_citizen.id,
                    department_id=dept_map[item["dept_code"]].id,
                    assigned_officer_id=officer_map.get(item.get("assigned_email"), None).id if item.get("assigned_email") in officer_map else None,
                    assigned_at=now - timedelta(hours=12) if item.get("assigned_email") else None,
                    sla_hours=item.get("sla_hours", 48),
                    sla_deadline=item.get("sla_deadline", now + timedelta(hours=48)),
                    resolution_image_path=item.get("resolution_photo"),
                    resolution_notes=item.get("resolution_notes"),
                    resolution_ai_comparison=item.get("ai_comp"),
                    resolution_submitted_at=now - timedelta(hours=4) if item.get("resolution_notes") else None,
                    citizen_feedback=item.get("citizen_feedback"),
                    citizen_verified_at=now - timedelta(hours=5) if item.get("citizen_feedback") else None,
                    resolved_at=item.get("resolved_at")
                )
                db.add(iss)
                db.flush()

                # Add image placeholder
                db.add(IssueImage(
                    issue_id=iss.id,
                    original_image_path="/uploads/original/sample_infra.jpg",
                    annotated_image_path="/uploads/annotated/sample_infra_annotated.jpg",
                    bounding_box_json='[{"class": "' + item["type"].value + '", "confidence": ' + str(item["confidence"]) + '}]'
                ))

                # Add initial lifecycle history
                db.add(IssueStatusHistory(
                    issue_id=iss.id,
                    previous_status=None,
                    new_status=IssueStatus.SUBMITTED,
                    changed_by_user_id=main_citizen.id,
                    notes="Citizen registered complaint on NagarSetu.",
                    progress_percentage=0
                ))
                db.add(IssueStatusHistory(
                    issue_id=iss.id,
                    previous_status=IssueStatus.SUBMITTED,
                    new_status=item["status"],
                    changed_by_user_id=admin.id,
                    notes=f"Operational update: status transitioned to {item['status'].value}.",
                    progress_percentage=item.get("progress", 0)
                ))

        db.commit()
        print("[OK] Seeded NagarSetu Sample Civic Issues with SLA & verification records.")
        print("=" * 70)
        print("SEEDING COMPLETE: NagarSetu ready for operations.")
        print("=" * 70)

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
