# Technical Debt — Sistem Manajemen Perpustakaan

Dokumen ini mencatat hal-hal teknis yang perlu ditindaklanjuti (refactoring, keamanan, atau penyesuaian API) pada sistem backend maupun frontend.

---

## 1. Keamanan & Izin API (Permissions) - Manajemen Cabang (Libraries)

### Masalah
Saat ini, penambahan, pengubahan, dan penghapusan data **Cabang Perpustakaan (Library)** memiliki aturan hak akses berikut di frontend:
* **Tambah Cabang**: Hanya diperbolehkan untuk staff dengan role **Admin**.
* **Edit/Hapus Cabang**: Hanya diperbolehkan untuk staff dengan role **Admin** dan **Supervisor**. Staff dengan role **Librarian** tidak diperbolehkan melakukan modifikasi (edit/hapus).

Namun, di backend API Django, izin akses pada endpoint ini belum diatur secara spesifik per role. Seluruh staff (`librarian`, `supervisor`, `admin`) masih dapat menembak endpoint penulisan/modifikasi data tersebut secara langsung.

### Endpoint yang Harus Diperbarui
* `POST /api/v1/users/libraries/` (Hanya boleh diakses oleh: **Admin**)
* `PUT /api/v1/users/libraries/{id}/` (Hanya boleh diakses oleh: **Admin**, **Supervisor**)
* `PATCH /api/v1/users/libraries/{id}/` (Hanya boleh diakses oleh: **Admin**, **Supervisor**)
* `DELETE /api/v1/users/libraries/{id}/` (Hanya boleh diakses oleh: **Admin**, **Supervisor**)

### Rekomendasi Solusi (Backend Django)
Buat permission classes berikut di Django REST Framework (DRF):

```python
# apps/users/permissions.py
from rest_framework import permissions

class IsAdminStaff(permissions.BasePermission):
    """
    Hanya mengizinkan akses bagi staff dengan role admin.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, "staff_profile")
            and request.user.staff_profile
            and request.user.staff_profile.role == "admin"
        )

class IsAdminOrSupervisorStaff(permissions.BasePermission):
    """
    Mengizinkan akses bagi staff dengan role admin atau supervisor.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, "staff_profile")
            and request.user.staff_profile
            and request.user.staff_profile.role in ["admin", "supervisor"]
        )
```

Terapkan permission classes ini pada views terkait di backend:
```python
# apps/users/views/library_views.py
from config.permissions import IsStaff
from apps.users.permissions import IsAdminStaff, IsAdminOrSupervisorStaff

class LibraryListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminStaff()]
        return [IsStaff()]  # GET bisa diakses semua staff

class LibraryDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAdminOrSupervisorStaff()]
        return [IsStaff()]  # GET bisa diakses semua staff
```
