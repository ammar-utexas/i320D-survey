from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check() -> dict[str, str]:
    """
    T037: Health check endpoint for monitoring and deployment verification.
    Returns a simple status indicating the service is running.
    """
    return {"status": "healthy"}
