import re
from datetime import datetime
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.response import Response
from app.models.survey import Survey
from app.models.user import User
from app.schemas.response import ResponseListItem
from app.schemas.survey import (
    SurveyCreate,
    SurveyListItem,
    SurveyResponse,
    SurveyUpdate,
)
from app.utils.security import get_current_admin

router = APIRouter(prefix="/surveys", tags=["surveys"])


def generate_slug(title: str) -> str:
    """Generate a URL-safe slug from the title."""
    slug = title.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    slug = slug.strip("-")
    return slug[:200] if slug else "survey"


async def get_unique_slug(db: AsyncSession, base_slug: str) -> str:
    """Ensure the slug is unique by appending a suffix if necessary."""
    slug = base_slug
    counter = 1

    while True:
        result = await db.execute(select(Survey).where(Survey.slug == slug))
        if result.scalar_one_or_none() is None:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


async def get_survey_for_admin(
    survey_id: UUID, db: AsyncSession, admin: User
) -> Survey:
    """Get a survey by ID, verifying ownership and not deleted."""
    result = await db.execute(
        select(Survey).where(
            Survey.id == survey_id,
            Survey.created_by == admin.id,
            Survey.deleted_at.is_(None),
        )
    )
    survey = result.scalar_one_or_none()

    if survey is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found",
        )

    return survey


