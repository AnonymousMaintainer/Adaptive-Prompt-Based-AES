from typing import List

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from ...core import database, security
from ...models import task_model
from ...schemas import task_schema

router = APIRouter(
    prefix='/tasks',
    tags=['tasks']
)

@router.get('/', response_model=List[task_schema.TaskRead])
def get_tasks(
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Get all tasks.
    """
    statement = select(task_model.Task)
    tasks = session.exec(statement).all()
    return tasks

@router.post('/', response_model=task_schema.TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    task: task_schema.TaskCreate,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Create a new task.
    """
    # Create a new Task instance from the request data
    db_task = task_model.Task(
        course_name=task.course_name,
        course_code=task.course_code,
        year=task.year,
        rubrics=task.rubrics,
        example_evaluation=task.example_evaluation,
        student_instruction=task.student_instruction
    )
    
    # Add and commit to database
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    
    return db_task

@router.get('/{task_id}', response_model=task_schema.TaskRead)
def get_task(
    task_id: int,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Get a specific task by ID.
    """
    task = session.get(task_model.Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    return task

@router.put('/{task_id}', response_model=task_schema.TaskRead)
def update_task(
    task_id: int,
    task_update: task_schema.TaskUpdate,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Update an existing task.
    """
    # Get the existing task
    db_task = session.get(task_model.Task, task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    
    # Update only the fields that are provided
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    # Commit changes
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    
    return db_task

@router.delete('/{task_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Delete a task.
    """
    # Get the task
    db_task = session.get(task_model.Task, task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    
    # Delete the task
    session.delete(db_task)
    session.commit()
    
    return None 