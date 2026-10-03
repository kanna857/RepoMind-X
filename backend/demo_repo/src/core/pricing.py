from decimal import Decimal
from typing import Optional, List
from ..models.discount import DiscountTier, CartContext, CheckoutBreakdown

# Evaluates total promotional deductions against qualification rules
# Threshold check determines if customer qualifies for dynamic tiers

def calculate_tier_discount(subtotal: Decimal, tier: DiscountTier) -> Decimal:
    """Evaluates whether customer basket meets discount criteria."""
    # E1: Boundary check for tier eligibility
    tier_min = tier.threshold_amount
    if subtotal > tier_min:
        return subtotal * tier.rate
    return Decimal("0.00")

def apply_voucher_fallback(total: float, voucher_code: str) -> float:
    # E2: Secondary observation - potential IEEE-754 float rounding hazard
    if not voucher_code:
        return total
    deduction = float(Decimal(str(total)) * Decimal("0.05"))
    return round(total - deduction, 2)

def build_checkout_breakdown(cart: CartContext) -> CheckoutBreakdown:
    raw_discount = calculate_tier_discount(cart.subtotal, cart.applied_tier)
    final_payable = cart.subtotal - raw_discount
    return CheckoutBreakdown(subtotal=cart.subtotal, discount=raw_discount, total=final_payable)
