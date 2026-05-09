import { useState, useEffect, useMemo } from 'react';
import {
    Plus, X, Pill, Trash2, Save, ChevronDown
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import {
    supplementSetService,
    formatTimingLabel,
    isMealTiming,
    isWorkoutTiming,
    isStandardUnit,
    STANDARD_UNITS,
    CUSTOM_UNIT_MAX,
    type SupplementSet,
    type SupplementSetItem,
    type SupplementKind,
} from '../services/supplementSet.service';
import toast, { Toaster } from 'react-hot-toast';
import './SupplementsPage.css';

type Tab = SupplementKind;

const emptyItem = (orderIndex: number): SupplementSetItem => ({
    name: '',
    quantity: 0,
    unit: 'g',
    orderIndex,
});

interface UnitSelectProps {
    value: string;
    onChange: (next: string) => void;
}

/**
 * Compact dropdown with the 9 standard units + an "Autre..." option that
 * reveals an inline text input (max 8 chars) for custom units.
 */
const UnitSelect: React.FC<UnitSelectProps> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const isCustom = !isStandardUnit(value);
    const [showCustom, setShowCustom] = useState(isCustom);

    const handlePick = (unit: string) => {
        setShowCustom(false);
        setOpen(false);
        onChange(unit);
    };

    const handleOther = () => {
        setShowCustom(true);
        setOpen(false);
        if (isStandardUnit(value)) onChange('');
    };

    return (
        <div className={`sp-unit ${showCustom ? 'sp-unit--custom' : ''}`}>
            {showCustom ? (
                <input
                    type="text"
                    className="sp-unit-custom"
                    placeholder="Unité"
                    value={value}
                    maxLength={CUSTOM_UNIT_MAX}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={() => {
                        if (!value.trim()) {
                            setShowCustom(false);
                            onChange('g');
                        }
                    }}
                    autoFocus
                />
            ) : (
                <button
                    type="button"
                    className="sp-unit-trigger"
                    onClick={() => setOpen(o => !o)}
                >
                    <span>{value}</span>
                    <ChevronDown size={14} />
                </button>
            )}
            {open && !showCustom && (
                <div className="sp-unit-menu" onMouseLeave={() => setOpen(false)}>
                    {STANDARD_UNITS.map(u => (
                        <button
                            key={u}
                            type="button"
                            className={`sp-unit-opt ${u === value ? 'active' : ''}`}
                            onClick={() => handlePick(u)}
                        >
                            {u}
                        </button>
                    ))}
                    <div className="sp-unit-sep" />
                    <button type="button" className="sp-unit-opt sp-unit-opt-other" onClick={handleOther}>
                        Autre…
                    </button>
                </div>
            )}
        </div>
    );
};

