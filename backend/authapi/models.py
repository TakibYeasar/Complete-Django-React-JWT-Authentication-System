from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework_simplejwt.tokens import RefreshToken

AUTH_PROVIDERS = {'email': 'email', 'google': 'google',
                  'github': 'github'}

class CustomManager(BaseUserManager):
    def email_validator(self, email):
        try:
            validate_email(email)
        except ValidationError:
            raise ValueError(_("please enter a valid email address"))
        
        
    def create_user(self, email, username, password=None, **extra_fields):
        """
        Creates and saves a User with the given email, date of
        birth and password.
        """
        if email:
            email = self.normalize_email(email)
            self.email_validator(email)
        else:
            raise ValueError(
                _("Base User Account: An email address is required"))
            
        user = self.model(
            email=self.normalize_email(email),
            username=username,
            **extra_fields,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Creates and saves a superuser with the given email, date of
        birth and password.
        """
        user = self.create_user(
            email=email,
            username=email,
            password=password,
            **extra_fields,
        )
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class CustomUser(AbstractBaseUser):
    id = models.BigAutoField(primary_key=True, editable=False)
    email = models.EmailField(
        verbose_name="Email address", max_length=255, unique=True)
    username = models.CharField(
        verbose_name="Username", max_length=200, unique=True, blank=True)
    first_name = models.CharField(
        verbose_name="First Name", max_length=200, blank=True, null=True)
    last_name = models.CharField(
        verbose_name="Last Name", max_length=200, blank=True, null=True)
    password = models.CharField(verbose_name="Password", max_length=255)
    confirm_password = models.CharField(
        verbose_name="Confirm Password", max_length=255)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    last_logind = models.DateTimeField(
        auto_now_add=True, null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    auth_provider = models.CharField(
        max_length=50, blank=False, null=False, default=AUTH_PROVIDERS.get('email'))

    objects = CustomManager()

    USERNAME_FIELD = "email"
    
    def tokens(self):
        refresh = RefreshToken.for_user(self)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }


    def __str__(self):
        return self.email

    @property
    def get_full_name(self):
        return f"{self.first_name.title()} {self.last_name.title()}"
    
    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return self.is_admin

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True


class OneTimePassword(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)

    def __str__(self):
        return f"{self.user.username} - otp code"
