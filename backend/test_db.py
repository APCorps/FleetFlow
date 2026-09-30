# Creates all SQLAlchemy tables defined in our models.
from database import engine, Base
import models

Base.metadata.create_all(bind=engine)

print("✅ Database tables created successfully!")