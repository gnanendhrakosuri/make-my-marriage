'use client';

import React, { useState, useEffect, useCallback, use, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
}

interface Photo {
  id: string;
  albumId: string;
  originalFileName: string;
  contentType: string;
  sizeBytes: number;
  caption?: string | null;
  url: string;
  createdAt: string;
}

interface WeddingMeta {
  id: string;
  slug: string;
  coupleNames: string[];
  siteTitle?: string;
  weddingDate?: string;
}

export default function PublicGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-serif text-[#722F37]">Loading Gallery Atelier...</div>}>
      <PublicGalleryContent slug={slug} />
    </Suspense>
  );
}

function PublicGalleryContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [activeToken, setActiveToken] = useState(tokenFromUrl);
  const [inputToken, setInputToken] = useState('');
  const [wedding, setWedding] = useState<WeddingMeta | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isAuthorizedGuest, setIsAuthorizedGuest] = useState(false);
  const [hasPrivateAlbums, setHasPrivateAlbums] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch Gallery metadata & albums
  const fetchGallery = useCallback(async (tokenToUse: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const url = new URL(`${API_BASE_URL}/api/v1/public/weddings/${slug}/gallery`);
      if (tokenToUse) {
        url.searchParams.set('token', tokenToUse);
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setWedding(data.wedding);
        setAlbums(data.albums || []);
        setIsAuthorizedGuest(data.isAuthorizedGuest);
        setHasPrivateAlbums(data.hasPrivateAlbums);

        if (data.albums && data.albums.length > 0) {
          setActiveAlbum(data.albums[0]);
        }
      } else if (res.status === 404) {
        setError('Wedding celebration not found.');
      } else {
        setError('Unable to load photo gallery at this time.');
      }
    } catch {
      setError('Connection error loading gallery.');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  // Fetch photos for selected album
  const fetchAlbumPhotos = useCallback(async (albumId: string, tokenToUse: string) => {
    try {
      setIsLoadingPhotos(true);
      const url = new URL(
        `${API_BASE_URL}/api/v1/public/weddings/${slug}/gallery/albums/${albumId}/photos`
      );
      if (tokenToUse) {
        url.searchParams.set('token', tokenToUse);
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      } else if (res.status === 403) {
        setPhotos([]);
      }
    } catch (err) {
      console.warn('Failed to fetch album photos:', err);
    } finally {
      setIsLoadingPhotos(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchGallery(activeToken);
  }, [fetchGallery, activeToken]);

  useEffect(() => {
    if (activeAlbum) {
      fetchAlbumPhotos(activeAlbum.id, activeToken);
    }
  }, [activeAlbum, activeToken, fetchAlbumPhotos]);

  const handleApplyToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    setActiveToken(inputToken.trim());
  };

  const coupleNamesDisplay = wedding?.coupleNames?.join(' & ') || 'Sarah & Julian';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] antialiased">
      {/* Top Haute Atelier Header */}
      <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#C5A059]/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/w/${slug}`}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#722F37] hover:text-[#581825] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Celebration</span>
          </Link>
          <span className="text-stone-300">•</span>
          <span className="text-xs uppercase tracking-widest text-[#C5A059] font-medium hidden sm:inline">
            Wedding Gallery
          </span>
        </div>

        <div className="text-right">
          <span className="font-serif italic text-base text-[#1A1A1A] block leading-tight">
            {coupleNamesDisplay}
          </span>
          {wedding?.weddingDate && (
            <span className="text-[11px] text-stone-500 uppercase tracking-wider">
              {new Date(wedding.weddingDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      </header>

      {/* Main Gallery Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        {/* Editorial Title Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-semibold block">
            Visual Keepsakes
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#1A1A1A] font-normal tracking-tight">
            The Wedding Gallery
          </h1>
          <p className="text-sm text-stone-600 font-light leading-relaxed">
            Every timeless moment, laughter, and celebration captured in high-resolution photography.
          </p>

          {/* Authorization Pill */}
          <div className="pt-2">
            {isAuthorizedGuest ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-semibold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-[#722F37]">verified</span>
                <span>Verified Guest Access • Private Albums Unlocked</span>
              </span>
            ) : hasPrivateAlbums ? (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 max-w-md mx-auto text-left space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 text-xs font-semibold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Private Gallery Verification</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Intimate ceremony and reception albums are reserved for invited guests. If you have an invitation code, enter it below to unlock all albums:
                </p>
                <form onSubmit={handleApplyToken} className="flex gap-2">
                  <input
                    type="text"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    placeholder="Paste 64-char invitation token..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-amber-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#722F37] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#581825]"
                  >
                    Unlock
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-8 text-center text-red-700 bg-red-50 rounded-2xl border border-red-200 max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="py-24 text-center text-stone-400 font-serif text-lg animate-pulse">
            Curating gallery archives...
          </div>
        ) : albums.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-[#C5A059]/20 p-8 max-w-lg mx-auto">
            <span className="material-symbols-outlined text-4xl text-stone-400">photo_library</span>
            <h3 className="font-serif text-xl text-[#1A1A1A]">No Albums Published Yet</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Photographs will appear here once the wedding concierge team uploads celebration collections.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Album Tabs Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#C5A059]/20 pb-4">
              {albums.map((album) => {
                const isActive = activeAlbum?.id === album.id;
                return (
                  <button
                    key={album.id}
                    onClick={() => setActiveAlbum(album)}
                    className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#722F37] text-white shadow-md'
                        : 'bg-white border border-[#C5A059]/30 text-stone-700 hover:border-[#C5A059]'
                    }`}
                  >
                    <span>{album.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {album.photoCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Photos Display */}
            {isLoadingPhotos ? (
              <div className="py-20 text-center text-stone-400 text-sm animate-pulse">
                Loading collection moments...
              </div>
            ) : photos.length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-sm">
                No photographs added to this collection yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    onClick={() => setLightboxIndex(idx)}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-[#C5A059]/20 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.caption || photo.originalFileName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn select-none"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors z-20"
          >
            <span className="material-symbols-outlined text-[26px]">close</span>
          </button>

          {/* Previous Button */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
              className="absolute left-6 w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors z-20"
            >
              <span className="material-symbols-outlined text-[26px]">chevron_left</span>
            </button>
          )}

          {/* Next Button */}
          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
              className="absolute right-6 w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors z-20"
            >
              <span className="material-symbols-outlined text-[26px]">chevron_right</span>
            </button>
          )}

          {/* Image Container */}
          <div
            className="relative max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].originalFileName}
              className="max-h-[75vh] w-auto rounded-lg shadow-2xl object-contain"
            />
            <div className="mt-4 text-center text-stone-200">
              <p className="text-xs uppercase tracking-wider text-stone-400">
                Photo {lightboxIndex + 1} of {photos.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
