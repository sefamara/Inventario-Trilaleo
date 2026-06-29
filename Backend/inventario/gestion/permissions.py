import logging
from django.conf import settings
from rest_framework.permissions import BasePermission

logger = logging.getLogger(__name__)


class LanTokenPermission(BasePermission):
    """
    Requires Authorization: Bearer <LAN_ACCESS_TOKEN> for all write operations.
    Read-only requests (GET, HEAD, OPTIONS) are allowed without token when the
    token is not configured, to preserve backwards compatibility during setup.
    Write operations always require the token when one is configured.
    """

    def has_permission(self, request, view):
        token = getattr(settings, 'LAN_ACCESS_TOKEN', '')

        if not token:
            return True

        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return False

        provided = auth_header[len('Bearer '):]
        return provided == token
