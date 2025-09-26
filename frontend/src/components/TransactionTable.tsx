import { useState, useEffect, useMemo } from 'react';
import api from '@/api';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import * as z from "zod";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

import { Transaction, getColumns } from './columns';
import { AddEditTransactionForm } from './AddEditTransactionForm';

// Data Table Component (no major changes)
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}
function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}


// Parent component that fetches data and manages all state
export const TransactionManager = () => {
  // Data and Pagination State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter State
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ sortBy: 'date', order: 'desc' });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Modal and Dialog State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  // Data Fetching Function
  const fetchTransactions = async () => {
    try {
      const params = {
        page,
        limit: 10,
        search,
        sortBy: sort.sortBy,
        order: sort.order,
        fromDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        toDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      };
      const { data } = await api.get('/transactions', { params });
      setTransactions(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    }
  };

  // Effects
  useEffect(() => {
    fetchTransactions();
  }, [page, search, sort, dateRange]);

  // Event Handlers for CRUD
  const handleOpenAdd = () => {
    setSelectedTransaction(undefined);
    setIsModalOpen(true);
  };
  
  const handleOpenEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;
    try {
      await api.delete(`/transactions/${transactionToDelete}`);
      fetchTransactions(); // Refetch data after delete
      setIsDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Failed to delete transaction", error);
    }
  };

  const handleFormSubmit = async (values: z.infer<any>) => {
    try {
        if (selectedTransaction) {
            // Update
            await api.put(`/transactions/${selectedTransaction._id}`, values);
        } else {
            // Create
            await api.post('/transactions', values);
        }
        fetchTransactions(); // Refetch data
        setIsModalOpen(false);
        setSelectedTransaction(undefined);
    } catch (error) {
        console.error("Failed to save transaction", error);
    }
  };
  
  // Table Columns
  const columns = useMemo(() => getColumns(handleOpenEdit, handleOpenDelete), []);
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Transaction Dashboard</h1>
      
      {/* Filter and Actions Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <Input
          placeholder="Search description, payee..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset to first page on search
          }}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
            {/* Sort Filter */}
            <Select
                value={`${sort.sortBy}-${sort.order}`}
                onValueChange={(value) => {
                    const [sortBy, order] = value.split('-');
                    setSort({ sortBy, order });
                }}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="date-desc">Date (Newest)</SelectItem>
                    <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                    <SelectItem value="amount-desc">Amount (High-Low)</SelectItem>
                    <SelectItem value="amount-asc">Amount (Low-High)</SelectItem>
                </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                    dateRange.to ? (
                        <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                    ) : (
                        format(dateRange.from, "LLL dd, y")
                    )
                    ) : (
                    <span>Pick a date range</span>
                    )}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                />
                </PopoverContent>
            </Popover>
            <Button onClick={handleOpenAdd}>Add Transaction</Button>
        </div>
      </div>

      <DataTable columns={columns} data={transactions} />

      {/* Full Pagination Controls */}
      <div className="py-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={page === p}
                  onClick={(e) => { e.preventDefault(); setPage(p); }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }}
                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedTransaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
          </DialogHeader>
          <AddEditTransactionForm
            onSubmit={handleFormSubmit}
            defaultValues={selectedTransaction}
            onClose={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                    This action cannot be undone. This will permanently delete the transaction.
                </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};