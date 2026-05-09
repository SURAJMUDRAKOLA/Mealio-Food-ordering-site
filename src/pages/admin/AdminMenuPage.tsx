import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { queryKeys } from '@/lib/queryClient';
import { formatPrice } from '@/utils/price';
import Button from '@/components/ui/Button';

interface DBMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string;
  category_id: string | null;
  is_veg: boolean;
  is_popular: boolean;
  is_available: boolean;
  rating: number | null;
  prep_time: string | null;
  tag: string | null;
}

type EditForm = Pick<DBMenuItem, 'name' | 'description' | 'price' | 'image_url' | 'category_id' | 'is_veg' | 'is_popular' | 'prep_time' | 'tag'>;

const emptyForm: EditForm = {
  name: '', description: '', price: 0, image_url: '', category_id: null,
  is_veg: true, is_popular: false, prep_time: '20 min', tag: null,
};

const AdminMenuPage: React.FC = () => {
  useAdminGuard();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<DBMenuItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<EditForm>(emptyForm);

  // ── Fetch all menu items ─────────────────────────────────────────────────────
  const { data: items = [], isLoading } = useQuery({
    queryKey: [...queryKeys.menuItems(), 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category_id')
        .order('name');
      if (error) throw error;
      return (data ?? []) as DBMenuItem[];
    },
    staleTime: 30 * 1000,
  });

  // ── Toggle availability ──────────────────────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...queryKeys.menuItems(), 'admin'] });
      void qc.invalidateQueries({ queryKey: queryKeys.menuItems() });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Update failed'),
  });

  // ── Save edits ───────────────────────────────────────────────────────────────
  const editMutation = useMutation({
    mutationFn: async (item: DBMenuItem) => {
      const { error } = await supabase
        .from('menu_items')
        .update({
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.image_url,
          is_veg: item.is_veg,
          is_popular: item.is_popular,
          prep_time: item.prep_time,
          tag: item.tag,
        })
        .eq('id', item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...queryKeys.menuItems(), 'admin'] });
      void qc.invalidateQueries({ queryKey: queryKeys.menuItems() });
      setEditItem(null);
      toast.success('Item updated');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Update failed'),
  });

  // ── Delete item ──────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...queryKeys.menuItems(), 'admin'] });
      void qc.invalidateQueries({ queryKey: queryKeys.menuItems() });
      toast.success('Item deleted');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Delete failed'),
  });

  // ── Add new item ─────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (form: EditForm) => {
      const newId = `item-${Date.now()}`;
      const { error } = await supabase.from('menu_items').insert({
        id: newId,
        ...form,
        is_available: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...queryKeys.menuItems(), 'admin'] });
      void qc.invalidateQueries({ queryKey: queryKeys.menuItems() });
      setShowAddModal(false);
      setAddForm(emptyForm);
      toast.success('Item added successfully');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Add failed'),
  });

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = items.filter((i) =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gourmet-accent">Management</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-gourmet-cream">Menu Items</h1>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Item
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gourmet-muted" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="w-full rounded-lg border border-gourmet-line bg-gourmet-surface/60 py-2.5 pl-9 pr-4 text-sm text-gourmet-cream placeholder:text-gourmet-dim outline-none focus:border-gourmet-primary"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gourmet-line bg-gourmet-surface/60">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-gourmet-primary" size={28} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gourmet-line text-left">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gourmet-muted">Item</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gourmet-muted">Price</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gourmet-muted">Category</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gourmet-muted">Available</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gourmet-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-gourmet-line/50 transition-colors hover:bg-gourmet-cream/3">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-10 w-10 rounded-md object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div>
                        <p className="font-semibold text-gourmet-cream">{item.name}</p>
                        <p className="text-xs text-gourmet-dim">{item.is_veg ? '🟢 Veg' : '🔴 Non-veg'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-gourmet-accent">{formatPrice(item.price)}</td>
                  <td className="px-4 py-3 text-gourmet-muted">{item.category_id ?? '—'}</td>
                  <td className="px-4 py-3">
                    {/* Toggle switch */}
                    <button
                      onClick={() => toggleMutation.mutate({ id: item.id, is_available: !item.is_available })}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        item.is_available ? 'bg-gourmet-success' : 'bg-gourmet-line'
                      }`}
                      role="switch"
                      aria-checked={item.is_available}
                      aria-label={`Toggle availability for ${item.name}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          item.is_available ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditItem({ ...item })}
                        className="rounded-md p-1.5 text-gourmet-muted transition-colors hover:bg-gourmet-primary/15 hover:text-gourmet-primary"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${item.name}"?`)) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                        className="rounded-md p-1.5 text-gourmet-muted transition-colors hover:bg-gourmet-danger/15 hover:text-gourmet-danger"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="py-12 text-center text-gourmet-muted">No items found</p>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <ItemModal
            title="Edit Item"
            form={editItem}
            onFormChange={(patch) => setEditItem((prev) => prev ? { ...prev, ...patch } : prev)}
            onSave={() => editMutation.mutate(editItem)}
            onClose={() => setEditItem(null)}
            isPending={editMutation.isPending}
          />
        )}
        {showAddModal && (
          <ItemModal
            title="Add New Item"
            form={addForm}
            onFormChange={(patch) => setAddForm((prev) => ({ ...prev, ...patch }))}
            onSave={() => addMutation.mutate(addForm)}
            onClose={() => { setShowAddModal(false); setAddForm(emptyForm); }}
            isPending={addMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Shared Edit / Add Modal ──────────────────────────────────────────────────
interface ItemModalProps {
  title: string;
  form: Partial<DBMenuItem>;
  onFormChange: (patch: Partial<DBMenuItem>) => void;
  onSave: () => void;
  onClose: () => void;
  isPending: boolean;
}

const ItemModal: React.FC<ItemModalProps> = ({ title, form, onFormChange, onSave, onClose, isPending }) => {
  const field = (label: string, node: React.ReactNode) => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gourmet-muted">{label}</span>
      {node}
    </label>
  );

  const input = (key: keyof DBMenuItem, type = 'text') => (
    <input
      type={type}
      value={(form[key] as string | number) ?? ''}
      onChange={(e) => onFormChange({ [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
      className="w-full rounded-md border border-gourmet-line bg-gourmet-bg px-3 py-2 text-sm text-gourmet-cream outline-none focus:border-gourmet-primary"
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg overflow-hidden rounded-xl border border-gourmet-line bg-gourmet-surface shadow-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gourmet-line px-6 py-4">
          <h2 className="font-display text-lg font-bold text-gourmet-cream">{title}</h2>
          <button onClick={onClose} className="text-gourmet-muted hover:text-gourmet-cream">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 overflow-y-auto p-6" style={{ maxHeight: '65vh' }}>
          {field('Name', input('name'))}
          {field('Description', (
            <textarea
              value={(form.description as string) ?? ''}
              onChange={(e) => onFormChange({ description: e.target.value })}
              rows={2}
              className="w-full rounded-md border border-gourmet-line bg-gourmet-bg px-3 py-2 text-sm text-gourmet-cream outline-none focus:border-gourmet-primary"
            />
          ))}
          <div className="grid grid-cols-2 gap-4">
            {field('Price (₹)', input('price', 'number'))}
            {field('Prep Time', input('prep_time'))}
          </div>
          {field('Image URL', input('image_url'))}
          {field('Category ID', input('category_id'))}
          {field('Tag', input('tag'))}

          <div className="flex gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_veg ?? true}
                onChange={(e) => onFormChange({ is_veg: e.target.checked })}
                className="accent-gourmet-success"
              />
              <span className="text-sm text-gourmet-cream">Vegetarian</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_popular ?? false}
                onChange={(e) => onFormChange({ is_popular: e.target.checked })}
                className="accent-gourmet-primary"
              />
              <span className="text-sm text-gourmet-cream">Popular / Trending</span>
            </label>
          </div>

          {/* Image preview */}
          {form.image_url && (
            <img
              src={form.image_url as string}
              alt="preview"
              className="h-32 w-full rounded-md object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gourmet-line px-6 py-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button isLoading={isPending} onClick={onSave}>Save</Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminMenuPage;
