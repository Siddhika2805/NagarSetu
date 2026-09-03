from fastapi import APIRouter
from app.api.v1.endpoints import auth, departments, issues, analytics

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(departments.router, prefix="/departments", tags=["Departments"])
api_router.include_router(issues.router, prefix="/issues", tags=["Issues"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
