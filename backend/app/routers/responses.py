from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.response import Response
from app.models.survey import Survey
from app.models.user import User
from app.schemas.response import MyResponseResponse, ResponseCreate, ResponseResponse
from app.schemas.survey import SurveyPublicResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/surveys", tags=["responses"])


async def get_survey_by_slug(db: AsyncSession, slug: str) -> Survey:
    """Get a survey by slug, verifying it exists and is not deleted."""
    result = await db.execute(
        select(Survey).where(Survey.slug == slug, Survey.deleted_at.is_(None))
    )
    survey = result.scalar_one_or_none()

    if survey is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found",
        )

    return survey


def is_survey_open(survey: Survey) -> bool:
    """Check if a survey is currently accepting responses."""
    now = datetime.utcnow()

    if survey.opens_at and now < survey.opens_at:
        return False

    if survey.closes_at and now > survey.closes_at:
        return False

    return True


@router.get("/{slug}/public", response_model=SurveyPublicResponse)
async def get_public_survey(
    slug: str,
    db: AsyncSession = Depends(get_db),
) -> SurveyPublicResponse:
    """Get survey for rendering (public access, no auth required)."""
    survey = await get_survey_by_slug(db, slug)

    return SurveyPublicResponse(
        slug=survey.slug,
        title=survey.title,
        description=survey.description,
        config=survey.config,
        opens_at=survey.opens_at,
        closes_at=survey.closes_at,
        is_open=is_survey_open(survey),
    )


@router.post("/{slug}/respond", response_model=ResponseResponse, status_code=status.HTTP_200_OK)
async def submit_response(
    slug: str,
    response_data: ResponseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResponseResponse:
    """
    Submit or update a survey response (upsert).

    - If is_draft=True: saves as draft (auto-save)
    - If is_draft=False: marks as submitted (sets submitted_at)
    """
    survey = await get_survey_by_slug(db, slug)

    # Check if survey is open for responses
    if not is_survey_open(survey):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Survey is not currently accepting responses",
        )

    # Check for existing response
    result = await db.execute(
        select(Response).where(
            Response.survey_id == survey.id,
            Response.user_id == current_user.id,
        )
    )
    response = result.scalar_one_or_none()

    if response is None:
        # Create new response
        response = Response(
            survey_id=survey.id,
            user_id=current_user.id,
            answers=response_data.answers,
            is_draft=response_data.is_draft,
        )
        if not response_data.is_draft:
            response.submitted_at = datetime.utcnow()
        db.add(response)
    else:
        # Update existing response
        # Don't allow updates to already submitted responses
        if not response.is_draft:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot modify an already submitted response",
            )

        response.answers = response_data.answers
        response.is_draft = response_data.is_draft
        if not response_data.is_draft:
            response.submitted_at = datetime.utcnow()

    await db.commit()
    await db.refresh(response)

    return ResponseResponse.model_validate(response)


@router.get("/{slug}/my-response", response_model=MyResponseResponse)
async def get_my_response(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MyResponseResponse:
    """Get the current user's response to a survey."""
    survey = await get_survey_by_slug(db, slug)

    result = await db.execute(
        select(Response).where(
            Response.survey_id == survey.id,
            Response.user_id == current_user.id,
        )
    )
    response = result.scalar_one_or_none()

    if response is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No response found for this survey",
        )

    return MyResponseResponse.model_validate(response)
