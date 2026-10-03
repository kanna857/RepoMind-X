import pytest
from decimal import Decimal
import sys
import os

# Ensure demo_repo root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.models.discount import DiscountTier, CartContext
from src.core.pricing import calculate_tier_discount, apply_voucher_fallback, build_checkout_breakdown

def test_subtotal_zero():
    tier = DiscountTier(name="SILVER", threshold_amount=Decimal("100.00"), rate=Decimal("0.15"))
    assert calculate_tier_discount(Decimal("0.00"), tier) == Decimal("0.00")

def test_subtotal_negative_guard():
    tier = DiscountTier(name="SILVER", threshold_amount=Decimal("100.00"), rate=Decimal("0.15"))
    assert calculate_tier_discount(Decimal("-10.00"), tier) == Decimal("0.00")

def test_tiered_rate_five_percent():
    tier = DiscountTier(name="BRONZE", threshold_amount=Decimal("25.00"), rate=Decimal("0.05"))
    assert calculate_tier_discount(Decimal("50.00"), tier) == Decimal("2.50")

def test_tiered_rate_ten_percent():
    tier = DiscountTier(name="GOLD", threshold_amount=Decimal("100.00"), rate=Decimal("0.10"))
    assert calculate_tier_discount(Decimal("150.00"), tier) == Decimal("15.00")

def test_exact_threshold():
    """Validates exact threshold boundary eligibility ($100.00 should qualify for tier)."""
    tier = DiscountTier(name="SILVER", threshold_amount=Decimal("100.00"), rate=Decimal("0.15"))
    result = calculate_tier_discount(Decimal("100.00"), tier)
    assert result == Decimal("15.00"), f"Expected Decimal('15.00'), got Decimal('{result}')"

def test_boundary_plus_one_cent():
    tier = DiscountTier(name="SILVER", threshold_amount=Decimal("100.00"), rate=Decimal("0.15"))
    assert calculate_tier_discount(Decimal("100.01"), tier) == Decimal("15.0015")

def test_boundary_minus_one_cent():
    tier = DiscountTier(name="SILVER", threshold_amount=Decimal("100.00"), rate=Decimal("0.15"))
    assert calculate_tier_discount(Decimal("99.99"), tier) == Decimal("0.00")

def test_coupon_stacking_cap():
    cart = CartContext(
        subtotal=Decimal("200.00"),
        applied_tier=DiscountTier(name="VIP", threshold_amount=Decimal("100.00"), rate=Decimal("0.20")),
        voucher_code="PROMO5"
    )
    breakdown = build_checkout_breakdown(cart)
    assert breakdown.discount == Decimal("40.00")
    assert breakdown.total == Decimal("160.00")
