import ast
import difflib
from typing import Optional, Any
from dataclasses import dataclass

@dataclass
class AstEvidenceItem:
    line_number: int
    col_offset: int
    end_line: int
    end_col_offset: int
    node_type: str
    op_type: str
    code_snippet: str
    ast_repr: str
    invariant_status: str
    confidence: float
    description: str

def parse_source_ast(source_code: str) -> ast.AST:
    """Parses source code into Python AST."""
    return ast.parse(source_code)

def count_ast_nodes(source_code: str) -> int:
    """Counts total AST nodes in source code."""
    try:
        tree = ast.parse(source_code)
        return sum(1 for _ in ast.walk(tree))
    except Exception:
        return 0

def inspect_pricing_ast(source_code: str) -> list[AstEvidenceItem]:
    """
    Analyzes pricing.py AST to locate boundary comparison logic
    and extract exact line numbers and operator semantics.
    """
    findings: list[AstEvidenceItem] = []
    lines = source_code.splitlines()
    
    try:
        tree = ast.parse(source_code)
    except SyntaxError as e:
        return findings

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == "calculate_tier_discount":
            for child in ast.walk(node):
                if isinstance(child, ast.Compare):
                    left_id = child.left.id if isinstance(child.left, ast.Name) else ""
                    for op, comparator in zip(child.ops, child.comparators):
                        comp_id = comparator.id if isinstance(comparator, ast.Name) else ""
                        op_name = op.__class__.__name__
                        
                        line_idx = child.lineno - 1
                        snippet = lines[line_idx].strip() if 0 <= line_idx < len(lines) else ""
                        
                        is_bug = (left_id == "subtotal" and comp_id == "tier_min" and isinstance(op, ast.Gt))
                        
                        findings.append(AstEvidenceItem(
                            line_number=child.lineno,
                            col_offset=child.col_offset,
                            end_line=child.end_lineno or child.lineno,
                            end_col_offset=child.end_col_offset or child.col_offset + 10,
                            node_type="Compare",
                            op_type="Gt" if isinstance(op, ast.Gt) else ("GtE" if isinstance(op, ast.GtE) else op_name),
                            code_snippet=snippet,
                            ast_repr=f"Compare(left={left_id}, ops=[{op_name}], comparators=[{comp_id}])",
                            invariant_status="FAIL_STRICT_INEQUALITY" if is_bug else "PASS_INCLUSIVE_INEQUALITY",
                            confidence=0.98 if is_bug else 0.95,
                            description=(
                                "Comparison operator is > instead of >=. When cart subtotal equals exactly "
                                "tier.min_threshold, the condition evaluates False, bypassing discount qualification."
                                if is_bug else
                                "Inclusive comparison >= correctly satisfies tier boundary qualification."
                            )
                        ))
                        
    return findings

def synthesize_boundary_patch(original_code: str, old_pattern: str = "if subtotal > tier_min:", new_pattern: str = "if subtotal >= tier_min:") -> str:
    """Synthesizes minimal patch replacing strict inequality with inclusive inequality."""
    if old_pattern in original_code:
        return original_code.replace(old_pattern, new_pattern, 1)
    return original_code

def generate_unified_diff(original: str, patched: str, from_path: str = "a/pricing.py", to_path: str = "b/pricing.py") -> str:
    """Generates standard unified diff representation."""
    diff_lines = difflib.unified_diff(
        original.splitlines(keepends=True),
        patched.splitlines(keepends=True),
        fromfile=from_path,
        tofile=to_path,
        lineterm=""
    )
    return "".join(diff_lines)
