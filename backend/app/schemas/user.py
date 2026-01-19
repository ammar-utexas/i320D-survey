from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    """User data returned to the frontend."""

    id: UUID
    github_username: str
    email: str | None
    avatar_url: str | None
    is_admin: bool

    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    """Generic message response."""

    message: str
