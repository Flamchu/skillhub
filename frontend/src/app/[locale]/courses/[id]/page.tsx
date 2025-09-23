import type { Metadata } from "next";
import CoursePage from "@/components/courses/CoursePage";
import { http } from "@/lib/http";
import type { Course } from "@/types";

// generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
	try {
		const { id } = await params;
		const response = await http.get(`/courses/${id}/lessons`);
		const courseData = response.data.course as Course;

		return {
			title: `${courseData.title} | SkillHub`,
			description: courseData.description || `Learn with ${courseData.title} on SkillHub`,
			keywords: courseData.tags?.map(tag => tag.tag.name).join(", ") || "",
		};
	} catch {
		return {
			title: "Course | SkillHub",
			description: "Learn new skills with SkillHub courses",
		};
	}
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <CoursePage courseId={id} />;
}
