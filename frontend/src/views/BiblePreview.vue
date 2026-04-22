<template>
  <div class="bible-preview-page">
    <section class="reading-hero church-card">
      <div class="hero-glow hero-glow-left"></div>
      <div class="hero-glow hero-glow-right"></div>

      <div class="reading-hero__inner">
        <div class="reading-hero__copy">
          <p class="eyebrow mb-2">Scripture Reading</p>
          <h1 class="display-title mb-3">Bible Preview</h1>
          <p class="hero-text mb-0">
            A quiet, book-like reading space for previewing verses chapter by chapter.
            No editing tools, only the text on the page.
          </p>
        </div>

        <div class="reading-hero__meta">
          <div class="meta-chip">
            <i class="bi bi-book-half me-2"></i>
            <span>{{ churchStore.totalBibleVerses }} verse{{ churchStore.totalBibleVerses === 1 ? '' : 's' }} loaded</span>
          </div>
          <div class="meta-chip meta-chip--soft">
            <i class="bi bi-journal-text me-2"></i>
            <span>{{ previewTitle }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="reading-controls church-card">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <p class="section-label mb-1">Reading Selection</p>
          <h2 class="mb-0">Choose a passage</h2>
        </div>
        <button class="btn btn-outline-gold" :disabled="churchStore.bibleVersesLoading" @click="refreshVerses">
          <i class="bi bi-arrow-clockwise me-2"></i>Refresh
        </button>
      </div>

      <div v-if="churchStore.bibleVersesError" class="alert alert-danger mb-4">
        {{ churchStore.bibleVersesError }}
      </div>

      <div class="row g-3">
        <div class="col-lg-2 col-md-4">
          <label class="form-label">Translation</label>
          <input v-model="filters.translation" type="text" class="form-control" placeholder="TB">
        </div>
        <div class="col-lg-2 col-md-4">
          <label class="form-label">Testament</label>
          <select v-model="filters.testament" class="form-select">
            <option value="">All</option>
            <option value="Old Testament">Old Testament</option>
            <option value="New Testament">New Testament</option>
          </select>
        </div>
        <div class="col-lg-3 col-md-4">
          <label class="form-label">Book</label>
          <input v-model="filters.book" type="text" class="form-control" placeholder="Genesis">
        </div>
        <div class="col-lg-2 col-md-4">
          <label class="form-label">Chapter</label>
          <input v-model.number="chapterInput" type="number" min="1" class="form-control" placeholder="1">
        </div>
        <div class="col-lg-3 col-md-8">
          <label class="form-label">Search Text</label>
          <input v-model="filters.search" type="text" class="form-control" placeholder="In the beginning">
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 mt-3">
        <button class="luxury-btn" :disabled="churchStore.bibleVersesLoading" @click="applyFilters">
          Open Book
        </button>
        <button class="btn btn-outline-secondary" :disabled="churchStore.bibleVersesLoading" @click="clearFilters">
          Clear
        </button>
      </div>
    </section>

    <section class="book-stage">
      <div class="book-spine"></div>
      <div class="open-book church-card">
        <div class="open-book__header">
          <div>
            <p class="section-label mb-1">Open Scripture</p>
            <h2 class="mb-1">{{ previewTitle }}</h2>
            <p class="book-subtitle mb-0">{{ previewSubtitle }}</p>
          </div>
          <div class="book-folio">
            <span>{{ readingCountLabel }}</span>
          </div>
        </div>

        <div v-if="churchStore.bibleVersesLoading" class="book-empty">
          <i class="bi bi-hourglass-split fs-2 mb-3"></i>
          <p class="mb-0">Turning the pages...</p>
        </div>

        <div v-else-if="!chapterPreview.length" class="book-empty">
          <i class="bi bi-book fs-2 mb-3"></i>
          <p class="mb-0">Select a book and chapter to begin reading.</p>
        </div>

        <div v-else class="pages">
          <article class="page page--left">
            <div class="page-number">1</div>
            <div class="page-body">
              <div
                v-for="verse in leftPageVerses"
                :key="verse.id"
                class="verse-line"
              >
                <span class="verse-badge">{{ verse.verse }}</span>
                <div>
                  <p class="verse-reference mb-1">{{ verse.reference }}</p>
                  <p class="verse-text mb-0">{{ verse.text }}</p>
                </div>
              </div>
            </div>
          </article>

          <article class="page page--right">
            <div class="page-number">2</div>
            <div class="page-body">
              <div
                v-for="verse in rightPageVerses"
                :key="verse.id"
                class="verse-line"
              >
                <span class="verse-badge">{{ verse.verse }}</span>
                <div>
                  <p class="verse-reference mb-1">{{ verse.reference }}</p>
                  <p class="verse-text mb-0">{{ verse.text }}</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useChurchStore } from '@/stores/church'
