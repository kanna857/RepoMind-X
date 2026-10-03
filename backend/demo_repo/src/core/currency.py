from decimal import Decimal, ROUND_HALF_UP

RATES = {
    "USD": Decimal("1.00"),
    "EUR": Decimal("0.92"),
    "GBP": Decimal("0.79"),
}

def convert_currency(amount: Decimal, from_curr: str, to_curr: str) -> Decimal:
    """Converts amounts between base supported currencies."""
    if from_curr == to_curr:
        return amount
    usd_val = amount / RATES[from_curr]
    target_val = usd_val * RATES[to_curr]
    return target_val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
