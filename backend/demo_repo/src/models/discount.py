from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

@dataclass
class DiscountTier:
    name: str
    threshold_amount: Decimal
    rate: Decimal

@dataclass
class CartContext:
    subtotal: Decimal
    applied_tier: DiscountTier
    voucher_code: Optional[str] = None

@dataclass
class CheckoutBreakdown:
    subtotal: Decimal
    discount: Decimal
    total: Decimal
