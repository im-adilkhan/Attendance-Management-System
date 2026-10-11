from pydantic import BaseModel, EmailStr, Field

class RegisterInput(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: str = "teacher"

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class UserOutput(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
