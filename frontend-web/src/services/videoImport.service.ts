import api from './api';

export interface VideoImportResult {
    isSuccess: boolean;
    exerciseTemplateId?: number;
    name?: string;
    category?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    detectionMethod?: 'dictionary' | 'gemini' | 'fallback';
    errorMessage?: string;
}

export interface ChannelVideoInfo {
    url: string;
    title: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
}

/**
 * Import a single YouTube video with AI detection.
 */
export const importYoutubeVideo = async (youtubeUrl: string): Promise<VideoImportResult> => {
    const formData = new FormData();
    formData.append('YoutubeUrl', youtubeUrl);

    const response = await api.post<VideoImportResult>(
        '/ExerciseTemplates/import-video',
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 180000, // 3min: yt-dlp download + ffmpeg + Gemini can take ~2min
        }
    );
    return response.data;
};

/**
 * Import a single local video file with AI detection.
 */
export const importVideoFile = async (file: File): Promise<VideoImportResult> => {
    const formData = new FormData();
    formData.append('videoFile', file);

    const response = await api.post<VideoImportResult>(
        '/ExerciseTemplates/import-video',
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000, // 2min for large file upload + AI analysis
        }
    );
    return response.data;
};

/**
 * Import a single Google Drive video with AI detection.
 * The file must be shared publicly ("Anyone with the link can view").
 */
export const importDriveVideo = async (driveUrl: string): Promise<VideoImportResult> => {
    const formData = new FormData();
    formData.append('DriveUrl', driveUrl);

    const response = await api.post<VideoImportResult>(
        '/ExerciseTemplates/import-video',
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 300000, // 5min: Drive download can be slow on large files
        }
    );
    return response.data;
};

/**
 * List all videos from a YouTube channel/playlist without downloading (fast).
 */
export const listChannelVideos = async (channelUrl: string): Promise<ChannelVideoInfo[]> => {
    const response = await api.post<ChannelVideoInfo[]>(
        '/ExerciseTemplates/list-channel',
        { channelUrl },
        { timeout: 30000 }
    );
    return response.data;
};

/**
 * Auto-detect URL type: 'video' | 'channel'
 */
export const detectUrlType = (url: string): 'video' | 'channel' => {
    const lower = url.toLowerCase();
    // Channel/playlist patterns
    if (
        /youtube\.com\/@[^/]+\/(shorts|videos|streams|live)/.test(lower) ||
        /youtube\.com\/playlist\?list=/.test(lower) ||
        /youtube\.com\/@[^/?]+$/.test(lower) ||
        /youtube\.com\/channel\//.test(lower) ||
        /youtube\.com\/c\//.test(lower)
    ) {
        return 'channel';
    }
    return 'video';
};
