'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/constants';

interface Album {
  id: string;
  weddingId: string;
  title: string;
  description?: string;
  accessType: 'public' | 'authorized_guests';
  photoCount: number;
  coverPhotoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Photo {
  id: string;
  weddingId: string;
  albumId: string;
  storageObjectKey: string;
  originalFileName: string;
  contentType: string;
  sizeBytes: number;
  caption?: string | null;
  url: string;
  createdAt: string;
}

interface PhotoGalleryTabProps {
  weddingId: string;
  weddingSlug?: string;
  showToast: (msg: string) => void;
}

export default function PhotoGalleryTab({
  weddingId,
  weddingSlug,
  showToast,
}: PhotoGalleryTabProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  // Create Album Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [newAlbumAccess, setNewAlbumAccess] = useState<'authorized_guests' | 'public'>('authorized_guests');
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox State
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  // Fetch albums
  const fetchAlbums = useCallback(async () => {
    if (!weddingId) return;
    try {
      setIsLoadingAlbums(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/albums`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setAlbums(data);
        if (data.length > 0 && !activeAlbum) {
          setActiveAlbum(data[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load albums:', err);
    } finally {
      setIsLoadingAlbums(false);
    }
  }, [weddingId, activeAlbum]);

  // Fetch photos for active album
  const fetchPhotos = useCallback(async (albumId: string) => {
    if (!weddingId || !albumId) return;
    try {
      setIsLoadingPhotos(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/albums/${albumId}/photos`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (err) {
      console.warn('Failed to load photos:', err);
    } finally {
      setIsLoadingPhotos(false);
    }
  }, [weddingId]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  useEffect(() => {
    if (activeAlbum) {
      fetchPhotos(activeAlbum.id);
    }
  }, [activeAlbum, fetchPhotos]);

  // Create Album
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;

    try {
      setIsCreatingAlbum(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newAlbumTitle.trim(),
          description: newAlbumDesc.trim() || undefined,
          accessType: newAlbumAccess,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setAlbums((prev) => [created, ...prev]);
        setActiveAlbum(created);
        setShowCreateModal(false);
        setNewAlbumTitle('');
        setNewAlbumDesc('');
        setNewAlbumAccess('authorized_guests');
        showToast(`Album "${created.title}" created successfully.`);
      } else {
        const err = await res.json();
        showToast(err.detail || 'Failed to create album.');
      }
    } catch {
      showToast('Network error creating album.');
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  // Upload Photos
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeAlbum) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(20);

      const timer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 300);

      const res = await fetch(
        `${API_BASE_URL}/api/v1/weddings/${weddingId}/albums/${activeAlbum.id}/photos`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      clearInterval(timer);
      setUploadProgress(100);

      if (res.ok) {
        const result = await res.json();
        if (result.uploadedCount > 0) {
          showToast(`Successfully uploaded ${result.uploadedCount} photo(s) to R2.`);
          fetchPhotos(activeAlbum.id);
          fetchAlbums(); // refresh counts
        }
        if (result.errors && result.errors.length > 0) {
          setUploadError(result.errors.join('; '));
        }
      } else {
        const err = await res.json();
        setUploadError(err.detail || 'Upload failed.');
      }
    } catch {
      setUploadError('Network error uploading photos.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Delete Photo
  const handleDeletePhoto = async (photoId: string) => {
    if (!activeAlbum) return;
    if (!confirm('Are you sure you want to permanently delete this photo?')) return;

    try {
      setDeletingPhotoId(photoId);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/weddings/${weddingId}/albums/${activeAlbum.id}/photos/${photoId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        showToast('Photo deleted from R2.');
        fetchAlbums(); // refresh counts
      } else {
        showToast('Failed to delete photo.');
      }
    } catch {
      showToast('Error deleting photo.');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  // Delete Album
  const handleDeleteAlbum = async (album: Album) => {
    if (!confirm(`Are you sure you want to delete album "${album.title}" and all its photos?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/albums/${album.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setAlbums((prev) => prev.filter((a) => a.id !== album.id));
        if (activeAlbum?.id === album.id) {
          const remaining = albums.filter((a) => a.id !== album.id);
          setActiveAlbum(remaining.length > 0 ? remaining[0] : null);
        }
        showToast(`Album "${album.title}" deleted.`);
      } else {
        showToast('Failed to delete album.');
      }
    } catch {
      showToast('Error deleting album.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#C5A059]/20">
        <div>
          <span className="font-label-sm uppercase tracking-widest text-primary font-semibold block mb-1">
            Media &amp; Visual Memories
          </span>
          <h2 className="font-headline-sm text-headline-sm text-charcoal-ink">
            Photo Gallery &amp; Albums
          </h2>
          <p className="font-body-sm text-stone-muted mt-1">
            High-resolution wedding photography secured in Cloudflare R2 object storage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {weddingSlug && (
            <Link
              href={`/w/${weddingSlug}/gallery`}
              target="_blank"
              className="px-4 py-2 rounded-full border border-[#C5A059]/40 text-charcoal-ink font-label-sm uppercase tracking-wider hover:bg-surface-container flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>View Guest Portal</span>
            </Link>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-full bg-burgundy-velvet text-on-primary font-label-md uppercase tracking-wider hover:bg-burgundy-hover transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            <span>New Album</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Left Sidebar Albums + Right Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Albums Roster */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-label-sm uppercase tracking-wider text-charcoal-ink font-semibold">
              Albums ({albums.length})
            </span>
          </div>

          {isLoadingAlbums ? (
            <div className="p-8 text-center text-stone-muted text-sm animate-pulse">
              Loading collections...
            </div>
          ) : albums.length === 0 ? (
            <div className="p-6 rounded-2xl bg-ivory-surface/50 border border-[#C5A059]/20 text-center space-y-2">
              <span className="material-symbols-outlined text-stone-muted text-[36px]">
                collections_bookmark
              </span>
              <p className="font-body-sm text-charcoal-ink font-medium">No albums yet</p>
              <p className="text-xs text-stone-muted">
                Create your first wedding album to start curating memories.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 text-xs font-semibold text-primary underline"
              >
                + Create Album
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {albums.map((album) => {
                const isActive = activeAlbum?.id === album.id;
                return (
                  <div
                    key={album.id}
                    onClick={() => setActiveAlbum(album)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-ivory-highlight border-[#C5A059] shadow-sm ring-1 ring-[#C5A059]/40'
                        : 'bg-ivory-surface border-[#C5A059]/15 hover:border-[#C5A059]/30 hover:bg-ivory-highlight/40'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-body-sm font-semibold text-charcoal-ink truncate block">
                          {album.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                            album.accessType === 'public'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-burgundy-velvet/10 text-burgundy-velvet'
                          }`}
                        >
                          {album.accessType === 'public' ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <span className="text-xs text-stone-muted block mt-0.5">
                        {album.photoCount} photo{album.photoCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <button
                      title="Delete Album"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAlbum(album);
                      }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-stone-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Album Photos Grid */}
        <div className="lg:col-span-3 space-y-4">
          {activeAlbum ? (
            <>
              {/* Active Album Banner */}
              <div className="p-5 rounded-2xl bg-ivory-surface border border-[#C5A059]/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-headline-sm text-headline-sm text-charcoal-ink">
                      {activeAlbum.title}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        activeAlbum.accessType === 'public'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-primary-fixed text-primary'
                      }`}
                    >
                      {activeAlbum.accessType === 'public' ? 'Publicly Visible' : 'Authorized Guests Only'}
                    </span>
                  </div>
                  {activeAlbum.description && (
                    <p className="text-xs text-stone-muted mt-1 leading-relaxed">
                      {activeAlbum.description}
                    </p>
                  )}
                </div>

                {/* Upload Button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    onChange={handleFileChange}
                    className="hidden"
                    id="photoUploadInput"
                  />
                  <label
                    htmlFor="photoUploadInput"
                    className={`px-5 py-2.5 rounded-full font-label-md uppercase tracking-wider cursor-pointer transition-colors shadow-sm inline-flex items-center gap-2 ${
                      isUploading
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                        : 'bg-gold-champagne text-on-primary-container hover:bg-gold-light'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isUploading ? 'hourglass_top' : 'cloud_upload'}
                    </span>
                    <span>{isUploading ? 'Uploading to R2...' : 'Upload Photos'}</span>
                  </label>
                </div>
              </div>

              {/* Upload Progress / Error Banner */}
              {isUploading && (
                <div className="p-4 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-charcoal-ink">
                    <span>Streaming photos securely to Cloudflare R2...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className="h-full bg-burgundy-velvet transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
                  <span>{uploadError}</span>
                  <button onClick={() => setUploadError(null)} className="text-red-900 font-bold ml-2">
                    ✕
                  </button>
                </div>
              )}

              {/* Photos Grid */}
              {isLoadingPhotos ? (
                <div className="p-16 text-center text-stone-muted text-sm animate-pulse">
                  Loading album photos from R2...
                </div>
              ) : photos.length === 0 ? (
                <div className="p-16 rounded-2xl border-2 border-dashed border-[#C5A059]/30 text-center space-y-3 bg-ivory-surface/30">
                  <span className="material-symbols-outlined text-[48px] text-stone-muted">
                    add_a_photo
                  </span>
                  <p className="font-headline-sm text-charcoal-ink">This album is empty</p>
                  <p className="text-xs text-stone-muted max-w-sm mx-auto">
                    Select JPEG, PNG, or WebP images to upload. Files are stored securely in your Cloudflare R2 bucket.
                  </p>
                  <label
                    htmlFor="photoUploadInput"
                    className="inline-block mt-2 px-6 py-2 rounded-full bg-burgundy-velvet text-on-primary font-label-sm uppercase tracking-wider hover:bg-burgundy-hover cursor-pointer"
                  >
                    Select Images
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-charcoal-ink/5 border border-[#C5A059]/20 shadow-xs hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setPreviewPhoto(photo)}
                    >
                      {/* Photo Thumbnail */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.caption || photo.originalFileName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                        <div className="flex justify-end">
                          <button
                            title="Delete Photo"
                            disabled={deletingPhotoId === photo.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhoto(photo.id);
                            }}
                            className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                        <div className="text-white text-xs truncate">
                          <p className="font-medium truncate">{photo.originalFileName}</p>
                          <p className="text-[10px] text-stone-300">
                            {Math.round(photo.sizeBytes / 1024)} KB
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-16 rounded-2xl bg-ivory-surface text-center text-stone-muted">
              Select or create an album to view and upload photographs.
            </div>
          )}
        </div>
      </div>

      {/* Create Album Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-ink/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-ivory-surface p-6 sm:p-8 shadow-[0_16px_40px_rgba(30,26,24,0.2)] border border-[#C5A059]/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-primary font-label-sm uppercase tracking-widest font-semibold">
                <span className="material-symbols-outlined text-[18px]">photo_library</span>
                <span>Curate Collection</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-muted hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <h3 className="font-headline-sm text-headline-sm text-charcoal-ink mb-1.5">
              Create New Photo Album
            </h3>
            <p className="font-body-sm text-stone-muted mb-5 leading-relaxed">
              Organize photographs by wedding function (e.g. Sangeet, Solemn Ceremony, Reception).
            </p>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-charcoal-ink font-semibold mb-1.5">
                  Album Title *
                </label>
                <input
                  required
                  type="text"
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  placeholder="e.g. Mehendi Ceremony &amp; High Tea"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-charcoal-ink placeholder:text-stone-muted focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-charcoal-ink font-semibold mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newAlbumDesc}
                  onChange={(e) => setNewAlbumDesc(e.target.value)}
                  placeholder="Memories captured in the gardens..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-charcoal-ink placeholder:text-stone-muted focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-charcoal-ink font-semibold mb-1.5">
                  Privacy &amp; Access Control
                </label>
                <select
                  value={newAlbumAccess}
                  onChange={(e) => setNewAlbumAccess(e.target.value as 'authorized_guests' | 'public')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                >
                  <option value="authorized_guests">Authorized Guests Only (Invitation Token Required)</option>
                  <option value="public">Public (Visible to Anyone with Wedding Link)</option>
                </select>
                <p className="text-[11px] text-stone-muted mt-1">
                  Private albums are delivered securely via short-lived pre-signed URLs to verified guests.
                </p>
              </div>

              <div className="mt-6 pt-3 flex items-center justify-end gap-3 border-t border-[#C5A059]/15">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2 rounded-full font-label-md text-stone-muted hover:text-charcoal-ink uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAlbum || !newAlbumTitle.trim()}
                  className="px-6 py-2.5 rounded-full bg-burgundy-velvet text-on-primary font-label-md uppercase tracking-wider hover:bg-burgundy-hover transition-colors disabled:opacity-50"
                >
                  {isCreatingAlbum ? 'Creating...' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Preview Lightbox Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-ink/85 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewPhoto.url}
              alt={previewPhoto.originalFileName}
              className="max-h-[80vh] w-auto rounded-lg shadow-2xl object-contain"
            />
            <div className="mt-3 text-center text-ivory-highlight text-sm">
              <p className="font-semibold">{previewPhoto.originalFileName}</p>
              <p className="text-xs text-stone-300">
                Uploaded {new Date(previewPhoto.createdAt).toLocaleDateString()} •{' '}
                {Math.round(previewPhoto.sizeBytes / 1024)} KB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
