<template>
  <div class="bible-view p-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
          <h2 class="mb-0">Bible Digitization</h2>
          <span class="source-badge">{{ environmentLabel }}</span>
        </div>
        <p class="text-muted mb-0">Preview each chapter, then add or refine verse-by-verse Bible text through the PHP API.</p>
      </div>
          <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-gold" :disabled="churchStore.bibleVersesLoading" @click="refreshVerses">
          <i class="bi bi-arrow-clockwise me-2"></i>Refresh
        </button>
        <button v-if="canManageBible" class="luxury-btn" @click="openCreateForm">
          <i class="bi bi-journal-plus me-2"></i>Input Bible Text
        </button>
      </div>
    </div>

    <div v-if="churchStore.bibleVersesError" class="alert alert-danger mb-4">
      {{ churchStore.bibleVersesError }}
    </div>

    <div class="church-card filter-shell p-4 mb-4">
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
          Show Preview
        </button>
        <button class="btn btn-outline-secondary" :disabled="churchStore.bibleVersesLoading" @click="clearFilters">
          Clear
        </button>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-xl-8">
        <div class="church-card preview-shell p-4">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <p class="preview-label mb-1">Bible Preview</p>
              <h3 class="mb-0">{{ previewTitle }}</h3>
            </div>
            <div class="preview-stats">
              <span>{{ churchStore.totalBibleVerses }} verse{{ churchStore.totalBibleVerses === 1 ? '' : 's' }}</span>
            </div>
          </div>

          <div v-if="churchStore.bibleVersesLoading" class="empty-state">
            <i class="bi bi-hourglass-split fs-2 mb-3"></i>
            <p class="mb-0">Loading Bible text...</p>
          </div>

          <div v-else-if="!chapterPreview.length" class="empty-state">
            <i class="bi bi-book-half fs-2 mb-3"></i>
            <p class="mb-0">Choose a translation, book, and chapter to preview verses already digitized.</p>
          </div>

          <div v-else class="chapter-preview">
            <div
              v-for="verse in chapterPreview"
              :key="verse.id"
              class="verse-card"
              :class="{ 'is-selected': editingVerseId === verse.id }"
            >
              <div class="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <p class="verse-reference mb-2">{{ verse.reference }}</p>
                  <p class="verse-text mb-0">
                    <span class="verse-number">{{ verse.verse }}</span>
                    {{ verse.text }}
                  </p>
                </div>
                <button
                  v-if="canManageBible"
                  type="button"
                  class="btn btn-sm btn-outline-gold"
                  @click="openEditForm(verse)"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-4">
        <div ref="editorShellRef" class="church-card editor-shell p-4">
          <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
            <div>
              <p class="preview-label mb-1">{{ canManageBible ? 'Bible Editor' : 'Guest Access' }}</p>
              <h4 class="mb-0">{{ canManageBible ? (isEditing ? 'Edit Verse' : 'Add Verse') : 'Preview Only' }}</h4>
            </div>
            <button v-if="canManageBible && showForm" class="btn btn-sm btn-outline-secondary" @click="closeForm">
              Close
            </button>
          </div>

          <div v-if="canManageBible && showForm">
            <form class="bible-form" @submit.prevent="submitForm">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Translation</label>
                  <input v-model="form.translation" type="text" class="form-control" placeholder="TB" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Testament</label>
                  <select v-model="form.testament" class="form-select" required>
                    <option value="Old Testament">Old Testament</option>
                    <option value="New Testament">New Testament</option>
                  </select>
                </div>
              </div>

              <div class="mb-3 mt-3">
                <label class="form-label">Book</label>
                <input v-model="form.book" type="text" class="form-control" placeholder="Genesis" required>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Chapter</label>
                  <input v-model.number="form.chapter" type="number" min="1" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Verse</label>
                  <input v-model.number="form.verse" type="number" min="1" class="form-control" required>
                </div>
              </div>

              <div class="mb-3 mt-3">
                <label class="form-label">Bible Text</label>
                <textarea
                  v-model="form.text"
                  class="form-control"
                  rows="7"
                  placeholder="Paste or type the verse text here..."
                  required
                ></textarea>
              </div>

              <div v-if="formError" class="alert alert-danger py-2">
                {{ formError }}
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="luxury-btn flex-fill" :disabled="submitting">
                  {{ submitting ? 'Saving...' : isEditing ? 'Update Verse' : 'Save Verse' }}
                </button>
                <button type="button" class="btn btn-outline-secondary flex-fill" :disabled="submitting" @click="resetForm">
                  Reset
                </button>
              </div>
            </form>

            <button
              v-if="isEditing && editingVerseId"
              type="button"
              class="btn btn-outline-danger w-100 mt-3"
              :disabled="submitting"
              @click="removeVerse(editingVerseId)"
            >
              Delete This Verse
            </button>
          </div>

          <div v-else class="empty-state compact-empty">
            <i :class="canManageBible ? 'bi bi-journal-text fs-2 mb-3' : 'bi bi-eye fs-2 mb-3'"></i>
            <p v-if="canManageBible" class="mb-0">Open the editor to add a new verse, or choose an existing verse from the preview to revise it.</p>
            <p v-else class="mb-0">Guests can preview digitized scripture, while signed-in users can add, edit, and delete Bible text.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useChurchStore, type BibleVerse } from '@/stores/church'
