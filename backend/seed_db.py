from app.core.database import SessionLocal, engine, Base
from app.models.map import RoadSegment
import random

def seed_traffic():
    db = SessionLocal()
    try:
        # Clear existing
        db.query(RoadSegment).delete()
        
        # Mumbai-like coordinates
        base_lat, base_lng = 19.0760, 72.8777
        
        segments = []
        for i in range(20):
            offset_lat = random.uniform(-0.05, 0.05)
            offset_lng = random.uniform(-0.05, 0.05)
            
            s = RoadSegment(
                name=f"Road Segment {i+1}",
                start_lat=base_lat + offset_lat,
                start_lng=base_lng + offset_lng,
                end_lat=base_lat + offset_lat + random.uniform(-0.01, 0.01),
                end_lng=base_lng + offset_lng + random.uniform(-0.01, 0.01),
                status=random.choice(["normal", "congested", "closed"]),
                congestion_score=random.uniform(0, 1)
            )
            segments.append(s)
            
        db.add_all(segments)
        db.commit()
        print(f"Successfully seeded {len(segments)} road segments.")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_traffic()