import type { BibleVerseFilters } from '@/services/bibleService'

const churchStore = useChurchStore()

const filters = reactive<BibleVerseFilters>({
  translation: 'TB',
  testament: '',
  book: '',
  chapter: null,
  search: ''
})

const chapterInput = computed({
  get: () => filters.chapter ?? '',
  set: (val) => { filters.chapter = val ? Number(val) : null }
})

const sanitizedFilters = () => ({
  translation: filters.translation?.trim() || undefined,
  testament: filters.testament || undefined,
  book: filters.book?.trim() || undefined,
  chapter: filters.chapter ? Number(filters.chapter) : undefined,
  search: filters.search?.trim() || undefined
})

const previewTitle = computed(() => {
  if (filters.book && filters.chapter) {
    return `${filters.translation || 'TB'} - ${filters.book} ${filters.chapter}`
  }

  if (filters.search) {
    return `Search results for "${filters.search}"`
  }

  return 'Digitized Scripture Preview'
})

const previewSubtitle = computed(() => {
  if (filters.testament) {
    return `${filters.testament} | quiet reading mode`
  }

  return 'Preview text in a calm, book-inspired layout'
})

const chapterPreview = computed(() => churchStore.bibleVerses)
const readingCountLabel = computed(() => {
  const total = chapterPreview.value.length
  return `${total} verse${total === 1 ? '' : 's'} on display`
})

const leftPageVerses = computed(() => {
  const midpoint = Math.ceil(chapterPreview.value.length / 2)
  return chapterPreview.value.slice(0, midpoint)
})

const rightPageVerses = computed(() => {
  const midpoint = Math.ceil(chapterPreview.value.length / 2)
  return chapterPreview.value.slice(midpoint)
})

const refreshVerses = async () => {
  try {
    await churchStore.loadBibleVerses(true, sanitizedFilters())
  } catch {
    // Store already keeps the error state.
  }
}

const applyFilters = async () => {
  await refreshVerses()
}

const clearFilters = async () => {
  filters.translation = 'TB'
  filters.testament = ''
  filters.book = ''
  filters.chapter = null
  filters.search = ''
  await refreshVerses()
}

onMounted(async () => {
  await refreshVerses()
})
</script>

<style scoped>
.bible-preview-page {
  min-height: 100%;
  padding: 1.5rem;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.65), transparent 38%),
    linear-gradient(180deg, rgba(245, 230, 211, 0.55), rgba(232, 213, 183, 0.82));
}

.reading-hero,
.reading-controls,
.open-book {
  position: relative;
  overflow: hidden;
}

.reading-hero {
  padding: 2rem;
  margin-bottom: 1.5rem;
  background:
    linear-gradient(135deg, rgba(68, 43, 26, 0.92), rgba(102, 68, 35, 0.94)),
    url('/gki_menteng.jpg') center/cover;
  color: #fbf4e7;
  border-color: rgba(255, 240, 205, 0.15);
}

.reading-hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: end;
}

.reading-hero__copy {
  max-width: 720px;
}

.eyebrow,
.section-label {
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 0.78rem;
  color: #f5d9a6;
}

.display-title {
  font-size: clamp(2.4rem, 4vw, 4.2rem);
  line-height: 0.95;
}

.hero-text {
  max-width: 58ch;
  font-size: 1.02rem;
  line-height: 1.8;
  color: rgba(251, 244, 231, 0.88);
}

.reading-hero__meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.8rem 1rem;
  border-radius: 999px;
  background: rgba(255, 248, 232, 0.14);
  border: 1px solid rgba(255, 248, 232, 0.14);
  backdrop-filter: blur(12px);
  font-size: 0.9rem;
  color: #fff7e7;
  white-space: nowrap;
}

.meta-chip--soft {
  background: rgba(255, 248, 232, 0.09);
}

.hero-glow {
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  filter: blur(18px);
  opacity: 0.4;
}

.hero-glow-left {
  top: -120px;
  left: -80px;
  background: radial-gradient(circle, rgba(255, 206, 120, 0.8), transparent 65%);
}