import { useAuthStore } from '@/stores/auth'
import type { BibleVerseFilters, BibleVersePayload } from '@/services/bibleService'

const churchStore = useChurchStore()
const authStore = useAuthStore()
const environmentLabel = import.meta.env.VITE_ENVIRONMENT === 'Production'
  ? 'Production / Firestore'
  : 'Development / PHP API'

const filters = reactive<BibleVerseFilters>({
  translation: 'TB',
  testament: '',
  book: '',
  chapter: null,
  search: ''
})

const showForm = ref(false)
const editingVerseId = ref<string | null>(null)
const submitting = ref(false)
const formError = ref<string | null>(null)
const editorShellRef = ref<HTMLElement | null>(null)

const form = reactive<BibleVersePayload>({
  translation: 'TB',
  testament: 'Old Testament',
  book: '',
  chapter: 1,
  verse: 1,
  text: ''
})

const canManageBible = computed(() => authStore.isAuthenticated)
const isEditing = computed(() => editingVerseId.value !== null)

const chapterPreview = computed(() => churchStore.bibleVerses)

const chapterInput = computed({
  get: () => filters.chapter ?? '',
  set: (val) => { filters.chapter = val ? Number(val) : null }
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

const sanitizedFilters = () => ({
  translation: filters.translation?.trim() || undefined,
  testament: filters.testament || undefined,
  book: filters.book?.trim() || undefined,
  chapter: filters.chapter ? Number(filters.chapter) : undefined,
  search: filters.search?.trim() || undefined
})

const applyVerseToForm = (verse?: BibleVerse) => {
  form.translation = verse?.translation ?? (filters.translation?.trim() || 'TB')
  form.testament = verse?.testament ?? 'Old Testament'
  form.book = verse?.book ?? (filters.book?.trim() || '')
  form.chapter = verse?.chapter ?? (filters.chapter || 1)
  form.verse = verse?.verse ?? 1
  form.text = verse?.text ?? ''
}

const validateForm = () => {
  if (!form.translation.trim() || !form.book.trim() || !form.text.trim()) {
    return 'Translation, book, and Bible text are required.'
  }

  if (!Number.isInteger(form.chapter) || form.chapter < 1) {
    return 'Chapter must be greater than 0.'
  }

  if (!Number.isInteger(form.verse) || form.verse < 1) {
    return 'Verse must be greater than 0.'
  }

  return null
}

const refreshVerses = async () => {
  try {
    await churchStore.loadBibleVerses(true, sanitizedFilters())
  } catch {
    // Store state already handles the error message.
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
  await churchStore.loadBibleVerses(true, sanitizedFilters())
}

const openCreateForm = () => {
  if (!canManageBible.value) {
    return
  }

  showForm.value = true
  editingVerseId.value = null
  formError.value = null
  applyVerseToForm()
  nextTick(() => {
    editorShellRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const openEditForm = (verse: BibleVerse) => {
  if (!canManageBible.value) {
    return
  }

  showForm.value = true
  editingVerseId.value = verse.id
  formError.value = null
  applyVerseToForm(verse)
  nextTick(() => {
    editorShellRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const closeForm = () => {
  showForm.value = false
  editingVerseId.value = null
  formError.value = null
}

const resetForm = () => {
  formError.value = null

  if (!editingVerseId.value) {
    applyVerseToForm()
    return
  }

  const currentVerse = churchStore.bibleVerses.find((verse) => verse.id === editingVerseId.value)
  applyVerseToForm(currentVerse)
}

const submitForm = async () => {
  if (!canManageBible.value) {
    return
  }

  formError.value = validateForm()

  if (formError.value) {
    return
  }

  submitting.value = true

  const payload: BibleVersePayload = {
    translation: form.translation.trim(),
    testament: form.testament,
    book: form.book.trim(),
    chapter: form.chapter,
    verse: form.verse,
    text: form.text.trim()
  }

  try {
    if (isEditing.value && editingVerseId.value) {
      await churchStore.updateBibleVerse(editingVerseId.value, payload)
    } else {
      await churchStore.createBibleVerse(payload)
    }

    filters.translation = payload.translation
    filters.testament = payload.testament
    filters.book = payload.book
    filters.chapter = payload.chapter
    await refreshVerses()
    closeForm()
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Unable to save bible verse.'
  } finally {
    submitting.value = false
  }
}

const removeVerse = async (id: string) => {
  if (!canManageBible.value) {
    return
  }

  const shouldDelete = window.confirm('Delete this verse?')

  if (!shouldDelete) {
    return
  }

  submitting.value = true

  try {
    await churchStore.deleteBibleVerse(id)
    await refreshVerses()
    closeForm()
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Unable to delete bible verse.'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await refreshVerses()
})
</script>

<style scoped>
.bible-view {
  min-height: 100%;
}

.source-badge,
.preview-stats {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(155, 123, 69, 0.12);
  color: #6a542f;
  font-size: 0.78rem;
  font-weight: 700;
}

.filter-shell,
.preview-shell,
.editor-shell {
  border-radius: 24px;
}

.preview-label {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.78rem;
  color: #9b7b45;
}

.chapter-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.verse-card {
  border: 1px solid rgba(155, 123, 69, 0.18);
  border-radius: 20px;
  padding: 1.15rem 1.25rem;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.96), rgba(247, 238, 219, 0.85));
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.verse-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(70, 49, 24, 0.08);
}

.verse-card.is-selected {
  border-color: #9b7b45;
  box-shadow: 0 14px 28px rgba(155, 123, 69, 0.18);
}

.verse-reference {
  font-size: 0.84rem;
  font-weight: 700;
  color: #9b7b45;
  letter-spacing: 0.04em;
}

.verse-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  margin-right: 0.75rem;
  border-radius: 999px;
  background: rgba(155, 123, 69, 0.14);
  color: #6a542f;
  font-weight: 700;
}

.verse-text {
  font-size: 1rem;
  line-height: 1.8;
  color: #3d3124;
}

.bible-form .form-control,
.bible-form .form-select,
.filter-shell .form-control,
.filter-shell .form-select {
  border-radius: 14px;
  border-color: rgba(155, 123, 69, 0.2);
  padding: 0.8rem 0.95rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 220px;
  border: 1px dashed rgba(155, 123, 69, 0.28);
  border-radius: 20px;
  color: #7a6a52;
  background: rgba(255, 252, 246, 0.7);
}

.compact-empty {
  min-height: 320px;
}

@media (max-width: 767.98px) {
  .verse-card {
    padding: 1rem;
  }

  .verse-text {
    line-height: 1.65;
  }
}
</style>
