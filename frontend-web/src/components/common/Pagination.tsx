import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

interface PaginationProps {
    page: number;
    pageCount: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizeOptions?: number[];
}

/**
 * Compact, reusable table pagination footer with a page-size selector.
 * Renders nothing when there's nothing to paginate.
 */
const Pagination: React.FC<PaginationProps> = ({
    page,
    pageCount,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100],
}) => {
    if (totalItems === 0) return null;

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalItems);

    // Build a compact list of page numbers with ellipses for long lists.
    const visiblePages = (): (number | 'ellipsis')[] => {
        if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
        const pages: (number | 'ellipsis')[] = [1];
        const left = Math.max(2, page - 1);
        const right = Math.min(pageCount - 1, page + 1);
        if (left > 2) pages.push('ellipsis');
        for (let i = left; i <= right; i++) pages.push(i);
        if (right < pageCount - 1) pages.push('ellipsis');
        pages.push(pageCount);
        return pages;
    };

    return (
        <div className="pg-wrap">
            <div className="pg-info">
                <span>
                    {start}–{end} sur {totalItems}
                </span>
                <div className="pg-size">
                    <label>Par page&nbsp;:</label>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    >
                        {pageSizeOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="pg-pages">
                <button
                    className="pg-arrow"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Page précédente"
                >
                    <ChevronLeft size={16} />
                </button>
                {visiblePages().map((p, idx) =>
                    p === 'ellipsis' ? (
                        <span key={`ell-${idx}`} className="pg-ellipsis">…</span>
                    ) : (
                        <button
                            key={p}
                            className={`pg-num ${p === page ? 'active' : ''}`}
                            onClick={() => onPageChange(p)}
                        >
                            {p}
                        </button>
                    )
                )}
                <button
                    className="pg-arrow"
                    disabled={page >= pageCount}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Page suivante"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
