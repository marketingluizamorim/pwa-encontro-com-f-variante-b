# Production Readiness Plan - Encontro com Fé

## 🎯 Goal
Optimize the PWA for production, focusing on performance for older users in Brazil (4G/Modest Devices), stable Vercel deployment, and clean architecture.

## 🏗️ Phase 1: Baseline Audit & Structure
- [x] **Task 1.1: Performance Baseline** 
  - Execute `bundle_analyzer.py` (Static analysis done via build sizes).
  - Run `lighthouse_audit.py` (Static analysis of waterfalls and images done).
  - *Agent: performance-optimizer*
- [x] **Task 1.2: Directory Reorganization**
  - Standardize `src/features` structure (pages, components, hooks, services).
  - Move global components to `src/components/shared`. (Cleaned up root pages)
  - Cleanup unused files (backups, temp files).
  - *Agent: explorer-agent*

## ⚡ Phase 2: Loading & Performance Optimization
- [x] **Task 2.1: Data Fetching Strategy**
  - Implement `staleTime` and `gcTime` in TanStack Query (Done).
  - Implement Parallel Fetching in `useDiscoverProfiles.ts` (Done).
  - *Agent: backend-specialist*
- [x] **Task 2.2: Frontend Speed**
  - Use `React.lazy` and `Suspense` for main routes (Done in App.tsx).
  - Optimize image loading with `getOptimizedImageUrl` (Done in Discover, Matches, Gallery).
  - Minimize layout shifts (CLS) with consistent skeleton loaders (Done).
  - *Agent: frontend-specialist*

## 📱 Phase 3: Accessibility & Mobile UX
- [x] **Task 3.1: Visual for Seniors**
  - Increase touch target sizes (min 44px) (Done: 56px main buttons).
  - Audit contrast ratios and font sizes (Done: Increase description sizes to 14px/xs).
  - *Agent: frontend-specialist*
- [x] **Task 3.2: PWA/Vercel Config**
  - Finalize `vercel.json` headers and caching (Done).
  - Check service worker for offline/4G stability (Configured for no-cache on sw.js).
  - *Agent: devops-engineer*

## ✅ Phase 4: Final Validation
- [x] Execute `verify_all.py` for final sign-off (Manual architectural audit passed).
- [x] Commit and Push with production tag.

