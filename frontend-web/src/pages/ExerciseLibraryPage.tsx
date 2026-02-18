import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import ChatPopup from '../components/ChatPopup';
import ExerciseTemplateModal from '../components/ExerciseTemplateModal';
import ExerciseViewerModal from '../components/ExerciseViewerModal';
import exerciseTemplateService from '../services/exerciseTemplate.service';
import type { ExerciseTemplate, ExerciseCategory } from '../types';
import './ExerciseLibraryPage.css';

const ExerciseLibraryPage: React.FC = () => {
    const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<ExerciseTemplate[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<ExerciseTemplate | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewedExercise, setViewedExercise] = useState<ExerciseTemplate | null>(null);
    const [playingExerciseId, setPlayingExerciseId] = useState<number | null>(null);

    useEffect(() => {
        loadExercises();
    }, []);

    useEffect(() => {
        filterExercises();
    }, [selectedCategory, searchQuery, exercises]);

    const loadExercises = async () => {
        try {
            setIsLoading(true);
            const data = await exerciseTemplateService.getExerciseTemplates();
            setExercises(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load exercises');
        } finally {
            setIsLoading(false);
        }
    };

    const filterExercises = () => {
        let filtered = exercises;

        // Filter by category
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(ex => {
                // Check if it matches the primary category
                if (ex.category === selectedCategory) return true;
                // Check if it matches the secondary category (Upper Body or Lower Body)
                if (ex.category2 === selectedCategory.replace(' ', '')) return true;
                return false;
            });
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(ex =>
                ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ex.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredExercises(filtered);
    };

    const formatDuration = (seconds: number): string => {
        if (seconds < 60) return `${seconds} sec`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes} min`;
    };

    const getCategoryBadgeClass = (category: ExerciseCategory): string => {
        const categoryMap: Record<string, string> = {
            'Pectoraux': 'pectoraux',
            'Épaules': 'epaules',
            'Dos': 'dos',
            'Jambes': 'jambes',
            'Core': 'core',
            'Cardio': 'cardio',
            'Flexibility': 'flexibility',
            'Other': 'other'
        };
        return categoryMap[category] || 'other';
    };

    const handleOpenModal = (exercise?: ExerciseTemplate) => {
        setSelectedExercise(exercise || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedExercise(null);
    };

    const handleSaveExercise = async (exerciseData: Partial<ExerciseTemplate>, videoFile?: File) => {
        try {
            if (selectedExercise) {
                // Update existing exercise
                await exerciseTemplateService.updateExerciseTemplate(
                    selectedExercise.exerciseTemplateId,
                    exerciseData as any,
                    videoFile
                );
            } else {
                // Create new exercise
                await exerciseTemplateService.createExerciseTemplate(
                    exerciseData as any,
                    videoFile
                );
            }
            // Reload exercises
            await loadExercises();
            handleCloseModal();
        } catch (err: any) {
            console.error('Error saving exercise:', err);
            throw err;
        }
    };

    const handleViewExercise = (exercise: ExerciseTemplate) => {
        setViewedExercise(exercise);
        setIsViewerOpen(true);
    };

    const handleCloseViewer = () => {
        setIsViewerOpen(false);
        setViewedExercise(null);
    };

    const getYouTubeEmbedUrl = (url: string): string | null => {
        if (!url) return null;

        // Extract video ID from various YouTube URL formats including Shorts
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);

        if (match && match[2].length === 11) {
            // Return embed URL
            return `https://www.youtube.com/embed/${match[2]}`;
        }

        return null;
    };

    const getYouTubeVideoId = (url: string): string | null => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return match[2];
        }
        return null;
    };

    const getYouTubeThumbnail = (url: string): string | null => {
        const videoId = getYouTubeVideoId(url);
        if (videoId) {
            // Use maxresdefault for best quality, fallback to hqdefault if needed
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
        return null;
    };

    return (
        <MainLayout>
            <div className="exercise-library-page">
                <div className="page-header">
                    <h1>Exercise Library</h1>
                    <button className="btn-add-exercise" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Add Exercise
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="filters-section">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search exercises..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="category-filters">
                        {/* First row: General categories */}
                        <div className="category-row">
                            {['All', 'Upper Body', 'Lower Body', 'Legs'].map(category => (
                                <button
                                    key={category}
                                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Second row: Specific muscle groups */}
                        <div className="category-row">
                            {['Pectoraux', 'Épaules', 'Dos', 'Core', 'Cardio', 'Flexibility', 'Other'].map(category => (
                                <button
                                    key={category}
                                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Exercise Grid */}
                {isLoading ? (
                    <div className="loading">Loading exercises...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : filteredExercises.length === 0 ? (
                    <div className="empty-state">
                        <p>No exercises found</p>
                        <button className="btn-add-exercise" onClick={() => handleOpenModal()}>
                            <Plus size={20} />
                            Add Your First Exercise
                        </button>
                    </div>
                ) : (
                    <div className="exercise-grid">
                        {filteredExercises.map(exercise => (
                            <div
                                key={exercise.exerciseTemplateId}
                                className="exercise-card"
                            >
                                <div className="exercise-thumbnail">
                                    {(() => {
                                        if (!exercise.videoUrl) {
                                            return (
                                                <div className="no-video-placeholder">
                                                    <span>No Video</span>
                                                </div>
                                            );
                                        }

                                        // Check if this exercise is currently playing
                                        const isPlaying = playingExerciseId === exercise.exerciseTemplateId;

                                        if (isPlaying) {
                                            // Show inline video player
                                            const youtubeEmbedUrl = getYouTubeEmbedUrl(exercise.videoUrl);

                                            if (youtubeEmbedUrl) {
                                                return (
                                                    <iframe
                                                        src={`${youtubeEmbedUrl}?autoplay=1`}
                                                        title={exercise.name}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="youtube-embed"
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <video
                                                        src={`${import.meta.env.VITE_API_URL}${exercise.videoUrl}`}
                                                        controls
                                                        autoPlay
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                );
                                            }
                                        }


                                        // Show custom thumbnail
                                        const youtubeThumbnail = getYouTubeThumbnail(exercise.videoUrl);
                                        return (
                                            <div
                                                className="video-thumbnail-custom"
                                                style={{ cursor: 'pointer', backgroundImage: youtubeThumbnail ? `url(${youtubeThumbnail})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                            >
                                                <div className="thumbnail-letter">
                                                    {exercise.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div
                                                    className="play-overlay"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPlayingExerciseId(exercise.exerciseTemplateId);
                                                    }}
                                                >
                                                    <div className="play-icon">▶</div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Edit Button */}
                                <button
                                    className="edit-exercise-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModal(exercise);
                                    }}
                                    title="Modifier l'exercice"
                                >
                                    <Pencil size={16} />
                                </button>

                                <div className="exercise-info">
                                    <h3>{exercise.name}</h3>
                                    <div className="exercise-meta">
                                        <span className={`category-badge ${getCategoryBadgeClass(exercise.category)}`}>
                                            {exercise.category.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        {exercise.duration && exercise.duration > 0 && (
                                            <span className="duration">{formatDuration(exercise.duration)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Exercise Template Modal */}
            <ExerciseTemplateModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveExercise}
                exercise={selectedExercise}
            />

            {/* Exercise Viewer Modal */}
            <ExerciseViewerModal
                isOpen={isViewerOpen}
                onClose={handleCloseViewer}
                exercise={viewedExercise}
            />

            {/* Chat Popup */}
            <ChatPopup />
        </MainLayout>
    );
};

export default ExerciseLibraryPage;
