import { useState, useEffect, useMemo } from 'react';
import { Plus, X, Trash2, Pencil, Check, ChevronDown } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Pagination from '../components/common/Pagination';
import {
    supplementSetService,
    shortTimingLabel,
    isMealTiming,
    isWorkoutTiming,
    isStandardUnit,
    STANDARD_UNITS,
    CUSTOM_UNIT_MAX,
    type SupplementSet,
    type SupplementGroup,
    type SupplementSetItem,
    type SupplementKind,
    type SupplementTiming,
} from '../services/supplementSet.service';
import toast, { Toaster } from 'react-hot-toast';
import './SupplementsPage.css';

// ─── Constants ───────────────────────────────────────────────

const GROUP_COLORS = [
    { bg: '#fef3c7', fg: '#d97706' },
    { bg: '#d1fae5', fg: '#059669' },
    { bg: '#dbeafe', fg: '#2563eb' },
    { bg: '#ede9fe', fg: '#7c3aed' },
    { bg: '#fce7f3', fg: '#db2777' },
    { bg: '#fee2e2', fg: '#dc2626' },
];

const getGroupColor = (orderIndex: number) => GROUP_COLORS[orderIndex % GROUP_COLORS.length];

const isPreTiming = (t: SupplementTiming) => t === 'PreMeal' || t === 'PreWorkout';

// ─── Helpers ─────────────────────────────────────────────────

const emptyItem = (orderIndex: number): SupplementSetItem => ({
    name: '', quantity: 0, unit: 'g', orderIndex,
});

const formatQty = (item: SupplementSetItem) => {
    const q = Number.isInteger(item.quantity)
        ? item.quantity.toString()
        : item.quantity.toFixed(2).replace(/\.?0+$/, '');
    return `${q} ${item.unit}`;
};

// ─── UnitSelect ──────────────────────────────────────────────

interface UnitSelectProps { value: string; onChange: (v: string) => void; }

const UnitSelect: React.FC<UnitSelectProps> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const isCustom = !isStandardUnit(value);
    const [showCustom, setShowCustom] = useState(isCustom);

    const handlePick = (unit: string) => { setShowCustom(false); setOpen(false); onChange(unit); };
    const handleOther = () => { setShowCustom(true); setOpen(false); if (isStandardUnit(value)) onChange(''); };

    return (
        <div className={`sp-unit ${showCustom ? 'sp-unit--custom' : ''}`}>
            {showCustom ? (
                <input
                    type="text" className="sp-unit-custom" placeholder="Unité"
                    value={value} maxLength={CUSTOM_UNIT_MAX}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={() => { if (!value.trim()) { setShowCustom(false); onChange('g'); } }}
                    autoFocus
                />
            ) : (
                <button type="button" className="sp-unit-trigger" onClick={() => setOpen(o => !o)}>
                    <span>{value}</span><ChevronDown size={12} />
                </button>
            )}
            {open && !showCustom && (
                <div className="sp-unit-menu" onMouseLeave={() => setOpen(false)}>
                    {STANDARD_UNITS.map(u => (
                        <button key={u} type="button"
                            className={`sp-unit-opt ${u === value ? 'active' : ''}`}
                            onClick={() => handlePick(u)}>{u}</button>
                    ))}
                    <div className="sp-unit-sep" />
                    <button type="button" className="sp-unit-opt sp-unit-opt-other" onClick={handleOther}>Autre…</button>
                </div>
            )}
        </div>
    );
};

// ─── Group card ──────────────────────────────────────────────

