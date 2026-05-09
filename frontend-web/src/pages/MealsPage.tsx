import { useState, useEffect, useRef } from 'react';
import {
    Plus, X, UtensilsCrossed, Trash2, Search, MoreVertical,
    Pencil, Copy, Sparkles
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Pagination from '../components/common/Pagination';
import { mealTabService } from '../services/mealTab.service';
import { mealService } from '../services/meal.service';
import type { MealTab, Meal, CreateMealRequest, UpdateMealRequest, MealIngredient } from '../types';
import toast, { Toaster } from 'react-hot-toast';
import './MealsPage.css';

// ──────────────────────────────────────────────────────────
// Visual mapping for the leading meal icon. Since we don't store
// images yet, we render a colored placeholder that varies by tab
// position (1st = breakfast warm, 2nd = lunch fresh, 3rd = dinner cool, etc).
// ──────────────────────────────────────────────────────────
const TAB_VISUALS = [
    { bg: '#fef3c7', fg: '#d97706' }, // 1st - warm yellow
    { bg: '#d1fae5', fg: '#059669' }, // 2nd - fresh green
    { bg: '#dbeafe', fg: '#2563eb' }, // 3rd - cool blue
    { bg: '#ede9fe', fg: '#7c3aed' }, // 4th - purple
    { bg: '#fce7f3', fg: '#db2777' }, // 5th - pink
    { bg: '#fee2e2', fg: '#dc2626' }, // 6th - red
    { bg: '#e0e7ff', fg: '#4f46e5' }, // 7th - indigo
    { bg: '#ccfbf1', fg: '#0d9488' }, // 8th - teal
];

const getTabVisual = (orderIndex: number) =>
    TAB_VISUALS[orderIndex % TAB_VISUALS.length];

const MealsPage = () => {
    const [tabs, setTabs] = useState<MealTab[]>([]);
    const [activeTabId, setActiveTabId] = useState<number | 'all'>('all');
    const [mealsByTab, setMealsByTab] = useState<Record<number, Meal[]>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'name' | 'ingredients'>('recent');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'duplicate'>('create');
    const [modalTabId, setModalTabId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [aliments, setAliments] = useState<MealIngredient[]>([]);

    const [deleteConfirmTab, setDeleteConfirmTab] = useState<MealTab | null>(null);
    const [deleteConfirmMeal, setDeleteConfirmMeal] = useState<Meal | null>(null);

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // ──────────────────────────────────────────────────────
    // Effects
    // ──────────────────────────────────────────────────────

    useEffect(() => {
        loadTabs();
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        if (openMenuId !== null) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [openMenuId]);

    // ──────────────────────────────────────────────────────
    // Loaders
    // ──────────────────────────────────────────────────────

    const loadTabs = async () => {
        try {
            setLoading(true);
            const data = await mealTabService.getAllTabs();
            setTabs(data);
            // Load meals for every tab so the "All" view aggregates them
            const all: Record<number, Meal[]> = {};
            await Promise.all(data.map(async (t) => {
                try { all[t.mealTabId] = await mealService.getMealsByTab(t.mealTabId); }
                catch { all[t.mealTabId] = []; }
            }));
            setMealsByTab(all);
        } catch (error) {
            console.error('Error loading tabs:', error);
            toast.error('Erreur lors du chargement des tabs');
        } finally {
            setLoading(false);
        }
    };

    const reloadTabMeals = async (tabId: number) => {
        try {
            const meals = await mealService.getMealsByTab(tabId);
            setMealsByTab(prev => ({ ...prev, [tabId]: meals }));
        } catch (e) {
            console.error('Error reloading meals:', e);
        }
    };

    // ──────────────────────────────────────────────────────
    // Tab actions
    // ──────────────────────────────────────────────────────

    const handleAddTab = async () => {
        try {
            const newOrderIndex = tabs.length;
            const tabNames = ['1st Meal', '2nd Meal', '3rd Meal', '4th Meal', '5th Meal', '6th Meal', '7th Meal', '8th Meal'];
            const newTab = await mealTabService.createTab({
                name: tabNames[newOrderIndex] || `${newOrderIndex + 1}th Meal`,
                orderIndex: newOrderIndex
            });
            setTabs([...tabs, newTab]);
            setMealsByTab(prev => ({ ...prev, [newTab.mealTabId]: [] }));
            setActiveTabId(newTab.mealTabId);
            toast.success('Tab créé');
        } catch (error) {
            console.error('Error creating tab:', error);
            toast.error('Erreur lors de la création du tab');
        }
    };

    const handleDeleteTab = async () => {
        if (!deleteConfirmTab) return;
        if (deleteConfirmTab.mealCount > 0) {
            toast.error(`Le tab contient ${deleteConfirmTab.mealCount} repas — supprimez-les d'abord.`);
            setDeleteConfirmTab(null);
            return;
        }
        try {
            await mealTabService.deleteTab(deleteConfirmTab.mealTabId);
            setTabs(tabs.filter(t => t.mealTabId !== deleteConfirmTab.mealTabId));
            setMealsByTab(prev => {
                const next = { ...prev };
                delete next[deleteConfirmTab.mealTabId];
                return next;
            });
            if (activeTabId === deleteConfirmTab.mealTabId) setActiveTabId('all');
            toast.success('Tab supprimé');
        } catch (error) {
            console.error('Error deleting tab:', error);
            toast.error('Erreur lors de la suppression du tab');
        } finally {
            setDeleteConfirmTab(null);
        }
    };

    // ──────────────────────────────────────────────────────
    // Meal modal
    // ──────────────────────────────────────────────────────

    const openCreateMeal = () => {
        setEditingMeal(null);
        setModalMode('create');
        setModalTabId(typeof activeTabId === 'number' ? activeTabId : (tabs[0]?.mealTabId ?? null));
        setFormData({ name: '', description: '' });
        setAliments([]);
        setIsModalOpen(true);
    };

    const openEditMeal = (meal: Meal) => {
        setEditingMeal(meal);
        setModalMode('edit');
        setModalTabId(meal.mealTabId);
        setFormData({ name: meal.name, description: meal.description || '' });
        setAliments(meal.ingredients.map((i, idx) => ({ ...i, orderIndex: idx })));
        setIsModalOpen(true);
    };

    const openDuplicateMeal = (meal: Meal) => {
        setOpenMenuId(null);
        setEditingMeal(null);
        setModalMode('duplicate');
        setModalTabId(meal.mealTabId);
        setFormData({
            name: `${meal.name} (Copie)`,
            description: meal.description || ''
        });
        setAliments(meal.ingredients.map((a, i) => ({ ...a, orderIndex: i })));
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMeal(null);
        setModalMode('create');
        setModalTabId(null);
        setFormData({ name: '', description: '' });
        setAliments([]);
    };

    const handleSaveMeal = async () => {
        if (!formData.name.trim()) {
            toast.error('Le nom du repas est requis');
            return;
        }
        if (!modalTabId) {
            toast.error('Aucune catégorie sélectionnée');
            return;
        }

        const allIngredients: MealIngredient[] = aliments.map((a, i) => ({
            ...a,
            orderIndex: i
        }));

        try {
            if (modalMode === 'edit' && editingMeal) {
                const updateData: UpdateMealRequest = {
                    name: formData.name,
                    description: formData.description || undefined,
                    ingredients: allIngredients
                };
                await mealService.updateMeal(editingMeal.mealId, updateData);
                toast.success('Repas modifié');
            } else {
                const targetTab = tabs.find(t => t.mealTabId === modalTabId);
                const createData: CreateMealRequest = {
                    mealTabId: modalTabId,
                    name: formData.name,
                    description: formData.description || undefined,
                    ingredients: allIngredients,
                    orderIndex: (mealsByTab[modalTabId]?.length ?? 0)
                };
                await mealService.createMeal(createData);
                toast.success(modalMode === 'duplicate'
                    ? `Repas dupliqué dans ${targetTab?.name ?? 'la catégorie'}`
                    : 'Repas créé');
            }
            await reloadTabMeals(modalTabId);
            await loadTabs(); // refresh mealCount on tabs
            handleCloseModal();
        } catch (error) {
            console.error('Error saving meal:', error);
            toast.error('Erreur lors de la sauvegarde du repas');
        }
    };

    const handleDeleteMeal = async () => {
        if (!deleteConfirmMeal) return;
        try {
            await mealService.deleteMeal(deleteConfirmMeal.mealId);
            await reloadTabMeals(deleteConfirmMeal.mealTabId);
            await loadTabs();
            toast.success('Repas supprimé');
        } catch (error) {
            console.error('Error deleting meal:', error);
            toast.error('Erreur lors de la suppression du repas');
        } finally {
            setDeleteConfirmMeal(null);
        }
    };

    // ──────────────────────────────────────────────────────
    // Ingredient editing helpers
    // ──────────────────────────────────────────────────────

    const updateIngredient = (
        list: MealIngredient[],
        setter: (next: MealIngredient[]) => void,
        index: number,
        field: 'name' | 'quantityGrams',
        value: string | number
    ) => {
        const next = [...list];
        next[index] = { ...next[index], [field]: value };
        setter(next);
    };

    // ──────────────────────────────────────────────────────
    // Derived data
    // ──────────────────────────────────────────────────────

    const allMeals: (Meal & { tab?: MealTab })[] = (() => {
        const entries: (Meal & { tab?: MealTab })[] = [];
        const tabsById = new Map(tabs.map(t => [t.mealTabId, t]));
        const targetTabIds = activeTabId === 'all'
            ? tabs.map(t => t.mealTabId)
            : [activeTabId];
        for (const tabId of targetTabIds) {
            const meals = mealsByTab[tabId] || [];
            for (const m of meals) entries.push({ ...m, tab: tabsById.get(tabId) });
        }
        return entries;
    })();

    const filteredMeals = allMeals
        .filter(m => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
                m.name.toLowerCase().includes(q) ||
                (m.description || '').toLowerCase().includes(q) ||
                m.ingredients.some(i => i.name.toLowerCase().includes(q))
            );
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'ingredients':
                    return b.ingredients.length - a.ingredients.length;
                case 'recent':
                default:
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }
        });

    // Pagination derived data
    const totalPages = Math.max(1, Math.ceil(filteredMeals.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const pageStart = (safePage - 1) * pageSize;
    const paginatedMeals = filteredMeals.slice(pageStart, pageStart + pageSize);

    // Reset to page 1 when filters/tab/search/pageSize change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTabId, searchQuery, sortBy, pageSize]);

    const totalMealsCount = Object.values(mealsByTab).reduce((acc, arr) => acc + arr.length, 0);

    const formatDate = (iso?: string) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const getIngredientPreview = (meal: Meal): string => {
        if (meal.description) return meal.description;
        if (meal.ingredients.length === 0) return 'Aucun ingrédient';
        return meal.ingredients.slice(0, 4).map(i => i.name).join(', ')
            + (meal.ingredients.length > 4 ? '…' : '');
    };

    // ──────────────────────────────────────────────────────
    // Render
    // ──────────────────────────────────────────────────────

    return (
        <MainLayout>
            <div className="ml-page">
                {/* Header */}
                <div className="ml-header">
                    <div>
                        <h1>Meals</h1>
                        <p>Organisez et gérez vos repas par catégories</p>
                    </div>
                    <button className="ml-btn-primary" onClick={openCreateMeal}>
                        <Plus size={18} />
                        Nouveau Repas
                    </button>
                </div>

                {/* Tabs row */}
                <div className="ml-tabs">
                    <button
                        className={`ml-tab ${activeTabId === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTabId('all')}
                    >
                        <span>Tous</span>
                        <span className="ml-tab-count">{totalMealsCount}</span>
                    </button>
                    {tabs.map(tab => (
                        <button
                            key={tab.mealTabId}
                            className={`ml-tab ${activeTabId === tab.mealTabId ? 'active' : ''}`}
                            onClick={() => setActiveTabId(tab.mealTabId)}
                        >
                            <span>{tab.name}</span>
                            <span className="ml-tab-count">{tab.mealCount}</span>
                            {tab.orderIndex >= 3 && (
                                <span
                                    className="ml-tab-close"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmTab(tab);
                                    }}
                                    role="button"
                                    aria-label="Supprimer le tab"
                                >
                                    <X size={13} />
                                </span>
                            )}
                        </button>
                    ))}
                    <button className="ml-tab-add" onClick={handleAddTab} aria-label="Ajouter une catégorie">
                        <Plus size={16} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="ml-toolbar">
                    <div className="ml-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un repas, un ingrédient..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="ml-filter-select"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                    >
                        <option value="recent">Tri: Plus récents</option>
                        <option value="name">Tri: Nom A→Z</option>
                        <option value="ingredients">Tri: Plus d'ingrédients</option>
                    </select>
                </div>

                {/* Body */}
                {loading ? (
                    <div className="ml-loading">
                        <div className="ml-spinner" />
                        <p>Chargement…</p>
                    </div>
                ) : filteredMeals.length === 0 ? (
                    <div className="ml-empty">
                        <UtensilsCrossed size={56} />
                        <h3>Aucun repas trouvé</h3>
                        <p>Créez votre premier repas pour commencer</p>
                        <button className="ml-btn-primary" onClick={openCreateMeal}>
                            <Plus size={18} />
                            Créer un Repas
                        </button>
                    </div>
                ) : (
                    <div className="ml-table-wrap">
                        <table className="ml-table">
                            <thead>
                                <tr>
                                    <th>Repas</th>
                                    <th>Catégorie</th>
                                    <th className="ml-col-num">Ingrédients</th>
                                    <th>Macros &amp; Calories</th>
                                    <th>Mise à jour</th>
                                    <th className="ml-col-actions" />
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedMeals.map((meal, rowIndex) => {
                                    const visual = getTabVisual(meal.tab?.orderIndex ?? 0);
                                    const isMenuOpen = openMenuId === meal.mealId;
                                    // Flip menu upward for the last 2 rows or when fewer than 3 rows remain below
                                    const flipMenu = paginatedMeals.length > 2
                                        && rowIndex >= paginatedMeals.length - 2;

                                    return (
                                        <tr key={meal.mealId} onClick={() => openEditMeal(meal)}>
                                            <td>
                                                <div className="ml-meal-cell">
                                                    <div
                                                        className="ml-meal-icon"
                                                        style={{ background: visual.bg, color: visual.fg }}
                                                    >
                                                        <UtensilsCrossed size={20} />
                                                    </div>
                                                    <div className="ml-meal-text">
                                                        <span className="ml-meal-name">{meal.name}</span>
                                                        <span className="ml-meal-sub">{getIngredientPreview(meal)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className="ml-cat-chip"
                                                    style={{ background: visual.bg, color: visual.fg }}
                                                >
                                                    {meal.tab?.name ?? '—'}
                                                </span>
                                            </td>
                                            <td className="ml-col-num">
                                                <div className="ml-ing-cell">
                                                    <span className="ml-ing-total">{meal.ingredients.length}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="ml-ai-pending">
                                                    <Sparkles size={13} />
                                                    Calcul IA bientôt
                                                </span>
                                            </td>
                                            <td>
                                                <span className="ml-muted">{formatDate(meal.updatedAt)}</span>
                                            </td>
                                            <td
                                                className="ml-col-actions"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="ml-action-wrap" ref={isMenuOpen ? menuRef : null}>
                                                    <button
                                                        className="ml-kebab-btn"
                                                        onClick={() =>
                                                            setOpenMenuId(isMenuOpen ? null : meal.mealId)
                                                        }
                                                        aria-label="Actions"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    {isMenuOpen && (
                                                        <div className={`ml-action-menu ${flipMenu ? 'flip-up' : ''}`}>
                                                            <button
                                                                className="ml-menu-item"
                                                                onClick={() => {
                                                                    setOpenMenuId(null);
                                                                    openEditMeal(meal);
                                                                }}
                                                            >
                                                                <Pencil size={15} />
                                                                Modifier
                                                            </button>
                                                            <button
                                                                className="ml-menu-item"
                                                                onClick={() => openDuplicateMeal(meal)}
                                                            >
                                                                <Copy size={15} />
                                                                Dupliquer
                                                            </button>
                                                            <div className="ml-menu-sep" />
                                                            <button
                                                                className="ml-menu-item ml-menu-item-danger"
                                                                onClick={() => {
                                                                    setOpenMenuId(null);
                                                                    setDeleteConfirmMeal(meal);
                                                                }}
                                                            >
                                                                <Trash2 size={15} />
                                                                Supprimer
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <Pagination
                            page={safePage}
                            pageCount={totalPages}
                            pageSize={pageSize}
                            totalItems={filteredMeals.length}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    </div>
                )}

                {/* Create / edit / duplicate modal */}
                {isModalOpen && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>
                                    {modalMode === 'edit' ? 'Modifier le Repas'
                                        : modalMode === 'duplicate' ? 'Dupliquer le Repas'
                                            : 'Nouveau Repas'}
                                </h2>
                                <button className="close-btn" onClick={handleCloseModal}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Catégorie *</label>
                                    <select
                                        value={modalTabId ?? ''}
                                        onChange={(e) => setModalTabId(Number(e.target.value))}
                                    >
                                        {tabs.map(t => (
                                            <option key={t.mealTabId} value={t.mealTabId}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Titre *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Poulet grillé avec légumes"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Description du repas..."
                                        rows={3}
                                    />
                                </div>

                                {/* Aliments */}
                                <div className="ingredients-section">
                                    <div className="section-header">
                                        <h3>Aliments</h3>
                                        <button
                                            type="button"
                                            className="btn-add-ingredient"
                                            onClick={() => setAliments([
                                                ...aliments,
                                                { name: '', quantityGrams: 0, orderIndex: aliments.length }
                                            ])}
                                        >
                                            <Plus size={16} />
                                            Ajouter
                                        </button>
                                    </div>
                                    {aliments.map((a, idx) => (
                                        <div key={idx} className="ingredient-row">
                                            <input
                                                type="text"
                                                placeholder="Nom"
                                                value={a.name}
                                                onChange={(e) =>
                                                    updateIngredient(aliments, setAliments, idx, 'name', e.target.value)
                                                }
                                            />
                                            <input
                                                type="number"
                                                placeholder="Quantité (g)"
                                                value={a.quantityGrams || ''}
                                                onChange={(e) =>
                                                    updateIngredient(aliments, setAliments, idx, 'quantityGrams',
                                                        parseFloat(e.target.value) || 0)
                                                }
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-ingredient"
                                                onClick={() => setAliments(aliments.filter((_, i) => i !== idx))}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={handleCloseModal}>
                                    Annuler
                                </button>
                                <button className="btn-primary" onClick={handleSaveMeal}>
                                    {modalMode === 'edit' ? 'Enregistrer'
                                        : modalMode === 'duplicate' ? 'Créer la copie'
                                            : 'Créer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab delete confirm */}
                {deleteConfirmTab && (
                    <div className="modal-overlay" onClick={() => setDeleteConfirmTab(null)}>
                        <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="delete-icon-wrapper">
                                <Trash2 size={48} />
                            </div>
                            <h3>Supprimer le tab "{deleteConfirmTab.name}" ?</h3>
                            <p>Cette action supprimera définitivement ce tab et tous les {deleteConfirmTab.mealCount} repas qu'il contient.</p>
                            <div className="delete-confirm-actions">
                                <button className="btn-cancel" onClick={() => setDeleteConfirmTab(null)}>
                                    Annuler
                                </button>
                                <button className="btn-delete" onClick={handleDeleteTab}>
                                    <Trash2 size={18} />
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Meal delete confirm */}
                {deleteConfirmMeal && (
                    <div className="modal-overlay" onClick={() => setDeleteConfirmMeal(null)}>
                        <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="delete-icon-wrapper">
                                <Trash2 size={48} />
                            </div>
                            <h3>Supprimer "{deleteConfirmMeal.name}" ?</h3>
                            <p>Cette action est irréversible.</p>
                            <div className="delete-confirm-actions">
                                <button className="btn-cancel" onClick={() => setDeleteConfirmMeal(null)}>
                                    Annuler
                                </button>
                                <button className="btn-delete" onClick={handleDeleteMeal}>
                                    <Trash2 size={18} />
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Toaster />
        </MainLayout>
    );
};

export default MealsPage;
