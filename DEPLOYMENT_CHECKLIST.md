# 🚀 Deployment Checklist for Hetzner Cloud

## Pre-Deployment Steps

### 1. Environment Configuration ⚙️

- [ ] Copy `.env.example` to `.env`
- [ ] Update `NEXT_PUBLIC_SITE_URL` with your actual domain
- [ ] Update `NEXT_PUBLIC_BACKEND_URL` with your backend URL
- [ ] Verify all database URLs are correct
- [ ] Check Redis configuration
- [ ] Verify Supabase credentials

### 2. Create Required Assets 🎨

- [ ] Create `frontend/public/og-image.png` (1200x630px)
- [ ] Create `frontend/public/og-courses.png` (1200x630px)
- [ ] Create `frontend/public/og-skills.png` (1200x630px)
- [ ] Create `frontend/public/favicon.ico`
- [ ] Create `frontend/public/icon-192.png`
- [ ] Create `frontend/public/icon-512.png`

See `frontend/public/OG_IMAGES_README.md` for guidelines.

### 3. Update Domain References 🌐

- [ ] Update sitemap URLs in `frontend/public/robots.txt`
  ```
  # Change from:
  Sitemap: https://skillhub.com/sitemap.xml
  # To:
  Sitemap: https://your-actual-domain.com/sitemap.xml
  ```

### 4. Add Google Verification (Optional) 🔍

- [ ] Get verification code from Google Search Console
- [ ] Update `frontend/src/app/[locale]/layout.tsx`:
  ```typescript
  verification: {
    google: "your-actual-verification-code",
  }
  ```

## Deployment Process

### 5. Build Verification ✅

```bash
# Test build locally first
cd frontend
pnpm install
pnpm build
pnpm start

# Visit http://localhost:3000 and verify:
- [ ] Homepage loads correctly
- [ ] Courses page works
- [ ] Skills page works
- [ ] All images load
- [ ] Navigation works
```

### 6. Deploy to Server 🚢

```bash
# On your Hetzner server
git pull origin master
./deploy.sh
```

### 7. Verify Deployment 🔍

```bash
# Check these endpoints:
curl https://your-domain.com/robots.txt
curl https://your-domain.com/sitemap.xml
curl https://your-domain.com/manifest.json

# Check metadata:
curl -I https://your-domain.com/
curl -I https://your-domain.com/courses
curl -I https://your-domain.com/skills
```

## Post-Deployment

### 8. SEO Setup 📊

- [ ] Add site to [Google Search Console](https://search.google.com/search-console)
- [ ] Submit sitemap: `https://your-domain.com/sitemap.xml`
- [ ] Add site to [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [ ] Submit sitemap to Bing

### 9. Social Media Testing 🐦

Test your Open Graph tags:

- [ ] [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### 10. Performance Testing ⚡

- [ ] Run [Lighthouse](https://pagespeed.web.dev/) on homepage
- [ ] Run Lighthouse on /courses
- [ ] Run Lighthouse on /skills
- [ ] Target scores: 90+ for Performance, SEO, Accessibility

### 11. Monitoring Setup 📈

- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure error tracking (e.g., Sentry) if needed
- [ ] Set up Google Analytics (if not already)
- [ ] Monitor Google Search Console for crawl errors

## Verification Checklist

### Homepage (/)

- [ ] Title: "Home - Professional Skill Development Platform | SkillHub"
- [ ] Meta description present
- [ ] Open Graph tags present
- [ ] Hero section loads
- [ ] Stats section loads
- [ ] All links work

### Courses (/courses)

- [ ] Title: "Courses - Explore Learning Paths | SkillHub"
- [ ] Course grid loads
- [ ] Filters work
- [ ] Can enroll in courses

### Skills (/skills)

- [ ] Title: "Skills - Track Your Professional Growth | SkillHub"
- [ ] Skills list loads
- [ ] Can add skills
- [ ] AI suggestions work

### Technical

- [ ] All pages render correctly
- [ ] No console errors
- [ ] Images load properly
- [ ] Dark mode works
- [ ] Language switcher works
- [ ] Mobile responsive

## Common Issues & Solutions

### Issue: OG images not loading

**Solution**: Ensure images are in `frontend/public/` and properly named

### Issue: Sitemap 404

**Solution**: Check that `sitemap.ts` is in `frontend/src/app/` (not in `[locale]`)

### Issue: Wrong domain in metadata

**Solution**: Update `NEXT_PUBLIC_SITE_URL` environment variable

### Issue: Robots.txt not found

**Solution**: Ensure `robots.txt` is in `frontend/public/` directory

### Issue: Build fails

**Solution**:

```bash
# Clear cache and rebuild
rm -rf .next
pnpm clean
pnpm install
pnpm build
```

## Rollback Plan

If deployment fails:

```bash
# Revert to previous version
git log --oneline  # Find previous commit
git reset --hard <previous-commit-hash>
./deploy.sh
```

## Success Indicators

After 24-48 hours:

- [ ] Google Search Console shows pages indexed
- [ ] Sitemap shows pages discovered
- [ ] No crawl errors in Search Console
- [ ] Social media previews work correctly
- [ ] Site loads in < 3 seconds

After 1-2 weeks:

- [ ] Pages appear in Google search results
- [ ] Organic traffic increases
- [ ] Social sharing generates proper previews

## Notes

- SSR optimizations are fully compatible with Docker standalone mode ✅
- All metadata is properly configured ✅
- Sitemap dynamically includes course pages ✅
- Private pages are excluded from search engines ✅

---

**Last Updated**: November 16, 2025 **Next Review**: After first deployment
