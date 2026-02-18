import React from 'react';
import Modal from './ui/Modal';
import type { ExerciseTemplate } from '../types';
import './ExerciseViewerModal.css';

interface ExerciseViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    exercise: ExerciseTemplate | null;
}

const ExerciseViewerModal: React.FC<ExerciseViewerModalProps> = ({ isOpen, onClose, exercise }) => {
    if (!exercise) return null;

    const getYouTubeEmbedUrl = (url: string): string | null => {
        if (!url) return null;

        // Extract video ID from various YouTube URL formats including Shorts
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);

        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }

        return null;
    };

    const embedUrl = exercise.videoUrl ? getYouTubeEmbedUrl(exercise.videoUrl) : null;

    const getCategoryLabel = (category: string): string => {
        const categoryMap: Record<string, string> = {
            'UpperBody': 'Haut du corps',
            'LowerBody': 'Bas du corps',
            'Core': 'Abdominaux',
            'Cardio': 'Cardio',
            'Flexibility': 'Flexibilité',
            'Other': 'Autre'
        };
        return categoryMap[category] || category;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={exercise.name}
            size="large"
        >
            <div className="exercise-viewer">
                {/* Video Section */}
                {embedUrl ? (
                    <div className="video-container">
                        <iframe
                            src={embedUrl}
                            title={exercise.name}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : exercise.videoUrl && exercise.videoUrl.startsWith('/') ? (
                    <div className="video-container">
                        <video
                            src={`${import.meta.env.VITE_API_URL}${exercise.videoUrl}`}
                            controls
                            poster={exercise.thumbnailUrl ? `${import.meta.env.VITE_API_URL}${exercise.thumbnailUrl}` : undefined}
                        />
                    </div>
                ) : (
                    <div className="no-video-message">
                        <p>Aucune vidéo disponible pour cet exercice</p>
                    </div>
                )}

                {/* Exercise Details */}
                <div className="exercise-details">
                    <div className="detail-row">
                        <span className="detail-label">Catégorie :</span>
                        <span className="detail-value category-badge">
                            {getCategoryLabel(exercise.category)}
                        </span>
                    </div>

                    {exercise.equipment && (
                        <div className="detail-row">
                            <span className="detail-label">Équipement :</span>
                            <span className="detail-value">{exercise.equipment}</span>
                        </div>
                    )}

                    {exercise.description && (
                        <div className="detail-section">
                            <h4>Description</h4>
                            <p>{exercise.description}</p>
                        </div>
                    )}

                    {exercise.instructions && (
                        <div className="detail-section">
                            <h4>Instructions</h4>
                            <p className="instructions-text">{exercise.instructions}</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ExerciseViewerModal;
