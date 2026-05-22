import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Sparkles, Clock } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import ChatPopup from '../components/ChatPopup';
import ExerciseTemplateModal from '../components/ExerciseTemplateModal';
import ExerciseViewerModal from '../components/ExerciseViewerModal';
import BulkAIImportModal from '../components/BulkAIImportModal';
import Pagination from '../components/common/Pagination';
import exerciseTemplateService from '../services/exerciseTemplate.service';
import type { ExerciseTemplate, ExerciseCategory } from '../types';
import './ExerciseLibraryPage.css';

// ─── Constants ───────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
    'Pectoraux':   { bg: '#fef3c7', fg: '#d97706' },
    'Épaules':     { bg: '#d1fae5', fg: '#059669' },
    'Dos':         { bg: '#dbeafe', fg: '#2563eb' },
    'Jambes':      { bg: '#ede9fe', fg: '#7c3aed' },
    'Core':        { bg: '#fce7f3', fg: '#db2777' },
    'Cardio':      { bg: '#fee2e2', fg: '#dc2626' },
    'Flexibility': { bg: '#ccfbf1', fg: '#0d9488' },
    'Other':       { bg: '#f3f4f6', fg: '#6b7280' },
};

const PRIMARY_FILTERS = ['All', 'Upper Body', 'Lower Body'];
const MUSCLE_FILTERS  = ['Pectoraux', 'Épaules', 'Dos', 'Jambes', 'Core', 'Cardio', 'Flexibility', 'Other'];

// ─── Helpers ─────────────────────────────────────────────────

const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds} sec`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m} min`;
};

const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const m = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/);
    return m && m[2].length === 11 ? m[2] : null;
};

