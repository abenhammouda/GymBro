import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import Modal from './ui/Modal';
import type { ExerciseTemplate, ExerciseCategory } from '../types';
import './ExerciseTemplateModal.css';

interface ExerciseTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (exercise: Partial<ExerciseTemplate>, videoFile?: File) => Promise<void>;
    exercise?: ExerciseTemplate | null;
}

const ExerciseTemplateModal: React.FC<ExerciseTemplateModalProps> = ({
    isOpen,
    onClose,
    onSave,
    exercise
}) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Pectoraux' as ExerciseCategory,
        description: '',
        equipment: '',
        instructions: '',
        mediaType: 'url' as 'url' | 'upload',
        videoUrl: '',
    });

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (exercise) {
            setFormData({
                name: exercise.name,
                category: exercise.category,
                description: exercise.description || '',
                equipment: exercise.equipment || '',
                instructions: exercise.instructions || '',
                mediaType: 'url',
                videoUrl: exercise.videoUrl || '',
            });
            if (exercise.videoUrl) {
                setVideoPreview(`${import.meta.env.VITE_API_URL}${exercise.videoUrl}`);
            }
        } else {
            resetForm();
        }
    }, [exercise, isOpen]);

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Pectoraux',
            description: '',
            equipment: '',
            instructions: '',
            mediaType: 'url',
            videoUrl: '',
        });
        setVideoFile(null);
        setVideoPreview('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const exerciseData: Partial<ExerciseTemplate> = {
                name: formData.name,
                category: formData.category,
            };

            // Only add optional fields if they have values
            if (formData.description) exerciseData.description = formData.description;
            if (formData.equipment) exerciseData.equipment = formData.equipment;
            if (formData.instructions) exerciseData.instructions = formData.instructions;

            // Add videoUrl if using URL mode and no file is uploaded
            if (formData.mediaType === 'url' && formData.videoUrl && !videoFile) {
                exerciseData.videoUrl = formData.videoUrl;
            }

            await onSave(exerciseData, videoFile || undefined);
            resetForm();
            onClose();
        } catch (error) {
            console.error('Error saving exercise:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={exercise ? 'Modifier l\'exercice' : 'Ajouter un exercice'}
            size="medium"
        >
            <form onSubmit={handleSubmit} className="exercise-form">
                {/* Informations générales */}
                <section className="form-section">
                    <h3 className="section-title">Informations générales</h3>

                    <div className="form-group">
                        <label htmlFor="name">
                            Nom de l'exercice <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Bench Press"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Groupe musculaire</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                        >
                            <option value="Pectoraux">Pectoraux</option>
                            <option value="Épaules">Épaules</option>
                            <option value="Dos">Dos</option>
                            <option value="Jambes">Jambes</option>
                            <option value="Core">Core</option>
                            <option value="Cardio">Cardio</option>
                            <option value="Flexibility">Flexibilité</option>
                            <option value="Other">Autre</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">
                            Description <span className="optional">(optionnel)</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Conseils d'exécution visibles par l'adhérent"
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="equipment">
                            Équipement <span className="optional">(optionnel)</span>
                        </label>
                        <input
                            type="text"
                            id="equipment"
                            name="equipment"
                            value={formData.equipment}
                            onChange={handleInputChange}
                            placeholder="Ex : Barre, haltères, banc"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="instructions">
                            Instructions <span className="optional">(optionnel)</span>
                        </label>
                        <textarea
                            id="instructions"
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleInputChange}
                            placeholder="Instructions détaillées pour l'exercice"
                            rows={3}
                        />
                    </div>
                </section>

                {/* Média */}
                <section className="form-section">
                    <h3 className="section-title">Média</h3>

                    <div className="media-type-selector">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="mediaType"
                                value="url"
                                checked={formData.mediaType === 'url'}
                                onChange={handleInputChange}
                            />
                            <span>Lien URL</span>
                        </label>

                        <label className="radio-label">
                            <input
                                type="radio"
                                name="mediaType"
                                value="upload"
                                checked={formData.mediaType === 'upload'}
                                onChange={handleInputChange}
                            />
                            <span>Fichier upload</span>
                        </label>
                    </div>

                    {formData.mediaType === 'url' ? (
                        <div className="form-group">
                            <input
                                type="url"
                                name="videoUrl"
                                value={formData.videoUrl}
                                onChange={handleInputChange}
                                placeholder="https://www.youtube.com/watch?v=dksf-fyjee8"
                            />
                            <button type="button" className="btn-add-file">
                                <Upload size={16} />
                                Ajouter un fichier
                            </button>
                        </div>
                    ) : (
                        <div className="file-upload-area">
                            <input
                                type="file"
                                id="videoFile"
                                accept="video/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="videoFile" className="file-upload-label">
                                {videoPreview ? (
                                    <div className="video-preview">
                                        <video src={videoPreview} controls />
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <Upload size={32} />
                                        <p>Cliquez pour télécharger une vidéo</p>
                                    </div>
                                )}
                            </label>
                            <p className="upload-hint">
                                Vidéo : 2L vidéo alus. limités dek vidéo au hanement de l'exercice est optionel.
                            </p>
                        </div>
                    )}
                </section>

                {/* Actions */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={isSubmitting || !formData.name}
                    >
                        {isSubmitting ? 'Enregistrement...' : exercise ? 'Modifier l\'exercice' : 'Ajouter l\'exercice'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ExerciseTemplateModal;
