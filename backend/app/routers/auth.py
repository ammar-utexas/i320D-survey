from datetime import datetime
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.user import MessageResponse, UserResponse
from app.services.github import (
    exchange_code_for_token,
    get_authorization_url,
    get_github_user,
)
from app.utils.security import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory state storage (for simplicity; use Redis in production)
_oauth_states: set[str] = set()


@router.get("/github")
async def initiate_github_oauth() -> RedirectResponse:
    """
    T022, T023: Initiate GitHub OAuth flow.
    Redirects user to GitHub authorization page with state parameter.
    """
    auth_url, state = get_authorization_url()
    _oauth_states.add(state)
    return RedirectResponse(url=auth_url, status_code=302)


@router.get("/github/callback")
async def github_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    """
    T024-T028: Handle GitHub OAuth callback.
    Validates state, exchanges code for token, creates/updates user,
    sets JWT cookie, and redirects to frontend.
    """
    # Handle OAuth errors from GitHub
    if error:
        params = urlencode({"error": "oauth_failed", "reason": error})
        return RedirectResponse(url=f"{settings.FRONTEND_URL}?{params}", status_code=302)

    # Validate state parameter
    if not state or state not in _oauth_states:
        params = urlencode({"error": "oauth_failed", "reason": "invalid_state"})
        return RedirectResponse(url=f"{settings.FRONTEND_URL}?{params}", status_code=302)

    _oauth_states.discard(state)

    # Validate code parameter
    if not code:
        params = urlencode({"error": "oauth_failed", "reason": "missing_code"})
        return RedirectResponse(url=f"{settings.FRONTEND_URL}?{params}", status_code=302)

    # Exchange code for access token
    access_token = await exchange_code_for_token(code)
    if not access_token:
        params = urlencode({"error": "oauth_failed", "reason": "token_exchange_failed"})
        return RedirectResponse(url=f"{settings.FRONTEND_URL}?{params}", status_code=302)

    # Fetch user profile from GitHub
    github_user = await get_github_user(access_token)
    if not github_user:
        params = urlencode({"error": "oauth_failed", "reason": "user_fetch_failed"})
        return RedirectResponse(url=f"{settings.FRONTEND_URL}?{params}", status_code=302)

    # Find or create user
    result = await db.execute(
        select(User).where(User.github_id == github_user["id"])
    )
    user = result.scalar_one_or_none()

    if user is None:
        # T025: Create new user
        user = User(
            github_id=github_user["id"],
            github_username=github_user["login"],
            email=github_user.get("email"),
            avatar_url=github_user.get("avatar_url"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # T033: Update returning user (moved here for consolidation)
        user.github_username = github_user["login"]
        user.email = github_user.get("email")
        user.avatar_url = github_user.get("avatar_url")
        user.last_login_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)

    # T026: Create JWT token and set cookie
    token = create_access_token(user.id)

    # T027: Redirect to frontend with cookie
    response = RedirectResponse(url=settings.FRONTEND_URL, status_code=302)
    response.set_cookie(
        key=settings.JWT_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,  # Set to False for local development if not using HTTPS
        samesite="lax",
        max_age=settings.JWT_EXPIRY_HOURS * 3600,
    )

    return response


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    T030, T031: Return the current authenticated user's profile.
    Requires valid JWT cookie.
    """
    return UserResponse.model_validate(current_user)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    """
    T034, T035, T036: Logout the current user by clearing the session cookie.
    """
    response.set_cookie(
        key=settings.JWT_COOKIE_NAME,
        value="",
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=0,
    )
    return MessageResponse(message="Successfully logged out")