const getYouTubeEmbedUrl = (url: string): string | null => {
    const id = getYouTubeVideoId(url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
};

const getYouTubeThumbnail = (url: string): string | null => {
    const id = getYouTubeVideoId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

// ─── Main component ──────────────────────────────────────────

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
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    useEffect(() => { loadExercises(); }, []);

    useEffect(() => { filterExercises(); }, [selectedCategory, searchQuery, exercises]);

    useEffect(() => { setPage(1); }, [selectedCategory, searchQuery]);

    const loadExercises = async () => {
        try {
            setIsLoading(true);
            const data = await exerciseTemplateService.getExerciseTemplates();
            setExercises(data);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement');
        } finally {
            setIsLoading(false);
        }
    };

    const filterExercises = () => {
        let filtered = exercises;
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(ex =>
                ex.category === selectedCategory ||
                ex.category2 === selectedCategory.replace(' ', '')
            );
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(ex =>
                ex.name.toLowerCase().includes(q) ||
                ex.description?.toLowerCase().includes(q)
            );
        }
        setFilteredExercises(filtered);
    };

    const handleOpenModal = (exercise?: ExerciseTemplate) => {
        setSelectedExercise(exercise || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => { setIsModalOpen(false); setSelectedExercise(null); };

    const handleSaveExercise = async (exerciseData: Partial<ExerciseTemplate>, videoFile?: File) => {
        try {
            if (selectedExercise) {
                await exerciseTemplateService.updateExerciseTemplate(selectedExercise.exerciseTemplateId, exerciseData as any, videoFile);
            } else {
                await exerciseTemplateService.createExerciseTemplate(exerciseData as any, videoFile);
            }
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

    const pageCount = Math.max(1, Math.ceil(filteredExercises.length / pageSize));
    const pagedExercises = filteredExercises.slice((page - 1) * pageSize, page * pageSize);

    const allFilters = [...PRIMARY_FILTERS, ...MUSCLE_FILTERS];

    return (
        <MainLayout>
            <div className="el-page">
                {/* Header */}
                <div className="el-header">
                    <div>
                        <h1>Bibliothèque d'exercices</h1>
                        <p>{exercises.length} exercice{exercises.length !== 1 ? 's' : ''} disponible{exercises.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="el-header-actions">
                        <button className="el-btn-secondary" onClick={() => setIsBulkImportOpen(true)}>
                            <Sparkles size={16} />
                            Bulk AI Import
                            <span className="el-btn-badge">NEW</span>
                        </button>
                        <button className="el-btn-primary" onClick={() => handleOpenModal()}>
                            <Plus size={16} />
                            Ajouter
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="el-toolbar">
                    <div className="el-search">
                        <Search size={17} className="el-search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher un exercice…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Category filters */}
                <div className="el-filters">
                    {allFilters.map(cat => (
                        <button
                            key={cat}
                            className={`el-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="el-loading">
                        <div className="el-spinner" />
                        <p>Chargement…</p>
                    </div>
                ) : error ? (
                    <div className="el-empty"><p>{error}</p></div>
                ) : filteredExercises.length === 0 ? (
                    <div className="el-empty">
                        <p>Aucun exercice trouvé.</p>
                        <button className="el-btn-primary" onClick={() => handleOpenModal()}>
                            <Plus size={16} /> Ajouter un exercice
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="el-grid">
                            {pagedExercises.map(exercise => {
                                const isPlaying = playingExerciseId === exercise.exerciseTemplateId;
                                const catColor = CATEGORY_COLORS[exercise.category] ?? CATEGORY_COLORS['Other'];
                                const ytThumbnail = exercise.videoUrl ? getYouTubeThumbnail(exercise.videoUrl) : null;
                                const ytEmbed = exercise.videoUrl ? getYouTubeEmbedUrl(exercise.videoUrl) : null;

                                return (
                                    <div
                                        key={exercise.exerciseTemplateId}
                                        className="el-card"
                                        onClick={() => handleViewExercise(exercise)}
                                    >
                                        {/* Thumbnail */}
                                        <div className="el-card-thumb">
                                            {!exercise.videoUrl ? (
                                                <div className="el-thumb-placeholder">
                                                    <span>{exercise.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                            ) : isPlaying ? (
                                                ytEmbed ? (
                                                    <iframe
                                                        src={`${ytEmbed}?autoplay=1`}
                                                        title={exercise.name}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="el-yt-embed"
                                                    />
                                                ) : (
                                                    <video
                                                        src={`${import.meta.env.VITE_API_URL}${exercise.videoUrl}`}
                                                        controls autoPlay
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                )
                                            ) : (
                                                <div
                                                    className="el-thumb-video"
                                                    style={ytThumbnail ? { backgroundImage: `url(${ytThumbnail})` } : undefined}
                                                >
                                                    {!ytThumbnail && (
                                                        <span className="el-thumb-letter">{exercise.name.charAt(0).toUpperCase()}</span>
                                                    )}
                                                    <div
                                                        className="el-play-overlay"
                                                        onClick={(e) => { e.stopPropagation(); setPlayingExerciseId(exercise.exerciseTemplateId); }}
                                                    >
                                                        <div className="el-play-icon">▶</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Edit button */}
                                        <button
                                            className="el-card-edit"
                                            onClick={(e) => { e.stopPropagation(); handleOpenModal(exercise); }}
                                            title="Modifier"
                                        >
                                            <Pencil size={14} />
                                        </button>

                                        {/* Info */}
                                        <div className="el-card-info">
                                            <h3 className="el-card-name">{exercise.name}</h3>
                                            <div className="el-card-meta">
                                                <span
                                                    className="el-cat-badge"
                                                    style={{ background: catColor.bg, color: catColor.fg }}
                                                >
                                                    {exercise.category}
                                                </span>
                                                {exercise.duration && exercise.duration > 0 && (
                                                    <span className="el-duration">
                                                        <Clock size={12} />
                                                        {formatDuration(exercise.duration)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredExercises.length > pageSize && (
                            <Pagination
                                page={page}
                                pageCount={pageCount}
                                pageSize={pageSize}
                                totalItems={filteredExercises.length}
                                onPageChange={setPage}
                                onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
                                pageSizeOptions={[12, 24, 48]}
                            />
                        )}
                    </>
                )}
            </div>

            <ExerciseTemplateModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveExercise}
                exercise={selectedExercise}
            />

            <ExerciseViewerModal
                isOpen={isViewerOpen}
                onClose={() => { setIsViewerOpen(false); setViewedExercise(null); }}
                exercise={viewedExercise}
            />

            <BulkAIImportModal
                isOpen={isBulkImportOpen}
                onClose={() => setIsBulkImportOpen(false)}
                onImportComplete={() => { setIsBulkImportOpen(false); loadExercises(); }}
            />

            <ChatPopup />
        </MainLayout>
    );
};

export default ExerciseLibraryPage;