interface GroupCardProps {
    group: SupplementGroup;
    colorIndex: number;
    isEditing: boolean;
    draftItems: SupplementSetItem[];
    savingItems: boolean;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSaveItems: () => void;
    onDraftChange: (items: SupplementSetItem[]) => void;
    isRenaming: boolean;
    renameValue: string;
    onRenameChange: (v: string) => void;
    onRenameSubmit: () => void;
    onRenameCancel: () => void;
    onStartRename: () => void;
    onDelete: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
    group, colorIndex, isEditing, draftItems, savingItems,
    onStartEdit, onCancelEdit, onSaveItems, onDraftChange,
    isRenaming, renameValue, onRenameChange, onRenameSubmit, onRenameCancel,
    onStartRename, onDelete,
}) => {
    const color = getGroupColor(colorIndex);

    const updateItem = (idx: number, patch: Partial<SupplementSetItem>) => {
        const next = [...draftItems];
        next[idx] = { ...next[idx], ...patch };
        onDraftChange(next);
    };

    return (
        <div className={`sp-group-card ${isEditing ? 'sp-group-card--editing' : ''}`}>
            <div className="sp-group-head" style={{ background: color.bg }}>
                <div className="sp-group-head-dot" style={{ background: color.fg }} />
                {isRenaming ? (
                    <input
                        className="sp-group-name-input"
                        value={renameValue} autoFocus
                        onChange={(e) => onRenameChange(e.target.value)}
                        onBlur={onRenameSubmit}
                        onKeyDown={(e) => { if (e.key === 'Enter') onRenameSubmit(); if (e.key === 'Escape') onRenameCancel(); }}
                    />
                ) : (
                    <button className="sp-group-name" style={{ color: color.fg }} onClick={onStartRename} title="Renommer">
                        {group.name}
                        <Pencil size={11} className="sp-group-name-icon" />
                    </button>
                )}
                <button className="sp-group-del" onClick={onDelete} title="Supprimer">
                    <X size={14} />
                </button>
            </div>

            {isEditing ? (
                <div className="sp-group-edit">
                    <div className="sp-rows-head">
                        <span>Nom</span><span>Qté</span><span>Unité</span><span />
                    </div>
                    {draftItems.map((item, idx) => (
                        <div className="sp-row" key={idx}>
                            <input type="text" placeholder="Ex: Vitamine D3" value={item.name}
                                onChange={(e) => updateItem(idx, { name: e.target.value })} />
                            <input type="number" step="any" placeholder="0" value={item.quantity || ''}
                                onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })} />
                            <UnitSelect value={item.unit} onChange={(unit) => updateItem(idx, { unit })} />
                            <button className="sp-row-del" onClick={() => onDraftChange(draftItems.filter((_, i) => i !== idx))}>
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    <button className="sp-btn-add-row" onClick={() => onDraftChange([...draftItems, emptyItem(draftItems.length)])}>
                        <Plus size={13} /> Ajouter
                    </button>
                    <div className="sp-group-edit-foot">
                        <button className="sp-btn-secondary" onClick={onCancelEdit}>Annuler</button>
                        <button className="sp-btn-primary" onClick={onSaveItems} disabled={savingItems}>
                            <Check size={14} />{savingItems ? 'Sauvegarde…' : 'Enregistrer'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="sp-group-body">
                    {group.items.length === 0 ? (
                        <div className="sp-group-empty">Aucun supplément</div>
                    ) : (
                        <ul className="sp-item-list">
                            {group.items.map((item, idx) => (
                                <li key={item.supplementSetItemId ?? idx}>
                                    <span className="sp-item-name">{item.name}</span>
                                    <span className="sp-item-qty" style={{ color: color.fg }}>{formatQty(item)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button className="sp-group-edit-btn" onClick={onStartEdit}>
                        <Pencil size={13} /> Modifier
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Main page ───────────────────────────────────────────────

const SupplementsPage = () => {
    const [activeCategory, setActiveCategory] = useState<SupplementKind>('Meal');
    const [sets, setSets] = useState<SupplementSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [activeSetId, setActiveSetId] = useState<number | null>(null);
    const [confirmDeleteSet, setConfirmDeleteSet] = useState<SupplementSet | null>(null);

    const [addGroupModal, setAddGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupItems, setNewGroupItems] = useState<SupplementSetItem[]>([emptyItem(0)]);
    const [creatingGroup, setCreatingGroup] = useState(false);

    const [renamingGroupId, setRenamingGroupId] = useState<number | null>(null);
    const [renameValue, setRenameValue] = useState('');

    const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
    const [draftItems, setDraftItems] = useState<SupplementSetItem[]>([]);
    const [savingItems, setSavingItems] = useState(false);

    const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<{
        setId: number; groupId: number; name: string;
    } | null>(null);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    useEffect(() => { loadSets(); }, []);

    const loadSets = async () => {
        try {
            setLoading(true);
            const data = await supplementSetService.getAll();
            setSets(data);
        } catch {
            toast.error('Erreur lors du chargement des compléments');
        } finally {
            setLoading(false);
        }
    };

    const visibleSets = useMemo(() => {
        const filter = activeCategory === 'Meal' ? isMealTiming : isWorkoutTiming;
        return sets.filter(s => filter(s.timing)).sort((a, b) => {
            if (a.index !== b.index) return a.index - b.index;
            return (isPreTiming(a.timing) ? 0 : 1) - (isPreTiming(b.timing) ? 0 : 1);
        });
    }, [sets, activeCategory]);

    const activeSet = useMemo(
        () => visibleSets.find(s => s.supplementSetId === activeSetId) ?? visibleSets[0] ?? null,
        [visibleSets, activeSetId]
    );

    const allGroups = activeSet?.groups ?? [];
    const pageCount = Math.max(1, Math.ceil(allGroups.length / pageSize));
    const pagedGroups = allGroups.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => {
        if (visibleSets.length > 0 && !visibleSets.find(s => s.supplementSetId === activeSetId)) {
            setActiveSetId(visibleSets[0].supplementSetId);
        }
    }, [visibleSets]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setEditingGroupId(null);
        setDraftItems([]);
        setNewGroupName('');
        setRenamingGroupId(null);
        setPage(1);
    }, [activeSetId]);

    const updateSet = (updated: SupplementSet) =>
        setSets(prev => prev.map(s => s.supplementSetId === updated.supplementSetId ? updated : s));

    const handleAddSet = async () => {
        try {
            setAdding(true);
            const newSet = await supplementSetService.addNext(activeCategory);
            setSets(prev => [...prev, newSet]);
            setActiveSetId(newSet.supplementSetId);
            toast.success(`${shortTimingLabel(newSet.timing, newSet.index)} ajouté`);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Erreur lors de l\'ajout');
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteSet = async () => {
        if (!confirmDeleteSet) return;
        try {
            await supplementSetService.delete(confirmDeleteSet.supplementSetId);
            setSets(prev => prev.filter(s => s.supplementSetId !== confirmDeleteSet.supplementSetId));
            if (activeSetId === confirmDeleteSet.supplementSetId) setActiveSetId(null);
            toast.success('Tab supprimé');
        } catch {
            toast.error('Erreur lors de la suppression');
        } finally {
            setConfirmDeleteSet(null);
        }
    };

    const handleAddGroup = async () => {
        if (!activeSet || !newGroupName.trim()) return;
        setCreatingGroup(true);
        try {
            const updated = await supplementSetService.addGroup(activeSet.supplementSetId, newGroupName.trim());
            const newGroup = [...updated.groups].sort((a, b) => b.orderIndex - a.orderIndex)[0];
            const cleanedItems = newGroupItems
                .filter(i => i.name.trim())
                .map((i, idx) => ({ ...i, name: i.name.trim(), unit: (i.unit || 'g').trim(), orderIndex: idx }));
            if (cleanedItems.length > 0 && newGroup?.supplementGroupId) {
                const final = await supplementSetService.updateGroupItems(
                    activeSet.supplementSetId, newGroup.supplementGroupId, cleanedItems
                );
                updateSet(final);
            } else {
                updateSet(updated);
            }
            setAddGroupModal(false);
            setNewGroupName('');
            setNewGroupItems([emptyItem(0)]);
            toast.success('Élément créé');
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Erreur');
        } finally {
            setCreatingGroup(false);
        }
    };

    const handleRenameGroup = async (groupId: number) => {
        if (!activeSet || !renameValue.trim()) { setRenamingGroupId(null); return; }
        try {
            const updated = await supplementSetService.renameGroup(activeSet.supplementSetId, groupId, renameValue.trim());
            updateSet(updated);
        } catch {
            toast.error('Erreur lors du renommage');
        } finally {
            setRenamingGroupId(null);
        }
    };

    const handleDeleteGroup = async () => {
        if (!confirmDeleteGroup) return;
        try {
            await supplementSetService.deleteGroup(confirmDeleteGroup.setId, confirmDeleteGroup.groupId);
            setSets(prev => prev.map(s => {
                if (s.supplementSetId !== confirmDeleteGroup.setId) return s;
                return { ...s, groups: s.groups.filter(g => g.supplementGroupId !== confirmDeleteGroup.groupId) };
            }));
            if (editingGroupId === confirmDeleteGroup.groupId) { setEditingGroupId(null); setDraftItems([]); }
            toast.success('Élément supprimé');
        } catch {
            toast.error('Erreur lors de la suppression');
        } finally {
            setConfirmDeleteGroup(null);
        }
    };

    const handleSaveGroupItems = async () => {
        if (!activeSet || editingGroupId === null) return;
        const cleaned = draftItems
            .filter(i => i.name.trim())
            .map((i, idx) => ({ ...i, name: i.name.trim(), unit: (i.unit || 'g').trim(), orderIndex: idx }));
        for (const item of cleaned) {
            if (!isStandardUnit(item.unit) && item.unit.length > CUSTOM_UNIT_MAX) {
                toast.error(`Unité max ${CUSTOM_UNIT_MAX} caractères`); return;
            }
        }
        try {
            setSavingItems(true);
            const updated = await supplementSetService.updateGroupItems(activeSet.supplementSetId, editingGroupId, cleaned);
            updateSet(updated);
            setEditingGroupId(null);
            setDraftItems([]);
            toast.success('Sauvegardé');
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSavingItems(false);
        }
    };

    const closeAddGroupModal = () => {
        setAddGroupModal(false);
        setNewGroupName('');
        setNewGroupItems([emptyItem(0)]);
    };

    return (
        <MainLayout>
            <div className="sp-page">
                {/* Header */}
                <div className="sp-header">
                    <div>
                        <h1>Compléments</h1>
                        <p>Organisez vos compléments alimentaires par timing.</p>
                    </div>
                    <button className="sp-btn-primary" onClick={handleAddSet} disabled={adding}>
                        <Plus size={16} />
                        {adding ? 'Ajout…' : 'Ajouter un tab'}
                    </button>
                </div>

                {/* Category pills */}
                <div className="sp-cat-tabs">
                    {(['Meal', 'Workout'] as SupplementKind[]).map(cat => (
                        <button
                            key={cat}
                            className={`sp-cat-tab ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat === 'Meal' ? 'Repas' : 'Workout'}
                            <span className="sp-tab-count">
                                {sets.filter(s => (cat === 'Meal' ? isMealTiming : isWorkoutTiming)(s.timing)).length}
                            </span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="sp-loading"><div className="sp-spinner" /><p>Chargement…</p></div>
                ) : (
                    <>
                        {/* Pre/Post set tab bar */}
                        {visibleSets.length > 0 && (
                            <div className="sp-set-tabs">
                                {visibleSets.map(set => (
                                    <button
                                        key={set.supplementSetId}
                                        className={`sp-set-tab ${isPreTiming(set.timing) ? 'sp-set-tab--pre' : 'sp-set-tab--post'} ${set.supplementSetId === activeSet?.supplementSetId ? 'active' : ''}`}
                                        onClick={() => setActiveSetId(set.supplementSetId)}
                                    >
                                        <span>{shortTimingLabel(set.timing, set.index)}</span>
                                        <span
                                            className="sp-set-tab-x"
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteSet(set); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setConfirmDeleteSet(set); } }}
                                        >
                                            <X size={11} />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {!activeSet ? (
                            <div className="sp-empty">
                                <p>Aucun tab. Cliquez sur "Ajouter un tab" pour commencer.</p>
                            </div>
                        ) : (
                            <div className="sp-groups-area">
                                {allGroups.length === 0 && (
                                    <div className="sp-empty-groups">
                                        <p>Aucun élément dans ce tab.</p>
                                    </div>
                                )}

                                {pagedGroups.length > 0 && (
                                    <div className="sp-group-grid">
                                        {pagedGroups.map(group => (
                                            <GroupCard
                                                key={group.supplementGroupId}
                                                group={group}
                                                colorIndex={group.orderIndex}
                                                isEditing={editingGroupId === group.supplementGroupId}
                                                draftItems={editingGroupId === group.supplementGroupId ? draftItems : group.items}
                                                savingItems={savingItems}
                                                onStartEdit={() => {
                                                    setEditingGroupId(group.supplementGroupId!);
                                                    setDraftItems(
                                                        group.items.length === 0
                                                            ? [emptyItem(0)]
                                                            : group.items.map((i, idx) => ({ ...i, orderIndex: idx }))
                                                    );
                                                }}
                                                onCancelEdit={() => { setEditingGroupId(null); setDraftItems([]); }}
                                                onSaveItems={handleSaveGroupItems}
                                                onDraftChange={setDraftItems}
                                                isRenaming={renamingGroupId === group.supplementGroupId}
                                                renameValue={renameValue}
                                                onRenameChange={setRenameValue}
                                                onRenameSubmit={() => handleRenameGroup(group.supplementGroupId!)}
                                                onRenameCancel={() => setRenamingGroupId(null)}
                                                onStartRename={() => { setRenamingGroupId(group.supplementGroupId!); setRenameValue(group.name); }}
                                                onDelete={() => setConfirmDeleteGroup({
                                                    setId: activeSet.supplementSetId,
                                                    groupId: group.supplementGroupId!,
                                                    name: group.name,
                                                })}
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="sp-add-group-row">
                                    <button className="sp-btn-add-group" onClick={() => setAddGroupModal(true)}>
                                        <Plus size={15} /> Ajouter un élément
                                    </button>
                                </div>

                                {allGroups.length > pageSize && (
                                    <Pagination
                                        page={page}
                                        pageCount={pageCount}
                                        pageSize={pageSize}
                                        totalItems={allGroups.length}
                                        onPageChange={setPage}
                                        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
                                        pageSizeOptions={[6, 12, 24]}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add group modal */}
            {addGroupModal && (
                <div className="sp-modal-overlay" onClick={closeAddGroupModal}>
                    <div className="sp-add-group-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sp-modal-head">
                            <h2>Nouvel élément</h2>
                            <button className="sp-close" onClick={closeAddGroupModal}><X size={20} /></button>
                        </div>
                        <div className="sp-modal-body">
                            <div className="sp-field-group">
                                <label className="sp-field-label">Nom de l'élément</label>
                                <input
                                    className="sp-field-input"
                                    placeholder="Ex: Vitamines, Protéines…"
                                    value={newGroupName}
                                    autoFocus
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Escape') closeAddGroupModal(); }}
                                />
                            </div>
                            <div className="sp-field-group">
                                <label className="sp-field-label">Suppléments</label>
                                <div className="sp-rows-head">
                                    <span>Nom</span><span>Qté</span><span>Unité</span><span />
                                </div>
                                {newGroupItems.map((item, idx) => (
                                    <div className="sp-row" key={idx}>
                                        <input type="text" placeholder="Ex: Vitamine D3" value={item.name}
                                            onChange={(e) => { const n = [...newGroupItems]; n[idx] = { ...n[idx], name: e.target.value }; setNewGroupItems(n); }} />
                                        <input type="number" step="any" placeholder="0" value={item.quantity || ''}
                                            onChange={(e) => { const n = [...newGroupItems]; n[idx] = { ...n[idx], quantity: parseFloat(e.target.value) || 0 }; setNewGroupItems(n); }} />
                                        <UnitSelect value={item.unit} onChange={(unit) => { const n = [...newGroupItems]; n[idx] = { ...n[idx], unit }; setNewGroupItems(n); }} />
                                        <button className="sp-row-del" onClick={() => setNewGroupItems(prev => prev.filter((_, i) => i !== idx))}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button className="sp-btn-add-row" onClick={() => setNewGroupItems(prev => [...prev, emptyItem(prev.length)])}>
                                    <Plus size={13} /> Ajouter un supplément
                                </button>
                            </div>
                        </div>
                        <div className="sp-modal-foot">
                            <button className="sp-btn-secondary" onClick={closeAddGroupModal}>Annuler</button>
                            <button className="sp-btn-primary" onClick={handleAddGroup} disabled={creatingGroup || !newGroupName.trim()}>
                                <Check size={14} />{creatingGroup ? 'Création…' : 'Créer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm delete set */}
            {confirmDeleteSet && (
                <div className="sp-modal-overlay" onClick={() => setConfirmDeleteSet(null)}>
                    <div className="sp-confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="sp-confirm-icon"><Trash2 size={30} /></div>
                        <h3>Supprimer "{shortTimingLabel(confirmDeleteSet.timing, confirmDeleteSet.index)}" ?</h3>
                        <p>Tous les éléments et suppléments de ce tab seront supprimés.</p>
                        <div className="sp-confirm-actions">
                            <button className="sp-btn-secondary" onClick={() => setConfirmDeleteSet(null)}>Annuler</button>
                            <button className="sp-btn-danger" onClick={handleDeleteSet}><Trash2 size={14} /> Supprimer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm delete group */}
            {confirmDeleteGroup && (
                <div className="sp-modal-overlay" onClick={() => setConfirmDeleteGroup(null)}>
                    <div className="sp-confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="sp-confirm-icon"><Trash2 size={30} /></div>
                        <h3>Supprimer "{confirmDeleteGroup.name}" ?</h3>
                        <p>Tous les suppléments de cet élément seront supprimés.</p>
                        <div className="sp-confirm-actions">
                            <button className="sp-btn-secondary" onClick={() => setConfirmDeleteGroup(null)}>Annuler</button>
                            <button className="sp-btn-danger" onClick={handleDeleteGroup}><Trash2 size={14} /> Supprimer</button>
                        </div>
                    </div>
                </div>
            )}

            <Toaster />
        </MainLayout>
    );
};

export default SupplementsPage;
