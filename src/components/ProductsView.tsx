/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  Package,
  Layers,
  Check,
  X,
  PlusCircle,
  MinusCircle,
  Upload,
  Download,
  Image as ImageIcon,
  FolderPlus,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { Product, UserAccount } from '../types/index.ts';

interface ProductsViewProps {
  products: Product[];
  categories: string[];
  currentUser: UserAccount;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onUpdateStock: (id: string, delta: number, reason: string) => void;
  onDeleteProduct: (id: string) => void;
  onAddCategory: (name: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportCSV: (csvText: string) => { success: number; errors: string[] };
  isDarkMode: boolean;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  currentUser,
  onAddProduct,
  onUpdateProduct,
  onUpdateStock,
  onDeleteProduct,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onExportCSV,
  onExportJSON,
  onImportCSV,
  isDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(1);
  const [stockReason, setStockReason] = useState<string>('Warehouse fabric restock shipment');

  // Category Manager modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [renamedCatValue, setRenamedCatValue] = useState('');

  // CSV Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvUploadText, setCsvUploadText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productImgInputRef = useRef<HTMLInputElement>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    category: 'Three-Piece Suit',
    fabric: '',
    color: '',
    pricePKR: 85000,
    costPKR: 45000,
    stockQty: 5,
    minStockAlert: 2,
    sizesAvailable: '38R, 40R, 42R, Bespoke Custom',
    imageUrl: '/src/assets/images/suit_royal_navy_3piece_1792162981461.jpg',
    description: '',
  });

  const [formError, setFormError] = useState('');

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fabric.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.color.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && p.stockQty <= p.minStockAlert && p.stockQty > 0) ||
      (stockFilter === 'out' && p.stockQty === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleOpenAdd = () => {
    setFormData({
      code: `ZS-${Math.floor(700 + products.length + 1)}`,
      title: '',
      category: categories[0] || 'Three-Piece Suit',
      fabric: '',
      color: '',
      pricePKR: 0,
      costPKR: 0,
      stockQty: 1,
      minStockAlert: 2,
      sizesAvailable: '38R, 40R, 42R, Bespoke Custom',
      imageUrl: '',
      description: '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      title: product.title,
      category: product.category,
      fabric: product.fabric,
      color: product.color,
      pricePKR: product.pricePKR,
      costPKR: product.costPKR,
      stockQty: product.stockQty,
      minStockAlert: product.minStockAlert,
      sizesAvailable: product.sizesAvailable.join(', '),
      imageUrl: product.imageUrl,
      description: product.description,
    });
    setFormError('');
  };

  // Image Upload handler for Product Photo
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Please enter product title');
      return;
    }
    if (!formData.code.trim()) {
      setFormError('Please enter unique product code');
      return;
    }

    onAddProduct({
      code: formData.code.trim(),
      title: formData.title.trim(),
      category: formData.category,
      fabric: formData.fabric.trim(),
      color: formData.color.trim(),
      pricePKR: Number(formData.pricePKR),
      costPKR: Number(formData.costPKR),
      stockQty: Number(formData.stockQty),
      minStockAlert: Number(formData.minStockAlert),
      sizesAvailable: formData.sizesAvailable.split(',').map((s) => s.trim()).filter(Boolean),
      imageUrl: formData.imageUrl,
      description: formData.description.trim(),
    });

    setIsAddModalOpen(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!formData.title.trim()) {
      setFormError('Please enter product title');
      return;
    }

    onUpdateProduct(editingProduct.id, {
      code: formData.code.trim(),
      title: formData.title.trim(),
      category: formData.category,
      fabric: formData.fabric.trim(),
      color: formData.color.trim(),
      pricePKR: Number(formData.pricePKR),
      costPKR: Number(formData.costPKR),
      stockQty: Number(formData.stockQty),
      minStockAlert: Number(formData.minStockAlert),
      sizesAvailable: formData.sizesAvailable.split(',').map((s) => s.trim()).filter(Boolean),
      imageUrl: formData.imageUrl,
      description: formData.description.trim(),
    });

    setEditingProduct(null);
  };

  const handleStockAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustProduct) return;
    onUpdateStock(stockAdjustProduct.id, stockDelta, stockReason);
    setStockAdjustProduct(null);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
  };

  const handleRenameCategorySubmit = (oldName: string) => {
    if (!renamedCatValue.trim()) return;
    onRenameCategory(oldName, renamedCatValue.trim());
    setEditingCatName(null);
    setRenamedCatValue('');
  };

  const handleCSVUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCsvUploadText(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = () => {
    if (!csvUploadText.trim()) return;
    const res = onImportCSV(csvUploadText);
    setImportStatus(res);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search / Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold font-serif-display ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Suit Catalogue &amp; Fabric Inventory
          </h1>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-neutral-400' : 'text-stone-500'}`}>
            Total {products.length} bespoke designs and ready-to-wear garments in persistent store
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Manager button */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
            <span>Manage Categories</span>
          </button>

          {/* Import / Export dropdown buttons */}
          <button
            onClick={onExportCSV}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
            }`}
            title="Download Products Catalog as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setImportStatus(null);
              setIsImportModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Suit</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-xl border space-y-3 ${
        isDarkMode ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by suit code (e.g. ZS-701), fabric, color, or title..."
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg focus:outline-none focus:border-amber-500 border ${
                isDarkMode
                  ? 'bg-neutral-950 border-neutral-800 text-neutral-200 placeholder-neutral-500'
                  : 'bg-stone-50 border-stone-300 text-stone-800 placeholder-stone-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Stock filter tabs */}
          <div className={`flex items-center gap-1 p-1 rounded-lg border text-xs shrink-0 ${
            isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-stone-100 border-stone-200'
          }`}>
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                stockFilter === 'all'
                  ? isDarkMode ? 'bg-neutral-800 text-white' : 'bg-white text-stone-900 shadow-sm'
                  : isDarkMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              All Stock
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                stockFilter === 'low'
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 font-semibold'
                  : isDarkMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Low Stock Alert
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                stockFilter === 'out'
                  ? 'bg-red-500/20 text-red-500 border border-red-500/30 font-semibold'
                  : isDarkMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>

        {/* Dynamic Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                  : isDarkMode
                  ? 'bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className={`p-12 text-center rounded-xl border space-y-3 ${
          isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-stone-200'
        }`}>
          <Package className="w-10 h-10 text-neutral-500 mx-auto" />
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-neutral-300' : 'text-stone-700'}`}>
            No suit products match the query
          </h3>
          <p className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-stone-400'}`}>
            Try adjusting your keyword, category, or stock filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isLowStock = product.stockQty <= product.minStockAlert && product.stockQty > 0;
            const isOutOfStock = product.stockQty === 0;

            return (
              <div
                key={product.id}
                className={`group rounded-xl border overflow-hidden flex flex-col transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                    : 'bg-white border-stone-200 hover:border-stone-400 shadow-sm'
                }`}
              >
                {/* Product Image Frame */}
                <div className="relative aspect-[4/3] bg-neutral-950 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Subtle code overlay */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-neutral-950/80 backdrop-blur-md rounded text-[11px] font-mono font-medium text-amber-400 border border-neutral-800">
                    {product.code}
                  </div>

                  {/* Stock tag */}
                  <div className="absolute top-3 right-3">
                    {isOutOfStock ? (
                      <span className="px-2 py-1 bg-red-950/90 text-red-300 border border-red-800/50 rounded text-[10px] font-medium">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-1 bg-amber-950/90 text-amber-300 border border-amber-800/50 rounded text-[10px] font-medium">
                        Low: {product.stockQty} left
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-neutral-950/80 text-emerald-400 border border-neutral-800 rounded text-[10px] font-medium">
                        Stock: {product.stockQty}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Unboxed Zero-pill Metadata */}
                    <div className={`flex items-center gap-2 text-xs mb-1 ${isDarkMode ? 'text-neutral-400' : 'text-stone-500'}`}>
                      <span>{product.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{product.color}</span>
                    </div>

                    <h3 className={`text-sm font-semibold leading-snug ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {product.title}
                    </h3>

                    <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-stone-600'}`}>
                      {product.fabric}
                    </p>
                  </div>

                  {/* Pricing & Stock Details */}
                  <div className={`pt-3 border-t space-y-2 ${isDarkMode ? 'border-neutral-800/80' : 'border-stone-200'}`}>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className={`text-[10px] uppercase tracking-wider ${isDarkMode ? 'text-neutral-500' : 'text-stone-400'}`}>
                          Retail Price
                        </div>
                        <div className="text-base font-bold text-amber-500 font-mono-numbers">
                          Rs. {product.pricePKR.toLocaleString()}
                        </div>
                      </div>

                      {/* Cost price strictly for accounts with canViewProfits */}
                      {currentUser.permissions.canViewProfits ? (
                        <div className="text-right">
                          <div className={`text-[10px] uppercase tracking-wider ${isDarkMode ? 'text-neutral-500' : 'text-stone-400'}`}>
                            COGS Cost
                          </div>
                          <div className={`text-xs font-mono-numbers ${isDarkMode ? 'text-neutral-300' : 'text-stone-700'}`}>
                            Rs. {product.costPKR.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-right text-[10px] text-neutral-500 italic">
                          Cost: Restricted
                        </div>
                      )}
                    </div>

                    {/* Sizes available */}
                    <div className={`text-[11px] flex items-center gap-1.5 overflow-hidden ${isDarkMode ? 'text-neutral-400' : 'text-stone-500'}`}>
                      <span>Sizes:</span>
                      <span className={`font-mono truncate ${isDarkMode ? 'text-neutral-300' : 'text-stone-800'}`}>
                        {product.sizesAvailable.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className={`pt-2 flex items-center justify-between gap-2 border-t ${
                    isDarkMode ? 'border-neutral-800/60' : 'border-stone-200'
                  }`}>
                    <button
                      onClick={() => {
                        setStockAdjustProduct(product);
                        setStockDelta(1);
                        setStockReason('Showroom floor replenishment');
                      }}
                      className={`px-2.5 py-1 text-xs rounded border transition-colors flex items-center gap-1 ${
                        isDarkMode
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                      }`}
                      title="Adjust stock quantity"
                    >
                      <span>Adjust Qty</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className={`p-1.5 rounded transition-colors ${
                          isDarkMode
                            ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                        }`}
                        title="Edit product specifications & photo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${product.code} - ${product.title}? This cannot be undone.`)) {
                              onDeleteProduct(product.id);
                            }
                          }}
                          className={`p-1.5 rounded transition-colors ${
                            isDarkMode
                              ? 'text-neutral-500 hover:text-red-400 hover:bg-neutral-800'
                              : 'text-stone-400 hover:text-red-600 hover:bg-stone-100'
                          }`}
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD PRODUCT MODAL (WITH REAL IMAGE UPLOAD) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden flex flex-col ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <h2 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Add New Bespoke Suit &amp; Fabric Photo
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-6 space-y-4 overflow-y-auto max-h-[80vh] text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200">
                  {formError}
                </div>
              )}

              {/* Image Upload Area */}
              <div>
                <label className={`block font-medium mb-1.5 ${isDarkMode ? 'text-neutral-300' : 'text-stone-700'}`}>
                  Product Picture (Upload File or Paste Image URL)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-neutral-950 border border-neutral-700 overflow-hidden shrink-0 relative">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={productImgInputRef}
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => productImgInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg shadow-sm transition-colors text-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Suit Photo File</span>
                      </button>

                      <span className={`text-[11px] ${isDarkMode ? 'text-neutral-500' : 'text-stone-400'}`}>
                        PNG, JPG, WebP supported
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder="Or enter direct image URL / asset link..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className={`w-full px-3 py-1.5 rounded-lg border font-mono text-[11px] focus:outline-none focus:border-amber-500 ${
                        isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Product Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-none focus:border-amber-500 ${
                      isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                      isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Super 150s Royal Navy 3-Piece Bespoke Suit"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Fabric &amp; Mill</label>
                  <input
                    type="text"
                    required
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                      isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Color Palette</label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                      isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Retail Price (PKR)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formData.pricePKR}
                    onChange={(e) => setFormData({ ...formData, pricePKR: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-none focus:border-amber-500 ${
                      isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                {currentUser.permissions.canViewProfits ? (
                  <div>
                    <label className="block text-neutral-400 mb-1">Cost of Goods (PKR)</label>
                    <input
                      type="number"
                      required
                      min={500}
                      value={formData.costPKR}
                      onChange={(e) => setFormData({ ...formData, costPKR: Number(e.target.value) })}
                      className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-none focus:border-amber-500 ${
                        isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-neutral-500 italic p-3 rounded-lg border border-neutral-800 bg-neutral-950/50">
                    Wholesale cost price is hidden by Admin.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stockQty}
                    onChange={(e) => setFormData({ ...formData, stockQty: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-none focus:border-amber-500 ${
                      isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Low Stock Warning At</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-none focus:border-amber-500 ${
                      isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Sizes Available</label>
                <input
                  type="text"
                  value={formData.sizesAvailable}
                  onChange={(e) => setFormData({ ...formData, sizesAvailable: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL (WITH PHOTO REPLACEMENT) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden flex flex-col ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <h2 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Edit {editingProduct.code} - {editingProduct.title}
              </h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh] text-xs">
              {/* Image replacement */}
              <div>
                <label className="block text-neutral-400 mb-1">Product Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-neutral-950 border border-neutral-700 overflow-hidden shrink-0">
                    <img
                      src={formData.imageUrl}
                      alt="Current"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={productImgInputRef}
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => productImgInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg shadow-sm transition-colors text-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Change Suit Photo</span>
                    </button>

                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className={`w-full px-3 py-1.5 rounded-lg border font-mono text-[11px] focus:outline-none focus:border-amber-500 ${
                        isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Fabric &amp; Mill</label>
                  <input
                    type="text"
                    required
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                      isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Retail Price (PKR)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formData.pricePKR}
                    onChange={(e) => setFormData({ ...formData, pricePKR: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-none focus:border-amber-500 ${
                      isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK STOCK ADJUSTMENT MODAL */}
      {stockAdjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-xl border shadow-2xl p-6 text-xs space-y-4 ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold">
                Adjust Inventory · {stockAdjustProduct.code}
              </h2>
              <button
                onClick={() => setStockAdjustProduct(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p>
              Current stock: <strong className="font-mono">{stockAdjustProduct.stockQty}</strong> suits.
            </p>

            <form onSubmit={handleStockAdjustmentSubmit} className="space-y-4">
              <div>
                <label className="block text-neutral-400 mb-1">Adjustment Quantity (+ or -)</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStockDelta((prev) => prev - 1)}
                    className="p-2 rounded bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                  >
                    <MinusCircle className="w-5 h-5 text-red-400" />
                  </button>
                  <input
                    type="number"
                    value={stockDelta}
                    onChange={(e) => setStockDelta(Number(e.target.value))}
                    className="w-24 text-center px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setStockDelta((prev) => prev + 1)}
                    className="p-2 rounded bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                  >
                    <PlusCircle className="w-5 h-5 text-emerald-400" />
                  </button>
                  <span className="text-neutral-400 text-xs">
                    New Qty: <strong className="text-amber-500 font-mono">{Math.max(0, stockAdjustProduct.stockQty + stockDelta)}</strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Reason for Audit Log</label>
                <input
                  type="text"
                  required
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  placeholder="e.g. Received shipment from Lahore mill"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setStockAdjustProduct(null)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg shadow-sm"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MANAGER MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-xl border shadow-2xl p-6 text-xs space-y-4 ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold">Manage Suit Categories</h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategorySubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter new category name (e.g. Safari Suit)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:border-amber-500 ${
                  isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg shadow-sm whitespace-nowrap"
              >
                + Add Category
              </button>
            </form>

            {/* List of categories with Edit & Delete */}
            <div className={`divide-y rounded-lg border max-h-60 overflow-y-auto ${
              isDarkMode ? 'divide-neutral-800 border-neutral-800 bg-neutral-950' : 'divide-stone-200 border-stone-200 bg-stone-50'
            }`}>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                const isEditing = editingCatName === cat;

                return (
                  <div key={cat} className="p-3 flex items-center justify-between gap-3">
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={renamedCatValue}
                          onChange={(e) => setRenamedCatValue(e.target.value)}
                          className="flex-1 px-2 py-1 rounded border bg-neutral-900 text-white font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameCategorySubmit(cat)}
                          className="px-2.5 py-1 bg-emerald-500 text-neutral-950 font-bold rounded"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatName(null)}
                          className="px-2 py-1 text-neutral-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="font-semibold">{cat}</span>
                          <span className={`text-[10px] ml-2 ${isDarkMode ? 'text-neutral-500' : 'text-stone-400'}`}>
                            ({count} products)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatName(cat);
                              setRenamedCatValue(cat);
                            }}
                            className="p-1 text-neutral-400 hover:text-white"
                            title="Rename Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {currentUser.role === 'ADMIN' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete category "${cat}"?`)) {
                                  onDeleteCategory(cat);
                                }
                              }}
                              className="p-1 text-neutral-500 hover:text-red-400"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-xl border shadow-2xl p-6 text-xs space-y-4 ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold">Import Products from CSV Spreadsheet</h2>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className={isDarkMode ? 'text-neutral-400' : 'text-stone-600'}>
              Upload a .csv spreadsheet containing suit title, price, category, stock, sizes, and fabric specifications.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv"
                onChange={handleCSVUploadChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-400 text-neutral-950 font-bold rounded-lg shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Select .CSV File</span>
              </button>
              <span className="text-neutral-500 text-[11px]">Or paste CSV text below</span>
            </div>

            <textarea
              rows={6}
              value={csvUploadText}
              onChange={(e) => setCsvUploadText(e.target.value)}
              placeholder="Code,Title,Category,Fabric,Color,PricePKR,CostPKR,StockQty,MinStockAlert,Sizes,Description..."
              className={`w-full p-3 rounded-lg border font-mono text-[11px] focus:outline-none focus:border-amber-500 ${
                isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
              }`}
            />

            {importStatus && (
              <div className={`p-3 rounded-lg border ${
                importStatus.success > 0 ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300'
              }`}>
                <div className="font-semibold">
                  Successfully imported {importStatus.success} suit products!
                </div>
                {importStatus.errors.length > 0 && (
                  <ul className="list-disc pl-4 mt-1 text-[10px]">
                    {importStatus.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 text-neutral-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={!csvUploadText.trim()}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-bold rounded-lg shadow-sm"
              >
                Import Products Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
