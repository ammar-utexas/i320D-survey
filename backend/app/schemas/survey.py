from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SurveyBase(BaseModel):
    """Base survey fields."""

    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None


class SurveyCreate(SurveyBase):
    """Schema for creating a new survey."""

    config: dict = Field(..., description="Full survey JSON configuration")
    opens_at: datetime | None = None
    closes_at: datetime | None = None


class SurveyUpdate(BaseModel):
    """Schema for updating survey metadata."""

    title: str | None = Field(None, min_length=1, max_length=500)
    description: str | None = None
    opens_at: datetime | None = None
    closes_at: datetime | None = None


class SurveyResponse(SurveyBase):
    """Schema for survey data returned to admin."""

    id: UUID
    slug: str
    config: dict
    created_by: UUID
    opens_at: datetime | None
    closes_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SurveyListItem(BaseModel):
    """Schema for survey list item (without full config)."""

    id: UUID
    slug: str
    title: str
    description: str | None
    opens_at: datetime | None
    closes_at: datetime | None
    created_at: datetime
    updated_at: datetime
    response_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class SurveyPublicResponse(BaseModel):
    """Schema for public survey access (respondents)."""

    slug: str
    title: str
    description: str | None
    config: dict
    opens_at: datetime | None
    closes_at: datetime | None
    is_open: bool = Field(..., description="Whether the survey is currently accepting responses")

    model_config = ConfigDict(from_attributes=True)
