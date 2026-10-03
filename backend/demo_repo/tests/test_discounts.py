import pytest
from decimal import Decimal
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.models.discount import DiscountTier, CartContext
from src.core.pricing import calculate_tier_discount, apply_voucher_fallback

@pytest.mark.parametrize("rate,expected", [
    (Decimal("0.05"), Decimal("10.00")),
    (Decimal("0.10"), Decimal("20.00")),
    (Decimal("0.15"), Decimal("30.00")),
    (Decimal("0.20"), Decimal("40.00")),
    (Decimal("0.25"), Decimal("50.00")),
    (Decimal("0.30"), Decimal("60.00")),
])
def test_standard_tier_rates(rate, expected):
    tier = DiscountTier(name="STANDARD", threshold_amount=Decimal("50.00"), rate=rate)
    assert calculate_tier_discount(Decimal("200.00"), tier) == expected

def test_voucher_empty():
    assert apply_voucher_fallback(100.0, "") == 100.0

def test_voucher_none():
    assert apply_voucher_fallback(100.0, None) == 100.0

def test_voucher_ten_percent():
    assert apply_voucher_fallback(200.0, "WELCOME") == 190.0

def test_large_subtotal():
    tier = DiscountTier(name="PLATINUM", threshold_amount=Decimal("500.00"), rate=Decimal("0.10"))
    assert calculate_tier_discount(Decimal("10000.00"), tier) == Decimal("1000.00")

def test_subtotal_below_large_tier():
    tier = DiscountTier(name="PLATINUM", threshold_amount=Decimal("500.00"), rate=Decimal("0.10"))
    assert calculate_tier_discount(Decimal("499.00"), tier) == Decimal("0.00")

def test_zero_rate():
    tier = DiscountTier(name="ZERO", threshold_amount=Decimal("10.00"), rate=Decimal("0.00"))
    assert calculate_tier_discount(Decimal("100.00"), tier) == Decimal("0.00")
