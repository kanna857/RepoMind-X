from decimal import Decimal, ROUND_HALF_UP

TAX_RATES = {
    "CA": Decimal("0.0825"),
    "NY": Decimal("0.08875"),
    "TX": Decimal("0.0625"),
}

def calculate_sales_tax(subtotal: Decimal, state: str) -> Decimal:
    """Calculates applicable regional sales tax."""
    rate = TAX_RATES.get(state.upper(), Decimal("0.00"))
    tax = subtotal * rate
    return tax.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
