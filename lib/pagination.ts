export type PaginationToken = number | "ellipsis";

// Windowed page list: 1 … 4 5 [6] 7 8 … 42 — never renders every page.
export function getPaginationRange(current: number, total: number, siblingCount = 1): PaginationToken[] {
  const totalNumbers = siblingCount * 2 + 5; // first, last, current, 2 ellipses
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: 3 + siblingCount * 2 }, (_, i) => i + 1);
    return [...leftRange, "ellipsis", total];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = Array.from({ length: 3 + siblingCount * 2 }, (_, i) => total - (3 + siblingCount * 2) + i + 1);
    return [1, "ellipsis", ...rightRange];
  }

  const middleRange = Array.from({ length: rightSibling - leftSibling + 1 }, (_, i) => leftSibling + i);
  return [1, "ellipsis", ...middleRange, "ellipsis", total];
}
