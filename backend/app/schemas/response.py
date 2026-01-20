from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ResponseCreate(BaseModel):
    """Schema for creating/updating a survey response."""

    answers: dict = Field(default_factory=dict, description="Answer data keyed by question_id")
    is_draft: bool = Field(True, description="True for auto-save, False for final submission")


class ResponseResponse(BaseModel):
    """Schema for response data returned to the user."""

    id: UUID
    survey_id: UUID
    user_id: UUID
    answers: dict
    is_draft: bool
    submitted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResponseListItem(BaseModel):
    """Schema for response list item (admin view)."""

    id: UUID
    user_id: UUID
    github_username: str
    answers: dict
    is_draft: bool
    submitted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MyResponseResponse(BaseModel):
    """Schema for user's own response to a survey."""

    answers: dict
    is_draft: bool
    submitted_at: datetime | None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
