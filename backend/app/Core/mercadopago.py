import mercadopago
from app.Core.Config.Config import settings

sdk = mercadopago.SDK(settings.TEST_ACCESS_TOKEN_MP)