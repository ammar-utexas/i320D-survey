import secrets
from typing import Any

import httpx

from app.config import settings

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"


def get_authorization_url(state: str | None = None) -> tuple[str, str]:
    """
    Generate the GitHub OAuth authorization URL.
    Returns tuple of (authorization_url, state).
    """
    if state is None:
        state = secrets.token_urlsafe(32)

    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_CALLBACK_URL,
        "scope": "read:user user:email",
        "state": state,
    }
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    url = f"{GITHUB_AUTHORIZE_URL}?{query_string}"
    return url, state


async def exchange_code_for_token(code: str) -> str | None:
    """
    Exchange the authorization code for an access token.
    Returns the access token or None if exchange fails.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GITHUB_TOKEN_URL,
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_CALLBACK_URL,
            },
            headers={"Accept": "application/json"},
        )

        if response.status_code != 200:
            return None

        data = response.json()
        return data.get("access_token")


async def get_github_user(access_token: str) -> dict[str, Any] | None:
    """
    Fetch the user profile from GitHub API.
    Returns user data dict or None if request fails.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            GITHUB_USER_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
        )

        if response.status_code != 200:
            return None

        return response.json()