const SupplementsPage = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Meal');
    const [sets, setSets] = useState<SupplementSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [adding, setAdding] = useState(false);

    // Edit modal state
    const [editingSet, setEditingSet] = useState<SupplementSet | null>(null);
    const [draftItems, setDraftItems] = useState<SupplementSetItem[]>([]);

    // Delete confirm state
    const [deleteConfirm, setDeleteConfirm] = useState<SupplementSet | null>(null);

    useEffect(() => {
        loadSets();
    }, []);

    const loadSets = async () => {
        try {
            setLoading(true);
            const data = await supplementSetService.getAll();
            setSets(data);
        } catch (error) {
            console.error('Error loading supplement sets:', error);
            toast.error('Erreur lors du chargement des sets de compléments');
        } finally {
            setLoading(false);
        }
    };

    const visibleSets = useMemo(() => {
        const filter = activeTab === 'Meal' ? isMealTiming : isWorkoutTiming;
        return sets
            .filter(s => filter(s.timing))
            .sort((a, b) => {
                if (a.index !== b.index) return a.index - b.index;
                // Pre comes before Post for the same index
                const order = { PreMeal: 0, PostMeal: 1, PreWorkout: 0, PostWorkout: 1 };
                return order[a.timing] - order[b.timing];
            });
    }, [sets, activeTab]);

    const handleAddNext = async () => {
        try {
            setAdding(true);
            const newSet = await supplementSetService.addNext(activeTab);
            setSets(prev => [...prev, newSet]);
            toast.success(`${formatTimingLabel(newSet.timing, newSet.index)} ajouté`);
        } catch (error: any) {
            console.error('Error adding next set:', error);
            toast.error(error?.response?.data?.message || 'Erreur lors de l\'ajout du set');
        } finally {
            setAdding(false);
        }
    };

    const openEdit = (set: SupplementSet) => {
        setEditingSet(set);
        setDraftItems(
            set.items.length === 0
                ? [emptyItem(0)]
                : set.items.map((i, idx) => ({ ...i, orderIndex: idx }))
        );
    };

    const closeEdit = () => {
        setEditingSet(null);
        setDraftItems([]);
    };

    const updateDraftItem = (idx: number, patch: Partial<SupplementSetItem>) => {
        setDraftItems(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], ...patch };
            return next;
        });
    };

    const handleSaveItems = async () => {
        if (!editingSet) return;

        const cleaned = draftItems
            .filter(i => i.name.trim() !== '')
            .map((i, idx) => ({
                ...i,
                name: i.name.trim(),
                unit: (i.unit || 'g').trim(),
                orderIndex: idx,
            }));

        for (const item of cleaned) {
            if (!isStandardUnit(item.unit) && item.unit.length > CUSTOM_UNIT_MAX) {
                toast.error(`Unité personnalisée max ${CUSTOM_UNIT_MAX} caractères (${item.name})`);
                return;
            }
            if (item.unit.length === 0) {
                toast.error(`Unité requise pour ${item.name}`);
                return;
            }
        }

        try {
            setSaving(true);
            const updated = await supplementSetService.updateItems(
                editingSet.supplementSetId,
                cleaned
            );
            setSets(prev => prev.map(s =>
                s.supplementSetId === updated.supplementSetId ? updated : s
            ));
            toast.success('Set sauvegardé');
            closeEdit();
        } catch (error: any) {
            console.error('Error saving items:', error);
            toast.error(error?.response?.data?.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await supplementSetService.delete(deleteConfirm.supplementSetId);
            setSets(prev => prev.filter(s => s.supplementSetId !== deleteConfirm.supplementSetId));
            toast.success('Set supprimé');
        } catch (error) {
            console.error('Error deleting set:', error);
            toast.error('Erreur lors de la suppression');
        } finally {
            setDeleteConfirm(null);
        }
    };

    const formatItemQty = (item: SupplementSetItem) => {
        const qtyStr = Number.isInteger(item.quantity)
            ? item.quantity.toString()
            : item.quantity.toFixed(2).replace(/\.?0+$/, '');
        return `${qtyStr} ${item.unit}`;
    };

    return (
        <MainLayout>
            <div className="sp-page">
                <div className="sp-header">
                    <div>
                        <h1>Compléments</h1>
                        <p>Organisez vos sets de compléments par timing (avant/après repas, avant/après séance).</p>
                    </div>
                </div>

                <div className="sp-tabs">
                    <button
                        className={`sp-tab ${activeTab === 'Meal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Meal')}
                    >
                        Repas
                        <span className="sp-tab-count">
                            {sets.filter(s => isMealTiming(s.timing)).length}
                        </span>
                    </button>
                    <button
                        className={`sp-tab ${activeTab === 'Workout' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Workout')}
                    >
                        Workout
                        <span className="sp-tab-count">
                            {sets.filter(s => isWorkoutTiming(s.timing)).length}
                        </span>
                    </button>
                </div>

                {loading ? (
                    <div className="sp-loading">
                        <div className="sp-spinner" />
                        <p>Chargement…</p>
                    </div>
                ) : visibleSets.length === 0 ? (
                    <div className="sp-empty">
                        <Pill size={48} />
                        <h3>Aucun set</h3>
                        <p>Ajoutez votre premier set ci-dessous.</p>
                    </div>
                ) : (
                    <div className="sp-grid">
                        {visibleSets.map(set => (
                            <article
                                key={set.supplementSetId}
                                className="sp-card"
                            >
                                <header className="sp-card-head">
                                    <div className="sp-card-title">
                                        <Pill size={16} />
                                        <span>{formatTimingLabel(set.timing, set.index)}</span>
                                    </div>
                                    <button
                                        className="sp-card-del"
                                        onClick={() => setDeleteConfirm(set)}
                                        aria-label="Supprimer ce set"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </header>

                                <div className="sp-card-body">
                                    {set.items.length === 0 ? (
                                        <div className="sp-card-empty">Aucun item</div>
                                    ) : (
                                        <ul className="sp-item-list">
                                            {set.items.map((item, idx) => (
                                                <li key={item.supplementSetItemId ?? idx}>
                                                    <span className="sp-item-name">{item.name}</span>
                                                    <span className="sp-item-qty">{formatItemQty(item)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <footer className="sp-card-foot">
                                    <button
                                        className="sp-card-edit"
                                        onClick={() => openEdit(set)}
                                    >
                                        Modifier les items
                                    </button>
                                </footer>
                            </article>
                        ))}
                    </div>
                )}

                <div className="sp-add-row">
                    <button
                        className="sp-btn-add-next"
                        onClick={handleAddNext}
                        disabled={adding}
                    >
                        <Plus size={16} />
                        {adding ? 'Ajout…' : `Ajouter le prochain set ${activeTab === 'Meal' ? 'Repas' : 'Workout'}`}
                    </button>
                </div>

                {/* Edit items modal */}
                {editingSet && (
                    <div className="sp-modal-overlay" onClick={closeEdit}>
                        <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="sp-modal-head">
                                <h2>{formatTimingLabel(editingSet.timing, editingSet.index)}</h2>
                                <button className="sp-close" onClick={closeEdit} aria-label="Fermer">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="sp-modal-body">
                                <div className="sp-rows-head">
                                    <span>Nom</span>
                                    <span>Quantité</span>
                                    <span>Unité</span>
                                    <span />
                                </div>

                                {draftItems.map((item, idx) => (
                                    <div className="sp-row" key={idx}>
                                        <input
                                            type="text"
                                            placeholder="Ex: Vitamine D3"
                                            value={item.name}
                                            onChange={(e) => updateDraftItem(idx, { name: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="0"
                                            value={item.quantity || ''}
                                            onChange={(e) => updateDraftItem(idx, {
                                                quantity: parseFloat(e.target.value) || 0
                                            })}
                                        />
                                        <UnitSelect
                                            value={item.unit}
                                            onChange={(unit) => updateDraftItem(idx, { unit })}
                                        />
                                        <button
                                            className="sp-row-del"
                                            onClick={() =>
                                                setDraftItems(prev => prev.filter((_, i) => i !== idx))
                                            }
                                            aria-label="Retirer cette ligne"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    className="sp-btn-add-row"
                                    onClick={() =>
                                        setDraftItems(prev => [...prev, emptyItem(prev.length)])
                                    }
                                >
                                    <Plus size={14} />
                                    Ajouter un item
                                </button>
                            </div>

                            <div className="sp-modal-foot">
                                <button className="sp-btn-secondary" onClick={closeEdit}>
                                    Annuler
                                </button>
                                <button
                                    className="sp-btn-primary"
                                    onClick={handleSaveItems}
                                    disabled={saving}
                                >
                                    <Save size={15} />
                                    {saving ? 'Sauvegarde…' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete confirm */}
                {deleteConfirm && (
                    <div className="sp-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                        <div className="sp-confirm" onClick={(e) => e.stopPropagation()}>
                            <div className="sp-confirm-icon">
                                <Trash2 size={36} />
                            </div>
                            <h3>
                                Supprimer "{formatTimingLabel(deleteConfirm.timing, deleteConfirm.index)}" ?
                            </h3>
                            <p>Tous les items de ce set seront supprimés. Action irréversible.</p>
                            <div className="sp-confirm-actions">
                                <button className="sp-btn-secondary" onClick={() => setDeleteConfirm(null)}>
                                    Annuler
                                </button>
                                <button className="sp-btn-danger" onClick={handleDelete}>
                                    <Trash2 size={15} />
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

export default SupplementsPage;
