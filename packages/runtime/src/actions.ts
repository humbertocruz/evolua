"use server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createPageAction(
  projectSlug: string,
  apiKey: string,
  data: {
    path: string;
    title: string;
    nodes?: unknown[];
    visual?: unknown;
  }
): Promise<ActionResponse<{ id: string }>> {
  try {
    const response = await fetch(`${API_BASE}/api/pages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Project-Slug": projectSlug,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: error || "Failed to create page" };
    }

    const page = await response.json();
    return { success: true, data: { id: page.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function deletePageAction(
  projectSlug: string,
  apiKey: string,
  pageId: string
): Promise<ActionResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/pages/${pageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Project-Slug": projectSlug,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: error || "Failed to delete page" };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function publishPageAction(
  projectSlug: string,
  apiKey: string,
  pageId: string
): Promise<ActionResponse<{ status: string }>> {
  try {
    const response = await fetch(`${API_BASE}/api/pages/${pageId}/publish`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Project-Slug": projectSlug,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: error || "Failed to publish page" };
    }

    const result = await response.json();
    return { success: true, data: { status: result.status } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
