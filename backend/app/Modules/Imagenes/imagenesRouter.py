from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from pydantic import BaseModel
import cloudinary
import cloudinary.uploader
from app.Core.cloudinary_config import configurar_cloudinary
from app.Core.Security.deps import require_role
from app.Modules.Usuarios.usuario import UserRole

configurar_cloudinary()

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_MB = 5


@router.post("/upload", dependencies=[Depends(require_role([UserRole.ADMIN, UserRole.STOCK]))])
async def upload_imagen(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no permitido. Usá JPG, PNG o WEBP."
        )

    contenido = await file.read()

    if len(contenido) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El archivo supera el límite de {MAX_SIZE_MB}MB."
        )

    try:
        resultado = cloudinary.uploader.upload(
            contenido,
            folder="food_store/productos",
            resource_type="image",
            transformation=[{"width": 800, "crop": "limit", "quality": "auto"}]
        )
        return {
            "url": resultado["secure_url"],
            "public_id": resultado["public_id"]
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error al subir imagen a Cloudinary: {type(e).__name__}: {str(e)}"
        )


class DeleteImagenBody(BaseModel):
    public_id: str


@router.delete("/delete", dependencies=[Depends(require_role([UserRole.ADMIN, UserRole.STOCK]))])
def delete_imagen(body: DeleteImagenBody):
    try:
        resultado = cloudinary.uploader.destroy(body.public_id, resource_type="image")
        if resultado.get("result") != "ok":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No se pudo eliminar la imagen: {resultado.get('result')}"
            )
        return {"message": "Imagen eliminada"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error al eliminar imagen de Cloudinary: {str(e)}"
        )
