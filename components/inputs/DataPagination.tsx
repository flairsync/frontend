import React from 'react'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface DataPaginationProps {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
}

const DataPagination = ({ current, total, pageSize, onChange }: DataPaginationProps) => {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;

    const renderPageLinks = () => {
        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        href="#"
                        size="default"
                        isActive={i === current}
                        onClick={(e) => { e.preventDefault(); onChange(i); }}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }
        return pages;
    };

    return (
        <div
            className="flex justify-center self-start pt-6 w-full"
            style={{
                all: 'revert',
                display: 'flex',
                justifyContent: 'center',
                alignSelf: 'flex-start',
                paddingTop: '1.5rem',
                width: '100%',
                fontSize: '14px',
                lineHeight: '1.5',
                letterSpacing: 'normal'
            }}
        >
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            size="default"
                            onClick={(e) => { e.preventDefault(); if (current > 1) onChange(current - 1); }}
                            className={current === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>

                    {renderPageLinks()}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            size="default"
                            onClick={(e) => { e.preventDefault(); if (current < totalPages) onChange(current + 1); }}
                            className={current === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

export default DataPagination