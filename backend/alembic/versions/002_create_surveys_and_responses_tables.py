"""create surveys and responses tables

Revision ID: 002
Revises: 001
Create Date: 2026-01-19

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: str | None = "001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Create surveys table
    op.create_table(
        "surveys",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("config", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_by", sa.UUID(), nullable=False),
        sa.Column("opens_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("closes_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_surveys_slug", "surveys", ["slug"], unique=True)
    op.create_index("ix_surveys_created_by", "surveys", ["created_by"], unique=False)
    op.create_index("ix_surveys_deleted_at", "surveys", ["deleted_at"], unique=False)

    # Create responses table
    op.create_table(
        "responses",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("survey_id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column(
            "answers",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default="{}",
        ),
        sa.Column("is_draft", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["survey_id"], ["surveys.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("survey_id", "user_id", name="uq_response_survey_user"),
    )
    op.create_index("ix_responses_survey_id", "responses", ["survey_id"], unique=False)
    op.create_index("ix_responses_user_id", "responses", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_responses_user_id", table_name="responses")
    op.drop_index("ix_responses_survey_id", table_name="responses")
    op.drop_table("responses")

    op.drop_index("ix_surveys_deleted_at", table_name="surveys")
    op.drop_index("ix_surveys_created_by", table_name="surveys")
    op.drop_index("ix_surveys_slug", table_name="surveys")
    op.drop_table("surveys")
