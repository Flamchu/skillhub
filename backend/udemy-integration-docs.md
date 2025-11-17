# Udemy API Integration

## Overview

SkillHub now integrates with Udemy's Affiliate API to provide access to thousands of external courses alongside our internal content. This integration allows users to search, browse, and discover Udemy courses directly within SkillHub.

## Features

### For Users

- **Search Udemy Courses**: Search thousands of courses from Udemy's catalog
- **Course Details**: View ratings, duration, instructors, and pricing
- **Direct Links**: Click through to Udemy with affiliate tracking (if configured)
- **Unified Experience**: External courses appear alongside internal courses with clear indicators

### For Admins

- **Course Import**: Import Udemy courses into SkillHub database
- **Bulk Import**: Import multiple courses by search query
- **Auto Sync**: Keep pricing and ratings updated automatically
- **Skill Mapping**: Link Udemy courses to SkillHub skills

## Setup

### 1. Get Udemy API Credentials

1. Visit [Udemy Affiliate Program](https://www.udemy.com/developers/affiliate/)
2. Sign up for the Udemy Affiliate API
3. Get your Client ID and Client Secret
4. (Optional) Get your Affiliate ID for commission tracking

### 2. Configure Environment Variables

Add to `backend/.env`:

```bash
UDEMY_CLIENT_ID=your_client_id_here
UDEMY_CLIENT_SECRET=your_client_secret_here
UDEMY_AFFILIATE_ID=your_affiliate_id_here  # Optional
```

### 3. Restart Backend

```bash
cd backend
pnpm run dev
```

## API Endpoints

### Public Endpoints

#### Search Udemy Courses

```
GET /api/udemy/search?query=python&page=1&pageSize=20
```

Query Parameters:

- `query` (required): Search term
- `page`: Page number (default: 1)
- `pageSize`: Results per page (default: 20, max: 100)
- `category`: Filter by category
- `level`: Filter by instructional level
- `language`: Filter by language
- `price`: Filter by price (`paid` or `free`)
- `orderBy`: Sort order (e.g., `-rating`, `price`)

Response:

```json
{
	"count": 1000,
	"next": "...",
	"previous": null,
	"results": [
		{
			"id": 123456,
			"title": "Complete Python Bootcamp",
			"url": "https://www.udemy.com/course/...",
			"headline": "Learn Python like a Professional",
			"image_480x270": "https://...",
			"price": "$89.99",
			"rating": 4.6,
			"content_length_video": 36000,
			"is_paid": true,
			"instructional_level": "All Levels"
		}
	]
}
```

#### Get Course Details

```
GET /api/udemy/course/:courseId
```

#### Get Imported Udemy Courses

```
GET /api/udemy/imported?page=1&limit=20&skillId=xxx
```

### Admin Endpoints (Require Authentication + Admin Role)

#### Import Single Course

```
POST /api/udemy/admin/import
Content-Type: application/json

{
  "courseId": 123456,
  "skillIds": ["skill-uuid-1", "skill-uuid-2"]
}
```

#### Bulk Import by Search

```
POST /api/udemy/admin/bulk-import
Content-Type: application/json

{
  "query": "python programming",
  "maxCourses": 20,
  "skillIds": ["skill-uuid-1"]
}
```

#### Sync Existing Courses

```
POST /api/udemy/admin/sync
```

Updates pricing, ratings, and thumbnails for all previously imported Udemy courses.

#### Get Recommendations by Skill

```
GET /api/udemy/recommendations/:skillName?limit=10
```

## Frontend Components

### UdemySearch Component

Search and display Udemy courses with modern UI:

```tsx
import { UdemySearch } from "@/components/courses";

<UdemySearch initialQuery="python" maxResults={12} showTitle={true} />;
```

### CoursesGrid Component

Updated to handle external courses with redirect buttons:

- Internal courses: Show "Enroll Now" button
- External courses: Show "View Course" button with external link icon

## Database Schema

External courses are stored with these fields:

```prisma
model Course {
  id            String        @id @default(uuid())
  title         String
  description   String
  url           String
  thumbnail     String?
  source        CourseSource  // INTERNAL, YOUTUBE, UDEMY, OTHER
  externalId    String?       // Udemy course ID
  provider      String?       // "Udemy"
  rating        Float?
  durationMinutes Int?
  isPaid        Boolean
  priceCents    Int?          // Price in cents
  difficulty    CourseDifficulty
  language      String?

  @@index([externalId])
  @@index([provider, source])
}

enum CourseSource {
  INTERNAL
  YOUTUBE
  UDEMY
  OTHER
}
```

## Rate Limiting

The service implements automatic rate limiting:

- 500ms delay between bulk imports
- 500ms delay between sync operations
- Prevents API quota exhaustion

## Caching

Redis caching is recommended for:

- Search results (5 minutes TTL)
- Course details (15 minutes TTL)
- Imported course lists (10 minutes TTL)

Add caching middleware in `/routes/udemy.ts` similar to other routes.

## Affiliate Revenue

If you configure `UDEMY_AFFILIATE_ID`, all course links will include your affiliate tracking code. You'll earn commission on purchases made through your links.

### Commission Structure

- 15% commission on new customer purchases
- 3% commission on returning customer purchases
- Cookie duration: 7 days

## Recommendations Integration

Udemy courses can be integrated into the recommendations system:

```typescript
// In recommendations service
const udemyCourses = await udemyService.getRecommendationsBySkill(skillName, 5);
// Mix with internal recommendations
```

## Monitoring

Track these metrics:

- API request count
- Import success/failure rate
- Sync operations
- Affiliate link clicks

## Troubleshooting

### "Udemy API not configured" error

- Verify environment variables are set
- Check credentials are valid
- Restart backend server

### Rate limit errors

- Reduce `maxCourses` in bulk import
- Increase delay between requests
- Contact Udemy to increase quota

### Course import fails

- Check if course already exists
- Verify course ID is valid
- Check API credentials

## Future Enhancements

- [ ] Category mapping between SkillHub and Udemy
- [ ] Automatic daily sync schedule
- [ ] Course preview/comparison
- [ ] User reviews sync
- [ ] Price tracking and alerts
- [ ] Coursera, Pluralsight, LinkedIn Learning integration

## Legal & Compliance

- Always display course source (Udemy badge)
- Include affiliate disclosure if using affiliate links
- Respect Udemy's Terms of Service
- Don't modify course content or pricing
- Cache data responsibly (follow Udemy's caching policies)

## Support

For issues with the Udemy API integration:

1. Check the [Udemy API Documentation](https://www.udemy.com/developers/affiliate/)
2. Review backend logs for detailed error messages
3. Test API credentials with Udemy's API console
