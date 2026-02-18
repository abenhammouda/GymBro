import { useState, useEffect } from 'react';
import { Plus, X, UtensilsCrossed, Trash2 } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { mealTabService } from '../services/mealTab.service';
import { mealService } from '../services/meal.service';
import type { MealTab, Meal, CreateMealRequest, UpdateMealRequest, MealIngredient } from '../types';
import toast, { Toaster } from 'react-hot-toast';
import './MealsPage.css';

const MealsPage = () => {
    const [tabs, setTabs] = useState<MealTab[]>([]);
    const [activeTabId, setActiveTabId] = useState<number | null>(null);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
    const [deleteConfirmTab, setDeleteConfirmTab] = useState<MealTab | null>(null);
    const [deleteConfirmMeal, setDeleteConfirmMeal] = useState<Meal | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [aliments, setAliments] = useState<MealIngredient[]>([]);
    const [complements, setComplements] = useState<MealIngredient[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        loadTabs();
    }, []);

    useEffect(() => {
        if (activeTabId) {
            loadMeals(activeTabId);
        }
    }, [activeTabId]);

    const loadTabs = async () => {
        try {
            setLoading(true);
            const data = await mealTabService.getAllTabs();
            setTabs(data);
            if (data.length > 0 && !activeTabId) {
                setActiveTabId(data[0].mealTabId);
            }
        } catch (error) {
            console.error('Error loading tabs:', error);
            toast.error('Erreur lors du chargement des tabs');
        } finally {
            setLoading(false);
        }
    };

    const loadMeals = async (tabId: number) => {
        try {
            const data = await mealService.getMealsByTab(tabId);
            setMeals(data);
        } catch (error) {
            console.error('Error loading meals:', error);
            toast.error('Erreur lors du chargement des repas');
        }
    };

    const handleAddTab = async () => {
        try {
            const newOrderIndex = tabs.length;
            const tabNames = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
            const newTab = await mealTabService.createTab({
                name: tabNames[newOrderIndex] || `${newOrderIndex + 1}th`,
                orderIndex: newOrderIndex
            });
            setTabs([...tabs, newTab]);
            setActiveTabId(newTab.mealTabId);
            toast.success('Tab créé avec succès');
        } catch (error) {
            console.error('Error creating tab:', error);
            toast.error('Erreur lors de la création du tab');
        }
    };

    const handleDeleteTab = async () => {
        if (!deleteConfirmTab) return;

        // Vérifier si le tab contient des repas
        if (deleteConfirmTab.mealCount > 0) {
            toast.error(`Impossible de supprimer ce tab : il contient ${deleteConfirmTab.mealCount} repas. Veuillez d'abord supprimer tous les repas.`);
            setDeleteConfirmTab(null);
            return;
        }

        try {
            await mealTabService.deleteTab(deleteConfirmTab.mealTabId);
            const newTabs = tabs.filter(t => t.mealTabId !== deleteConfirmTab.mealTabId);
            setTabs(newTabs);
            if (activeTabId === deleteConfirmTab.mealTabId && newTabs.length > 0) {
                setActiveTabId(newTabs[0].mealTabId);
            }
            toast.success('Tab supprimé avec succès');
            setDeleteConfirmTab(null);
        } catch (error) {
            console.error('Error deleting tab:', error);
            toast.error('Erreur lors de la suppression du tab');
            setDeleteConfirmTab(null);
        }
    };

    const handleOpenModal = (meal?: Meal) => {
        if (meal) {
            setEditingMeal(meal);
            setFormData({
                name: meal.name,
                description: meal.description || ''
            });
            setAliments(meal.ingredients.filter(i => i.type === 'Aliment'));
            setComplements(meal.ingredients.filter(i => i.type === 'Complement'));
        } else {
            setEditingMeal(null);
            setFormData({
                name: '',
                description: ''
            });
            setAliments([]);
            setComplements([]);
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMeal(null);
        setFormData({
            name: '',
            description: ''
        });
        setAliments([]);
        setComplements([]);
        setImageFile(null);
    };

    const handleAddAliment = () => {
        setAliments([...aliments, { name: '', quantityGrams: 0, type: 'Aliment', orderIndex: aliments.length }]);
    };

    const handleRemoveAliment = (index: number) => {
        setAliments(aliments.filter((_, i) => i !== index));
    };

    const handleUpdateAliment = (index: number, field: 'name' | 'quantityGrams', value: string | number) => {
        const updated = [...aliments];
        updated[index] = { ...updated[index], [field]: value };
        setAliments(updated);
    };

    const handleAddComplement = () => {
        setComplements([...complements, { name: '', quantityGrams: 0, type: 'Complement', orderIndex: complements.length }]);
    };

    const handleRemoveComplement = (index: number) => {
        setComplements(complements.filter((_, i) => i !== index));
    };

    const handleUpdateComplement = (index: number, field: 'name' | 'quantityGrams', value: string | number) => {
        const updated = [...complements];
        updated[index] = { ...updated[index], [field]: value };
        setComplements(updated);
    };

    const handleSaveMeal = async () => {
        if (!formData.name.trim()) {
            toast.error('Le nom du repas est requis');
            return;
        }

        if (!activeTabId) {
            toast.error('Aucun tab sélectionné');
            return;
        }

        // Combine aliments and complements with proper order indices
        const allIngredients: MealIngredient[] = [
            ...aliments.map((a, i) => ({ ...a, orderIndex: i })),
            ...complements.map((c, i) => ({ ...c, orderIndex: i }))
        ];

        try {
            if (editingMeal) {
                const updateData: UpdateMealRequest = {
                    name: formData.name,
                    description: formData.description || undefined,
                    ingredients: allIngredients
                };
                await mealService.updateMeal(editingMeal.mealId, updateData, imageFile || undefined);
                toast.success('Repas modifié avec succès');
            } else {
                const createData: CreateMealRequest = {
                    mealTabId: activeTabId,
                    name: formData.name,
                    description: formData.description || undefined,
                    ingredients: allIngredients,
                    orderIndex: meals.length
                };
                await mealService.createMeal(createData, imageFile || undefined);
                toast.success('Repas créé avec succès');
            }
            loadMeals(activeTabId);
            loadTabs(); // Reload tabs to update mealCount
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
            if (activeTabId) {
                loadMeals(activeTabId);
                loadTabs(); // Reload tabs to update mealCount
            }
            toast.success('Repas supprimé avec succès');
            setDeleteConfirmMeal(null);
        } catch (error) {
            console.error('Error deleting meal:', error);
            toast.error('Erreur lors de la suppression du repas');
            setDeleteConfirmMeal(null);
        }
    };

    return (
        <MainLayout>
            <div className="meals-page">
                <div className="page-header">
                    <div className="header-content">
                        <h1>Meals</h1>
                        <p>Gérez vos repas par catégories</p>
                    </div>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Nouveau Repas
                    </button>
                </div>

                <div className="tabs-section">
                    <div className="tabs-container">
                        {tabs.map(tab => (
                            <div
                                key={tab.mealTabId}
                                className={`tab ${activeTabId === tab.mealTabId ? 'active' : ''}`}
                                onClick={() => setActiveTabId(tab.mealTabId)}
                            >
                                <span>{tab.name}</span>
                                <span className="meal-count">{tab.mealCount}</span>
                                {tab.orderIndex >= 3 && (
                                    <button
                                        className="delete-tab-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirmTab(tab);
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button className="add-tab-btn" onClick={handleAddTab}>
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Chargement des repas...</p>
                    </div>
                ) : meals.length === 0 ? (
                    <div className="empty-state">
                        <UtensilsCrossed size={64} />
                        <h3>Aucun repas trouvé</h3>
                        <p>Créez votre premier repas pour commencer</p>
                        <button className="btn-primary" onClick={() => handleOpenModal()}>
                            <Plus size={20} />
                            Créer un Repas
                        </button>
                    </div>
                ) : (
                    <div className="meals-grid">
                        {meals.map(meal => (
                            <div key={meal.mealId} className="meal-card">
                                <div
                                    className="meal-image"
                                    style={{
                                        backgroundImage: meal.imageUrl
                                            ? `url(${meal.imageUrl.startsWith('http') ? meal.imageUrl : `${import.meta.env.VITE_API_URL}${meal.imageUrl}`})`
                                            : undefined
                                    }}
                                >
                                    {!meal.imageUrl && <div className="default-meal-icon"><UtensilsCrossed size={48} /></div>}
                                    <button
                                        className="delete-meal-btn"
                                        onClick={() => setDeleteConfirmMeal(meal)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="meal-content">
                                    <h3>{meal.name}</h3>
                                    {meal.description && <p className="meal-description">{meal.description}</p>}

                                    {meal.ingredients.length > 0 && (
                                        <div className="meal-ingredients">
                                            {meal.ingredients.filter(i => i.type === 'Aliment').length > 0 && (
                                                <div className="ingredient-section">
                                                    <h4>Aliments</h4>
                                                    {meal.ingredients
                                                        .filter(i => i.type === 'Aliment')
                                                        .map((ing, idx) => (
                                                            <div key={idx} className="ingredient-item">
                                                                <span>{ing.name}</span>
                                                                <span>{ing.quantityGrams}g</span>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                            {meal.ingredients.filter(i => i.type === 'Complement').length > 0 && (
                                                <div className="ingredient-section">
                                                    <h4>Compléments</h4>
                                                    {meal.ingredients
                                                        .filter(i => i.type === 'Complement')
                                                        .map((ing, idx) => (
                                                            <div key={idx} className="ingredient-item">
                                                                <span>{ing.name}</span>
                                                                <span>{ing.quantityGrams}g</span>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        className="btn-secondary"
                                        onClick={() => handleOpenModal(meal)}
                                    >
                                        Modifier
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isModalOpen && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingMeal ? 'Modifier le Repas' : 'Nouveau Repas'}</h2>
                                <button className="close-btn" onClick={handleCloseModal}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="modal-body">
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

                                {/* Aliments Section */}
                                <div className="ingredients-section">
                                    <div className="section-header">
                                        <h3>Aliments</h3>
                                        <button type="button" className="btn-add-ingredient" onClick={handleAddAliment}>
                                            <Plus size={16} />
                                            Ajouter un aliment
                                        </button>
                                    </div>
                                    {aliments.map((aliment, index) => (
                                        <div key={index} className="ingredient-row">
                                            <input
                                                type="text"
                                                placeholder="Nom"
                                                value={aliment.name}
                                                onChange={(e) => handleUpdateAliment(index, 'name', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Quantité (g)"
                                                value={aliment.quantityGrams || ''}
                                                onChange={(e) => handleUpdateAliment(index, 'quantityGrams', parseFloat(e.target.value) || 0)}
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-ingredient"
                                                onClick={() => handleRemoveAliment(index)}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Compléments Section */}
                                <div className="ingredients-section">
                                    <div className="section-header">
                                        <h3>Compléments</h3>
                                        <button type="button" className="btn-add-ingredient" onClick={handleAddComplement}>
                                            <Plus size={16} />
                                            Ajouter un complément
                                        </button>
                                    </div>
                                    {complements.map((complement, index) => (
                                        <div key={index} className="ingredient-row">
                                            <input
                                                type="text"
                                                placeholder="Nom"
                                                value={complement.name}
                                                onChange={(e) => handleUpdateComplement(index, 'name', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Quantité (g)"
                                                value={complement.quantityGrams || ''}
                                                onChange={(e) => handleUpdateComplement(index, 'quantityGrams', parseFloat(e.target.value) || 0)}
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-ingredient"
                                                onClick={() => handleRemoveComplement(index)}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-group">
                                    <label>Image du repas</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={handleCloseModal}>
                                    Annuler
                                </button>
                                <button className="btn-primary" onClick={handleSaveMeal}>
                                    {editingMeal ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {deleteConfirmTab && (
                    <div className="modal-overlay" onClick={() => setDeleteConfirmTab(null)}>
                        <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="delete-icon-wrapper">
                                <Trash2 size={48} />
                            </div>
                            <h3>Supprimer le tab "{deleteConfirmTab.name}" ?</h3>
                            <p>Cette action supprimera définitivement ce tab et tous les {deleteConfirmTab.mealCount} repas qu'il contient.</p>
                            <div className="delete-confirm-actions">
                                <button
                                    className="btn-cancel"
                                    onClick={() => setDeleteConfirmTab(null)}
                                >
                                    Annuler
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={handleDeleteTab}
                                >
                                    <Trash2 size={18} />
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {deleteConfirmMeal && (
                    <div className="modal-overlay" onClick={() => setDeleteConfirmMeal(null)}>
                        <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="delete-icon-wrapper">
                                <Trash2 size={48} />
                            </div>
                            <h3>Supprimer "{deleteConfirmMeal.name}" ?</h3>
                            <p>Cette action supprimera définitivement ce repas. Cette action est irréversible.</p>
                            <div className="delete-confirm-actions">
                                <button
                                    className="btn-cancel"
                                    onClick={() => setDeleteConfirmMeal(null)}
                                >
                                    Annuler
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={handleDeleteMeal}
                                >
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
