from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Response(Base):
    """Response model representing a user's answers to a survey."""

    __tablename__ = "responses"
    __table_args__ = (
        UniqueConstraint("survey_id", "user_id", name="uq_response_survey_user"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    survey_id = Column(
        UUID(as_uuid=True),
        ForeignKey("surveys.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    answers = Column(JSONB, nullable=False, default=dict)
    is_draft = Column(Boolean, nullable=False, default=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    survey = relationship("Survey", back_populates="responses")
    user = relationship("User", back_populates="responses")

    def __repr__(self) -> str:
        return f"<Response survey={self.survey_id} user={self.user_id}>"
