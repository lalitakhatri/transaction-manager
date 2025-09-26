import { useState, useEffect, useCallback } from 'react';
import api from '@/api';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Transaction } from '@/components/columns';
import * as z from 'zod';

export const useTransactions = () => {
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

  // Data Fetching Function (using useCallback for optimization)
  const fetchTransactions = useCallback(async () => {
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
  }, [page, search, sort, dateRange]);

  // Effects
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  
  // CRUD Handlers
  const handleFormSubmit = async (values: z.infer<any>) => {
    try {
        if (selectedTransaction) {
            await api.put(`/transactions/${selectedTransaction._id}`, values);
        } else {
            await api.post('/transactions', values);
        }
        fetchTransactions(); // Refetch data
        setIsModalOpen(false);
        setSelectedTransaction(undefined);
    } catch (error) {
        console.error("Failed to save transaction", error);
    }
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

  // UI State Handlers
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

  return {
    transactions,
    page,
    totalPages,
    search,
    sort,
    dateRange,
    isModalOpen,
    isDeleteDialogOpen,
    selectedTransaction,
    setPage,
    setSearch,
    setSort,
    setDateRange,
    setIsModalOpen,
    setIsDeleteDialogOpen,
    handleFormSubmit,
    handleDeleteConfirm,
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDelete,
  };
};