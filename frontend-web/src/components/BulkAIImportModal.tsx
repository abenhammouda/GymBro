import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Youtube, FileVideo, Trash2, GripVertical, Sparkles, CheckCircle2, XCircle, Loader2, HardDrive } from 'lucide-react';
import { importYoutubeVideo, importVideoFile, importDriveVideo, listChannelVideos, detectUrlType } from '../services/videoImport.service';
import './BulkAIImportModal.css';

interface ImportItem {
    id: string;
    type: 'file' | 'youtube';
    name: string;
    size?: string;
    duration?: string;
    file?: File;
    url?: string;
    thumbnail?: string;
    status: 'pending' | 'analyzing' | 'done' | 'error';
    detectedName?: string;
    detectedCategory?: string;
    errorMsg?: string;
}

interface BulkAIImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
}

type ImportMethod = 'upload' | 'youtube' | 'drive';
type Step = 1 | 2 | 3 | 4;

const STEPS = [
    { num: 1, label: 'Importer' },
    { num: 2, label: 'Analyse IA' },
    { num: 3, label: 'Vérification' },
    { num: 4, label: 'Terminé' },
];

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getTotalSize = (items: ImportItem[]): string => {
    const totalBytes = items
        .filter(i => i.type === 'file' && i.file)
        .reduce((acc, i) => acc + (i.file!.size || 0), 0);
    if (totalBytes === 0) return '';
    return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB total`;
};

const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu\.be\/|v\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};

const getYouTubeThumbnail = (url: string): string | null => {
    const id = getYouTubeVideoId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

const isValidYoutubeUrl = (url: string): boolean => {
    return /youtube\.com|youtu\.be/.test(url);
};

const BulkAIImportModal: React.FC<BulkAIImportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
    const [step, setStep] = useState<Step>(1);
    const [method, setMethod] = useState<ImportMethod>('upload');
    const [items, setItems] = useState<ImportItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [youtubeInput, setYoutubeInput] = useState('');
    const [youtubeError, setYoutubeError] = useState('');
    const [driveInput, setDriveInput] = useState('');
    const [driveError, setDriveError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetModal = () => {
        setStep(1);
        setMethod('upload');
        setItems([]);
        setYoutubeInput('');
        setYoutubeError('');
        setDriveInput('');
        setDriveError('');
    };

    const handleClose = () => {
        if (step === 4) onImportComplete();
        resetModal();
        onClose();
    };

    // --- File Upload ---
    const addFiles = useCallback((files: FileList | File[]) => {
        const arr = Array.from(files);
        const newItems: ImportItem[] = arr
            .filter(f => /video/i.test(f.type) || /\.(mp4|mov|avi|webm|mkv)$/i.test(f.name))
            .map(f => ({
                id: `file-${Date.now()}-${Math.random()}`,
                type: 'file',
                name: f.name,
                size: formatFileSize(f.size),
                file: f,
                status: 'pending',
            }));
        setItems(prev => [...prev, ...newItems]);
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    // --- YouTube ---
    const handleAddYoutubeUrls = async () => {
        const lines = youtubeInput.split('\n').map(l => l.trim()).filter(Boolean);
        const toAdd: ImportItem[] = [];
        const invalid: string[] = [];

        for (const url of lines) {
            if (!isValidYoutubeUrl(url)) {
                invalid.push(url);
                continue;
            }

            const urlType = detectUrlType(url);

            if (urlType === 'channel') {
                // Channel/playlist: show a loading indicator then expand into videos
                const placeholder: ImportItem = {
                    id: `yt-ch-${Date.now()}-${Math.random()}`,
                    type: 'youtube',
                    name: `🔄 Chargement de la playlist…`,
                    url,
                    status: 'pending',
                };
                setItems(prev => [...prev, placeholder]);
                setYoutubeInput('');

                try {
                    const channelVideos = await listChannelVideos(url);
                    setItems(prev => [
                        ...prev.filter(i => i.id !== placeholder.id),
                        ...channelVideos.map(v => ({
                            id: `yt-${Date.now()}-${Math.random()}`,
                            type: 'youtube' as const,
                            name: v.title,
                            url: v.url,
                            thumbnail: v.thumbnailUrl,
                            status: 'pending' as const,
                        }))
                    ]);
                } catch {
                    setItems(prev => prev.filter(i => i.id !== placeholder.id));
                    setYoutubeError('Impossible de charger la playlist. Vérifiez l\'URL.');
                }
            } else {
                const id = getYouTubeVideoId(url);
                const thumb = getYouTubeThumbnail(url);
                toAdd.push({
                    id: `yt-${Date.now()}-${Math.random()}`,
                    type: 'youtube',
                    name: id ? `YouTube • ${id}` : url,
                    url,
                    thumbnail: thumb || undefined,
                    status: 'pending',
                });
            }
        }

        if (invalid.length > 0) {
            setYoutubeError(`URL(s) invalide(s) : ${invalid.join(', ')}`);
        } else {
            setYoutubeError('');
        }
        if (toAdd.length > 0) {
            setItems(prev => [...prev, ...toAdd]);
            setYoutubeInput('');
        }
    };

    // --- Google Drive ---
    const extractDriveFileId = (url: string): string | null => {
        const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileMatch) return fileMatch[1];
        const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch) return idMatch[1];
        return null;
    };

    const isValidDriveUrl = (url: string): boolean =>
        /drive\.google\.com/.test(url) && extractDriveFileId(url) !== null;

    const handleAddDriveUrls = () => {
        const lines = driveInput.split('\n').map(l => l.trim()).filter(Boolean);
        const toAdd: ImportItem[] = [];
        const invalid: string[] = [];

        for (const url of lines) {
            if (!isValidDriveUrl(url)) {
                invalid.push(url);
                continue;
            }
            const fileId = extractDriveFileId(url)!;
            toAdd.push({
                id: `drive-${Date.now()}-${Math.random()}`,
                type: 'youtube', // reuse type for rendering; url presence identifies it
                name: `Drive • ${fileId.slice(0, 12)}…`,
                url,
                status: 'pending',
            });
        }

        if (invalid.length > 0) {
            setDriveError(`Lien(s) invalide(s) : ${invalid.join(', ')}`);
        } else {
            setDriveError('');
        }
        if (toAdd.length > 0) {
            setItems(prev => [...prev, ...toAdd]);
            setDriveInput('');
        }
    };

    const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

    // --- Real AI Analysis via backend API ---
    const runAnalysis = async () => {
        setStep(2);
        const snapshot = [...items];
        const updated = [...snapshot];

        for (let i = 0; i < updated.length; i++) {
            // Mark as analyzing
            updated[i] = { ...updated[i], status: 'analyzing' };
            setItems([...updated]);

            try {
                let result;
                const itemUrl = updated[i].url ?? '';
                if (updated[i].type === 'youtube' && /drive\.google\.com/.test(itemUrl)) {
                    result = await importDriveVideo(itemUrl);
                } else if (updated[i].type === 'youtube' && itemUrl) {
                    result = await importYoutubeVideo(itemUrl);
                } else if (updated[i].type === 'file' && updated[i].file) {
                    result = await importVideoFile(updated[i].file!);
                } else {
                    throw new Error('Source invalide');
                }

                if (result.isSuccess) {
                    updated[i] = {
                        ...updated[i],
                        status: 'done',
                        detectedName: result.name,
                        detectedCategory: result.category,
                    };
                } else {
                    updated[i] = {
                        ...updated[i],
                        status: 'error',
                        errorMsg: result.errorMessage || 'Erreur inconnue',
                    };
                }
            } catch (err: any) {
                updated[i] = {
                    ...updated[i],
                    status: 'error',
                    errorMsg: err?.response?.data?.message || err?.message || 'Erreur réseau',
                };
            }

            setItems([...updated]);
        }

        setStep(3);
    };

    const handleConfirmImport = async () => {
        setStep(4);
    };

    const updateItemField = (id: string, field: 'detectedName' | 'detectedCategory', value: string) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    if (!isOpen) return null;

    const doneCount = items.filter(i => i.status === 'done').length;
    const errorCount = items.filter(i => i.status === 'error').length;

    return (
        <div className="bai-overlay" onClick={handleClose}>
            <div className="bai-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bai-header">
                    <div className="bai-header-title">
                        <Sparkles size={20} className="bai-sparkle-icon" />
                        <h2>Import en Bulk avec IA</h2>
                    </div>
                    <button className="bai-close-btn" onClick={handleClose}><X size={20} /></button>
                </div>

                {/* Stepper */}
                <div className="bai-stepper">
                    {STEPS.map((s, idx) => (
                        <React.Fragment key={s.num}>
                            <div className={`bai-step ${step === s.num ? 'active' : step > s.num ? 'completed' : ''}`}>
                                <div className="bai-step-circle">
                                    {step > s.num ? <CheckCircle2 size={16} /> : s.num}
                                </div>
                                <span className="bai-step-label">{s.label}</span>
                            </div>
                            {idx < STEPS.length - 1 && <div className={`bai-step-line ${step > s.num ? 'completed' : ''}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Body */}
                <div className="bai-body">

                    {/* ===== STEP 1: Import ===== */}
                    {step === 1 && (
                        <>
                            <h3 className="bai-section-title">1. Choisir la méthode d'import</h3>
                            <div className="bai-method-cards">
                                <div
                                    className={`bai-method-card ${method === 'upload' ? 'selected' : ''}`}
                                    onClick={() => setMethod('upload')}
                                >
                                    <Upload size={26} className="bai-method-icon upload" />
                                    <span className="bai-method-name">Upload</span>
                                    <span className="bai-method-desc">MP4, MOV, AVI</span>
                                    {method === 'upload' && <span className="bai-badge recommended">Recommandé</span>}
                                </div>
                                <div
                                    className={`bai-method-card ${method === 'youtube' ? 'selected' : ''}`}
                                    onClick={() => setMethod('youtube')}
                                >
                                    <Youtube size={26} className="bai-method-icon youtube" />
                                    <span className="bai-method-name">YouTube</span>
                                    <span className="bai-method-desc">Vidéos & Shorts</span>
                                    {method === 'youtube' && <span className="bai-badge youtube-badge">Jusqu'à 20</span>}
                                </div>
                                <div
                                    className={`bai-method-card ${method === 'drive' ? 'selected' : ''}`}
                                    onClick={() => setMethod('drive')}
                                >
                                    <HardDrive size={26} className="bai-method-icon drive" />
                                    <span className="bai-method-name">Google Drive</span>
                                    <span className="bai-method-desc">Liens de partage</span>
                                    {method === 'drive' && <span className="bai-badge drive-badge">Public requis</span>}
                                </div>
                            </div>

                            {/* Upload zone */}
                            {method === 'upload' && (
                                <>
                                    <h3 className="bai-section-title">2. Uploader vos vidéos</h3>
                                    <div
                                        className={`bai-dropzone ${isDragging ? 'dragging' : ''}`}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload size={36} className="bai-dropzone-icon" />
                                        <p className="bai-dropzone-text">Glissez-déposez vos vidéos ici</p>
                                        <span className="bai-dropzone-or">ou</span>
                                        <button className="bai-browse-btn" type="button" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                                            <FileVideo size={16} />
                                            Parcourir les fichiers
                                        </button>
                                        <p className="bai-dropzone-hint">Format: MP4, MOV, AVI • Max 500MB par fichier • Maximum 50 vidéos</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="video/*,.mp4,.mov,.avi,.webm,.mkv"
                                            multiple
                                            style={{ display: 'none' }}
                                            onChange={e => e.target.files && addFiles(e.target.files)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* YouTube zone */}
                            {method === 'youtube' && (
                                <>
                                    <h3 className="bai-section-title">2. Coller vos liens YouTube</h3>
                                    <div className="bai-youtube-input-area">
                                        <textarea
                                            className="bai-youtube-textarea"
                                            placeholder={`https://youtube.com/shorts/abc123\nhttps://youtube.com/watch?v=xyz789\nhttps://youtube.com/@UnCoach/shorts\n\nUn lien par ligne`}
                                            value={youtubeInput}
                                            onChange={e => setYoutubeInput(e.target.value)}
                                            rows={5}
                                        />
                                        {youtubeError && <p className="bai-yt-error">{youtubeError}</p>}
                                        <button className="bai-add-yt-btn" onClick={handleAddYoutubeUrls} disabled={!youtubeInput.trim()}>
                                            <Youtube size={16} />
                                            Ajouter les liens
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Google Drive zone */}
                            {method === 'drive' && (
                                <>
                                    <h3 className="bai-section-title">2. Coller vos liens Google Drive</h3>
                                    <div className="bai-drive-info-banner">
                                        <HardDrive size={14} />
                                        <span>Les fichiers doivent être partagés en mode <strong>«&nbsp;Tous les utilisateurs avec le lien&nbsp;»</strong></span>
                                    </div>
                                    <div className="bai-youtube-input-area">
                                        <textarea
                                            className="bai-drive-textarea"
                                            placeholder={`https://drive.google.com/file/d/1abc.../view\nhttps://drive.google.com/file/d/1xyz.../view\n\nUn lien par ligne`}
                                            value={driveInput}
                                            onChange={e => setDriveInput(e.target.value)}
                                            rows={4}
                                        />
                                        {driveError && <p className="bai-yt-error">{driveError}</p>}
                                        <button className="bai-add-drive-btn" onClick={handleAddDriveUrls} disabled={!driveInput.trim()}>
                                            <HardDrive size={16} />
                                            Ajouter les liens Drive
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* File list */}
                            {items.length > 0 && (
                                <div className="bai-file-list">
                                    <div className="bai-file-list-header">
                                        <span>Fichiers sélectionnés ({items.length})</span>
                                        <span className="bai-total-size">{getTotalSize(items)}</span>
                                    </div>
                                    {items.map(item => (
                                        <div key={item.id} className="bai-file-item">
                                            <GripVertical size={16} className="bai-drag-handle" />
                                            <div className="bai-file-thumb">
                                                {item.thumbnail ? (
                                                    <img src={item.thumbnail} alt={item.name} />
                                                ) : (
                                            <div className="bai-file-thumb-placeholder">
                                                    {item.type === 'youtube' && /drive\.google\.com/.test(item.url ?? '')
                                                        ? <HardDrive size={20} className="drive-icon-color" />
                                                        : item.type === 'youtube' ? <Youtube size={20} />
                                                        : <FileVideo size={20} />}
                                                </div>
                                                )}
                                            </div>
                                            <div className="bai-file-info">
                                                <span className="bai-file-name">{item.name}</span>
                                                <span className="bai-file-meta">
                                                    {item.size && <>{item.size} • </>}
                                                    {item.type === 'youtube' && /drive\.google\.com/.test(item.url ?? '')
                                                        ? 'Google Drive'
                                                        : item.type === 'youtube' ? 'YouTube' : 'Upload'}
                                                </span>
                                            </div>
                                            <button className="bai-remove-btn" onClick={() => removeItem(item.id)}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ===== STEP 2: Analyse IA ===== */}
                    {step === 2 && (
                        <div className="bai-analysis-view">
                            <div className="bai-analysis-header">
                                <div className="bai-analysis-pulse">
                                    <Sparkles size={24} />
                                </div>
                                <h3>Analyse IA en cours…</h3>
                                <p>{doneCount} / {items.length} vidéo(s) traitée(s)</p>
                            </div>
                            <div className="bai-progress-bar-wrap">
                                <div
                                    className="bai-progress-bar-fill"
                                    style={{ width: `${items.length > 0 ? (doneCount / items.length) * 100 : 0}%` }}
                                />
                            </div>
                            <div className="bai-analysis-list">
                                {items.map(item => (
                                    <div key={item.id} className={`bai-analysis-item ${item.status}`}>
                                        <div className="bai-analysis-thumb">
                                            {item.thumbnail ? (
                                                <img src={item.thumbnail} alt="" />
                                            ) : (
                                                <div className="bai-file-thumb-placeholder sm">
                                                    {item.type === 'youtube' && /drive\.google\.com/.test(item.url ?? '')
                                                        ? <HardDrive size={16} className="drive-icon-color" />
                                                        : item.type === 'youtube' ? <Youtube size={16} />
                                                        : <FileVideo size={16} />}
                                                </div>
                                            )}
                                        </div>
                                        <div className="bai-analysis-info">
                                            <span className="bai-analysis-name">{item.name}</span>
                                            {item.status === 'analyzing' && <span className="bai-status-text analyzing">🔄 Analyse en cours…</span>}
                                            {item.status === 'done' && (
                                                <span className="bai-status-text done">
                                                    ✅ {item.detectedName} · <strong>{item.detectedCategory}</strong>
                                                </span>
                                            )}
                                            {item.status === 'pending' && <span className="bai-status-text pending">⏳ En attente</span>}
                                            {item.status === 'error' && <span className="bai-status-text error">❌ {item.errorMsg}</span>}
                                        </div>
                                        <div className="bai-status-icon">
                                            {item.status === 'analyzing' && <Loader2 size={18} className="bai-spin" />}
                                            {item.status === 'done' && <CheckCircle2 size={18} className="bai-done-icon" />}
                                            {item.status === 'error' && <XCircle size={18} className="bai-error-icon" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== STEP 3: Vérification ===== */}
                    {step === 3 && (
                        <div className="bai-verify-view">
                            <p className="bai-verify-intro">
                                Vérifiez et corrigez les résultats avant de confirmer l'import.
                            </p>
                            <div className="bai-verify-list">
                                {items.filter(i => i.status === 'done').map(item => (
                                    <div key={item.id} className="bai-verify-item">
                                        <div className="bai-verify-thumb">
                                            {item.thumbnail ? (
                                                <img src={item.thumbnail} alt="" />
                                            ) : (
                                                <div className="bai-file-thumb-placeholder sm">
                                                    {item.type === 'youtube' && /drive\.google\.com/.test(item.url ?? '')
                                                        ? <HardDrive size={16} className="drive-icon-color" />
                                                        : item.type === 'youtube' ? <Youtube size={16} />
                                                        : <FileVideo size={16} />}
                                                </div>
                                            )}
                                        </div>
                                        <div className="bai-verify-fields">
                                            <input
                                                className="bai-verify-input"
                                                value={item.detectedName || ''}
                                                onChange={e => updateItemField(item.id, 'detectedName', e.target.value)}
                                                placeholder="Nom de l'exercice"
                                            />
                                            <select
                                                className="bai-verify-select"
                                                value={item.detectedCategory || ''}
                                                onChange={e => updateItemField(item.id, 'detectedCategory', e.target.value)}
                                            >
                                                {['Pectoraux', 'Épaules', 'Dos', 'Jambes', 'Bras', 'Core', 'Cardio', 'Flexibility', 'Other'].map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button className="bai-remove-btn" onClick={() => removeItem(item.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {errorCount > 0 && (
                                <p className="bai-error-summary">⚠️ {errorCount} vidéo(s) n'ont pas pu être analysées et seront ignorées.</p>
                            )}
                        </div>
                    )}

                    {/* ===== STEP 4: Terminé ===== */}
                    {step === 4 && (
                        <div className="bai-done-view">
                            <div className="bai-done-icon-wrap">
                                <CheckCircle2 size={64} />
                            </div>
                            <h3>Import terminé !</h3>
                            <p>{doneCount} exercice(s) ajouté(s) à votre bibliothèque.</p>
                            <button className="bai-done-btn" onClick={handleClose}>Fermer</button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 1 && (
                    <div className="bai-footer">
                        <button className="bai-cancel-btn" onClick={handleClose}>Annuler</button>
                        <button
                            className="bai-launch-btn"
                            onClick={runAnalysis}
                            disabled={items.length === 0}
                        >
                            <Sparkles size={18} />
                            Lancer l'analyse IA ({items.length} vidéo{items.length !== 1 ? 's' : ''})
                        </button>
                    </div>
                )}
                {step === 3 && (
                    <div className="bai-footer">
                        <button className="bai-cancel-btn" onClick={() => setStep(1)}>← Retour</button>
                        <button
                            className="bai-launch-btn"
                            onClick={handleConfirmImport}
                            disabled={items.filter(i => i.status === 'done').length === 0}
                        >
                            <CheckCircle2 size={18} />
                            Confirmer l'import ({items.filter(i => i.status === 'done').length} exercices)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkAIImportModal;
