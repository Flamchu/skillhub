## 🔹 Flow: Ingest YouTube Playlists → DB (Express + Prisma + yt-dlp)

1. **Admin gives a YouTube playlist or video URL**.
2. **Backend ingestion endpoint** calls `yt-dlp` as a subprocess.
   - Use `--dump-json` for structured metadata.
   - For playlists: `yt-dlp -J --flat-playlist URL` → returns JSON with all video IDs + titles.
   - For individual videos: `yt-dlp -J URL`.

3. **Normalize output → Prisma models**.
4. **Persist**: insert/update `Course` + `Lesson` tables.
5. **Frontend** embeds with `https://www.youtube-nocookie.com/embed/:videoId`.

---

## 🔹 Prisma Models (example)

```prisma
model Course {
  id          String   @id @default(cuid())
  provider    String   @default("YOUTUBE")
  providerId  String   // playlist ID or video ID
  title       String
  description String?
  thumbnail   String?
  lessons     Lesson[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Lesson {
  id             String   @id @default(cuid())
  courseId       String
  course         Course   @relation(fields: [courseId], references: [id])
  providerVideoId String  // YouTube video ID
  title          String
  position       Int
  durationSeconds Int?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model UserProgress {
  id        String   @id @default(cuid())
  userId    String
  lessonId  String
  lesson    Lesson   @relation(fields: [lessonId], references: [id])
  completed Boolean  @default(false)
  progressPercent Int? // 0–100 if partial tracking
  updatedAt DateTime @updatedAt
}
```

---

## 🔹 Express Ingestion Route (sketch)

```ts
import { exec } from "child_process";
import { prisma } from "../lib/prisma";

function runYtDlp(url: string): Promise<any> {
	return new Promise((resolve, reject) => {
		exec(`yt-dlp -J --flat-playlist "${url}"`, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout) => {
			if (err) return reject(err);
			try {
				resolve(JSON.parse(stdout));
			} catch (e) {
				reject(e);
			}
		});
	});
}

app.post("/api/admin/import/youtube", async (req, res) => {
	const { url } = req.body;
	try {
		const data = await runYtDlp(url);
		const playlistId = data.id;
		const course = await prisma.course.upsert({
			where: { providerId: playlistId },
			update: { title: data.title },
			create: {
				providerId: playlistId,
				title: data.title,
				lessons: {
					create: data.entries.map((v: any, idx: number) => ({
						providerVideoId: v.id,
						title: v.title,
						position: idx,
					})),
				},
			},
		});
		res.json(course);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});
```

---

## 🔹 Frontend Integration

- Course detail page fetches `/api/courses/:id` → gets course + lessons.
- Render sidebar of lessons.
- Player = iframe:

  ```tsx
  <iframe src={`https://www.youtube-nocookie.com/embed/${lesson.providerVideoId}`} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full aspect-video rounded-xl" />
  ```
