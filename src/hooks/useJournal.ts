import { useState, useEffect, useCallback } from 'react';
import type { JournalEntry, CreateJournalEntryRequest, UpdateJournalEntryRequest, JournalFilters } from '~/types/journal';

// Local storage key for journal entries
const LOCAL_STORAGE_KEY = 'solara_journal_entries';

// Local storage interface
interface LocalJournalEntry {
  id: string;
  content: string;
  sol_day: number;
  word_count: number;
  created_at: string;
  preservation_status: 'local';
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load entries from local storage on mount
  useEffect(() => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const allEntries = JSON.parse(stored);
        // Only load local entries initially, synced/preserved entries will be loaded when userFid is provided
        const localEntries = allEntries.filter((e: JournalEntry) => e.preservation_status === 'local');
        setEntries(localEntries);
      }
    } catch (err) {
      console.error('Error loading local journal entries:', err);
      setError('Failed to load journal entries from local storage.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save entries to local storage
  const saveToLocalStorage = useCallback((newEntries: JournalEntry[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newEntries));
    } catch (err) {
      console.error('Error saving to local storage:', err);
      setError('Failed to save journal entry.');
    }
  }, []);

  // Migrate local entries to database
  const migrateLocalEntries = useCallback(async (userFid: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate userFid
      if (!userFid || typeof userFid !== 'number' || isNaN(userFid)) {
        throw new Error(`Invalid userFid: ${userFid} (type: ${typeof userFid})`);
      }

      const localEntries = entries.filter(e => e.preservation_status === 'local');
      
      if (localEntries.length === 0) {
        return { migrated: 0, errors: [] };
      }

      console.log('[useJournal] Starting migration with userFid:', userFid, 'type:', typeof userFid);
      console.log('[useJournal] Local entries to migrate:', localEntries);

      const results = await Promise.allSettled(
        localEntries.map(async (entry) => {
          const requestBody = {
            content: entry.content,
            sol_day: entry.sol_day,
            userFid: userFid,
            parent_entry_id: entry.parent_entry_id,
            parent_share_id: entry.parent_share_id
          };
          
          console.log('[useJournal] Sending migration request:', {
            entryId: entry.id,
            requestBody,
            userFid: userFid,
            userFidType: typeof userFid
          });

          const response = await fetch('/api/journal/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });

          console.log('[useJournal] Migration response status:', response.status);
          
          if (!response.ok) {
            let errorMsg = `Failed to migrate entry: `;
            try {
              const errorBody = await response.json();
              console.error('[useJournal] Migration error response:', errorBody);
              if (errorBody && errorBody.error) {
                errorMsg += errorBody.error;
              } else {
                errorMsg += response.statusText;
              }
            } catch (e) {
              errorMsg += response.statusText;
            }
            throw new Error(errorMsg);
          }

          const { entry: newEntry } = await response.json();
          console.log('[useJournal] Migration successful for entry:', entry.id, 'New entry:', newEntry);
          return { oldId: entry.id, newEntry };
        })
      );

      const migrated = results.filter(r => r.status === 'fulfilled').length;
      const errors = results.filter(r => r.status === 'rejected').map(r => 
        (r as PromiseRejectedResult).reason
      );

      console.log('[useJournal] Migration complete. Migrated:', migrated, 'Errors:', errors);

      // Remove migrated entries from local storage
      if (migrated > 0) {
        const remainingEntries = entries.filter(e => e.preservation_status !== 'local');
        setEntries(remainingEntries);
        saveToLocalStorage(remainingEntries);
      }

      return { migrated, errors };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to migrate entries';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [entries, saveToLocalStorage]);

  // Create a new journal entry locally
  const createEntry = useCallback(async (data: CreateJournalEntryRequest, userFid?: number): Promise<JournalEntry> => {
    setLoading(true);
    setError(null);
    try {
      const newEntry: JournalEntry = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_fid: userFid || 0, // Use provided userFid or default to 0
        sol_day: data.sol_day,
        content: data.content,
        word_count: data.content.trim().split(/\s+/).length,
        preservation_status: 'local',
        created_at: new Date().toISOString(),
        parent_entry_id: data.parent_entry_id,
        parent_share_id: data.parent_share_id
      };

      setEntries(prev => {
        const newEntries = [newEntry, ...prev];
        saveToLocalStorage(newEntries);
        return newEntries;
      });

      return newEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create entry';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [saveToLocalStorage]);

  // Load entries from API (for authenticated users)
  const loadEntries = useCallback(async (filters?: JournalFilters, userFid?: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[useJournal] loadEntries called with filters:', filters, 'userFid:', userFid);
      
      // Always load local entries from storage first
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      let localEntries: JournalEntry[] = [];
      if (stored) {
        localEntries = JSON.parse(stored).filter((e: JournalEntry) => e.preservation_status === 'local');
      }
      console.log('[useJournal] Local entries from storage:', localEntries.length);

      // Try to load synced/preserved entries from API
      const params = new URLSearchParams();
      if (filters?.preservation_status && filters.preservation_status !== 'local') {
        params.append('preservation_status', filters.preservation_status);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      
      // Add userFid parameter (required for service role client)
      if (userFid) {
        params.append('userFid', String(userFid));
      } else {
        console.log('[useJournal] No userFid provided, skipping API call');
        setEntries(localEntries);
        return;
      }
      
      const apiUrl = `/api/journal/entries?${params.toString()}`;
      console.log('[useJournal] Fetching from API:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('[useJournal] API response status:', response.status);
      console.log('[useJournal] API response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const { entries: apiEntries } = await response.json();
        console.log('[useJournal] API entries received:', apiEntries.length, apiEntries);
        
        // Merge API entries with local entries
        const merged = [...apiEntries, ...localEntries];
        console.log('[useJournal] Merged entries:', merged.length);
        
        // Sort by created_at descending
        merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        console.log('[useJournal] Setting entries:', merged.length);
        setEntries(merged);
        saveToLocalStorage(merged);
      } else if (response.status === 400) {
        // Missing userFid parameter
        console.log('[useJournal] Missing userFid parameter, showing local entries only');
        setEntries(localEntries);
      } else {
        console.warn('[useJournal] Failed to load entries from API, using local only. Status:', response.status);
        try {
          const errorText = await response.text();
          console.warn('[useJournal] API error response:', errorText);
        } catch (e) {
          console.warn('[useJournal] Could not read error response');
        }
        setEntries(localEntries);
      }
    } catch (err) {
      console.warn('[useJournal] Error loading entries, using local only:', err);
      // Fallback to local entries only
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const localEntries = JSON.parse(stored).filter((e: JournalEntry) => e.preservation_status === 'local');
        setEntries(localEntries);
      }
    } finally {
      setLoading(false);
    }
  }, [saveToLocalStorage]);

  // Update a journal entry locally or in the database
  const updateEntry = useCallback(async (id: string, data: UpdateJournalEntryRequest, userFid?: number): Promise<JournalEntry> => {
    setLoading(true);
    setError(null);
    try {
      const entryToUpdate = entries.find(e => e.id === id);
      if (!entryToUpdate) {
        throw new Error('Entry not found');
      }
      if (entryToUpdate.preservation_status === 'local') {
        // Local update
        const updatedEntry: JournalEntry = {
          ...entryToUpdate,
          content: data.content,
          word_count: data.content.trim().split(/\s+/).length,
        };
        setEntries(prev => {
          const newEntries = prev.map(e => (e.id === id ? updatedEntry : e));
          saveToLocalStorage(newEntries);
          return newEntries;
        });
        return updatedEntry;
      } else if (entryToUpdate.preservation_status === 'synced') {
        // API update
        const params = new URLSearchParams();
        if (userFid) {
          params.append('userFid', String(userFid));
        } else {
          throw new Error('userFid required for synced entry updates');
        }
        const response = await fetch(`/api/journal/entries/${id}?${params.toString()}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: data.content }),
        });
        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(errorBody.error || 'Failed to update entry');
        }
        const { entry: updatedEntry } = await response.json();
        // Refresh entries from the database
        await loadEntries(undefined, userFid);
        return updatedEntry;
      } else {
        throw new Error('Cannot update preserved entries');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update entry';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [entries, saveToLocalStorage, loadEntries]);

  // Delete a journal entry locally or in the database
  const deleteEntry = useCallback(async (id: string, userFid?: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const entryToDelete = entries.find(e => e.id === id);
      if (!entryToDelete) {
        throw new Error('Entry not found');
      }
      if (entryToDelete.preservation_status === 'local') {
        setEntries(prev => {
          const newEntries = prev.filter(e => e.id !== id);
          saveToLocalStorage(newEntries);
          return newEntries;
        });
      } else if (entryToDelete.preservation_status === 'synced') {
        // API delete
        const params = new URLSearchParams();
        if (userFid) {
          params.append('userFid', String(userFid));
        } else {
          throw new Error('userFid required for synced entry deletion');
        }
        const response = await fetch(`/api/journal/entries/${id}?${params.toString()}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(errorBody.error || 'Failed to delete entry');
        }
        // Refresh entries from the database
        await loadEntries(undefined, userFid);
      } else {
        throw new Error('Cannot delete preserved entries');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete entry';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [entries, saveToLocalStorage, loadEntries]);

  // Filter entries
  const getFilteredEntries = useCallback((filters?: JournalFilters) => {
    let filtered = entries;

    if (filters?.preservation_status && filters.preservation_status !== 'all') {
      filtered = filtered.filter(entry => entry.preservation_status === filters.preservation_status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.content.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [entries]);

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    loadEntries,
    getFilteredEntries,
    migrateLocalEntries
  };
} 