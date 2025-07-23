from fastapi import APIRouter

from .v1 import auth, projects, tasks, users, stats, vector

router = APIRouter(
    prefix=''
)

router.include_router(auth.router)
router.include_router(projects.router)
router.include_router(tasks.router)
router.include_router(users.router)
router.include_router(stats.router)
router.include_router(vector.router)