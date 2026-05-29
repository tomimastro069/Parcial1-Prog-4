from enum import Enum

class PaymentStatus(str, Enum):
    success = "success"
    failure = "failure"
    pending = "pending"