@router.post("/", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
async def create_survey(
    survey_data: SurveyCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> SurveyResponse:
    """Create a new survey from JSON configuration."""
    base_slug = generate_slug(survey_data.title)
    slug = await get_unique_slug(db, base_slug)

    survey = Survey(
        slug=slug,
        title=survey_data.title,
        description=survey_data.description,
        config=survey_data.config,
        created_by=admin.id,
        opens_at=survey_data.opens_at,
        closes_at=survey_data.closes_at,
    )

    db.add(survey)
    await db.commit()
    await db.refresh(survey)

    return SurveyResponse.model_validate(survey)


@router.get("/", response_model=list[SurveyListItem])
async def list_surveys(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> list[SurveyListItem]:
    """List all surveys created by the current admin."""
    # Get surveys with response counts
    stmt = (
        select(
            Survey,
            func.count(Response.id).label("response_count"),
        )
        .outerjoin(Response, Survey.id == Response.survey_id)
        .where(Survey.created_by == admin.id, Survey.deleted_at.is_(None))
        .group_by(Survey.id)
        .order_by(Survey.created_at.desc())
    )

    result = await db.execute(stmt)
    rows = result.all()

    return [
        SurveyListItem(
            id=row.Survey.id,
            slug=row.Survey.slug,
            title=row.Survey.title,
            description=row.Survey.description,
            opens_at=row.Survey.opens_at,
            closes_at=row.Survey.closes_at,
            created_at=row.Survey.created_at,
            updated_at=row.Survey.updated_at,
            response_count=row.response_count,
        )
        for row in rows
    ]


@router.get("/{survey_id}", response_model=SurveyResponse)
async def get_survey(
    survey_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> SurveyResponse:
    """Get survey details by ID."""
    survey = await get_survey_for_admin(survey_id, db, admin)
    return SurveyResponse.model_validate(survey)


@router.patch("/{survey_id}", response_model=SurveyResponse)
async def update_survey(
    survey_id: UUID,
    survey_data: SurveyUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> SurveyResponse:
    """Update survey metadata."""
    survey = await get_survey_for_admin(survey_id, db, admin)

    update_data = survey_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(survey, field, value)

    await db.commit()
    await db.refresh(survey)

    return SurveyResponse.model_validate(survey)


@router.delete("/{survey_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_survey(
    survey_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> None:
    """Soft-delete a survey."""
    survey = await get_survey_for_admin(survey_id, db, admin)
    survey.deleted_at = datetime.utcnow()
    await db.commit()


@router.post("/{survey_id}/duplicate", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_survey(
    survey_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> SurveyResponse:
    """Duplicate an existing survey."""
    original = await get_survey_for_admin(survey_id, db, admin)

    base_slug = generate_slug(f"{original.title} copy")
    slug = await get_unique_slug(db, base_slug)

    duplicate = Survey(
        slug=slug,
        title=f"{original.title} (Copy)",
        description=original.description,
        config=original.config,
        created_by=admin.id,
        opens_at=None,
        closes_at=None,
    )

    db.add(duplicate)
    await db.commit()
    await db.refresh(duplicate)

    return SurveyResponse.model_validate(duplicate)


@router.get("/{survey_id}/responses", response_model=list[ResponseListItem])
async def list_survey_responses(
    survey_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> list[ResponseListItem]:
    """List all responses for a survey."""
    survey = await get_survey_for_admin(survey_id, db, admin)

    stmt = (
        select(Response, User.github_username)
        .join(User, Response.user_id == User.id)
        .where(Response.survey_id == survey.id)
        .order_by(Response.created_at.desc())
    )

    result = await db.execute(stmt)
    rows = result.all()

    return [
        ResponseListItem(
            id=row.Response.id,
            user_id=row.Response.user_id,
            github_username=row.github_username,
            answers=row.Response.answers,
            is_draft=row.Response.is_draft,
            submitted_at=row.Response.submitted_at,
            created_at=row.Response.created_at,
            updated_at=row.Response.updated_at,
        )
        for row in rows
    ]


@router.get("/{survey_id}/export")
async def export_survey_responses(
    survey_id: UUID,
    format: str = Query("json", regex="^(json|csv)$"),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> StreamingResponse:
    """Export survey responses as CSV or JSON."""
    survey = await get_survey_for_admin(survey_id, db, admin)

    stmt = (
        select(Response, User.github_username)
        .join(User, Response.user_id == User.id)
        .where(Response.survey_id == survey.id)
        .order_by(Response.created_at)
    )

    result = await db.execute(stmt)
    rows = result.all()

    if format == "json":
        import json

        data = [
            {
                "id": str(row.Response.id),
                "user_id": str(row.Response.user_id),
                "github_username": row.github_username,
                "answers": row.Response.answers,
                "is_draft": row.Response.is_draft,
                "submitted_at": row.Response.submitted_at.isoformat() if row.Response.submitted_at else None,
                "created_at": row.Response.created_at.isoformat(),
                "updated_at": row.Response.updated_at.isoformat(),
            }
            for row in rows
        ]

        content = json.dumps(data, indent=2)
        return StreamingResponse(
            iter([content]),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={survey.slug}-responses.json"},
        )

    else:  # CSV
        import csv
        import io

        # Collect all unique question IDs from answers
        all_question_ids: set[str] = set()
        for row in rows:
            all_question_ids.update(row.Response.answers.keys())

        sorted_question_ids = sorted(all_question_ids)

        output = io.StringIO()
        writer = csv.writer(output)

        # Header row
        header = ["id", "user_id", "github_username", "is_draft", "submitted_at", "created_at"] + sorted_question_ids
        writer.writerow(header)

        # Data rows
        for row in rows:
            csv_row = [
                str(row.Response.id),
                str(row.Response.user_id),
                row.github_username,
                str(row.Response.is_draft),
                row.Response.submitted_at.isoformat() if row.Response.submitted_at else "",
                row.Response.created_at.isoformat(),
            ]
            for qid in sorted_question_ids:
                answer = row.Response.answers.get(qid, "")
                # Handle complex answer types (lists, dicts)
                if isinstance(answer, (list, dict)):
                    import json
                    csv_row.append(json.dumps(answer))
                else:
                    csv_row.append(str(answer) if answer else "")
            writer.writerow(csv_row)

        content = output.getvalue()
        return StreamingResponse(
            iter([content]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={survey.slug}-responses.csv"},
        )
