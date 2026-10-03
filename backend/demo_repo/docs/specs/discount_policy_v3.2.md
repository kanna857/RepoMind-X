# Acme Commerce — Discount Policy Specification v3.2

## Section 4.1: Tier Qualification Rules
Customers qualify for tier-based order discounts when the order subtotal meets or exceeds the specified threshold:

$$\text{Subtotal} \ge \text{Threshold}$$

- **SILVER Tier**: Threshold $100.00, Rate: 15% (or 10% standard)
- **GOLD Tier**: Threshold $100.00, Rate: 10%
- **BRONZE Tier**: Threshold $25.00, Rate: 5%

### Invariant:
When subtotal is exactly $100.00, the silver tier discount MUST be applied. Strict inequality (`subtotal > threshold`) is a contract violation.
