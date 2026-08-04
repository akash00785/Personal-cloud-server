# TODO

## Agent-02 — Authentication

- [ ] Create Supabase project, copy credentials to `.env.local`
- [ ] Implement `/login` page (email + password)
- [ ] Implement `/register` page
- [ ] Implement `/forgot-password` page
- [ ] Implement `/auth/callback` route handler for OAuth
- [ ] Add protected route middleware (redirect unauthenticated users)
- [ ] Add user session context provider
- [ ] Add logout button to Header

## Agent-03 — File Manager

- [ ] Design and create Supabase storage bucket
- [ ] Create `/dashboard` page with file overview stats
- [ ] Create `/files` page with file list
- [ ] Implement file upload (drag-and-drop + file picker)
- [ ] Implement file download
- [ ] Implement file delete
- [ ] Implement folder creation and navigation
- [ ] Add file type icons
- [ ] Add file preview (images, PDFs)

## Agent-04 — Google Drive Integration

- [ ] Set up Google Cloud project and OAuth 2.0 credentials
- [ ] Implement Google Drive OAuth flow
- [ ] List Google Drive files
- [ ] Import Google Drive files to personal cloud
- [ ] Export files to Google Drive

## Agent-05 — Remote Downloader

- [ ] Create download queue UI
- [ ] Implement URL submission form
- [ ] Implement server-side download via API route
- [ ] Track download progress (WebSocket or polling)
- [ ] Store downloaded files to Supabase storage

## Agent-06 — Search & Streaming

- [ ] Implement full-text search across files
- [ ] Implement video/audio streaming from Supabase storage
- [ ] Add search filters (file type, date, size)

## Agent-07 — Deployment

- [ ] Create `render.yaml` for Render deployment
- [ ] Configure production environment variables on Render
- [ ] Set up custom domain (optional)
- [ ] Configure Supabase production environment
- [ ] Set up CI/CD (GitHub Actions → Render)
