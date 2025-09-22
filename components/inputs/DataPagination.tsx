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

const DataPagination = () => {
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
                        <PaginationPrevious href="#" onClick={(e) => e.preventDefault()} />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" onClick={(e) => e.preventDefault()}>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
                            2
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" onClick={(e) => e.preventDefault()}>3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => e.preventDefault()} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

export default DataPagination