.hero-glow-right {
  right: -80px;
  bottom: -140px;
  background: radial-gradient(circle, rgba(255, 236, 194, 0.7), transparent 65%);
}

.reading-controls {
  padding: 1.75rem;
  margin-bottom: 1.5rem;
}

.reading-controls :deep(.form-control),
.reading-controls :deep(.form-select) {
  border-radius: 14px;
  border-color: rgba(155, 123, 69, 0.2);
  padding: 0.8rem 0.95rem;
}

.book-stage {
  position: relative;
  padding: 1rem 0 2rem;
}

.book-spine {
  position: absolute;
  top: 2.2rem;
  bottom: 2.2rem;
  left: 50%;
  width: 18px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: linear-gradient(180deg, #8a6433 0%, #6a4a24 50%, #8a6433 100%);
  box-shadow: 0 0 0 1px rgba(255, 249, 236, 0.25), 0 0 24px rgba(107, 75, 36, 0.3);
  z-index: 0;
}

.open-book {
  position: relative;
  z-index: 1;
  padding: 1.25rem;
  background:
    linear-gradient(90deg, rgba(255, 252, 247, 0.98), rgba(248, 241, 229, 0.98) 50%, rgba(255, 252, 247, 0.98)),
    repeating-linear-gradient(
      0deg,
      rgba(155, 123, 69, 0.03),
      rgba(155, 123, 69, 0.03) 1px,
      transparent 1px,
      transparent 28px
    );
  border-radius: 28px;
  box-shadow: 0 24px 70px rgba(73, 50, 26, 0.16);
  border: 1px solid rgba(155, 123, 69, 0.16);
}

.open-book::before {
  content: '';
  position: absolute;
  inset: 1rem;
  border-radius: 22px;
  border: 1px solid rgba(155, 123, 69, 0.08);
  pointer-events: none;
}

.open-book__header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
  padding: 0.5rem 0.5rem 1.1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(155, 123, 69, 0.14);
}

.book-subtitle {
  color: #866f52;
}

.book-folio {
  padding: 0.7rem 1rem;
  border-radius: 999px;
  background: rgba(155, 123, 69, 0.1);
  color: #6a542f;
  font-size: 0.88rem;
  font-weight: 700;
  white-space: nowrap;
}

.pages {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.page {
  position: relative;
  min-height: 560px;
  padding: 1.25rem 1.15rem 1.4rem;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 253, 248, 0.96), rgba(250, 243, 231, 0.97)),
    repeating-linear-gradient(
      0deg,
      rgba(155, 123, 69, 0.025),
      rgba(155, 123, 69, 0.025) 1px,
      transparent 1px,
      transparent 31px
    );
  border: 1px solid rgba(155, 123, 69, 0.14);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.page--left {
  box-shadow: inset -18px 0 26px rgba(114, 76, 33, 0.06);
}

.page--right {
  box-shadow: inset 18px 0 26px rgba(114, 76, 33, 0.06);
}

.page-number {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  background: rgba(155, 123, 69, 0.12);
  color: #6a542f;
  font-weight: 700;
  font-size: 0.85rem;
}

.page-body {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  padding-top: 2rem;
}

.verse-line {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.85rem;
  align-items: start;
}

.verse-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  margin-top: 0.1rem;
  border-radius: 999px;
  background: rgba(155, 123, 69, 0.16);
  color: #6a542f;
  font-size: 0.9rem;
  font-weight: 700;
}

.verse-reference {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #9b7b45;
}

.verse-text {
  font-size: 1rem;
  line-height: 1.9;
  color: #392d21;
}

.book-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 520px;
  text-align: center;
  color: #7a6a52;
  background: rgba(255, 252, 246, 0.55);
  border: 1px dashed rgba(155, 123, 69, 0.25);
  border-radius: 24px;
}

@media (max-width: 991.98px) {
  .reading-hero__inner {
    flex-direction: column;
    align-items: start;
  }

  .pages {
    grid-template-columns: 1fr;
  }

  .book-spine {
    display: none;
  }

  .page {
    min-height: auto;
  }
}

@media (max-width: 767.98px) {
  .bible-preview-page {
    padding: 1rem;
  }

  .reading-hero,
  .reading-controls,
  .open-book {
    border-radius: 20px;
  }

  .reading-hero {
    padding: 1.5rem;
  }

  .reading-controls,
  .open-book {
    padding: 1rem;
  }

  .hero-text,
  .verse-text {
    line-height: 1.7;
  }
}
</style>
